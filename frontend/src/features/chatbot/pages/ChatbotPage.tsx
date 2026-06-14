/**
 * ChatbotPage
 * 3-panel desktop layout matching Flutter's AI Chat page
 * Left: Portfolio, News, History, User Story, Companion Mode
 * Center: Chat header + messages + input
 * Right: Health, Quran, Reminders, Share
 *
 * On smaller screens: single-column chat only
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/stores/auth.store';
import { trackFeature } from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerBanner, DisclaimerModal } from '@/components/shared';
import { useDisclaimerSeen } from '@/features/legal/hooks/useDisclaimerSeen';
import { ChatbotWalkthrough } from '../components/ChatbotWalkthrough';
import {
  Sparkle,
  CaretDown,
  CaretRight,
  CaretLeft,
  ArrowCounterClockwise,
  WifiSlash,
  ClockCounterClockwise,
  PlusCircle,
  Brain,
  MagnifyingGlass,
  Heart,
  Bell,
  ShareNetwork,
  InstagramLogo,
  LinkSimple,
  User,
  ChartLineUp,
  ShieldCheck,
  Lock,
  MoonStars,
  Coins,
  Star,
  CalendarBlank,
  UsersThree,
  Calendar,
  MapPin,
  Book,
  BookOpen,
  Circle,
  TrendUp,
  TrendDown,
  ChatTeardropDots,
  GlobeSimple,
  X,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useChatbotStore } from '../stores/chatbot.store';
import { checkHealth } from '../services/chatbotService';
import { QUICK_SUGGESTIONS } from '../types/chatbot.types';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { ChatInput } from '../components/ChatInput';
import { CompanionSelector } from '../components/CompanionSelector';
import { ConversationHistory } from '../components/ConversationHistory';
import { InsightsPanel } from '../components/InsightsPanel';
import { shareToInstagram, shareToApps, downloadShareImage } from '../utils/shareService';
import { createShareLink } from '../utils/shareLinkService';
import type { ShareCardData } from '../utils/chatImageGenerator';
import type { ShareResult } from '../utils/shareService';
import { ChatFeedbackPopup } from '../components/ChatFeedbackPopup';
import { ConversationListPanel } from '../components/ConversationListPanel';
import type { QuranAnchor } from '../types/chatbot.types';
import { WhatsAppFooterBanner } from '@/features/whatsapp-link/components/WhatsAppFooterBanner';

const FEEDBACK_SHOWN_KEY = 'zaryah_chat_feedback_shown';

/** Suggested follow-up questions shown under the Quran anchor pill. */
const RAYA_ANCHOR_CHIPS = [
  'What does this ayah teach me?',
  'What is the context of revelation?',
  'How can I apply this today?',
] as const;

function useChatFeedbackTrigger(messages: { isUser: boolean }[]) {
  const userId = useAuthStore((s) => s.user?.id);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const key = `${FEEDBACK_SHOWN_KEY}_${userId ?? 'anon'}`;
    try {
      if (localStorage.getItem(key) === '1') return;
    } catch { return; }

    const userMsgCount = messages.filter((m) => m.isUser).length;
    if (userMsgCount >= 3) {
      setShowFeedback(true);
      try { localStorage.setItem(key, '1'); } catch { /* best-effort */ }
    }
  }, [messages, userId]);

  const openFeedback = useCallback(() => setShowFeedback(true), []);
  const closeFeedback = useCallback(() => setShowFeedback(false), []);

  return [showFeedback, closeFeedback, openFeedback] as const;
}

function useChatWalkthroughSeen(): [boolean, () => void] {
  const userId = useAuthStore((s) => s.user?.id);
  const key = `zaryah_chat_walkthrough_${userId ?? 'anon'}`;
  const [seen, setSeen] = useState(() => {
    try { return localStorage.getItem(key) === '1'; } catch { return false; }
  });
  // Re-read when userId becomes available
  useEffect(() => {
    try { setSeen(localStorage.getItem(key) === '1'); } catch { /* best-effort */ }
  }, [key]);
  const markSeen = useCallback(() => {
    try { localStorage.setItem(key, '1'); } catch { /* best-effort */ }
    setSeen(true);
  }, [key]);
  return [seen, markSeen];
}

export function ChatbotPage() {
  useEffect(() => { trackFeature('chatbot'); }, []);
  const [chatbotSeen, markChatbotSeen] = useDisclaimerSeen('chatbot');
  const [chatWalkthroughSeen, markChatWalkthroughSeen] = useChatWalkthroughSeen();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const {
    messages,
    selectedCompanion,
    isTyping,
    error,
    backendOnline,
    activeConversationId,
    conversations,
    conversationsLoading,
    historyDrawerOpen,
    insightsData,
    insightsLoading,
    insightsPanelOpen,
    insightsMoodData,
    userProfile,
    weeklyInsights,
    sendUserMessage,
    setCompanion,
    clearChat,
    initFromNavState,
    setBackendOnline,
    refreshChartData,
    refreshComparisonData,
    startNewConversation,
    sendGreeting,
    loadConversation,
    deleteConversation,
    cleanupSmallConversations,
    subscribeConversations,
    setHistoryDrawerOpen,
    setInsightsPanelOpen,
    fetchInsights,
    restoreActiveConversation,
    fetchUserProfile,
    chatLanguage,
    setChatLanguage,
    quranAnchor,
    clearQuranAnchor,
  } = useChatbotStore();

  const [showFeedbackPopup, closeFeedbackPopup, openFeedbackPopup] = useChatFeedbackTrigger(messages);

  // Close language dropdown on outside click
  useEffect(() => {
    if (!langDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langDropdownOpen]);

  // On mount: restore last conversation OR start fresh
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Always fetch user profile + DOB on mount (needed for age-adaptive voice)
    fetchUserProfile();

    const navState = location.state as { companionId?: string; initialMessage?: string; chatLanguage?: string; newChat?: number; quranAnchor?: QuranAnchor } | null;

    if (navState?.companionId || navState?.initialMessage || navState?.quranAnchor) {
      initFromNavState(navState);
      if (!navState.initialMessage && !navState.quranAnchor) {
        sendGreeting();
      }
      window.history.replaceState({}, document.title);
    } else if (navState?.newChat) {
      // Fresh chat requested (from nav/widget)
      startNewConversation();
      sendGreeting();
      window.history.replaceState({}, document.title);
    } else {
      restoreActiveConversation().then(() => {
        if (useChatbotStore.getState().messages.length === 0) {
          sendGreeting();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startNewConversation is a stable zustand action; init effect is intentionally not re-run when its reference changes
  }, [location.state, initFromNavState, restoreActiveConversation, sendGreeting, fetchUserProfile]);

  // Handle re-click on sidebar (same route, new state.newChat timestamp)
  useEffect(() => {
    if (!initializedRef.current) return;
    const navState = location.state as { newChat?: number } | null;
    if (navState?.newChat) {
      startNewConversation();
      sendGreeting();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, startNewConversation, sendGreeting]);

  // Check backend health on mount
  useEffect(() => {
    checkHealth().then(setBackendOnline);
  }, [setBackendOnline]);

  // Subscribe to conversation list
  const authUser = useAuthStore((s) => s.user);
  useEffect(() => {
    if (!authUser?.id) return;
    const unsub = subscribeConversations();
    return () => { unsub?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  // Track whether user has scrolled up (don't auto-scroll if so)
  const isUserScrolledUp = useRef(false);

  // Listen for wheel / touch so we flip the pause flag *immediately* on user
  // intent, instead of waiting for onScroll (which can lag behind the many
  // auto-scrolls fired during a fast token stream).
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const pause = () => {
      isUserScrolledUp.current = true;
      setShowScrollBtn(true);
    };
    el.addEventListener('wheel', pause, { passive: true });
    el.addEventListener('touchstart', pause, { passive: true });
    return () => {
      el.removeEventListener('wheel', pause);
      el.removeEventListener('touchstart', pause);
    };
  }, []);

  // Auto-scroll to bottom on new messages only if user hasn't scrolled up
  useEffect(() => {
    if (!isUserScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Track scroll position so we can (a) hide/show the jump-to-bottom button
  // and (b) re-arm auto-scroll once the user returns near the bottom.
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom <= 80) {
      // Back at (or near) the bottom → resume auto-follow.
      isUserScrolledUp.current = false;
      setShowScrollBtn(false);
    } else if (distFromBottom > 150) {
      isUserScrolledUp.current = true;
      setShowScrollBtn(true);
    }
  }, []);

  const scrollToBottom = () => {
    isUserScrolledUp.current = false;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSuggestionSelect = useCallback(
    (text: string) => { isUserScrolledUp.current = false; sendUserMessage(text); },
    [sendUserMessage]
  );

  const handlePeriodChange = useMemo(
    () => (messageId: string) => (symbol: string, period: string) => {
      refreshChartData(messageId, symbol, period);
    },
    [refreshChartData]
  );

  const handleComparisonPeriodChange = useMemo(
    () => (messageId: string) => (symbols: string[], period: string) => {
      refreshComparisonData(messageId, symbols, period);
    },
    [refreshComparisonData]
  );

  const isEmpty = messages.length === 0 && !isTyping;

  return (
    <div className="flex h-full bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0F141F]">
      {!chatbotSeen && <DisclaimerModal contentId="AI_CHATBOT" onAccept={markChatbotSeen} />}

      {/* ==================== LEFT PANEL (xl+ only) ==================== */}
      {/* Hidden for marketing launch (40+ UX). Flip `false` → `true` to restore. */}
      {/* eslint-disable-next-line no-constant-binary-expression */}
      {false && (
        <div className="hidden xl:block shrink-0 relative">
          <div
            className="h-full overflow-hidden transition-[width] duration-300 ease-in-out"
            style={{ width: leftPanelOpen ? 320 : 0 }}
          >
            <aside className="flex flex-col w-[320px] h-full border-r border-[#D4A853]/10 bg-[#0A0E16] overflow-y-auto scrollbar-hide">
              <div className="p-4 space-y-4">
                <PortfolioCard />
                <ShariahScreeningCard />
                <HalalIntimacyCard />
                <UpcomingEventsCard />
                <NetworkingCard />
                <HalaqahCard />
                <UserStoryCard />
                <CompanionModeCard
                  companion={selectedCompanion}
                  onClick={() => setSelectorOpen(true)}
                />
              </div>
            </aside>
          </div>
          {/* Toggle arrow */}
          <button
            onClick={() => setLeftPanelOpen((v) => !v)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 flex items-center justify-center rounded-r-lg bg-[#0F141F] border border-l-0 border-[rgba(212,168,83,0.25)] hover:bg-[#10151F] hover:border-[rgba(212,168,83,0.4)] transition-all text-[#D4A853] shadow-lg"
            aria-label={leftPanelOpen ? 'Hide left panel' : 'Show left panel'}
          >
            {leftPanelOpen ? <CaretLeft size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
          </button>
        </div>
      )}

      {/* ==================== CENTER — Chat Area ==================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <header className="shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#D4A853]/15 bg-[#0A0E16]/95 backdrop-blur-lg relative z-20">
          <div className="flex items-center justify-between">
            {/* Left: companion info (mobile) / Digital Twin badge (desktop) */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              {/* Mobile: companion selector */}
              <button
                data-tour="chat-companion"
                onClick={() => setSelectorOpen(true)}
                className="flex xl:hidden items-center gap-2 hover:opacity-80 transition-opacity min-w-0"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0F141F]/80 border border-[#D4A853]/30 flex items-center justify-center text-base sm:text-lg shrink-0">
                  {selectedCompanion.icon}
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1">
                    <h1 className="text-xs sm:text-sm font-bold text-[#F5E8C7] truncate">{selectedCompanion.name}</h1>
                    <CaretDown size={12} className="text-[#D4A853] shrink-0" />
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-[#D4A853]/80 truncate">
                    Tap to switch companion
                  </p>
                </div>
              </button>

              {/* Desktop: companion header with selector */}
              <button
                data-tour="chat-companion-desktop"
                onClick={() => setSelectorOpen(true)}
                className="hidden xl:flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-11 h-11 rounded-full bg-[#0F141F]/80 border border-[#D4A853]/30 flex items-center justify-center text-xl">
                  {selectedCompanion.icon}
                </div>
                <div className="flex flex-col text-left">
                  {selectedCompanion.id === 'raya' && (
                    <span className="text-[10px] font-bold text-[#4FB892] bg-[#4FB892]/10 px-2.5 py-0.5 rounded-full border border-[#4FB892]/20 w-fit mb-1">
                      Digital Twin
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-xl font-display font-bold text-[#F5E8C7]">{selectedCompanion.name}</h1>
                    <CaretDown size={14} className="text-[#D4A853]" />
                  </div>
                  <p className="text-[10px] text-[#D4A853]/80">
                    Tap to switch companion · {selectedCompanion.title}
                  </p>
                </div>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className={cn('w-2 h-2 rounded-full', backendOnline ? 'bg-emerald-400' : 'bg-red-400')} />

              <button
                data-tour="chat-insights"
                onClick={() => setInsightsPanelOpen(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                title="Your insights"
              >
                <Brain size={16} className="text-white/50" />
              </button>

              <button
                onClick={() => setHistoryDrawerOpen(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                title="Conversation history"
              >
                <ClockCounterClockwise size={16} className="text-white/50" />
              </button>

              <button
                onClick={openFeedbackPopup}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-[#D4A853]/15 hover:bg-[#D4A853]/25 transition-colors border border-[#D4A853]/20"
                title="Share your feedback — we're in beta!"
              >
                <ChatTeardropDots size={16} weight="duotone" className="text-[#E8C97A]" />
              </button>

              {/* Language selector */}
              <div ref={langDropdownRef} className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className={cn(
                    'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors',
                    chatLanguage !== 'auto'
                      ? 'bg-[#D4A853]/15 border border-[#D4A853]/20'
                      : 'bg-white/5 hover:bg-white/10'
                  )}
                  title="Chat language"
                >
                  <GlobeSimple size={16} className={chatLanguage !== 'auto' ? 'text-[#E8C97A]' : 'text-white/50'} />
                </button>
                <AnimatePresence>
                  {langDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 z-50 w-48 max-h-72 overflow-y-auto rounded-xl bg-[#0A0E16] border border-[rgba(212,168,83,0.2)] shadow-xl"
                    >
                      {[
                        { code: 'auto', label: 'Auto-detect', flag: '🌐' },
                        { code: 'en', label: 'English', flag: '🇬🇧' },
                        { code: 'ar', label: 'العربية', flag: '🇸🇦' },
                        { code: 'ur', label: 'اردو', flag: '🇵🇰' },
                        { code: 'fr', label: 'Français', flag: '🇫🇷' },
                        { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
                        { code: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
                        { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
                        { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
                        { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
                        { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
                        { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                        { code: 'es', label: 'Español', flag: '🇪🇸' },
                        { code: 'pt', label: 'Português', flag: '🇧🇷' },
                        { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
                        { code: 'so', label: 'Soomaali', flag: '🇸🇴' },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { setChatLanguage(lang.code); setLangDropdownOpen(false); }}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                            chatLanguage === lang.code
                              ? 'bg-[#D4A853]/15 text-[#E8C97A]'
                              : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                          )}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search — desktop only */}
              {/* Hidden for launch — onClick was never wired. Flip false→true to restore. */}
              {/* eslint-disable-next-line no-constant-binary-expression */}
              {false && (
                <button
                  className="hidden xl:flex w-9 h-9 rounded-full items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                  title="Search conversations"
                >
                  <MagnifyingGlass size={16} className="text-white/50" />
                </button>
              )}

              {activeConversationId && (
                <button
                  onClick={startNewConversation}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                  title="New conversation"
                >
                  <PlusCircle size={16} className="text-white/50" />
                </button>
              )}

              {/* Clear chat — hidden for launch (redundant with New conversation above). */}
              {/* eslint-disable-next-line no-constant-binary-expression */}
              {false && (
                <button
                  onClick={clearChat}
                  className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                  title="Clear chat"
                >
                  <ArrowCounterClockwise size={16} className="text-white/50" />
                </button>
              )}
            </div>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-red-400/80 mt-2 flex items-center gap-1.5">
                  <WifiSlash size={12} />
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Messages area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4"
        >
          {isEmpty ? (
            <EmptyState
              companion={selectedCompanion}
              onSuggestionTap={handleSuggestionSelect}
            />
          ) : (
            <>
              {messages.map((msg, i) => {
                // Find the previous user message for AI share cards
                let prevUserMsg: string | undefined;
                if (!msg.isUser) {
                  for (let j = i - 1; j >= 0; j--) {
                    if (messages[j].isUser) {
                      prevUserMsg = messages[j].text;
                      break;
                    }
                  }
                }
                return (
                  <ChatMessageBubble
                    key={msg.id}
                    message={msg}
                    companion={selectedCompanion}
                    isLast={i === messages.length - 1 && !msg.isUser}
                    onSuggestionSelect={handleSuggestionSelect}
                    onPeriodChange={handlePeriodChange(msg.id)}
                    onComparisonPeriodChange={handleComparisonPeriodChange(msg.id)}
                    previousUserMessage={prevUserMsg}
                  />
                );
              })}

              {isTyping && !messages[messages.length - 1]?.thinkingContent && (
                <ChatMessageBubble
                  message={{
                    id: 'typing',
                    text: '',
                    isUser: false,
                    timestamp: new Date(),
                    isLoading: true,
                  }}
                  companion={selectedCompanion}
                  isLast={false}
                  onSuggestionSelect={handleSuggestionSelect}
                />
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom FAB */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={scrollToBottom}
              className={cn(
                'absolute bottom-24 right-6 z-10',
                'w-9 h-9 rounded-full flex items-center justify-center',
                'bg-[#0F141F]/90 border border-[#D4A853]/30',
                'shadow-lg hover:bg-[#0F141F] transition-colors'
              )}
            >
              <CaretDown size={16} className="text-[#D4A853]" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <DisclaimerBanner contentId="AI_CHATBOT" variant="subtle" className="shrink-0" />

        {/* Input */}
        <div data-tour="chat-input">
          {quranAnchor && (
            <QuranAnchorPill
              anchor={quranAnchor}
              onClear={clearQuranAnchor}
              onOpen={() =>
                navigate(
                  `/quran/read?surah=${quranAnchor.surahId ?? quranAnchor.verseKey.split(':')[0]}&verse=${encodeURIComponent(quranAnchor.verseKey)}`,
                )
              }
              onSuggestionTap={(text) => { isUserScrolledUp.current = false; sendUserMessage(text); }}
              showSuggestions={isEmpty}
            />
          )}
          <ChatInput
            onSend={(text) => { isUserScrolledUp.current = false; sendUserMessage(text); }}
            disabled={isTyping}
            placeholder={quranAnchor ? 'Ask about this ayah...' : undefined}
          />
        </div>
      </div>

      {/* ==================== RIGHT: Recent Chats (xl+ only) ==================== */}
      {/* Mobile/tablet keep using the Clock-icon drawer (ConversationHistory). */}
      <ConversationListPanel />

      {/* ==================== RIGHT PANEL (xl+ only) ==================== */}
      {/* Hidden for marketing launch (40+ UX). Flip `false` → `true` to restore. */}
      {/* eslint-disable-next-line no-constant-binary-expression */}
      {false && (
        <div className="hidden xl:block shrink-0 relative">
          {/* Toggle arrow */}
          <button
            onClick={() => setRightPanelOpen((v) => !v)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 flex items-center justify-center rounded-l-lg bg-[#0F141F] border border-r-0 border-[rgba(212,168,83,0.25)] hover:bg-[#10151F] hover:border-[rgba(212,168,83,0.4)] transition-all text-[#D4A853] shadow-lg"
            aria-label={rightPanelOpen ? 'Hide right panel' : 'Show right panel'}
          >
            {rightPanelOpen ? <CaretRight size={14} weight="bold" /> : <CaretLeft size={14} weight="bold" />}
          </button>
          <div
            className="h-full overflow-hidden transition-[width] duration-300 ease-in-out"
            style={{ width: rightPanelOpen ? 300 : 0 }}
          >
            <aside className="flex flex-col w-[300px] h-full border-l border-[#D4A853]/10 bg-[#0A0E16] overflow-y-auto scrollbar-hide">
              <div className="p-4 space-y-4">
                <HijriDateCard />
                <ZakatSummaryCard />
                <RemindersSection />
                <ShareHighlightsSection />
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ==================== OVERLAYS ==================== */}
      <CompanionSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        selectedId={selectedCompanion.id}
        onSelect={setCompanion}
      />

      <ConversationHistory
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        conversations={conversations}
        loading={conversationsLoading}
        activeId={activeConversationId}
        onSelect={loadConversation}
        onDelete={deleteConversation}
        onNewChat={startNewConversation}
        onCleanup={cleanupSmallConversations}
      />

      <InsightsPanel
        open={insightsPanelOpen}
        onClose={() => setInsightsPanelOpen(false)}
        data={insightsData}
        loading={insightsLoading}
        onRefresh={fetchInsights}
        moodData={insightsMoodData}
        userProfile={userProfile}
        weeklyInsights={weeklyInsights}
      />

      {/* Chatbot walkthrough — first visit only, after disclaimer accepted */}
      {chatbotSeen && !chatWalkthroughSeen && (
        <ChatbotWalkthrough onComplete={markChatWalkthroughSeen} />
      )}

      {/* Feedback popup — triggered after 3 user messages or via floating button */}
      <ChatFeedbackPopup open={showFeedbackPopup} onClose={closeFeedbackPopup} />
    </div>
  );
}

// ==================== Empty State ====================

function EmptyState({
  companion,
  onSuggestionTap,
}: {
  companion: { name: string; icon: string; title: string };
  onSuggestionTap: (text: string) => void;
}) {
  return (
    <div data-tour="chat-empty-state" className="flex flex-col items-center justify-center h-full px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0F141F]/80 to-[#0A0E16]/80 border border-[#D4A853]/30 flex items-center justify-center text-4xl mb-4 shadow-[0_8px_32px_rgba(212,168,83,0.15)]"
      >
        {companion.icon}
      </motion.div>

      <h2 className="text-lg font-bold text-[#F5E8C7] mb-1">{companion.name}</h2>
      <p className="text-sm text-[#C9A85C] mb-6 text-center">{companion.title}</p>

      <div className="w-full max-w-sm space-y-2">
        {QUICK_SUGGESTIONS.slice(0, 4).map((s, i) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => onSuggestionTap(s.replace('...', ''))}
            className={cn(
              'w-full text-left px-4 py-3 rounded-xl transition-colors',
              'bg-[#0F141F]/30 border border-white/5',
              'hover:bg-[#0F141F]/50 hover:border-[#D4A853]/20'
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkle size={14} className="text-[#D4A853]/50 shrink-0" />
              <span className="text-sm text-white/60">{s}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* TL §5 Step 8 — footer banner that surfaces the WhatsApp linking flow.
       * Hidden once the user has linked or dismissed. */}
      <WhatsAppFooterBanner />
    </div>
  );
}

// ==================== QURAN ANCHOR PILL ====================

function QuranAnchorPill({
  anchor,
  onClear,
  onOpen,
  onSuggestionTap,
  showSuggestions,
}: {
  anchor: QuranAnchor;
  onClear: () => void;
  onOpen: () => void;
  onSuggestionTap: (text: string) => void;
  showSuggestions: boolean;
}) {
  const label = `${anchor.surahName ?? 'Quran'} · ${anchor.verseKey}`;
  const source = anchor.tafsirSource ?? 'tafsir';
  const subtitle = anchor.tafsir ? `Tafsir from ${source} attached` : 'Verse context attached';

  return (
    <div className="max-w-3xl mx-auto -mb-px rounded-t-lg border border-b-0 border-[#D4A853]/25 bg-[#0A0E16]/95 px-3 py-2 shadow-sm border-l-2 border-l-[#D4A853]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${label}`}
          className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-md hover:bg-white/5 transition-colors -mx-1 px-1 py-1"
        >
          <span className="shrink-0 w-9 h-9 rounded-full bg-[#D4A853]/15 flex items-center justify-center text-[#D4A853]">
            <BookOpen size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#F5E8C7] truncate">{label}</p>
            <p className="text-xs text-white/45 truncate">{subtitle}</p>
          </span>
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Remove ayah context"
          className="shrink-0 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50"
        >
          <X size={14} />
        </button>
      </div>
      {showSuggestions && (
        <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {RAYA_ANCHOR_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onSuggestionTap(chip)}
              className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[11px] text-white/65 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== LEFT PANEL COMPONENTS ====================

function PortfolioCard() {
  return (
    <div className="rounded-xl border border-[#D4A853]/15 bg-[#0F141F]/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ChartLineUp size={16} className="text-[#4FB892]" />
          <span className="text-xs font-semibold text-[#7A7363]">Portfolio</span>
        </div>
        <CaretRight size={14} className="text-white/20" />
      </div>
      <p className="text-2xl font-bold text-[#F5E8C7]">$74,794</p>
      <div className="flex items-center gap-3 mt-1">
        <span className="text-xs text-emerald-400">1D +0.7%</span>
        <span className="text-xs text-[#7A7363]">Risk: Moderate</span>
      </div>
    </div>
  );
}

function ShariahScreeningCard() {
  const navigate = useNavigate();

  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 189.84, change: +1.32, halal: true },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.60, change: -0.87, halal: true },
  ];

  return (
    <div className="rounded-xl border border-[#D4A853]/15 bg-[#0F141F]/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} weight="fill" className="text-emerald-400" />
          <span className="text-xs font-semibold text-[#F5E8C7]">Shariah Screening</span>
        </div>
        <button
          onClick={() => navigate('/screener')}
          className="text-[10px] text-[#4FB892] hover:underline"
        >
          Screen more
        </button>
      </div>

      {/* Stock rows */}
      <div className="space-y-2">
        {stocks.map((stock) => (
          <button
            key={stock.symbol}
            onClick={() => navigate('/screener')}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-[#0A0E16]/50 border border-white/5 hover:border-[#D4A853]/20 transition-colors"
          >
            {/* Symbol badge */}
            <div className="w-9 h-9 rounded-lg bg-[#D4A853]/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-[#D4A853]">{stock.symbol}</span>
            </div>

            {/* Name + compliance */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-medium text-[#F5E8C7] truncate">{stock.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck size={10} weight="fill" className={stock.halal ? 'text-emerald-400' : 'text-red-400'} />
                <span className={cn('text-[9px] font-medium', stock.halal ? 'text-emerald-400' : 'text-red-400')}>
                  {stock.halal ? 'Halal' : 'Not Compliant'}
                </span>
              </div>
            </div>

            {/* Price + change */}
            <div className="text-right shrink-0">
              <p className="text-[11px] font-bold text-[#F5E8C7]">${stock.price.toFixed(2)}</p>
              <div className={cn('flex items-center gap-0.5 justify-end', stock.change >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {stock.change >= 0 ? <TrendUp size={10} /> : <TrendDown size={10} />}
                <span className="text-[10px] font-medium">{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Standards */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">AAOIFI</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4FB892]/10 text-[#4FB892] border border-[#4FB892]/20">TASIS</span>
        <span className="text-[10px] text-white/30 ml-auto">3-stage pipeline</span>
      </div>
    </div>
  );
}

function HalalIntimacyCard() {
  return (
    <div className="rounded-xl border border-[#D4A853]/15 bg-[#0F141F]/30 p-4 relative overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-pink-500/15 flex items-center justify-center">
          <Heart size={18} weight="fill" className="text-pink-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#F5E8C7]">Halal Intimacy</p>
          <p className="text-[10px] text-[#7A7363] mt-0.5">Islamic marital guidance</p>
        </div>
        <Lock size={14} className="text-[#D4A853]/40" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500/60 to-[#D4A853]/60 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '65%' }}
            transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[10px] text-[#D4A853] font-medium">Coming Soon</span>
      </div>
    </div>
  );
}

function UpcomingEventsCard() {
  const navigate = useNavigate();

  const events = [
    { id: '1', title: 'Global Islamic Finance Summit', date: 'Mar 15', location: 'Dubai, UAE', attendees: 380, format: 'In-Person' as const },
    { id: '2', title: 'Halal Economy Conference', date: 'Mar 22', location: 'Virtual', attendees: 1200, format: 'Virtual' as const },
  ];

  return (
    <div className="rounded-xl border border-[#D4A853]/15 bg-[#0F141F]/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} weight="fill" className="text-[#4FB892]" />
          <span className="text-xs font-semibold text-[#F5E8C7]">Upcoming Events</span>
        </div>
        <button
          onClick={() => navigate('/events')}
          className="text-[10px] text-[#4FB892] hover:underline"
        >
          View all
        </button>
      </div>
      <div className="space-y-2.5">
        {events.map((evt) => (
          <button
            key={evt.id}
            onClick={() => navigate('/events')}
            className="w-full text-left p-2.5 rounded-lg bg-[#0A0E16]/50 border border-white/5 hover:border-[#D4A853]/20 transition-colors"
          >
            <p className="text-[11px] font-medium text-[#F5E8C7] truncate">{evt.title}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-[#D4A853] flex items-center gap-1">
                <CalendarBlank size={10} />
                {evt.date}
              </span>
              <span className="text-[10px] text-[#7A7363] flex items-center gap-1">
                <MapPin size={10} />
                {evt.location}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-white/30 flex items-center gap-1">
                <UsersThree size={10} />
                {evt.attendees} attending
              </span>
              <span className={cn(
                'text-[9px] px-1.5 py-0.5 rounded-full',
                evt.format === 'Virtual'
                  ? 'bg-[#4FB892]/10 text-[#4FB892] border border-[#4FB892]/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              )}>
                {evt.format}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function NetworkingCard() {
  const navigate = useNavigate();

  const onlineUsers = [
    { id: '1', name: 'Ahmad Hassan', role: 'Islamic Finance', verified: true },
    { id: '2', name: 'Fatima Al-Rashid', role: 'Shariah Scholar', verified: true },
    { id: '3', name: 'Ibrahim Khan', role: 'Investment Banking', verified: true },
  ];

  return (
    <div className="rounded-xl border border-[#D4A853]/15 bg-[#0F141F]/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <UsersThree size={16} weight="fill" className="text-violet-400" />
          <span className="text-xs font-semibold text-[#F5E8C7]">Network</span>
        </div>
        <button
          onClick={() => navigate('/connections')}
          className="text-[10px] text-[#4FB892] hover:underline"
        >
          Explore
        </button>
      </div>

      {/* Online indicator */}
      <div className="flex items-center gap-1.5 mb-3">
        <Circle size={8} weight="fill" className="text-emerald-400" />
        <span className="text-[10px] text-emerald-400">{onlineUsers.length} professionals online</span>
      </div>

      <div className="space-y-2">
        {onlineUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => navigate('/connections')}
            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-violet-500/15 flex items-center justify-center text-[10px] font-bold text-violet-300 shrink-0">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1">
                <p className="text-[11px] text-[#F5E8C7] font-medium truncate">{user.name}</p>
                {user.verified && <ShieldCheck size={10} weight="fill" className="text-[#4FB892] shrink-0" />}
              </div>
              <p className="text-[10px] text-[#7A7363] truncate">{user.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function HalaqahCard() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/halaqah')}
      className="w-full rounded-xl border border-[#D4A853]/15 bg-[#0F141F]/30 p-4 hover:bg-[#0F141F]/50 hover:border-[#D4A853]/30 transition-all text-left group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Book size={16} weight="fill" className="text-emerald-400" />
          <span className="text-xs font-semibold text-[#F5E8C7]">Next Halaqah</span>
        </div>
        <CaretRight size={14} className="text-white/20 group-hover:text-[#D4A853]/60 transition-colors" />
      </div>

      <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
        <p className="text-[11px] font-medium text-[#F5E8C7]">Weekly Quran Study Circle</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] text-[#D4A853] flex items-center gap-1">
            <CalendarBlank size={10} />
            Friday, 2:00 PM
          </span>
          <span className="text-[10px] text-[#7A7363] flex items-center gap-1">
            <MapPin size={10} />
            Masjid Al-Noor
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-white/30 flex items-center gap-1">
            <UsersThree size={10} />
            22 / 30 spots
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Quran Study
          </span>
        </div>
      </div>

      <p className="text-[10px] text-white/25 mt-2">Sheikh Ahmad Abdullah &middot; 4.9 rating</p>
    </button>
  );
}

function UserStoryCard() {
  return (
    <div className="rounded-xl border border-[#D4A853]/15 bg-[#0F141F]/30 p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#4FB892]/20 flex items-center justify-center">
          <User size={14} className="text-[#4FB892]" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-[#7A7363]">User Story</span>
          <p className="text-[10px] text-white/40">Your profile</p>
        </div>
        <CaretRight size={14} className="text-white/20" />
      </div>
    </div>
  );
}

function CompanionModeCard({
  companion,
  onClick,
}: {
  companion: { name: string; icon: string };
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-[#D4A853]/15 bg-[#0F141F]/30 p-4 flex items-center gap-3 hover:bg-[#0F141F]/50 transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-[#D4A853]/10 flex items-center justify-center text-base">
        {companion.icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <span className="text-xs font-semibold text-[#7A7363]">Companion Mode</span>
        <p className="text-[10px] text-[#E8C97A]">{companion.name}</p>
      </div>
      <CaretRight size={14} className="text-white/20" />
    </button>
  );
}

// ==================== RIGHT PANEL COMPONENTS ====================

// ── Hijri date utilities (same algorithm as HijriCalendarPage) ──

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
];

const SPECIAL_DAYS: Record<number, Array<{ day: number; name: string }>> = {
  1: [{ day: 1, name: 'Islamic New Year' }, { day: 10, name: 'Day of Ashura' }],
  3: [{ day: 12, name: 'Mawlid an-Nabi' }],
  7: [{ day: 27, name: "Isra' and Mi'raj" }],
  8: [{ day: 15, name: 'Shab-e-Barat' }],
  9: [{ day: 1, name: 'Start of Ramadan' }, { day: 27, name: 'Laylat al-Qadr' }],
  10: [{ day: 1, name: 'Eid al-Fitr' }],
  12: [{ day: 9, name: 'Day of Arafah' }, { day: 10, name: 'Eid al-Adha' }],
};

function gregorianToHijri(gDate: Date): { year: number; month: number; day: number } {
  const y = gDate.getFullYear(), m = gDate.getMonth() + 1, d = gDate.getDate();
  const jd = Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4)
    + Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12)
    - Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4)
    + d - 32075;
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const lRem = l - 10631 * n + 354;
  const j = Math.floor((10985 - lRem) / 5316) * Math.floor((50 * lRem) / 17719)
    + Math.floor(lRem / 5670) * Math.floor((43 * lRem) / 15238);
  const lFinal = lRem - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hMonth = Math.floor((24 * lFinal) / 709);
  const hDay = lFinal - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;
  return { year: hYear, month: hMonth, day: hDay };
}

function getNextSpecialDay(hijri: { year: number; month: number; day: number }): { name: string; daysUntil: number } | null {
  // Check current month first, then upcoming months
  for (let offset = 0; offset < 12; offset++) {
    const checkMonth = ((hijri.month - 1 + offset) % 12) + 1;
    const days = SPECIAL_DAYS[checkMonth];
    if (!days) continue;
    for (const special of days) {
      if (offset === 0 && special.day <= hijri.day) continue;
      // Rough estimate of days until
      const daysUntil = offset === 0
        ? special.day - hijri.day
        : (offset - 1) * 30 + (30 - hijri.day) + special.day;
      return { name: special.name, daysUntil };
    }
  }
  return null;
}

function HijriDateCard() {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const hijri = useMemo(() => gregorianToHijri(today), [today]);
  const nextSpecial = useMemo(() => getNextSpecialDay(hijri), [hijri]);
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <button
      onClick={() => navigate('/calendar')}
      className="w-full rounded-xl border border-[#D4A853]/15 bg-[#0F141F]/30 p-4 hover:bg-[#0F141F]/50 hover:border-[#D4A853]/30 transition-all text-left group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MoonStars size={16} weight="fill" className="text-[#D4A853]" />
          <span className="text-xs font-semibold text-[#F5E8C7]">Hijri Date</span>
        </div>
        <CalendarBlank size={14} className="text-white/20 group-hover:text-[#D4A853]/60 transition-colors" />
      </div>

      {/* Big date display */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#D4A853]">{hijri.day}</span>
        <div>
          <p className="text-sm font-semibold text-[#F5E8C7]">{HIJRI_MONTHS[hijri.month - 1]}</p>
          <p className="text-[10px] text-[#7A7363]">{hijri.year} AH</p>
        </div>
      </div>

      <p className="text-[10px] text-white/30 mt-1">{dayOfWeek} &middot; {today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>

      {/* Next special day */}
      {nextSpecial && (
        <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#D4A853]/5 border border-[#D4A853]/15">
          <Star size={12} weight="fill" className="text-[#D4A853] shrink-0" />
          <p className="text-[10px] text-[#E8C97A]">
            {nextSpecial.name} <span className="text-white/30">&middot; in {nextSpecial.daysUntil} day{nextSpecial.daysUntil !== 1 ? 's' : ''}</span>
          </p>
        </div>
      )}
    </button>
  );
}

function ZakatSummaryCard() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/zakat')}
      className="w-full rounded-xl border border-[#D4A853]/15 bg-[#0F141F]/30 p-4 hover:bg-[#0F141F]/50 hover:border-[#D4A853]/30 transition-all text-left group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins size={16} weight="fill" className="text-emerald-400" />
          <span className="text-xs font-semibold text-[#F5E8C7]">Zakat</span>
        </div>
        <CaretRight size={14} className="text-white/20 group-hover:text-[#D4A853]/60 transition-colors" />
      </div>

      {/* Nisab info */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="px-2.5 py-2 rounded-lg bg-[#D4A853]/5 border border-[#D4A853]/15">
          <p className="text-[10px] text-[#7A7363]">Gold Nisab</p>
          <p className="text-xs font-bold text-[#D4A853]">85g</p>
        </div>
        <div className="px-2.5 py-2 rounded-lg bg-white/[0.03] border border-white/5">
          <p className="text-[10px] text-[#7A7363]">Silver Nisab</p>
          <p className="text-xs font-bold text-[#C9C0A8]">595g</p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
        <Coins size={12} className="text-emerald-400 shrink-0" />
        <p className="text-[10px] text-emerald-300">Calculate your Zakat &mdash; 2.5% of net wealth</p>
      </div>
      <p className="text-[10px] text-white/25 mt-2">AAOIFI Shariah Standard No. 35</p>
    </button>
  );
}

function RemindersSection() {
  const reminders = [
    { id: '1', text: 'Read Surah Al-Kahf', time: 'Friday' },
    { id: '2', text: 'Zakat calculation due', time: 'In 3 days' },
    { id: '3', text: 'Iftar preparation', time: '5:45 PM' },
  ];

  return (
    <div className="rounded-xl border border-[#D4A853]/15 bg-[#0F141F]/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={16} weight="fill" className="text-[#D4A853]" />
          <span className="text-xs font-semibold text-[#F5E8C7]">Reminders</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {reminders.map((r) => (
          <div key={r.id} className="flex items-center justify-between">
            <p className="text-xs text-white/60">{r.text}</p>
            <span className="text-[10px] text-[#7A7363]">{r.time}</span>
          </div>
        ))}
      </div>
      <button className="text-[10px] text-[#4FB892] mt-3 hover:underline">
        View all reminders
      </button>
    </div>
  );
}

function ShareHighlightsSection() {
  const messages = useChatbotStore((s) => s.messages);
  const selectedCompanion = useChatbotStore((s) => s.selectedCompanion);
  const [shareStatus, setShareStatus] = useState<'idle' | 'generating' | 'done'>('idle');
  const [linkStatus, setLinkStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleCopyLink = async () => {
    if (messages.length === 0) return;
    setLinkStatus('generating');
    setShareUrl(null);
    try {
      const url = await createShareLink(messages, {
        id: selectedCompanion.id,
        name: selectedCompanion.name,
        icon: selectedCompanion.icon,
      });
      setShareUrl(url);
      // Try clipboard — fallback handled below via visible URL
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // Clipboard blocked — user can still copy from the displayed URL
      }
      setLinkStatus('done');
      setTimeout(() => setLinkStatus('idle'), 5000);
    } catch (err) {
      console.error('Failed to create share link:', err);
      setLinkStatus('error');
      setTimeout(() => setLinkStatus('idle'), 3000);
    }
  };

  // Find the latest Q&A pair
  const latestQA = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].isUser && messages[i].text) {
        for (let j = i - 1; j >= 0; j--) {
          if (messages[j].isUser && messages[j].text) {
            return {
              userQuestion: messages[j].text,
              aiResponse: messages[i].text,
            };
          }
        }
      }
    }
    return null;
  }, [messages]);

  const shareData: ShareCardData | null = latestQA
    ? {
        userQuestion: latestQA.userQuestion,
        aiResponse: latestQA.aiResponse,
        companionName: selectedCompanion.name,
        companionIcon: selectedCompanion.icon,
      }
    : null;

  const handleShare = async (action: (data: ShareCardData) => Promise<ShareResult>) => {
    if (!shareData) return;
    setShareStatus('generating');
    try {
      await action(shareData);
      setShareStatus('done');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch {
      setShareStatus('idle');
    }
  };

  return (
    <div className="rounded-xl border border-[#D4A853]/15 bg-[#0F141F]/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShareNetwork size={16} className="text-[#7A7363]" />
        <span className="text-xs font-semibold text-[#7A7363]">Share Highlights</span>
      </div>

      {latestQA ? (
        <>
          {/* Preview snippet */}
          <div className="mb-3 p-2.5 rounded-lg bg-[#0A0E16]/60 border border-white/5">
            <p className="text-[10px] text-[#D4A853] font-medium mb-1">Latest Q&A</p>
            <p className="text-[11px] text-[#F5E8C7] line-clamp-2">{latestQA.userQuestion}</p>
            <p className="text-[10px] text-[#7A7363] line-clamp-2 mt-1">{latestQA.aiResponse}</p>
          </div>

          {/* Status */}
          {shareStatus !== 'idle' && (
            <p className={cn(
              'text-[10px] mb-2',
              shareStatus === 'generating' ? 'text-[#D4A853]' : 'text-emerald-400'
            )}>
              {shareStatus === 'generating' ? 'Generating image...' : 'Done!'}
            </p>
          )}

          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            disabled={linkStatus === 'generating' || messages.length === 0}
            className="w-full flex items-center justify-center gap-2 py-2 mb-2 rounded-lg bg-[#D4A853]/10 hover:bg-[#D4A853]/20 border border-[#D4A853]/20 transition-colors disabled:opacity-40"
            title="Copy shareable link"
          >
            <LinkSimple size={14} className={linkStatus === 'error' ? 'text-red-400' : 'text-[#D4A853]'} />
            <span className={cn('text-[10px] font-medium', linkStatus === 'error' ? 'text-red-400' : 'text-[#D4A853]')}>
              {linkStatus === 'generating' ? 'Creating link...' : linkStatus === 'done' ? 'Link copied!' : linkStatus === 'error' ? 'Failed — try again' : 'Copy Link'}
            </span>
          </button>

          {/* Show generated URL so user can manually copy if clipboard fails */}
          {shareUrl && linkStatus === 'done' && (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- copy-on-click affordance; the primary share action above is the button. This is a secondary fallback display.
            <div
              onClick={() => { navigator.clipboard.writeText(shareUrl).catch(() => {}); }}
              className="mb-2 px-2.5 py-1.5 rounded-lg bg-[#0A0E16]/60 border border-[#D4A853]/15 cursor-pointer hover:bg-[#0A0E16]/80 transition-colors"
              title="Click to copy"
            >
              <p className="text-[9px] text-[#7A7363] truncate">{shareUrl}</p>
            </div>
          )}

          {/* Share buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShare(shareToInstagram)}
              disabled={shareStatus === 'generating'}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40"
              title="Share to Instagram"
            >
              <InstagramLogo size={14} className="text-[#E84393]" />
              <span className="text-[10px] text-[#F5E8C7]">Instagram</span>
            </button>
            <button
              onClick={() => handleShare(shareToApps)}
              disabled={shareStatus === 'generating'}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40"
              title="Share to Apps"
            >
              <ShareNetwork size={14} className="text-[#4FB892]" />
              <span className="text-[10px] text-[#F5E8C7]">Share</span>
            </button>
            <button
              onClick={() => handleShare(downloadShareImage)}
              disabled={shareStatus === 'generating'}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40"
              title="Download Image"
            >
              <CaretDown size={14} className="text-[#D4A853]" />
              <span className="text-[10px] text-[#F5E8C7]">Save</span>
            </button>
          </div>
        </>
      ) : (
        <p className="text-xs text-white/40 text-center py-2">Start a conversation to share highlights</p>
      )}
    </div>
  );
}
