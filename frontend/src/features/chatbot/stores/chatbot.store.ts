/**
 * Chatbot Store
 * Replaces Flutter's ChatbotCubit with Zustand
 * Manages messages, companion selection, API routing, and conversation persistence
 */

import { create } from 'zustand';
import type { ChatMessage, Companion, ConversationMeta, EmotionData, MoodLogEntry, QuranAnchor, UserEmotionalProfile } from '../types/chatbot.types';
import { COMPANIONS, getCompanionById, ChatMessageType } from '../types/chatbot.types';
import { streamMessage, streamCompanionMessage, submitFeedback as submitFeedbackAPI, getUserInsights, getWeeklyInsights } from '../services/chatbotService';
import type { StreamEvent } from '../services/chatbotService';
import {
  createConversation,
  saveMessage,
  updateConversationMeta,
  loadConversationMessages,
  subscribeToConversations,
  deleteConversation as deleteConversationFromFirestore,
  deleteConversationsBelowCount,
  getRecentConversationSummaries,
  saveMoodEntry,
  updateUserProfile,
  getUserProfile,
  getMoodLog,
} from '../services/conversationService';
import { useAuthStore } from '@/core/stores/auth.store';
import { useWalletStore } from '@/features/wallet/stores/wallet.store';
import { analyzeUserQuery } from '../utils/investmentDetector';
import type { AnalyzeOptions } from '../utils/investmentDetector';
import { buildStockChartData, buildAnalysisData, buildComparisonData, buildPortfolioChartData } from '../utils/chartDataBuilder';
import { doc, getDoc, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import type { InsightsData, WeeklyInsightsData } from '../components/InsightsPanel';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const ACTIVE_CONV_KEY = 'zaryah_active_conversation';
const QURAN_ANCHOR_KEY = 'zaryah_quran_anchor';

function loadPersistedQuranAnchor(): QuranAnchor | null {
  try {
    const raw = localStorage.getItem(QURAN_ANCHOR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuranAnchor;
    return parsed && typeof parsed.verseKey === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

function persistQuranAnchor(anchor: QuranAnchor | null): void {
  try {
    if (anchor) localStorage.setItem(QURAN_ANCHOR_KEY, JSON.stringify(anchor));
    else localStorage.removeItem(QURAN_ANCHOR_KEY);
  } catch {
    // best-effort
  }
}

interface ChatbotState {
  messages: ChatMessage[];
  selectedCompanion: Companion;
  isTyping: boolean;
  sessionId: string;
  error: string | null;
  backendOnline: boolean;
  activeConversationId: string | null;
  conversations: ConversationMeta[];
  conversationsLoading: boolean;
  historyDrawerOpen: boolean;
  feedbackMap: Record<string, 'up' | 'down'>;
  insightsData: InsightsData | null;
  insightsLoading: boolean;
  insightsPanelOpen: boolean;
  // RAYA EVOLUTION: Emotion & profile state
  lastEmotionData: EmotionData | null;
  userProfile: UserEmotionalProfile | null;
  insightsMoodData: MoodLogEntry[];
  weeklyInsights: WeeklyInsightsData | null;
  // Age-adaptive voice: cached DOB from Firestore users/{userId}
  userDateOfBirth: string | null;
  // Multilingual chat language
  chatLanguage: string;
  // Quran anchor — verse + tafsir attached as reference context for next turn
  quranAnchor: QuranAnchor | null;
}

interface ChatbotActions {
  sendUserMessage: (text: string) => Promise<void>;
  setCompanion: (id: string) => void;
  clearChat: () => void;
  initFromNavState: (state: { companionId?: string; initialMessage?: string; chatLanguage?: string; quranAnchor?: QuranAnchor }) => void;
  setQuranAnchor: (anchor: QuranAnchor) => void;
  clearQuranAnchor: () => void;
  setBackendOnline: (online: boolean) => void;
  refreshChartData: (messageId: string, symbol: string, period: string) => Promise<void>;
  refreshComparisonData: (messageId: string, symbols: string[], period: string) => Promise<void>;
  startNewConversation: () => void;
  sendGreeting: () => void;
  loadConversation: (convId: string) => Promise<void>;
  deleteConversation: (convId: string) => Promise<void>;
  cleanupSmallConversations: (minMessages?: number) => Promise<number>;
  subscribeConversations: () => Unsubscribe | null;
  setHistoryDrawerOpen: (open: boolean) => void;
  restoreActiveConversation: () => Promise<void>;
  submitFeedback: (messageId: string, feedback: 'up' | 'down') => void;
  fetchInsights: () => Promise<void>;
  setInsightsPanelOpen: (open: boolean) => void;
  // SOULBUDDY
  fetchUserProfile: () => Promise<void>;
  fetchWeeklyInsights: () => Promise<void>;
  // Multilingual
  setChatLanguage: (lang: string) => void;
}

// ── Persistence helpers (fire-and-forget, never block UI) ──

function isAuthenticated(): string | null {
  const user = useAuthStore.getState().user;
  if (!user || !user.id) return null;
  return user.id;
}

// Lock to prevent duplicate conversation creation from concurrent sendUserMessage calls
let _creatingConversation: Promise<string> | null = null;

async function ensureConversation(
  userId: string,
  companionId: string,
  firstMessage: string,
  currentConvId: string | null,
): Promise<string> {
  if (currentConvId) return currentConvId;
  // If another call is already creating a conversation, wait for it
  if (_creatingConversation) return _creatingConversation;

  _creatingConversation = createConversation(userId, companionId, firstMessage).then((convId) => {
    localStorage.setItem(ACTIVE_CONV_KEY, convId);
    return convId;
  });

  try {
    return await _creatingConversation;
  } finally {
    _creatingConversation = null;
  }
}

function persistSave(
  userId: string,
  convId: string,
  msg: ChatMessage,
  userText: string,
  aiText: string,
) {
  saveMessage(userId, convId, msg).catch(console.error);

  if (!msg.isUser) {
    // RAYA EVOLUTION: Always update summary (not just first exchange)
    const meta: Record<string, string> = {
      lastUserMessage: userText.slice(0, 100),
      lastAiResponse: aiText.slice(0, 100),
      summary: `User: ${userText.slice(0, 100)} | AI: ${aiText.slice(0, 100)}`,
    };
    updateConversationMeta(userId, convId, meta).catch(console.error);
  }
}

export const useChatbotStore = create<ChatbotState & ChatbotActions>((set, get) => ({
  messages: [],
  selectedCompanion: COMPANIONS[0], // Raya
  isTyping: false,
  sessionId: generateSessionId(),
  error: null,
  backendOnline: true,
  activeConversationId: null,
  conversations: [],
  conversationsLoading: false,
  historyDrawerOpen: false,
  feedbackMap: {},
  insightsData: null,
  insightsLoading: false,
  insightsPanelOpen: false,
  lastEmotionData: null,
  userProfile: null,
  insightsMoodData: [],
  weeklyInsights: null,
  userDateOfBirth: null,
  chatLanguage: (() => { try { return localStorage.getItem('zaryah_chat_language') || 'auto'; } catch { return 'auto'; } })(),
  quranAnchor: loadPersistedQuranAnchor(),

  sendUserMessage: async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || get().isTyping) return;

    const companion = get().selectedCompanion;
    const authUser = useAuthStore.getState().user;
    const userId = authUser?.id ?? 'anonymous';
    const userName = authUser?.displayName ?? undefined;
    const sessionId = get().sessionId;
    const canPersist = userId !== 'anonymous';

    // Ensure we have a Firestore conversation
    let convId = get().activeConversationId;
    // Also check localStorage in case state was cleared but storage wasn't
    if (!convId) {
      convId = localStorage.getItem(ACTIVE_CONV_KEY);
      if (convId) set({ activeConversationId: convId });
    }
    if (canPersist && !convId) {
      try {
        convId = await ensureConversation(userId, companion.id, trimmed, convId);
        set({ activeConversationId: convId });
      } catch (e) {
        console.error('Failed to create conversation:', e);
      }
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      text: trimmed,
      isUser: true,
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, userMsg], isTyping: true, error: null }));

    // Fire-and-forget: save user message
    if (canPersist && convId) {
      saveMessage(userId, convId, userMsg).catch(console.error);
    }

    // Fetch context in parallel — summaries + KYC profile at the same time
    let context: Record<string, unknown> | undefined;
    const ensureContext = () => {
      context ??= {};
      return context;
    };

    // Multilingual: pass selected chat language (works for anonymous users too)
    const chatLang = get().chatLanguage;
    if (chatLang && chatLang !== 'auto') {
      ensureContext().chat_language = chatLang;
    }

    // Quran anchor — verse + tafsir attached as reference context for this turn.
    // Sent on both authed and anonymous chats since it's not user-PII.
    const quranAnchor = get().quranAnchor;
    if (quranAnchor) {
      ensureContext().quran_anchor = {
        surah_id: quranAnchor.surahId,
        surah_name: quranAnchor.surahName,
        ayah_number: quranAnchor.ayahNumber,
        verse_key: quranAnchor.verseKey,
        arabic_text: quranAnchor.arabicText,
        translation: quranAnchor.translation,
        tafsir: quranAnchor.tafsir,
        tafsir_source: quranAnchor.tafsirSource,
      };
    }

    if (canPersist) {
      try {
        context ??= {};

        // Launch all context reads in parallel
        const summariesPromise = getRecentConversationSummaries(userId, 5);
        const blessingsPromise = (async () => {
          try {
            const { getStats } = await import('@/features/barka-labs/services/barkaLabsService');
            const stats = await getStats(userId);
            return stats;
          } catch {
            return null;
          }
        })();
        const kycPromise = (async () => {
          try {
            const { useKycStore } = await import('@/features/kyc/stores/kyc.store');
            const kycState = useKycStore.getState();
            if (kycState.kycTier >= 2 && userId !== 'anonymous') {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) return { tier: kycState.kycTier, data: userDoc.data() };
            }
            return { tier: kycState.kycTier, data: null };
          } catch {
            return { tier: 0, data: null };
          }
        })();

        const [summaries, kycResult, blessingsStats] = await Promise.all([summariesPromise, kycPromise, blessingsPromise]);

        if (summaries.length > 0) {
          context.conversation_summaries = summaries.map((s) => ({
            title: s.title,
            summary: s.summary,
            companion: s.companionId,
            date: s.updatedAt.toISOString(),
          }));
        }
        // RAYA EVOLUTION: Send user profile to backend for prompt injection
        const profile = get().userProfile;
        if (profile) {
          context.user_profile = profile;
        }
        // Send last emotion data for continuity
        const lastEmotion = get().lastEmotionData;
        if (lastEmotion) {
          context.last_emotion = lastEmotion;
        }
        // Age-adaptive voice: send DOB for Raya's age-group voice overlay
        const dob = get().userDateOfBirth;
        if (dob) {
          context.date_of_birth = dob;
        }
        // KYC profile context for personalization
        if (kycResult.tier > 0) {
          context.user_kyc_tier = kycResult.tier;
        }
        if (kycResult.data) {
          const d = kycResult.data;
          const kycProfile: Record<string, unknown> = {};
          if (d.intent_primary) kycProfile.intents = [d.intent_primary, ...(d.intent_secondary || [])];
          if (d.occupation) kycProfile.occupation = d.occupation;
          if (d.life_stage) kycProfile.life_stage = d.life_stage;
          if (d.iman_level !== undefined) kycProfile.iman_level = d.iman_level;
          if (d.money_motivation) kycProfile.money_motivation = d.money_motivation;
          if (d.crisis_instinct) kycProfile.crisis_instinct = d.crisis_instinct;
          if (d.biggest_stress) kycProfile.biggest_stress = d.biggest_stress;
          if (d.stress_sharing) kycProfile.stress_sharing = d.stress_sharing;
          if (d.conversation_pref) kycProfile.conversation_pref = d.conversation_pref;
          if (d.advice_style) kycProfile.advice_style = d.advice_style;
          if (d.raya_help_goal) kycProfile.raya_help_goal = d.raya_help_goal;
          if (d.deep_trying_to_change) kycProfile.deep_trying_to_change = d.deep_trying_to_change;
          if (d.deep_repeating_pattern) kycProfile.deep_repeating_pattern = d.deep_repeating_pattern;
          if (d.deep_night_thoughts) kycProfile.deep_night_thoughts = d.deep_night_thoughts;
          if (d.deep_feared_self) kycProfile.deep_feared_self = d.deep_feared_self;
          if (d.deep_real_self) kycProfile.deep_real_self = d.deep_real_self;
          if (d.deep_whose_life) kycProfile.deep_whose_life = d.deep_whose_life;
          if (d.deep_five_year_test) kycProfile.deep_five_year_test = d.deep_five_year_test;
          if (d.deep_younger_self) kycProfile.deep_younger_self = d.deep_younger_self;
          if (d.school_of_thought) kycProfile.school_of_thought = d.school_of_thought;
          if (d.pascoArchetype) kycProfile.pasco_archetype = d.pascoArchetype;
          if (d.pascoTraits?.length) kycProfile.pasco_traits = d.pascoTraits;
          if (d.islamic_interests?.length) kycProfile.islamic_interests = d.islamic_interests;
          if (d.islamicInterests?.length) kycProfile.islamic_interests = d.islamicInterests;
          if (d.hobbies?.length) kycProfile.hobbies = d.hobbies;
          if (d.gender) kycProfile.gender = d.gender;
          if (d.country) kycProfile.country = d.country;
          if (d.city) kycProfile.city = d.city;
          if (Object.keys(kycProfile).length > 0) {
            context.user_kyc_profile = kycProfile;
          }
        }
        // Blessings/Niyaamat stats for gratitude awareness
        if (blessingsStats && blessingsStats.total_blessings > 0) {
          context.blessings_stats = {
            total_blessings: blessingsStats.total_blessings,
            avg_depth_score: blessingsStats.avg_depth_score,
            profound_count: blessingsStats.profound_count,
            thoughtful_count: blessingsStats.thoughtful_count,
            common_count: blessingsStats.common_count,
            current_streak: blessingsStats.current_streak,
            longest_streak: blessingsStats.longest_streak,
          };
        }
      } catch {
        // Non-critical — continue without context
      }
    }

    try {
      if (companion.id === 'raya') {
        // ======= STREAMING PATH for Raya =======
        const aiMsgId = generateId();
        // Check if recent conversation was about investments (context-aware detection)
        const recentMsgs = get().messages.slice(-8);
        const investmentContext: AnalyzeOptions = {
          conversationIsAboutInvestments: recentMsgs.some((m) =>
            m.messageType === ChatMessageType.stockChart ||
            m.messageType === ChatMessageType.comparison ||
            m.messageType === ChatMessageType.pieChart
          ),
        };
        const analysis = analyzeUserQuery(trimmed, investmentContext);

        const aiMsg: ChatMessage = {
          id: aiMsgId,
          text: '',
          isUser: false,
          timestamp: new Date(),
          companionId: companion.id,
          messageType: analysis.isInvestmentQuery ? analysis.messageType : undefined,
          thinkingContent: analysis.isInvestmentQuery
            ? 'Analyzing your query...'
            : 'Raya is thinking...',
        };
        set((s) => ({ messages: [...s.messages, aiMsg] }));

        let fullText = '';
        let hasToolThinking = false;

        // Smooth streaming: batch token updates to next animation frame
        let rafPending = false;
        const flushText = () => {
          rafPending = false;
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === aiMsgId ? { ...m, text: fullText } : m
            ),
          }));
        };

        await streamMessage(
          {
            user_id: userId,
            session_id: sessionId,
            message: trimmed,
            user_name: userName,
            context,
          },
          // onChunk — accumulate text, flush on next animation frame for smooth rendering
          (chunk: string) => {
            fullText += chunk;
            if (!rafPending) {
              rafPending = true;
              requestAnimationFrame(flushText);
            }
          },
          // onDone — set suggestions + cross-referral + ai source + emotion + persist
          (event: StreamEvent) => {
            const sourceMap: Record<string, string> = { anthropic: 'anthropic', openai: 'openai', deepseek: 'deepseek', groq: 'groq' };
            const aiSource = (sourceMap[event.ai_source ?? ''] ?? 'anthropic') as 'anthropic' | 'openai' | 'deepseek' | 'groq';

            // RAYA EVOLUTION: Parse emotion data from SSE event
            let emotionData: EmotionData | undefined;
            if (event.emotion_data) {
              emotionData = {
                primaryEmotion: event.emotion_data.primary_emotion,
                secondaryEmotion: event.emotion_data.secondary_emotion,
                intensity: event.emotion_data.intensity,
                sentiment: event.emotion_data.sentiment,
                underlyingNeed: event.emotion_data.underlying_need,
                cognitivePattern: event.emotion_data.cognitive_pattern,
              };
              set({ lastEmotionData: emotionData });
            }

            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === aiMsgId
                  ? {
                      ...m,
                      suggestions: event.suggestions?.length ? event.suggestions : undefined,
                      suggestedCompanion: event.suggested_companion ?? undefined,
                      suggestedCompanionName: event.suggested_companion_name ?? undefined,
                      navigateLinks: event.navigate_links?.length
                        ? event.navigate_links.map((nl) => ({ label: nl.label, route: nl.route }))
                        : undefined,
                      aiSource,
                      emotionData,
                      // Clear placeholder thinking; keep real tool steps
                      ...(!hasToolThinking ? { thinkingContent: undefined } : {}),
                    }
                  : m
              ),
              isTyping: false,
            }));

            // Fire-and-forget: save completed AI message + mood entry
            if (canPersist && convId) {
              const completedAiMsg: ChatMessage = {
                id: aiMsgId,
                text: fullText,
                isUser: false,
                timestamp: aiMsg.timestamp,
                companionId: companion.id,
                messageType: aiMsg.messageType,
                emotionData,
              };
              persistSave(userId, convId, completedAiMsg, trimmed, fullText);

              // RAYA EVOLUTION Phase 4: Persist mood + profile
              if (emotionData && emotionData.primaryEmotion !== 'neutral') {
                saveMoodEntry(userId, {
                  primaryEmotion: emotionData.primaryEmotion,
                  secondaryEmotion: emotionData.secondaryEmotion,
                  intensity: emotionData.intensity,
                  sentiment: emotionData.sentiment,
                  underlyingNeed: emotionData.underlyingNeed,
                  conversationId: convId,
                  timestamp: new Date(),
                }).catch(console.error);

                // Accumulate dominant emotions in profile
                const currentProfile = get().userProfile;
                const dominantEmotions = [...(currentProfile?.dominantEmotions ?? []), emotionData.primaryEmotion].slice(-20);
                updateUserProfile(userId, { dominantEmotions }).catch(console.error);
              }
            }

            // RAYA EVOLUTION Phase 6: Update summary if backend sent one
            if (event.summary_update && canPersist && convId) {
              updateConversationMeta(userId, convId, { summary: event.summary_update }).catch(console.error);
            }

            // DNZ: Refresh wallet balance after chat message (server awards DNZ per 5 msgs)
            useWalletStore.getState().refreshBalance();
          },
          // onThinking — update thinking content on the AI message
          (thinkingContent: string) => {
            hasToolThinking = true;
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === aiMsgId ? { ...m, thinkingContent } : m
              ),
            }));
          },
        );

        // Ensure isTyping is off even if onDone didn't fire
        set({ isTyping: false });

        // Fire-and-forget: fetch chart data + analysis for stock queries
        if (analysis.isInvestmentQuery && analysis.symbols.length > 0) {
          const fetchFn = analysis.messageType === 'pieChart'
            ? buildPortfolioChartData(analysis.symbols, trimmed)
            : analysis.isComparison && analysis.symbols.length >= 2
              ? buildComparisonData(analysis.symbols)
              : buildAnalysisData(analysis.symbols[0], analysis.investmentIntent !== 'none' ? analysis.investmentIntent : 'full_analysis');
          // Add 30s timeout so skeleton doesn't hang forever
          const withTimeout = Promise.race([
            fetchFn,
            new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 30000)),
          ]);
          withTimeout.then((chartData) => {
            if (chartData) {
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === aiMsgId ? { ...m, chartData } : m
                ),
              }));
            }
          }).catch(() => {
            // On error/timeout, clear the messageType so skeleton disappears
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === aiMsgId ? { ...m, messageType: undefined } : m
              ),
            }));
          });
        }
      } else {
        // ======= STREAMING PATH for companions =======
        const aiMsgId = generateId();
        const aiMsg: ChatMessage = {
          id: aiMsgId,
          text: '',
          isUser: false,
          timestamp: new Date(),
          companionId: companion.id,
          thinkingContent: `${companion.name} is reflecting...`,
        };
        set((s) => ({ messages: [...s.messages, aiMsg] }));

        let fullText = '';

        // Smooth streaming: batch companion token updates to next animation frame
        let rafPending2 = false;
        const flushCompanionText = () => {
          rafPending2 = false;
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === aiMsgId ? { ...m, text: fullText, thinkingContent: undefined } : m
            ),
          }));
        };

        await streamCompanionMessage(
          {
            user_id: userId,
            message: trimmed,
            companion_id: companion.id,
            session_id: sessionId,
            require_sources: true,
          },
          // onChunk — accumulate text, flush on next animation frame for smooth rendering
          (chunk: string) => {
            fullText += chunk;
            if (!rafPending2) {
              rafPending2 = true;
              requestAnimationFrame(flushCompanionText);
            }
          },
          // onDone — set metadata from companion done event
          (event: StreamEvent) => {
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === aiMsgId
                  ? {
                      ...m,
                      suggestions: event.suggestions?.length ? event.suggestions : undefined,
                      sources: event.sources?.length ? event.sources : undefined,
                      confidence: event.confidence,
                      suggestedCompanion: event.suggested_companion ?? undefined,
                      suggestedCompanionName: event.suggested_companion_name ?? undefined,
                      navigateLinks: event.navigate_links?.length
                        ? event.navigate_links.map((nl) => ({ label: nl.label, route: nl.route }))
                        : undefined,
                      thinkingContent: undefined,
                    }
                  : m
              ),
              isTyping: false,
            }));

            // Fire-and-forget: persist completed AI message
            if (canPersist && convId) {
              const completedAiMsg: ChatMessage = {
                id: aiMsgId,
                text: fullText,
                isUser: false,
                timestamp: aiMsg.timestamp,
                companionId: companion.id,
              };
              persistSave(userId, convId, completedAiMsg, trimmed, fullText);
            }
          },
        );

        // Ensure isTyping is off even if onDone didn't fire
        set({ isTyping: false });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
      console.error('[Chatbot] sendUserMessage error:', err);

      // Build a user-friendly message based on the error type
      let userMessage: string;
      if (errorMsg.includes('Cannot reach the backend') || errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        userMessage = 'I cannot reach the server right now. Please check that the backend is running and try again.';
      } else if (errorMsg.includes('timed out')) {
        userMessage = 'The request timed out. The server may be busy — please try again in a moment.';
      } else if (errorMsg.includes('Backend error')) {
        userMessage = `The server returned an error: ${errorMsg}. Please try again.`;
      } else if (errorMsg.includes('Stream error from backend')) {
        userMessage = `Something went wrong on the server side. Please try again.`;
      } else if (errorMsg.includes('rate_limit') || errorMsg.includes('RateLimitError') || errorMsg.includes('429')) {
        userMessage = 'The AI service is temporarily busy. Please try again in a moment.';
      } else {
        userMessage = `Something went wrong: ${errorMsg}. Please try again.`;
      }

      const fallbackMsg: ChatMessage = {
        id: generateId(),
        text: userMessage,
        isUser: false,
        timestamp: new Date(),
        companionId: companion.id,
      };
      set((s) => ({
        messages: [...s.messages, fallbackMsg],
        isTyping: false,
        error: errorMsg,
      }));
    }
  },

  setCompanion: (id: string) => {
    const companion = getCompanionById(id);
    localStorage.removeItem(ACTIVE_CONV_KEY);
    persistQuranAnchor(null);

    // Build initial messages — include welcome message if companion has one
    const initialMessages: ChatMessage[] = [];
    if (companion.welcomeMessage && companion.id !== 'raya') {
      initialMessages.push({
        id: `welcome-${Date.now()}`,
        text: companion.welcomeMessage,
        isUser: false,
        timestamp: new Date(),
        companionId: companion.id,
      });
    }

    set({
      selectedCompanion: companion,
      messages: initialMessages,
      activeConversationId: null,
      sessionId: generateSessionId(),
      error: null,
      quranAnchor: null,
    });
  },

  clearChat: () => {
    localStorage.removeItem(ACTIVE_CONV_KEY);
    persistQuranAnchor(null);
    set({
      messages: [],
      activeConversationId: null,
      sessionId: generateSessionId(),
      error: null,
      quranAnchor: null,
    });
  },

  initFromNavState: (state) => {
    const hasAnchor = !!state.quranAnchor;
    const hasCompanion = !!state.companionId;

    if (hasAnchor || hasCompanion) {
      // Anchor handoffs land on Raya unless a different companion was passed.
      const companion = hasCompanion
        ? getCompanionById(state.companionId!)
        : getCompanionById('raya');

      const initialMessages: ChatMessage[] = [];
      if (companion.welcomeMessage && companion.id !== 'raya') {
        initialMessages.push({
          id: `welcome-${Date.now()}`,
          text: companion.welcomeMessage,
          isUser: false,
          timestamp: new Date(),
          companionId: companion.id,
        });
      }

      localStorage.removeItem(ACTIVE_CONV_KEY);
      const nextAnchor = state.quranAnchor ?? null;
      persistQuranAnchor(nextAnchor);

      set({
        selectedCompanion: companion,
        messages: initialMessages,
        activeConversationId: null,
        sessionId: generateSessionId(),
        quranAnchor: nextAnchor,
      });
    }
    // Set chat language if passed (e.g. from Quran reading page translation)
    if (state.chatLanguage && state.chatLanguage !== 'en') {
      get().setChatLanguage(state.chatLanguage);
    }
    if (state.initialMessage) {
      setTimeout(() => get().sendUserMessage(state.initialMessage!), 100);
    }
  },

  setQuranAnchor: (anchor) => {
    persistQuranAnchor(anchor);
    set({ quranAnchor: anchor });
  },

  clearQuranAnchor: () => {
    persistQuranAnchor(null);
    set({ quranAnchor: null });
  },

  setBackendOnline: (online: boolean) => set({ backendOnline: online }),

  refreshChartData: async (messageId: string, symbol: string, period: string) => {
    try {
      const chartData = await buildStockChartData(symbol, period);
      const current = get().messages.find((m) => m.id === messageId);
      if (current) {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === messageId ? { ...m, chartData } : m
          ),
        }));
      }
    } catch {
      // Silently ignore — existing chart stays
    }
  },

  refreshComparisonData: async (messageId: string, symbols: string[], period: string) => {
    try {
      const chartData = await buildComparisonData(symbols, period);
      const current = get().messages.find((m) => m.id === messageId);
      if (current) {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === messageId ? { ...m, chartData } : m
          ),
        }));
      }
    } catch {
      // Silently ignore — existing chart stays
    }
  },

  // ── Conversation History ──

  startNewConversation: () => {
    localStorage.removeItem(ACTIVE_CONV_KEY);
    persistQuranAnchor(null);
    set({
      messages: [],
      activeConversationId: null,
      sessionId: generateSessionId(),
      error: null,
      historyDrawerOpen: false,
      quranAnchor: null,
    });
  },

  sendGreeting: () => {
    // Only greet if the conversation is empty
    if (get().messages.length > 0) return;

    const companion = get().selectedCompanion;
    const authUser = useAuthStore.getState().user;
    const name = authUser?.displayName?.split(' ')[0] ?? '';

    const greetings: Record<string, string> = {
      raya: `Assalamu Alaikum${name ? `, ${name}` : ''}! I'm Raya, your Islamic knowledge guide. How can I help you today? Whether it's about Quran, prayer, halal finance, or any other topic — feel free to ask me anything.`,
      abu_bakr: `Assalamu Alaikum${name ? `, ${name}` : ''}. I am Abu Bakr As-Siddiq. I am here to offer you guidance with sincerity and gentleness. What weighs on your heart today?`,
      umar: `Assalamu Alaikum${name ? `, ${name}` : ''}. I am Umar ibn Al-Khattab. Speak plainly — what matter do you seek guidance on? I will give you an honest answer, by Allah's will.`,
      uthman: `Assalamu Alaikum${name ? `, ${name}` : ''}. I am Uthman ibn Affan. It is a pleasure to speak with you. How may I assist you today?`,
      ali: `Assalamu Alaikum${name ? `, ${name}` : ''}. I am Ali ibn Abi Talib. Knowledge is the greatest treasure — what would you like to explore together?`,
      khadijah: `Assalamu Alaikum${name ? `, ${name}` : ''}. I am Khadijah bint Khuwaylid. I'm here to support and guide you. What would you like to discuss?`,
      aisha: `Assalamu Alaikum${name ? `, ${name}` : ''}. I am Aisha bint Abi Bakr. I have much knowledge to share — what question is on your mind?`,
      fatimah: `Assalamu Alaikum${name ? `, ${name}` : ''}. I am Fatimah Az-Zahra. I'm here to help with whatever you need. What would you like to talk about?`,
      imam_abu_hanifa: `Assalamu Alaikum${name ? `, ${name}` : ''}. I am Imam Abu Hanifa. I'm ready to reason through any matter of fiqh or daily life with you. What is your question?`,
      imam_malik: `Assalamu Alaikum${name ? `, ${name}` : ''}. I am Imam Malik ibn Anas. What guidance do you seek today?`,
      imam_shafii: `Assalamu Alaikum${name ? `, ${name}` : ''}. I am Imam Ash-Shafi'i. Let us explore your question together with clarity and evidence.`,
      imam_ahmad: `Assalamu Alaikum${name ? `, ${name}` : ''}. I am Imam Ahmad ibn Hanbal. I am here to help you with matters of faith and practice. What do you need?`,
    };

    const text = greetings[companion.id] ?? greetings.raya;

    const greetingMsg: ChatMessage = {
      id: generateId(),
      text,
      isUser: false,
      timestamp: new Date(),
      companionId: companion.id,
    };
    set({ messages: [greetingMsg] });
  },

  loadConversation: async (convId: string) => {
    const userId = isAuthenticated();
    if (!userId) return;

    try {
      const messages = await loadConversationMessages(userId, convId);
      const convMeta = get().conversations.find((c) => c.id === convId);

      localStorage.setItem(ACTIVE_CONV_KEY, convId);
      persistQuranAnchor(null);
      set({
        messages,
        activeConversationId: convId,
        selectedCompanion: convMeta ? getCompanionById(convMeta.companionId) : COMPANIONS[0],
        sessionId: generateSessionId(),
        error: null,
        historyDrawerOpen: false,
        quranAnchor: null,
      });
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  },

  deleteConversation: async (convId: string) => {
    const userId = isAuthenticated();
    if (!userId) {
      console.warn('deleteConversation: not authenticated');
      return;
    }

    // Optimistic removal from local state so UI updates immediately
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== convId),
    }));

    try {
      await deleteConversationFromFirestore(userId, convId);
      // If we deleted the active conversation, clear it
      if (get().activeConversationId === convId) {
        localStorage.removeItem(ACTIVE_CONV_KEY);
        persistQuranAnchor(null);
        set({ messages: [], activeConversationId: null, sessionId: generateSessionId(), quranAnchor: null });
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      // Revert: re-subscribe will restore the list from Firestore
    }
  },

  cleanupSmallConversations: async (minMessages = 5) => {
    const userId = isAuthenticated();
    if (!userId) return 0;

    // NO optimistic removal — let the onSnapshot listener handle UI updates
    // as each conversation gets deleted from Firestore in real-time
    try {
      const deleted = await deleteConversationsBelowCount(userId, minMessages);
      // If active conversation was among deleted, clear it
      const activeId = get().activeConversationId;
      if (activeId && !get().conversations.find((c) => c.id === activeId)) {
        localStorage.removeItem(ACTIVE_CONV_KEY);
        persistQuranAnchor(null);
        set({ messages: [], activeConversationId: null, sessionId: generateSessionId(), quranAnchor: null });
      }
      return deleted;
    } catch (err) {
      console.error('Error cleaning up conversations:', err);
      return 0;
    }
  },

  subscribeConversations: () => {
    const userId = isAuthenticated();
    if (!userId) {
      console.log('ChatbotStore: subscribeConversations skipped — no authenticated user');
      return null;
    }

    console.log('ChatbotStore: subscribing to conversations for user', userId);
    set({ conversationsLoading: true });
    return subscribeToConversations(userId, (convs) => {
      // Deduplicate: if two conversations share the same title, keep the one with more messages
      const seen = new Map<string, typeof convs[number]>();
      for (const conv of convs) {
        const key = conv.title.trim().toLowerCase();
        const existing = seen.get(key);
        if (!existing || conv.messageCount > existing.messageCount) {
          seen.set(key, conv);
        }
      }
      const deduped = [...seen.values()].sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
      console.log('ChatbotStore: received', convs.length, 'conversations, deduped to', deduped.length);
      set({ conversations: deduped, conversationsLoading: false });
    });
  },

  setHistoryDrawerOpen: (open: boolean) => set({ historyDrawerOpen: open }),

  restoreActiveConversation: async () => {
    const userId = isAuthenticated();
    if (!userId) return;

    // RAYA EVOLUTION: Load user profile on init
    get().fetchUserProfile();

    const savedConvId = localStorage.getItem(ACTIVE_CONV_KEY);
    if (!savedConvId) return;

    try {
      const messages = await loadConversationMessages(userId, savedConvId);
      if (messages.length > 0) {
        // Determine companion from first AI message
        const firstAiMsg = messages.find((m) => !m.isUser);
        const companionId = firstAiMsg?.companionId ?? 'raya';

        set({
          messages,
          activeConversationId: savedConvId,
          selectedCompanion: getCompanionById(companionId),
          sessionId: generateSessionId(),
        });
      }
    } catch (err) {
      console.error('Error restoring conversation:', err);
      localStorage.removeItem(ACTIVE_CONV_KEY);
    }
  },

  submitFeedback: (messageId: string, feedback: 'up' | 'down') => {
    const userId = isAuthenticated();
    if (!userId) return;

    // Optimistic update
    set((s) => ({ feedbackMap: { ...s.feedbackMap, [messageId]: feedback } }));

    const rating = feedback === 'up' ? 5 : 1;
    submitFeedbackAPI(userId, messageId, feedback, rating).catch(() => {
      // Revert on failure
      set((s) => {
        const next = { ...s.feedbackMap };
        delete next[messageId];
        return { feedbackMap: next };
      });
    });
  },

  fetchInsights: async () => {
    const userId = isAuthenticated();
    if (!userId) return;

    set({ insightsLoading: true });
    try {
      // Fetch insights + mood data + weekly insights in parallel
      const [insightsRes, moodLog, profile, weekly] = await Promise.all([
        getUserInsights(userId).catch(() => ({ insights: {} })),
        getMoodLog(userId, 100).catch(() => []),
        getUserProfile(userId).catch(() => null),
        getWeeklyInsights(userId).catch(() => null),
      ]);
      const raw = insightsRes.insights as Record<string, unknown>;
      set({
        insightsData: {
          insights: (raw.insights as string) ?? '',
          stats: (raw.stats as InsightsData['stats']) ?? {},
          last_updated: (raw.last_updated as string) ?? new Date().toISOString(),
        },
        insightsMoodData: moodLog,
        userProfile: profile,
        weeklyInsights: weekly,
        insightsLoading: false,
      });
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      set({ insightsLoading: false });
    }
  },

  setInsightsPanelOpen: (open: boolean) => {
    set({ insightsPanelOpen: open });
    if (open) {
      // Auto-fetch on open
      get().fetchInsights();
    }
  },

  // SOULBUDDY: Load user emotional profile from Firestore
  fetchUserProfile: async () => {
    const userId = isAuthenticated();
    if (!userId) return;
    try {
      // Fetch emotional profile + DOB in parallel (single session read for DOB)
      const [profile, userSnap] = await Promise.all([
        getUserProfile(userId),
        get().userDateOfBirth === null
          ? getDoc(doc(db, 'users', userId))
          : Promise.resolve(null),
      ]);
      if (profile) {
        set({ userProfile: profile });
      }
      // Cache date_of_birth from the main user document (one-time per session)
      if (userSnap && userSnap.exists()) {
        const userData = userSnap.data();
        const dob = userData?.date_of_birth ?? userData?.dateOfBirth ?? null;
        // Handle Firestore Timestamp, Date, or ISO string
        let dobStr: string | null = null;
        if (dob) {
          if (typeof dob === 'string') {
            dobStr = dob;
          } else if (dob.toDate) {
            dobStr = dob.toDate().toISOString();
          } else if (dob instanceof Date) {
            dobStr = dob.toISOString();
          }
        }
        set({ userDateOfBirth: dobStr });
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  },

  // SOULBUDDY: Fetch weekly insights from backend
  fetchWeeklyInsights: async () => {
    const userId = isAuthenticated();
    if (!userId) return;
    try {
      const weekly = await getWeeklyInsights(userId);
      if (weekly) {
        set({ weeklyInsights: weekly });
      }
    } catch (err) {
      console.error('Failed to fetch weekly insights:', err);
    }
  },

  setChatLanguage: (lang: string) => {
    set({ chatLanguage: lang });
    try { localStorage.setItem('zaryah_chat_language', lang); } catch { /* best-effort */ }
  },
}));
