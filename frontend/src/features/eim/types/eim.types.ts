/**
 * EIM (Ethical Investment Mentor) — TypeScript types.
 * Mirrors backend/langchain_backend/app/eim_models.py.
 * Every persisted entity carries a `tier` field for future paywall gating.
 */

export type Tier = 'free' | 'plus';
export type AssetClass = 'stock' | 'etf' | 'fund' | 'gold' | 'silver' | 'reit' | 'sukuk' | 'crypto';
export type ShariahStandard = 'AAOIFI' | 'IFSB' | 'TASIS';
export type ScholarPole = 'malaysia_sac' | 'gcc_aaoifi' | 'deobandi' | 'modern_western';
export type Ruling =
  | 'permissible'
  | 'permissible_with_conditions'
  | 'haram'
  | 'case_by_case'
  | 'no_position';

// ── Lessons ───────────────────────────────────────────────────────────────

export interface TarbiyahVerse {
  arabic: string;
  translation: string;
  citation: string;
}

export interface HalalLensBlock {
  title: string;
  body: string;
}

export type CalloutVariant = 'info' | 'warning' | 'danger' | 'success' | 'tip' | 'wisdom';
export type BlockKind =
  | 'callout'
  | 'comparison_table'
  | 'key_takeaways'
  | 'case_study'
  | 'stat_grid'
  | 'diagram'
  | 'quiz_check'
  | 'quote';

export interface StatItem {
  label: string;
  value: string;
  hint: string;
}

export interface ContentBlock {
  kind: BlockKind;
  title: string;
  body: string;
  variant?: CalloutVariant | null;
  columns: string[];
  rows: string[][];
  items: string[];
  subject: string;
  narrative: string;
  stats: StatItem[];
  caption: string;
  ascii: string;
  question: string;
  options: string[];
  answer_idx: number;
  explanation: string;
  citation: string;
}

export interface LessonStep {
  heading: string;
  body: string;
  blocks: ContentBlock[];
  halal_lens?: HalalLensBlock | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer_idx: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  level_id: string;
  title: string;
  summary: string;
  minutes: number;
  tier: Tier;
  steps: LessonStep[];
  tarbiyah?: TarbiyahVerse | null;
  references: string[];
  final_quiz: QuizQuestion[];
  /** Optional YouTube companion video shown above the lesson text. Full URL
   *  or bare 11-char id; "" / absent = no video. Mirrors backend Lesson. */
  video_url?: string;
}

export interface LessonLevel {
  id: string;
  title_en: string;
  title_ar?: string;
  transliteration?: string;
  description: string;
  order: number;
  is_specialization: boolean;
}

// ── Scholars / Ulama Screening ────────────────────────────────────────────

export interface Scholar {
  id: string;
  name: string;
  pole: ScholarPole;
  madhab_or_jurisdiction: string;
  bio: string;
  avatar_initial: string;
  notable_works: string[];
}

export interface ScholarOpinion {
  scholar_id: string;
  topic_id: string;
  ruling: Ruling;
  conditions: string;
  rationale: string;
  source_title: string;
  source_url: string;
  year?: number | null;
}

export interface Topic {
  id: string;
  title: string;
  summary: string;
  category: 'asset_class' | 'instrument' | 'methodology' | 'structure';
}

// ── Simulator ─────────────────────────────────────────────────────────────

export interface TripleShariah {
  aaoifi: number;
  ifsb: number;
  tasis: number;
  composite: number;
  /** Legacy field name; value is actually Debt / Total Assets (the ratio
   *  AAOIFI / TASIS / DJIM screens use). UI labels it accurately. */
  debt_to_equity: string;
  /** Interest / Revenue. */
  interest_income: string;
  /** Annual per-share purification in the ticker's home currency
   *  (e.g. "$0.84", "₹4.20"). When `purification_is_proxy` is true,
   *  this is "—" because the underlying figure is interest expense, not
   *  interest income — the wrong basis for purification math. */
  purification_per_share: string;
  /** True when the interest figure is interest *expense* used as a proxy
   *  (Indian stocks via Screener.in have no discrete interest-income
   *  line). The compliance ratio is still meaningful; the purification
   *  number is not. Defaults to false. */
  purification_is_proxy?: boolean;
}

export interface Asset {
  ticker: string;
  name: string;
  asset_class: AssetClass;
  sector: string;
  price: number;
  day_change_pct: number;
  market_cap: string;
  pe: string;
  triple_shariah?: TripleShariah | null;
  description: string;
}

export interface Position {
  id: string;
  portfolio_id: string;
  ticker: string;
  qty: number;
  /** Stored in PORTFOLIO currency (FX-converted at trade time per D38). */
  buy_price: number;
  buy_date: string;
  tier: Tier;
}

// ── Sim primitives (master plan §6.R, Sprint 1) ───────────────────────────
// Mirrors backend/langchain_backend/app/eim_models.py. Every state mutation
// appends one SimTransaction to portfolio.transactions; the journal is the
// audit trail + the input to Mizan Mirror's sim-trade preview path (F1.d).

export type SimTransactionKind =
  | 'BUY'
  | 'SELL'
  | 'DCA_BUY'
  | 'CASH_DEPOSIT'
  | 'CASH_WITHDRAW'
  | 'DIVIDEND'
  | 'COUPON';

export interface SimTransaction {
  id: string;
  portfolio_id: string;
  kind: SimTransactionKind;
  /** Null for pure cash movements (deposits, withdrawals, dividends not tied
   *  to a specific ticker). */
  ticker: string | null;
  qty: number;
  /** Price in TICKER native currency (pre-FX). */
  price: number;
  /** SELL-only, in portfolio currency. */
  realized_pnl: number;
  /** Signed: negative for buy, positive for sell/dividend/deposit. */
  cash_delta: number;
  /** Running balance in portfolio currency after this txn applied. */
  cash_after: number;
  /** Ticker currency → portfolio currency at txn time. */
  fx_rate: number;
  /** ISO 8601. Sim-time when applied inside a Time Machine session. */
  timestamp: string;
  /** Optional "why am I doing this?" reflection. Pedagogy. */
  reflection_note: string;
  tier: Tier;
}

export interface HoldingSummary {
  ticker: string;
  total_qty: number;
  /** Qty-weighted average buy_price in portfolio currency. */
  avg_cost: number;
  lot_count: number;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  positions: Position[];
  tier: Tier;
  // ── Sim primitives (added Sprint 1; default 0 / USD / [] for legacy data) ──
  cash_balance: number;
  /** ISO 4217. Foreign-ticker trades FX-converted at trade time (D38). */
  currency: string;
  transactions: SimTransaction[];
}

// ── Simulator v2 — open-universe stock data ───────────────────────────────

export interface TickerSearchResult {
  ticker: string;
  name: string;
  /** Friendly exchange label (e.g. "NASDAQ", "NSE", "LSE"). */
  exchange: string;
  /** Raw yfinance exchange short-code (e.g. "NMS", "NSI"). May be empty. */
  exchange_code: string;
  /** ISO 3166-1 alpha-2 country code (US, IN, GB, CA, …). */
  country: string;
  type: string;
}

export interface SnapshotHorizon {
  price: number | null;
  change_pct: number | null;
  available: boolean;
  note?: string;
}

export type DataQualitySeverity = 'none' | 'caution' | 'risky';

export interface DataQualityFlag {
  id:
    | 'horizons_missing'
    | 'recent_ipo'
    | 'shariah_unavailable'
    | 'fundamentals_thin'
    | 'micro_cap'
    | 'penny_stock'
    | 'thin_volume';
  severity: 'caution' | 'risky';
  /** Pre-rendered human-readable copy from the backend. */
  label: string;
}

export interface DataQuality {
  severity: DataQualitySeverity;
  flags: DataQualityFlag[];
}

export interface StockSnapshot {
  ticker: string;
  name: string;
  currency: string;
  exchange: string;
  sector: string;
  industry: string;
  quote: {
    close: number;
    change: number;
    percent_change: number;
    market_cap: number;
    pe: number | null;
  };
  horizons: {
    '1mo': SnapshotHorizon;
    '6mo': SnapshotHorizon;
    '1yr': SnapshotHorizon;
    '5yr': SnapshotHorizon;
  };
  shariah: TripleShariah | null;
  /** Honest disclosure layer — surfaces missing/thin data signals so users
   *  know when to take the rest of the snapshot with a grain of salt. The
   *  user can still add the position regardless of severity. */
  data_quality: DataQuality;
  as_of: string;
}

export interface HistoricalAtResult {
  ticker: string;
  date: string;
  price: number | null;
  current_price?: number | null;
  change_pct?: number | null;
  available: boolean;
}

export interface QuarterlyRow {
  quarter: string;
  sales: number | null;
  net_profit: number | null;
  eps: number | null;
  operating_margin_pct: number | null;
}

export interface StockQuarterly {
  ticker: string;
  source: 'yfinance' | 'screener+yfinance' | 'unavailable';
  quarters: QuarterlyRow[];
  currency: string;
  as_of: string;
}

// ── Personas / Analysis ───────────────────────────────────────────────────

export type PersonaType =
  | 'scholar'
  | 'value_investor'
  | 'macro'
  | 'islamic_finance'
  | 'historical'
  | 'compass';

export interface Persona {
  id: string;
  name: string;
  framework: string;
  bio: string;
  philosophy: string;
  /** Tone/style description (internal — not rendered to users). */
  voice: string;
  /** Single-letter fallback used inside the avatar disc when `icon` is empty. */
  avatar_initial: string;
  tier: Tier;
  /** Methodology label only — never a real person's name. */
  inspired_by: string;
  /** Phosphor icon name (e.g. "Mosque", "Mountain", "BookOpen"). Renders
   *  inside the avatar disc when present; falls back to `avatar_initial`. */
  icon: string;
  persona_type: PersonaType;
  /** Hex colour used to tint the avatar disc and the type-badge chip. */
  accent_color: string;
  /** When true, surfaced in the top "Featured Mentors" strip on the
   *  EIM mentor page. */
  featured: boolean;
}

export interface ReportSection {
  heading: string;
  body: string;
  items: string[];
}

export interface ConcentrationSlice {
  label: string;
  pct: number;
  color: string;
}

export interface AnalysisReport {
  id: string;
  portfolio_id: string;
  persona_id: string;
  generated_at: string;
  at_a_glance: string;
  sections: ReportSection[];
  /** Server-computed asset-class concentration figure rendered at the top
   *  of the report. Empty when the portfolio has no priced positions. */
  concentration?: ConcentrationSlice[];
  disclaimer: string;
}

// ── Scholar FAQ (§6.L) ────────────────────────────────────────────────────

export type ScholarFAQCategory =
  | 'stocks_equities'
  | 'crypto_digital_assets'
  | 'insurance_takaful'
  | 'mortgages_home_finance'
  | 'sukuk_bonds'
  | 'business_models'
  | 'pensions_savings'
  | 'zakat_purification'
  | 'employment_income'
  | 'general';

export interface ScholarFAQ {
  id: string;
  question: string;
  category: ScholarFAQCategory;
  scholar_id: string;
  scholar_name: string;
  scholar_role: string;
  full_answer: string;
  citations: string[];
  tags: string[];
}

// ── Investability Score (§6.H / D21) ─────────────────────────────────────

export type PillarId = 'shariah' | 'financial_health' | 'growth' | 'valuation' | 'gharar';

export interface InvestabilityPillar {
  id: PillarId;
  label: string;
  weight_pct: number;
  value: number | null;
  reason: string;
  inverted: boolean;
}

export type InvestabilityBand =
  | 'excellent'
  | 'strong'
  | 'fair'
  | 'concerning'
  | 'avoid'
  | 'unavailable';

export interface InvestabilityScore {
  ticker: string;
  asset_name: string;
  composite: number | null;
  band: InvestabilityBand;
  pillars: InvestabilityPillar[];
  reason_withheld: string;
  source_timestamp: string;
  refresh_due: string;
  methodology_note: string;
}

// ── Follow-up + Disagreement ──────────────────────────────────────────────

export interface FollowupResponse {
  answer: string;
  lesson_refs: string[];
  scholar_refs: string[];
  /** 2-3 lowercase concept handles the LLM emits for the recommender. */
  topic_tags: string[];
  fallback: boolean;
}

// ── Saved conversations (P2) + lesson recommender (P3) ────────────────────

export type MessageRole = 'user' | 'assistant';

export interface EimMessage {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  persona_id: string;
  topic_tags: string[];
  citation_refs: string[];
  created_at: string;
}

export interface EimConversation {
  id: string;
  user_id: string;
  persona_id: string;
  portfolio_id: string;
  title: string;
  created_at: string;
  last_message_at: string | null;
  message_count: number;
  archived: boolean;
}

export interface ConversationListResponse {
  conversations: EimConversation[];
}

export interface ConversationDetailResponse {
  conversation: EimConversation;
  messages: EimMessage[];
}

export interface SendMessageResponse {
  user_message: EimMessage;
  assistant_message: EimMessage;
  answer: string;
  lesson_refs: string[];
  scholar_refs: string[];
  topic_tags: string[];
  fallback: boolean;
}

export interface RecommendedLesson {
  id: string;
  title: string;
  summary: string;
  level: string;
  minutes: number;
  deep_link: string;
  score: number;
  matched_tags: string[];
  /** "Because you discussed: sukuk, gharar" */
  match_reason: string;
}

export interface RecommendedLessonsResponse {
  lessons: RecommendedLesson[];
  since_days: number;
}

// ── Learning Streak (P7) ──────────────────────────────────────────────────

export interface StreakAwardEcho {
  awarded: boolean;
  amount: number;
  new_balance: number;
  reason: string;
}

export interface StreakState {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  started_at: string | null;
  milestone_reached: boolean;
  milestone_days: number;
  milestone_award_dnz: number;
  award: StreakAwardEcho | null;
}

// ── Dinarz (DNZ) claim — wraps the shared site-wide engine ────────────────

export type DinarzClaimKind =
  | 'lesson_complete'
  | 'first_portfolio'
  | 'first_analysis';

export interface DinarzClaimRequest {
  user_id: string;
  kind: DinarzClaimKind;
  ref_id?: string;
}

export interface DinarzClaimResponse {
  awarded: boolean;
  amount: number;
  new_balance: number;
  reason: string;
  daily_total: number;
  daily_remaining: number;
}

// ── Progress (local) ──────────────────────────────────────────────────────

export interface LessonProgress {
  lessonId: string;
  step: number;
  completedAt?: string;
}

// ── Mizan Mirror (EIM Phase F1) ──────────────────────────────────────────
// Mirrors backend/langchain_backend/app/eim_mirror_models.py. F1.a fields
// only; F1.b adds biases + behavioural state + archetype + anomaly fields,
// F1.c adds the muhasaba narrative. Defaults to empty arrays so the same
// type renders cleanly across sub-phases.

export type MirrorBroker = 'zerodha_kite';

export type MirrorSide = 'BUY' | 'SELL';

export type MirrorUploadStatus = 'uploaded' | 'parsing' | 'parsed' | 'failed';

export type MirrorRunStatus = 'queued' | 'running' | 'completed' | 'failed';

export type MirrorBiasId =
  | 'loss_aversion'
  | 'disposition_effect'
  | 'revenge_trading'
  | 'early_exit'
  | 'emotional_state'
  | 'fomo'
  | 'herding'
  | 'recency'
  | 'confirmation'
  | 'anchoring';

export type MirrorBiasBand = 'low' | 'moderate' | 'high';

export type MirrorBehaviouralStateLabel = 'calm' | 'anxious' | 'euphoric';

export type MirrorArchetypeId =
  | 'disciplined_steward'
  | 'reactive_emotional'
  | 'aggressive_high_activity'
  | 'balanced_tactical';

export interface MirrorReconstructedLot {
  lot_id: string;
  symbol: string;
  side: MirrorSide;
  timestamp: string; // ISO 8601 — close
  open_timestamp: string; // ISO 8601 — open
  quantity: number;
  price: number;
  open_price: number;
  pnl: number;
  holding_duration: number; // days
  exchange: string;
}

export interface MirrorBiasScore {
  bias_id: MirrorBiasId;
  value: number; // 0..1
  band: MirrorBiasBand;
  evidence_trade_ids: string[];
  notes: string;
}

export interface MirrorBehaviouralStatePoint {
  timestamp: string; // ISO 8601
  state: MirrorBehaviouralStateLabel;
  score: number;
}

export interface MirrorArchetype {
  id: MirrorArchetypeId;
  label: string;
  description: string;
}

export interface MirrorReportSummary {
  total_trades?: number;
  win_rate?: number;
  total_pnl?: number;
  wins?: number;
  losses?: number;
  breakevens?: number;
  symbols_traded?: number;
}

/** Per-bias attribution entry — fields populate progressively across
 *  F1.b (lot_ids, narrative, band, notes) and F1.c (muhasaba_framing,
 *  verse, concept, recommended_lesson_id). Any field may be empty. */
export interface MirrorAttributionEntry {
  lot_ids?: string[];
  narrative?: string;
  band?: MirrorBiasBand;
  notes?: string;
  muhasaba_framing?: string;
  concept?: string;
  concept_ar?: string;
  verse_citation?: string;
  verse_arabic?: string;
  verse_translation?: string;
  recommended_lesson_id?: string;
}

export interface MirrorReport {
  report_id: string;
  upload_id: string;
  user_id: string;
  generated_at: string; // ISO 8601
  summary: MirrorReportSummary;
  lots: MirrorReconstructedLot[];
  biases: MirrorBiasScore[];
  archetype?: MirrorArchetype | null;
  behavioural_state_timeline: MirrorBehaviouralStatePoint[];
  anomaly_trade_ids: string[];
  attribution: Record<string, MirrorAttributionEntry>;
  muhasaba_narrative: string;
  disclaimer: string;
}

export interface MirrorUploadResponse {
  upload_id: string;
  row_count: number;
  broker: MirrorBroker;
  status: MirrorUploadStatus;
}

export interface MirrorRunResponse {
  run_id: string;
  upload_id: string;
  status: MirrorRunStatus;
  queued: boolean;
}

export interface MirrorPurgeResponse {
  uploads_deleted: number;
  lots_deleted: number;
  reports_deleted: number;
}

/** Polling-shape returned by `GET /api/eim/mirror/uploads/{upload_id}/latest-report`. */
export type MirrorReportPollResponse =
  | { status: 'pending'; upload_id: string }
  | { status: 'ready'; report: MirrorReport };

// ── Monthly OHLC (P5 — lightweight-charts portfolio chart) ────────────────

export type MonthlyOhlcRange = '1y' | '3y' | '5y' | '10y' | 'max';

export interface MonthlyOhlcBar {
  /** YYYY-MM-DD — the lightweight-charts series accepts this directly. */
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number | null;
}

export interface MonthlyOhlcResponse {
  ticker: string;
  range: MonthlyOhlcRange;
  currency: string;
  as_of: string;
  bars: MonthlyOhlcBar[];
}

/** Free-tier teaser shape returned by `POST /api/eim/mirror/preview`.
 *  Distinct from MirrorReport — the teaser slicer is the API boundary and
 *  the frontend should never receive a full report on this path. */
export interface MirrorTeaserReport {
  is_preview: true;
  mode: 'simulator_preview';
  preview_note: string;
  report_id: string;
  generated_at: string;
  summary: MirrorReportSummary;
  archetype?: MirrorArchetype | null;
  behavioural_state_timeline: MirrorBehaviouralStatePoint[];
  anomaly_count: number;
  muhasaba_narrative: string;
  unlocked_biases: MirrorBiasScore[];
  unlocked_attribution: Record<string, MirrorAttributionEntry>;
  locked_biases: { bias_id: MirrorBiasId; band: MirrorBiasBand }[];
  disclaimer: string;
}

// ── Sim event corpus card (Tier 1, master plan §6.R / Sprint 3) ──────────
// Loaded eagerly into the SimEngine alongside OHLC; rendered as timeline
// markers + right-rail cards when sim_date crosses event date.

export type SimEventCategory =
  | 'financial_crisis'
  | 'pandemic'
  | 'geopolitical'
  | 'central_bank'
  | 'tech'
  | 'commodity'
  | 'policy'
  | 'election';

export type SimEventSeverity = 'low' | 'moderate' | 'high' | 'extreme';

export interface SimEventCard {
  id: string;
  /** ISO YYYY-MM-DD. */
  date: string;
  category: SimEventCategory;
  severity: SimEventSeverity;
  headline: string;
  context: string;
  /** Optional Islamic-framing commentary (sabr / tawakkul / gharar). */
  islamic_lens?: string;
}

// ── Simulator sessions (master plan §6.R, Sprint 2 — Time Machine) ────────
// Mirrors backend/langchain_backend/app/eim_models.py SimSession + friends.

export type SimSurface =
  | 'time_machine'
  | 'scenario_lab'
  | 'strategy_comparator'
  | 'projection';

export type SimSessionStatus = 'idle' | 'playing' | 'paused' | 'ended';

export type SimSpeed = '1mo_per_sec' | '3mo_per_sec' | '1yr_per_sec';

export interface SimDecision {
  id: string;
  session_id: string;
  /** ISO YYYY-MM-DD — when in sim-time the decision was applied. */
  sim_date: string;
  /** ISO 8601 — when the user actually clicked. */
  wall_timestamp: string;
  kind: SimTransactionKind;
  ticker: string | null;
  qty: number;
  price: number;
  fx_rate: number;
  realized_pnl: number;
  cash_after: number;
  reflection_note: string;
  /** Cross-ref to Portfolio.transactions entry. */
  txn_id: string;
}

export interface SimSession {
  id: string;
  user_id: string;
  surface: SimSurface;
  status: SimSessionStatus;
  /** User-facing name. Auto-generated as "Sim N" with gap-fill on create,
   *  renameable via PATCH. Defaults to "" on legacy sessions — UI falls
   *  back to portfolio.name in that case. */
  name: string;
  /** ISO YYYY-MM-DD. */
  start_date: string;
  /** ISO YYYY-MM-DD — advances forward only; never < start_date. */
  current_sim_date: string;
  /** ISO YYYY-MM-DD — typically "today" at creation, frozen. */
  end_date: string;
  speed: SimSpeed;
  starting_cash: number;
  currency: string;
  tickers: string[];
  /** The sim's evolving Portfolio (cash + lots + transaction journal). */
  portfolio: Portfolio;
  decisions: SimDecision[];
  post_mortem_report_id: string | null;
  mirror_report_id: string | null;
  /** Smart Interrupt bookkeeping (Sprint 4b). Capped per-session at
   *  MAX_INTERRUPTS_PER_SESSION on the backend. */
  interrupts_shown: number;
  interrupts_seen_ids: string[];
  /** Running max of client-reported portfolio value — drives drawdown trigger. */
  peak_value: number;
  tier: Tier;
  /** ISO 8601. */
  created_at: string;
  /** ISO 8601 — touched on every save. */
  updated_at: string;
}

// ── Smart Interrupts (Sprint 4b — D9 + D27 layer a) ─────────────────────────

export type InterruptKind = 'event_window' | 'drawdown';

export interface InterruptCard {
  /** Stable composite id — tracked in session.interrupts_seen_ids. */
  id: string;
  kind: InterruptKind;
  persona_id: string;
  persona_label: string;
  headline: string;
  body: string;
  severity: 'caution' | 'high' | 'extreme';
  sim_date: string;
  /** Set when kind === 'event_window'. */
  event_id: string | null;
  prebuilt: boolean;
}

// ── Strategy Comparator (Sprint 5) ────────────────────────────────────────

export type StrategyId = 'lump_sum' | 'dca_monthly' | 'rebalanced_60_40';

export interface StrategyDecision {
  sim_date: string;
  kind: 'BUY' | 'SELL' | 'REBALANCE';
  ticker: string;
  qty: number;
  price: number;
  cash_after: number;
}

export interface WealthPoint {
  sim_date: string;
  value: number;
}

export interface StrategyOutcome {
  strategy_id: StrategyId;
  label: string;
  decisions: StrategyDecision[];
  wealth_curve: WealthPoint[];
  final_cash: number;
  final_holdings: Record<string, number>;
  skipped_reason: string | null;
}

export interface StrategyMetrics {
  strategy_id: StrategyId;
  label: string;
  starting_value: number;
  ending_value: number;
  total_return_pct: number;
  cagr_pct: number;
  max_drawdown_pct: number;
  volatility_annualised_pct: number;
  n_decisions: number;
  n_months: number;
  skipped_reason: string | null;
}

export interface ComparatorResult {
  start_date: string;
  end_date: string;
  starting_cash: number;
  tickers: string[];
  outcomes: StrategyOutcome[];
  metrics: StrategyMetrics[];
}

export interface StrategyCommentaryItem {
  strategy_id: string;
  label: string;
  paragraph: string;
}

export interface CommentaryResult {
  items: StrategyCommentaryItem[];
  source: 'llm' | 'template_fallback';
  model_used: string;
  disclaimer: string;
}

export interface ComparatorRunResponse {
  result: ComparatorResult;
  commentary: CommentaryResult;
}

// ── Scenario Lab (Sprint 6) ────────────────────────────────────────────────
// Mirrors backend/langchain_backend/app/eim_sim_scenarios.py + the route's
// ScenarioSummary / ScenarioResolveResponse. Two-phase: the list + detail
// carry the dilemma framing ONLY (decide blind); resolve reveals outcomes.

/** List-view card — framing only, never outcomes. */
export interface ScenarioSummary {
  id: string;
  title: string;
  anchor_date: string;
  horizon_months: number;
  starting_cash: number;
  currency: string;
  category: SimEventCategory;
  severity: SimEventSeverity;
  /** First line of the setup narrative. */
  teaser: string;
  n_options: number;
}

export interface ScenarioOption {
  id: string;
  label: string;
  rationale: string;
  /** ticker -> weight (fraction of starting cash, 0..1; sum <= 1; rest cash). */
  allocation: Record<string, number>;
}

/** Full dilemma detail (GET /scenarios/{id}) — still no outcome data. */
export interface Scenario {
  id: string;
  title: string;
  anchor_date: string;
  horizon_months: number;
  starting_cash: number;
  currency: string;
  category: SimEventCategory;
  severity: SimEventSeverity;
  setup: string;
  decision_prompt: string;
  islamic_lens: string;
  event_id: string | null;
  options: ScenarioOption[];
}

/** One option fast-forwarded to the horizon (the reveal). */
export interface BranchOutcome {
  option_id: string;
  label: string;
  rationale: string;
  is_chosen: boolean;
  wealth_curve: WealthPoint[];
  starting_value: number;
  ending_value: number;
  total_return_pct: number;
  max_drawdown_pct: number;
  final_cash: number;
  final_holdings: Record<string, number>;
  /** Tickers with no price at the anchor — held as cash, disclosed (D22). */
  unavailable_tickers: string[];
}

export interface ScenarioResolution {
  scenario_id: string;
  title: string;
  anchor_date: string;
  horizon_months: number;
  starting_cash: number;
  currency: string;
  chosen_option_id: string | null;
  branches: BranchOutcome[];
}

export interface ScenarioBranchCommentary {
  option_id: string;
  label: string;
  /** Beginner explanation — everyday language, jargon defined in-line (D5). */
  plain: string;
  /** Advanced explanation — names the precise trade-off for the educated. */
  deeper: string;
}

export interface ScenarioCommentaryResult {
  branches: ScenarioBranchCommentary[];
  /** Addressed to the chosen path (or neutral when none chosen). */
  reflection: string;
  source: 'llm' | 'template_fallback';
  model_used: string;
  disclaimer: string;
}

export interface ScenarioResolveResponse {
  resolution: ScenarioResolution;
  commentary: ScenarioCommentaryResult;
}

// ── Projection Engine (Sprint 7) ───────────────────────────────────────────
// Mirrors backend/langchain_backend/app/eim_sim_projection.py. Forward Monte
// Carlo — a distribution of SCENARIOS, never a forecast.

export interface ProjectionInput {
  starting_capital: number;
  monthly_contribution: number;
  years: number;
  annual_return_pct: number;
  annual_volatility_pct: number;
  inflation_pct: number;
  target_amount?: number | null;
  stress_test: boolean;
  recession_every_years?: number;
  recession_drawdown_pct?: number;
  n_simulations?: number;
  seed?: number | null;
}

export interface ProjectionBandPoint {
  month_index: number;
  year_label: string;
  p10: number;
  p50: number;
  p90: number;
  p10_real: number;
  p50_real: number;
  p90_real: number;
}

export interface ProjectionTerminalStats {
  p10: number;
  p50: number;
  p90: number;
  p10_real: number;
  p50_real: number;
  p90_real: number;
}

export interface ProjectionResult {
  years: number;
  months: number;
  starting_capital: number;
  monthly_contribution: number;
  total_contributed: number;
  annual_return_pct: number;
  annual_volatility_pct: number;
  inflation_pct: number;
  stress_test: boolean;
  n_simulations: number;
  target_amount: number | null;
  /** P(terminal nominal >= target), 0..100. Null when no target set. */
  goal_probability_pct: number | null;
  bands: ProjectionBandPoint[];
  terminal: ProjectionTerminalStats;
}

export interface ProjectionCommentaryResult {
  /** Beginner reading — ranges in everyday terms. */
  plain: string;
  /** Advanced reading — dispersion, contribution split, sequence risk. */
  deeper: string;
  /** Target-hit likelihood reading; "" when no target. */
  goal_reading: string;
  source: 'llm' | 'template_fallback';
  model_used: string;
  disclaimer: string;
}

export interface ProjectionRunResponse {
  result: ProjectionResult;
  commentary: ProjectionCommentaryResult;
}


// ── Post-mortem report (Sprint 4c) ─────────────────────────────────────────

export interface PostMortemSection {
  heading: string;
  body: string;
  items: string[];
}

export interface PostMortemReport {
  session_id: string;
  /** "YYYY-MM-DD → YYYY-MM-DD" */
  sim_period: string;
  starting_cash: number;
  ending_value: number;
  total_return_pct: number;
  /** Split since v3: realised is from SELL decisions, unrealised is the
   *  remainder still riding on open positions. Default 0 so older v1/v2
   *  cached reports deserialise without crashing. */
  realised_pnl: number;
  unrealised_pnl: number;
  decision_count: number;
  interrupts_shown: number;
  at_a_glance: string;
  sections: PostMortemSection[];
  source: 'llm' | 'template_fallback';
  model_used: string;
  generated_at: string;
  disclaimer: string;
}

export interface CheckInterruptsResponse {
  interrupt: InterruptCard | null;
  interrupts_shown: number;
  max_per_session: number;
  peak_value: number;
}
