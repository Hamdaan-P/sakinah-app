/**
 * EIM API client — thin wrapper around authGet/authPost.
 *
 * MVP scope: read-only catalogue endpoints + analysis. Portfolios stay
 * client-side (zustand + localStorage), so we send them in the analysis body.
 */

import { authDelete, authGet, authPost, authPostMultipart, authPostStream } from '@/lib/api';
import type {
  AnalysisReport,
  Asset,
  ConversationDetailResponse,
  ConversationListResponse,
  DinarzClaimRequest,
  DinarzClaimResponse,
  EimConversation,
  FollowupResponse,
  HistoricalAtResult,
  InvestabilityScore,
  Lesson,
  LessonLevel,
  MirrorBroker,
  MirrorPurgeResponse,
  MirrorReport,
  MirrorReportPollResponse,
  MirrorRunResponse,
  MirrorTeaserReport,
  MirrorUploadResponse,
  MonthlyOhlcRange,
  MonthlyOhlcResponse,
  Persona,
  Portfolio,
  RecommendedLessonsResponse,
  Scholar,
  ScholarFAQ,
  ScholarFAQCategory,
  ScholarOpinion,
  SendMessageResponse,
  StockQuarterly,
  StockSnapshot,
  StreakState,
  TickerSearchResult,
  Topic,
} from '../types/eim.types';

const BASE = '/api/eim';

export interface PortfolioPositionPerf {
  ticker: string;
  qty: number;
  current_price: number;
  current_value: number;
  anchored_to_buy_date: boolean;
  since_buy_pct: number | null;
  since_buy_label: string;
}

export interface PortfolioPerformance {
  monthly_pct: number;
  yearly_pct: number;
  total_value: number;
  value_change_month: number;
  value_change_year: number;
  positions_priced: number;
  positions_total: number;
  /** Per-position breakdown with optional "since you bought" label
   *  populated when the position was opened more recently than the
   *  monthly/yearly window. */
  positions: PortfolioPositionPerf[];
}

export type TimeTravelHorizon = '6mo' | '1yr' | '3yr' | '5yr' | '10yr';

/** Server-sent event shapes for `POST /api/eim/analysis/stream`. */
export type AnalysisStreamEvent =
  | { type: 'context_ready' }
  | { type: 'chunk'; text: string }
  | { type: 'complete'; report: AnalysisReport }
  | { type: 'error'; message: string };

export interface TimeTravelPosition {
  ticker: string;
  qty: number;
  historical_price: number;
  current_price: number;
  historical_value: number;
  current_value: number;
  change_pct: number;
  note: string;
}

export interface TimeTravelResult {
  horizon: TimeTravelHorizon;
  start_date: string;
  positions: TimeTravelPosition[];
  historical_total: number;
  current_total: number;
  total_change_pct: number;
  total_change_dollars: number;
  positions_priced: number;
  positions_total: number;
}

export interface MetalsSpot {
  gold: { ticker: string; per_troy_oz_usd: number; per_gram_usd: number; day_change_pct: number };
  silver: { ticker: string; per_troy_oz_usd: number; per_gram_usd: number; day_change_pct: number };
  nisab: {
    gold_grams: number;
    silver_grams: number;
    gold_usd: number;
    silver_usd: number;
    operative_usd: number;
    operative_basis: string;
    rationale: string;
  };
  as_of: string;
}

export const eimService = {
  getLevels: () => authGet<LessonLevel[]>(`${BASE}/levels`),
  getLessons: (levelId?: string) =>
    authGet<Lesson[]>(levelId ? `${BASE}/lessons?level_id=${encodeURIComponent(levelId)}` : `${BASE}/lessons`),
  getLesson: (id: string) => authGet<Lesson>(`${BASE}/lessons/${encodeURIComponent(id)}`),
  getScholars: () => authGet<Scholar[]>(`${BASE}/scholars`),
  getTopics: () => authGet<Topic[]>(`${BASE}/topics`),
  getTopicOpinions: (topicId: string) =>
    authGet<ScholarOpinion[]>(`${BASE}/topics/${encodeURIComponent(topicId)}/opinions`),
  getPersonas: () => authGet<Persona[]>(`${BASE}/personas`),
  getScholarFAQs: (opts: { category?: ScholarFAQCategory; query?: string } = {}) => {
    const params = new URLSearchParams();
    if (opts.category) params.set('category', opts.category);
    if (opts.query) params.set('query', opts.query);
    const qs = params.toString();
    return authGet<ScholarFAQ[]>(`${BASE}/scholar-faqs${qs ? `?${qs}` : ''}`);
  },
  getScholarFAQ: (id: string) =>
    authGet<ScholarFAQ>(`${BASE}/scholar-faqs/${encodeURIComponent(id)}`),
  getAssets: () => authGet<Asset[]>(`${BASE}/assets`),
  getAsset: (ticker: string) => authGet<Asset>(`${BASE}/assets/${encodeURIComponent(ticker)}`),
  getInvestability: (ticker: string) =>
    authGet<InvestabilityScore>(`${BASE}/investability/${encodeURIComponent(ticker)}`),
  getPortfolioPerformance: (portfolio: Portfolio) =>
    // Hits yfinance history per ticker — can be slow on cold cache.
    authPost<PortfolioPerformance>(`${BASE}/portfolio/performance`, portfolio, 45_000),
  timeTravel: (portfolio: Portfolio, horizon: TimeTravelHorizon) =>
    // Same — historical fetch per ticker; 10yr horizons especially slow.
    authPost<TimeTravelResult>(
      `${BASE}/portfolio/time-travel?horizon=${encodeURIComponent(horizon)}`,
      portfolio,
      45_000,
    ),
  getMetalsSpot: () => authGet<MetalsSpot>(`${BASE}/metals/spot`),
  runAnalysis: (portfolio: Portfolio, personaId: string) =>
    // Real Claude call — 8-25s typical, can be 30s+ on cold-start.
    // Generous 120s timeout so the user never sees a false "cancelled".
    // Non-streaming variant — preserved for tests/non-UI callers.
    authPost<AnalysisReport>(
      `${BASE}/analysis?persona_id=${encodeURIComponent(personaId)}`,
      portfolio,
      120_000,
    ),

  /**
   * Streaming analysis — returns an async iterable of SSE events the UI
   * can render progressively. Used by the mentor page for the "writing…"
   * UX while Sonnet 4.6 generates the structured report.
   *
   * Event shape:
   *   { type: 'context_ready' }                — I/O fetches done, LLM starting
   *   { type: 'chunk',   text: '...' }         — raw token chunk
   *   { type: 'complete', report: AnalysisReport }
   *   { type: 'error',   message: '...' }
   *
   * Consume with `for await (const event of …) { … }`. Pass a `signal` to
   * cancel the stream (e.g. user navigates away mid-analysis).
   */
  async *runAnalysisStream(
    portfolio: Portfolio,
    personaId: string,
    signal?: AbortSignal,
  ): AsyncGenerator<AnalysisStreamEvent, void, void> {
    const res = await authPostStream(
      `${BASE}/analysis/stream?persona_id=${encodeURIComponent(personaId)}`,
      portfolio,
      signal,
    );
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE frames separated by \n\n. Drain every complete frame.
        let sep: number;
        while ((sep = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          // Each frame is one or more lines; we only care about `data:` lines.
          for (const line of frame.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload) continue;
            try {
              yield JSON.parse(payload) as AnalysisStreamEvent;
            } catch {
              // Malformed frame — log and skip rather than crash the stream.
               
              console.warn('[eim] bad SSE frame:', payload.slice(0, 120));
            }
          }
        }
      }
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // ignore — reader may already be closed if the stream errored
      }
    }
  },
  runFollowup: (params: {
    portfolio: Portfolio;
    persona_id: string;
    prior_at_a_glance: string;
    user_question: string;
  }) =>
    // Follow-up is shorter than full analysis — typically 4-12s.
    authPost<FollowupResponse>(`${BASE}/mentor/followup`, params, 60_000),
  /**
   * Claim a Dinarz reward for an EIM event. Server-validated, idempotent
   * per claim_key — second call for the same event returns awarded=false.
   * Wraps the shared site-wide DNZEngine (same path as daily login, chat,
   * mining, niyaamat). Counts against the global 50 DNZ/day cap.
   */
  claimDinarz: (params: DinarzClaimRequest) =>
    authPost<DinarzClaimResponse>(`${BASE}/dinarz/claim`, params, 15_000),
  /**
   * Streak heartbeat — records one day of EIM activity. Idempotent within a
   * calendar day. The response.award is populated only on the heartbeat that
   * crosses the 100-day milestone.
   */
  streakHeartbeat: (userId: string) =>
    authPost<StreakState>(`${BASE}/streak/heartbeat`, { user_id: userId }, 10_000),
  /** Read-only fetch of the current streak — never writes. */
  getStreak: (userId: string) =>
    authGet<StreakState>(`${BASE}/streak/${encodeURIComponent(userId)}`),

  // ── Simulator v2: open-universe ticker data ──────────────────────────────

  /** Autocomplete tickers for the add-position wizard. */
  lookupTicker: (q: string, limit = 12) =>
    authGet<TickerSearchResult[]>(
      `${BASE}/lookup?q=${encodeURIComponent(q)}&limit=${limit}`,
    ),

  /** Quote + fundamentals + Shariah + horizons (1mo/6mo/1yr/5yr) for one ticker. */
  getStockSnapshot: (ticker: string) =>
    authGet<StockSnapshot>(`${BASE}/stock/${encodeURIComponent(ticker)}/snapshot`),

  /** Closing price at a user-picked buy date — anchor column of the compare panel. */
  getHistoricalAt: (ticker: string, dateIso: string) =>
    authGet<HistoricalAtResult>(
      `${BASE}/stock/${encodeURIComponent(ticker)}/historical-at?date=${encodeURIComponent(dateIso)}`,
    ),

  /** Last 4 quarters of sales / net profit / EPS / operating margin. */
  getStockQuarterly: (ticker: string) =>
    authGet<StockQuarterly>(`${BASE}/stock/${encodeURIComponent(ticker)}/quarterly`),

  /** Monthly OHLC bars for the lightweight-charts price strip (P5).
   *  Monthly is the *only* timeframe per master plan §6.G + D15 — daily
   *  framing is excluded everywhere in EIM. */
  getStockMonthly: (ticker: string, range: MonthlyOhlcRange = '1y') =>
    authGet<MonthlyOhlcResponse>(
      `${BASE}/stock/${encodeURIComponent(ticker)}/monthly?range=${range}`,
    ),

  /** FX rates {ccy: ccy_per_1_USD} used by the currency picker. */
  getFxRates: () => authGet<FxRatesResponse>(`${BASE}/fx/rates`),

  // ── Saved persona conversations (P2 + P3) ────────────────────────────────

  /** Open a new persona chat thread. */
  createConversation: (params: {
    persona_id: string;
    portfolio_id: string;
    portfolio_name?: string;
  }) => authPost<EimConversation>(`${BASE}/conversations`, params, 15_000),

  /** List the authenticated user's persona chats, newest first. */
  listConversations: (opts: { include_archived?: boolean; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (opts.include_archived) params.set('include_archived', 'true');
    if (opts.limit) params.set('limit', String(opts.limit));
    const qs = params.toString();
    return authGet<ConversationListResponse>(`${BASE}/conversations${qs ? `?${qs}` : ''}`);
  },

  /** Fetch one conversation + its message history. */
  getConversation: (convId: string) =>
    authGet<ConversationDetailResponse>(`${BASE}/conversations/${encodeURIComponent(convId)}`),

  /** Send a follow-up that persists both turns and returns the assistant reply. */
  sendConversationMessage: (
    convId: string,
    params: { portfolio: Portfolio; user_question: string; prior_at_a_glance?: string },
  ) =>
    authPost<SendMessageResponse>(
      `${BASE}/conversations/${encodeURIComponent(convId)}/messages`,
      params,
      60_000,
    ),

  /** Soft-archive a conversation. Idempotent. */
  archiveConversation: (convId: string) =>
    authPost<{ archived: boolean; id: string }>(
      `${BASE}/conversations/${encodeURIComponent(convId)}/archive`,
      {},
      10_000,
    ),

  /** Lessons surfaced from the topic_tags of the user's recent persona chats. */
  getRecommendedLessons: (opts: { since_days?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (opts.since_days) params.set('since_days', String(opts.since_days));
    if (opts.limit) params.set('limit', String(opts.limit));
    const qs = params.toString();
    return authGet<RecommendedLessonsResponse>(
      `${BASE}/recommendations/lessons${qs ? `?${qs}` : ''}`,
    );
  },

  // ── Mizan Mirror (EIM Phase F1) ─────────────────────────────────────────
  // The frontend MUST also gate UI entry points on
  // `import.meta.env.VITE_ENABLE_EIM_MIRROR === 'true'` — the backend will
  // 503 if its own `EIM_MIRROR_ENABLED` flag is off, but hiding the entry
  // CTA is what keeps free users from seeing the surface at all.

  /** Upload a broker tradebook CSV. The backend persists the parsed trades
   *  under the user's auth-scoped subtree and returns the upload_id. */
  uploadTradeCsv: (file: File, broker: MirrorBroker = 'zerodha_kite') => {
    const form = new FormData();
    form.append('file', file);
    const qs = `?broker=${encodeURIComponent(broker)}`;
    return authPostMultipart<MirrorUploadResponse>(
      `${BASE}/mirror/upload${qs}`,
      form,
      60_000,
    );
  },

  /** Kick off the Mirror pipeline against an uploaded tradebook. Returns
   *  immediately — poll `getMirrorLatestReport` until status === 'ready'. */
  runMirror: (uploadId: string) =>
    authPost<MirrorRunResponse>(`${BASE}/mirror/run`, { upload_id: uploadId }, 15_000),

  /** Polling endpoint — returns the latest report for an upload, or
   *  { status: 'pending' } while the pipeline is still running. */
  getMirrorLatestReport: (uploadId: string) =>
    authGet<MirrorReportPollResponse>(
      `${BASE}/mirror/uploads/${encodeURIComponent(uploadId)}/latest-report`,
    ),

  /** Fetch a previously generated Mirror report by id. */
  getMirrorReport: (reportId: string) =>
    authGet<MirrorReport>(`${BASE}/mirror/report/${encodeURIComponent(reportId)}`),

  /** Free-tier Mirror preview — runs the full pipeline against virtual
   *  trades synthesised from the user's simulator portfolios. NO upload,
   *  NO PDPA exposure, returns a teaser-sliced report with ≤2 unlocked
   *  biases. The teaser shape is the API contract (server-side slicer). */
  previewMirror: (portfolios: Portfolio[]) =>
    authPost<MirrorTeaserReport>(`${BASE}/mirror/preview`, { portfolios }, 60_000),

  /** PDPA purge: drop every Mirror artefact for the calling user. */
  deleteMirrorData: () => authDelete<MirrorPurgeResponse>(`${BASE}/mirror/data`),
};

export interface FxRatesResponse {
  base: 'USD';
  /** Map of currency code → how many of that currency one USD buys.
   *  USD itself is always 1.0. Missing entries mean yfinance couldn't
   *  fetch that pair — the frontend renders native currency for them. */
  rates: Record<string, number>;
  /** Currencies the backend will *attempt* to fetch — useful for the UI
   *  picker even if a few are missing from `rates` in the current payload. */
  supported: string[];
  as_of: string;
}
