/**
 * Quran Types
 * Mirrors Flutter's quran models from quran_reader_service, streak, and score services
 */

// --- Surah & Verse Models ---

export interface Surah {
  id: number;
  nameSimple: string;
  nameArabic: string;
  nameEnglish: string;
  versesCount: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface QuranLine {
  verseNumber: number;
  verseKey: string; // "1:1"
  arabic: string;
  arabicIndopak?: string;
  arabicImla?: string;
  /** Uthmani Hafs (KFGQPC) text — text_qpc_hafs. */
  arabicHafs?: string;
  /** Tajweed-annotated HTML (text_uthmani_tajweed). Used by TajweedText. */
  arabicTajweed?: string;
  translation: string;
  transliteration: string;
  rootWords: string[];
  wordBreakdown: string[];
  pageNumber: number;
  juzNumber?: number;
  hizbNumber?: number;
  rubNumber?: number;
}

export interface Reciter {
  id: number;
  name: string;
  style?: string;
}

export type ReadingMode = 'focus' | 'ayah' | 'page';
export type ArabicScript = 'uthmani' | 'indopak' | 'imlaei';

// --- Translation & Reciter Options ---

export const TRANSLATION_OPTIONS = [
  { id: 20, label: 'English (Saheeh International)' },
  { id: 85, label: 'English (Abdel Haleem)' },
  { id: 22, label: 'English (Yusuf Ali)' },
  { id: 234, label: 'Urdu (Jalandhari)' },
  { id: 831, label: 'Roman Urdu (Maududi)' },
  { id: 133, label: 'Tamil (Abdul Hameed Baqavi)' },
  { id: 50, label: 'Tamil (Jan Trust Foundation)' },
] as const;

export const RECITER_PRESETS = [
  { id: 7, name: 'Mishari Alafasy', folder: 'Alafasy_128kbps' },
  { id: 2, name: 'Abdul Basit', folder: 'Abdul_Basit_Mujawwad_128kbps' },
  { id: 14, name: 'Al-Muaiqly', folder: 'Ghamadi_40kbps' },
] as const;

export const READING_PRESETS = [
  { label: 'Arabic Only', showTranslation: false, showTransliteration: false, showRoots: false },
  { label: 'Arabic + Roman', showTranslation: false, showTransliteration: true, showRoots: true },
  { label: 'Arabic + English', showTranslation: true, showTransliteration: false, showRoots: false, translationId: 20 },
  { label: 'Arabic + Urdu', showTranslation: true, showTransliteration: false, showRoots: false, translationId: 234 },
  { label: 'Arabic + Tamil', showTranslation: true, showTransliteration: false, showRoots: false, translationId: 133 },
] as const;

// --- Streak & Score Models ---

export interface QuranStreakInfo {
  streakCount: number;
  longestStreak: number;
  dailyReadCount: number;
  dailyTarget: number;
  streakEarnedToday: boolean;
  dateKey: string;
}

export interface QuranStreakStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysRead: number;
  thisWeekAyahs: number;
  thisMonthAyahs: number;
  averageDailyAyahs: number;
  todayProgress: number;
  todayCount: number;
  remainingToday: number;
  nextMilestoneMessage: string;
}

export interface QuranScoreInfo {
  totalAyahs: number;
  todayAyahs: number;
  thisWeekAyahs: number;
  thisMonthAyahs: number;
  nextMilestone: string;
  progressToMilestone: number;
}

export interface QuranSearchResult {
  verseKey: string;
  surahName: string;
  translation: string;
  translationName: string;
}

// --- Word-level data (for tap-word popover, highlight-a-word) ---

export interface QuranWord {
  verseKey: string;
  position: number;
  arabic: string;
  transliteration: string;
  translation: string;
  root?: string;
}

// --- Mushaf line-layout (authentic 15-line page rendering) ---

/**
 * One word as positioned on a physical Mushaf page. Carries every script
 * variant so the renderer can switch style without refetching. `charType` is
 * 'word' for normal words and 'end' for the ayah-end marker glyph.
 */
export interface MushafWord {
  verseKey: string;
  verseNumber: number;
  position: number;
  lineNumber: number;
  charType: string;
  codeV1?: string;
  codeV2?: string;
  textHafs?: string;
  textIndopak?: string;
}

/** A single printed line (1..15) with its words in reading order. */
export interface MushafLine {
  lineNumber: number;
  words: MushafWord[];
}

// --- Highlights ---

export type HighlightCategory = 'favorite' | 'review' | 'mistake' | 'note' | 'custom';
export type HighlightScope = 'word' | 'ayah' | 'range';

export interface Highlight {
  id: string;
  scope: HighlightScope;
  verseKey: string;           // start key, also the only key for ayah/word scope
  endVerseKey?: string;       // for range scope
  wordPosition?: number;      // for word scope
  color: string;              // hex, may be user-picked
  category: HighlightCategory;
  label?: string;
  createdAt: number;
}

export const HIGHLIGHT_CATEGORY_COLORS: Record<HighlightCategory, string> = {
  favorite: '#D4A853',  // gold — align with ZP palette
  review:   '#4FB892',  // teal
  mistake:  '#E87171',  // red
  note:     '#B891E8',  // purple
  custom:   '#7FC98A',  // green (fallback)
};

// --- Annotations ---

export type AnnotationStatus = 'open' | 'resolved';

export interface Annotation {
  id: string;
  verseKey: string;
  wordPosition?: number;        // optional: annotation attached to a word
  surahId: number;
  pageNumber?: number;
  comment: string;
  tags: string[];               // e.g. ['tajweed', 'meaning', 'transition']
  status: AnnotationStatus;
  createdAt: number;
  updatedAt: number;
}

export const PRESET_ANNOTATION_TAGS = [
  'difficult-word',
  'transition',
  'tajweed',
  'meaning',
  'forgot-next',
  'pronunciation',
] as const;

// --- Hifz (memorization) ---

export type HifzStatus = 'new' | 'learning' | 'memorized' | 'mastered';

export interface AyahHifzRecord {
  verseKey: string;
  surahId: number;
  status: HifzStatus;
  lastReviewed: number | null;
  nextReview: number | null;    // unix ms, set by spaced-repetition
  interval: number;             // days, SM-2-lite
  ease: number;                 // 1.3 - 2.8
  streak: number;               // consecutive perfect recalls
  mistakeCount: number;
  totalAttempts: number;
}

export type HifzTestType =
  | 'voice'
  | 'find-next-ayah'
  | 'ayah-ordering'
  | 'tajweed-check'
  | 'record-and-check';

export interface HifzMistake {
  verseKey: string;
  type: 'skipped' | 'word' | 'order' | 'pronunciation';
  expected: string;
  actual?: string;
  at: number;
}

export interface HifzSession {
  id: string;
  testType: HifzTestType;
  surahId: number;
  startVerseKey: string;
  endVerseKey: string;
  startedAt: number;
  completedAt: number | null;
  correctCount: number;
  mistakeCount: number;
  accuracy: number;             // 0..1
  mistakes: HifzMistake[];
  hintsUsed: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type MemorizeMode = 'beginner' | 'intensive' | 'revision';

export interface MemorizeStep {
  kind: 'listen' | 'read' | 'blind-recall' | 'repeat' | 'test';
  label: string;
  reps: number;
  description: string;
}

export interface RevisionPlanItem {
  verseKey: string;
  surahId: number;
  reason: 'due' | 'weak' | 'recent-mistake';
  priority: number;             // 0..1 — higher = revise first
  lastMistake?: number;
}

// --- Rayah Plus Quran: governance primitives ---

/**
 * A citation chip the AI/research surfaces render uniformly. Every AI-touching
 * surface MUST render a SourceCitationChip per claim or fall back to a
 * LowConfidenceNotice (see Workstream 4 governance audit).
 */
export type CitationKind = 'quran' | 'hadith' | 'book';

export interface QuranCitation {
  kind: 'quran';
  verse_key: string;
  surah_name: string;
  arabic_text?: string;
}

export interface HadithCitation {
  kind: 'hadith';
  collection: string;
  number: string;
  narrator?: string;
  grade?: string;
}

export interface BookCitation {
  kind: 'book';
  book: string;
  author?: string;
  page?: number | null;
}

export type SourceCitation = QuranCitation | HadithCitation | BookCitation;

// --- Rayah Plus Quran: related hadith + cross-references + surah summary ---

export interface RelatedHadith {
  collection: string;
  collection_slug: string;
  number: string;
  narrator: string;
  arabic: string;
  english: string;
  grade: string;
  relevance_score: number;
}

export interface CrossReference {
  verse_key: string;
  surah_name: string;
  arabic_text: string;
  english_text: string;
  relevance_score: number;
}

export interface SurahSummary {
  surah_id: number;
  name_arabic: string;
  name_english: string;
  revelation_place: string;
  ayah_count: number;
  theme: string;
  key_topics: string[];
  context: string;
  sources: Array<{ book: string; author?: string }>;
  source_tier: 'curated' | 'rag';
}

// --- Rayah Plus Quran: research workspace ---

export type ResearchBucket = 'quran' | 'hadith' | 'tafsir';

export interface ResearchResult {
  bucket: ResearchBucket;
  relevance_score: number;
  excerpt: string;
  citation: SourceCitation;
}

export interface ResearchResponse {
  query: string;
  sources: ResearchBucket[];
  category: string;
  confidence: number;
  meets_threshold: boolean;
  buckets: Record<ResearchBucket, ResearchResult[]>;
  total: number;
}

export interface ResearchCollectionItem {
  id: string;
  savedAt: number;
  result: ResearchResult;
}

export interface ResearchCollection {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  items: ResearchCollectionItem[];
}

// --- Rayah Plus Quran: in-page Raya panel ---

export interface RayaQuranMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: SourceCitation[];
  /** When user/AI generated, in ms. */
  createdAt: number;
  /** True when the response was a refusal / low-confidence. */
  lowConfidence?: boolean;
}

export interface RayaQuranAyahContext {
  verseKey: string;
  surahName?: string;
  ayahTranslation?: string;
}

// --- Rayah Plus Quran: scholar-led learning tracks (PDF Section 11) ---

export interface LearningTrackHadithRef {
  collection: string;
  number: string;
}

export interface LearningTrackStage {
  id: string;
  title: string;
  summary: string;
  verses: string[];
  hadith_refs: LearningTrackHadithRef[];
  reflection_prompt: string;
}

export interface LearningTrackSummary {
  id: string;
  title: string;
  subtitle: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration_days: number;
  stage_count: number;
  scholar_attribution: Array<{ book: string; author?: string }>;
}

export interface LearningTrack extends LearningTrackSummary {
  intro: string;
  stages: LearningTrackStage[];
}

export interface LearningTrackProgress {
  trackId: string;
  startedAt: number;
  /** Stage IDs marked complete by the user. */
  completedStages: string[];
  /** Last accessed stage ID for "resume where I left off". */
  lastStageId: string | null;
  updatedAt: number;
}
