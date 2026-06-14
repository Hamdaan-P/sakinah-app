/**
 * Chatbot Types
 * Companion personas, chat messages, and API request/response models
 * Mirrors Flutter's companion.dart + chatbot models
 */

// ==================== COMPANION TYPES ====================

export type CompanionSection = 'default' | 'sahaba' | 'sahabiyat' | 'imams';

export interface Companion {
  id: string;
  name: string;
  title: string;
  description: string;
  voiceId: string;
  keywords: string[];
  icon: string;
  section: CompanionSection;
  welcomeMessage?: string;
}

export interface CompanionSectionConfig {
  title: string;
  companions: string[];
}

// ==================== NAVIGATE LINK TYPES ====================

export interface NavigateLink {
  label: string;
  route: string;
}

// ==================== CHAT MESSAGE TYPES ====================

export const ChatMessageType = {
  text: 'text',
  stockChart: 'stockChart',
  lineChart: 'lineChart',
  barChart: 'barChart',
  pieChart: 'pieChart',
  stockAnalysis: 'stockAnalysis',
  comparison: 'comparison',
} as const;
export type ChatMessageType = (typeof ChatMessageType)[keyof typeof ChatMessageType];

export const AISource = {
  anthropic: 'anthropic',
  openai: 'openai',
  deepseek: 'deepseek',
  deepseekThinking: 'deepseekThinking',
  groq: 'groq',
  groqPlus: 'groqPlus',
  offline: 'offline',
} as const;
export type AISource = (typeof AISource)[keyof typeof AISource];

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockMetric {
  label: string;
  value: string;
}

export interface PieChartSlice {
  name: string;
  value: number;
  color: string;
}

export interface StockChartData {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  isHalal?: boolean;
  series: HistoricalDataPoint[];
  metrics: StockMetric[];
  period: string;
}

// ==================== STOCK COMPARISON TYPES ====================

export interface NormalizedDataPoint {
  date: string;
  percentChange: number;
  close: number;
}

export interface ComparisonStockData {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  isHalal?: boolean;
  normalizedSeries: NormalizedDataPoint[];
  trailingPE?: number;
  roe?: number;
  overallVerdict?: string;
  shariahCompliant?: boolean;
  shariahStandard?: string;
}

export interface ComparisonData {
  stocks: ComparisonStockData[];
  period: string;
}

// ==================== STOCK ANALYSIS TYPES ====================

export interface RatioResult {
  name: string;
  value: number;
  limit: number;
  passed: boolean;
  percent_str: string;
  limit_str: string;
}

export interface ShariahScreenResult {
  symbol: string;
  name: string;
  standard: string;
  is_compliant: boolean;
  business_screen_passed: boolean;
  business_reason: string;
  debt_ratio: RatioResult;
  interest_ratio: RatioResult;
  receivables_ratio: RatioResult;
  sector: string;
  industry: string;
  current_price: number;
  purification_per_share_per_day: number;
  purification_per_dividend: number;
  issues: string[];
  warnings: string[];
}

export interface FundamentalAnalysis {
  dcf_intrinsic_value?: number;
  dcf_upside_pct?: number;
  trailing_pe?: number;
  sector_avg_pe?: number;
  pe_verdict: string;
  roe?: number;
  roe_verdict: string;
  eps_growth_cagr?: number;
  eps_verdict: string;
  combined_score: number;
  verdict: string;
}

export interface TechnicalAnalysis {
  rsi_14?: number;
  rsi_signal: string;
  ema_50?: number;
  ema_200?: number;
  ema_signal: string;
  macd_value?: number;
  macd_signal_line?: number;
  macd_histogram?: number;
  macd_signal: string;
  combined_score: number;
  verdict: string;
}

export interface StockAnalysisResult {
  symbol: string;
  name: string;
  current_price: number;
  change: number;
  change_percent: number;
  analysis_type: string;
  shariah?: ShariahScreenResult;
  fundamentals?: FundamentalAnalysis;
  technicals?: TechnicalAnalysis;
  overall_verdict?: string;
  user_level?: string;
}

export interface ChartData {
  type: ChatMessageType;
  stock?: StockChartData;
  pieSlices?: PieChartSlice[];
  barData?: Array<{ label: string; value: number }>;
  analysis?: StockAnalysisResult;
  comparison?: ComparisonData;
}

// ==================== EMOTION & MOOD TYPES (RAYA EVOLUTION) ====================

export interface EmotionData {
  primaryEmotion: string;
  secondaryEmotion?: string;
  intensity: number;
  sentiment: number;
  underlyingNeed?: string;
  cognitivePattern?: string;
}

export interface MoodLogEntry {
  primaryEmotion: string;
  secondaryEmotion?: string;
  intensity: number;
  sentiment: number;
  underlyingNeed?: string;
  conversationId: string;
  timestamp: Date;
}

export interface UserEmotionalProfile {
  recurringThemes: string[];
  copingPatterns: string[];
  growthAreas: string[];
  triggers: string[];
  dominantEmotions: string[];
  communicationStyle: string;
  lastUpdated: Date;
  // SOULBUDDY: Cognitive pattern tracking
  cognitivePatterns?: CognitivePatternTracker;
  // SOULBUDDY: Relationship graph
  relationships?: Record<string, RelationshipProfile>;
}

export interface CognitivePatternTracker {
  [patternName: string]: {
    count: number;
    lastSeen: string;
    examples: string[];
  };
}

export interface RelationshipProfile {
  relation: string;
  valence: string;
  dynamics: string[];
  mentionCount: number;
  typicalEmotions: string[];
  keyEvents: string[];
}

// SOULBUDDY: Weekly insight categories
export interface WeeklyInsight {
  type: string;
  title: string;
  description: string;
  icon?: string;
  data?: Record<string, unknown>;
}

export interface WeeklyInsightsResponse {
  summary: string;
  insights: WeeklyInsight[];
  period_start: string;
  period_end: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  companionId?: string;
  sources?: Array<Record<string, unknown>>;
  suggestions?: string[];
  confidence?: number;
  thinkingContent?: string;
  isLoading?: boolean;
  messageType?: ChatMessageType;
  chartData?: ChartData;
  aiSource?: AISource;
  suggestedCompanion?: string;
  suggestedCompanionName?: string;
  navigateLinks?: NavigateLink[];
  emotionData?: EmotionData;
}

/** Structured Quran-verse context attached to chat turns (Ask Raya from a verse). */
export interface QuranAnchor {
  surahId?: number;
  surahName?: string;
  ayahNumber?: number;
  verseKey: string;
  arabicText?: string;
  translation?: string;
  tafsir?: string;
  tafsirSource?: string;
}

// ==================== CONVERSATION PERSISTENCE TYPES ====================

export interface ConversationMeta {
  id: string;
  title: string;
  companionId: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastUserMessage: string;
  lastAiResponse: string;
  summary: string;
}

export interface ConversationSummary {
  title: string;
  summary: string;
  companionId: string;
  updatedAt: Date;
}

// ==================== API TYPES ====================

export interface ChatRequest {
  user_id: string;
  session_id: string;
  message: string;
  context?: Record<string, unknown>;
  user_name?: string;
}

export interface ChatResponse {
  response: string;
  confidence: number;
  sources: string[];
  suggestions: string[];
  metadata: Record<string, unknown>;
  suggested_companion?: string;
  suggested_companion_name?: string;
}

export interface CompanionChatRequest {
  user_id: string;
  message: string;
  companion_id: string;
  session_id?: string;
  require_sources: boolean;
}

export interface CompanionChatResponse {
  response: string;
  companion_id: string;
  companion_name: string;
  voice_id: string;
  sources: Array<Record<string, unknown>>;
  confidence: number;
  meets_threshold: boolean;
  suggested_companion?: string;
  suggested_companion_name?: string;
}

export interface IslamicChatRequest {
  user_id: string;
  message: string;
  session_id?: string;
  require_sources: boolean;
}

export interface IslamicChatResponse {
  response: string;
  sources: Array<Record<string, unknown>>;
  confidence: number;
  category: string;
  meets_threshold: boolean;
}

// ==================== STATIC DATA ====================

/** All 12 companion personas — mirrors backend companion_config.py */
export const COMPANIONS: Companion[] = [
  {
    id: 'raya',
    name: 'Raya',
    title: 'Your Islamic Knowledge Guide',
    description: 'General Islamic knowledge assistant',
    voiceId: 'ErXwobaYiN019PkySvjV',
    keywords: ['helpful', 'knowledgeable', 'patient', 'educational'],
    icon: '✨',
    section: 'default',
  },
  // Sahaba
  {
    id: 'abu_bakr',
    name: 'Abu Bakr As-Siddiq',
    title: 'The Truthful One',
    description: 'Gentle, truthful, and compassionate',
    voiceId: 'wkTpJpe8bBOpR7NVcuB4',
    keywords: ['truthful', 'sincere', 'gentle', 'compassionate', 'loyal'],
    icon: '🕊️',
    section: 'sahaba',
    welcomeMessage: "As-salamu alaykum. I'm glad you're here. Whatever's on your mind — whether it's something heavy or something small — I'm listening. What would you like to talk about?",
  },
  {
    id: 'umar',
    name: 'Umar ibn Al-Khattab',
    title: 'The Distinguisher (Al-Farooq)',
    description: 'Firm, just, and authoritative',
    voiceId: 'eDAXA5c0H3pfOdZ1oqQb',
    keywords: ['just', 'firm', 'strong', 'fair', 'leader', 'courageous'],
    icon: '⚔️',
    section: 'sahaba',
    welcomeMessage: "As-salamu alaykum. I don't do small talk, so let's get to it. What do you need?",
  },
  {
    id: 'uthman',
    name: 'Uthman ibn Affan',
    title: 'The Possessor of Two Lights',
    description: 'Gentle, generous, and humble',
    voiceId: '8Nr0YiQHYloU1I7EdugF',
    keywords: ['generous', 'modest', 'gentle', 'patient', 'refined'],
    icon: '🌙',
    section: 'sahaba',
    welcomeMessage: "As-salamu alaykum. It's a blessing to sit with you. Whatever you'd like to discuss — whether it's about wealth, patience, or anything on your heart — I'm here. Take your time.",
  },
  {
    id: 'ali',
    name: 'Ali ibn Abi Talib',
    title: 'The Lion of Allah',
    description: 'Wise, courageous, and eloquent',
    voiceId: 'TX3LPaxmHKxFdv7VOQHJ',
    keywords: ['wise', 'knowledgeable', 'brave', 'eloquent', 'scholar'],
    icon: '🦁',
    section: 'sahaba',
    welcomeMessage: "As-salamu alaykum. Knowledge is a treasure, and its key is questions. So — what's the question you've been carrying?",
  },
  // Sahabiyat
  {
    id: 'khadijah',
    name: 'Khadijah bint Khuwaylid',
    title: 'Mother of the Believers',
    description: 'Supportive, wise, and comforting',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    keywords: ['supportive', 'comforting', 'wise', 'strong', 'nurturing'],
    icon: '💎',
    section: 'sahabiyat',
    welcomeMessage: "As-salamu alaykum. Whether you're building something, figuring something out, or just need someone who gets it — I'm here. What's on your mind?",
  },
  {
    id: 'aisha',
    name: 'Aisha bint Abi Bakr',
    title: 'Mother of the Believers',
    description: 'Scholarly, precise, and wise',
    voiceId: 'AZnzlk1XvdvUeBnXmlld',
    keywords: ['scholarly', 'knowledgeable', 'precise', 'teacher', 'hadith'],
    icon: '📚',
    section: 'sahabiyat',
    welcomeMessage: "As-salamu alaykum. If you have a question, ask it clearly and I'll give you a clear answer. If you're not sure what to ask, tell me the topic and we'll get to the heart of it. What would you like to know?",
  },
  {
    id: 'fatimah',
    name: 'Fatimah Az-Zahra',
    title: 'Leader of the Women of Paradise',
    description: 'Pious, gentle, and devoted',
    voiceId: 'ThT5KcBeYPX3keUQqHPh',
    keywords: ['pious', 'gentle', 'devoted', 'patient', 'serene'],
    icon: '🌹',
    section: 'sahabiyat',
    welcomeMessage: "As-salamu alaykum. Whatever is on your heart — whether it's about family, faith, or just the quiet things that no one else sees — I'm here. Take your time.",
  },
  // Four Imams
  {
    id: 'imam_abu_hanifa',
    name: 'Imam Abu Hanifa',
    title: 'The Greatest Imam',
    description: 'Analytical and methodical scholar',
    voiceId: 'VR6AewLTigWG4xSOukaG',
    keywords: ['hanafi', 'fiqh', 'analytical', 'methodical', 'rational'],
    icon: '📖',
    section: 'imams',
    welcomeMessage: "As-salamu alaykum. I love a good question — especially the kind that makes you think. What's yours?",
  },
  {
    id: 'imam_malik',
    name: 'Imam Malik ibn Anas',
    title: 'Imam of the Abode of Migration',
    description: 'Traditional and connected to Madinan practice',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    keywords: ['maliki', 'fiqh', 'traditional', 'madinah', 'hadith'],
    icon: '🕌',
    section: 'imams',
    welcomeMessage: "As-salamu alaykum. Knowledge carries weight, and I don't speak on what I don't know. But if your question has an answer, I'll give it to you. What would you like to ask?",
  },
  {
    id: 'imam_shafii',
    name: "Imam Ash-Shafi'i",
    title: 'The Reviver of the Sunnah',
    description: 'Systematic and methodological scholar',
    voiceId: 'yoZ06aMxZJJ28mfd3POQ',
    keywords: ['shafii', 'fiqh', 'systematic', 'usul', 'methodology'],
    icon: '⚖️',
    section: 'imams',
    welcomeMessage: "As-salamu alaykum. Whether it's a matter of fiqh, a question about methodology, or something you've been debating — let's organize it properly. What's the question?",
  },
  {
    id: 'imam_ahmad',
    name: 'Imam Ahmad ibn Hanbal',
    title: 'Imam of Ahl al-Sunnah',
    description: 'Principled and hadith-focused scholar',
    voiceId: 'TX3LPaxmHKxFdv7VOQHJ',
    keywords: ['hanbali', 'fiqh', 'hadith', 'principled', 'steadfast'],
    icon: '📜',
    section: 'imams',
    welcomeMessage: "As-salamu alaykum. If you have a question, I'll give you the hadith. If the text is clear, so is the answer. What do you need?",
  },
];

export const COMPANION_SECTIONS: CompanionSectionConfig[] = [
  { title: 'AI Assistant', companions: ['raya'] },
  { title: 'Sahaba', companions: ['abu_bakr', 'umar', 'uthman', 'ali'] },
  { title: 'Sahabiyat', companions: ['khadijah', 'aisha', 'fatimah'] },
  { title: 'Four Imams', companions: ['imam_abu_hanifa', 'imam_malik', 'imam_shafii', 'imam_ahmad'] },
];

export const QUICK_SUGGESTIONS = [
  'How do I start investing in halal stocks?',
  'Which tech stocks are Shariah compliant?',
  'How much Zakat do I owe on my savings?',
  'Is Apple (AAPL) halal to invest in?',
  'What is the current nisab amount?',
  'What makes a stock haram vs halal?',
];

export function getCompanionById(id: string): Companion {
  return COMPANIONS.find((c) => c.id === id) ?? COMPANIONS[0];
}
