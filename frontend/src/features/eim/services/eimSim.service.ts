/**
 * EIM Simulator — REST client for SimSession CRUD (Sprint 2).
 *
 * Wraps /api/eim/sim/* endpoints registered in backend/.../routes/eim_sim.py.
 * Auth handled by the shared authGet/authPost helpers.
 */

import { authDelete, authGet, authPatch, authPost } from '@/lib/api';
import type {
  CheckInterruptsResponse,
  ComparatorRunResponse,
  MonthlyOhlcBar,
  PostMortemReport,
  ProjectionInput,
  ProjectionRunResponse,
  Scenario,
  ScenarioResolveResponse,
  ScenarioSummary,
  SimDecision,
  SimEventCard,
  SimEventCategory,
  SimEventSeverity,
  SimSession,
  SimSessionStatus,
  SimSpeed,
  StrategyId,
  SimSurface,
  SimTransactionKind,
} from '../types/eim.types';

const BASE = '/api/eim/sim';

export interface CreateSessionPayload {
  surface?: SimSurface;
  start_date: string;
  end_date: string;
  starting_cash: number;
  currency?: string;
  tickers?: string[];
  speed?: SimSpeed;
}

export interface UpdateSessionPayload {
  status?: SimSessionStatus;
  current_sim_date?: string;
  speed?: SimSpeed;
  name?: string;
}

export interface RecordDecisionPayload {
  kind: SimTransactionKind;
  sim_date: string;
  ticker?: string | null;
  qty?: number;
  price?: number;
  fx_rate?: number;
  cash_delta?: number;
  reflection_note?: string;
}

export interface SessionListResponse {
  sessions: SimSession[];
}

export interface DecisionRecordedResponse {
  session: SimSession;
  decision: SimDecision;
}

export interface DeleteResponse {
  deleted: boolean;
}

export interface FilteredTicker {
  ticker: string;
  reason: string;
}

export interface AvailableTickersResponse {
  start_date: string;
  available: string[];
  filtered_out: FilteredTicker[];
}

export interface EventsResponse {
  events: SimEventCard[];
}

export interface BigMove {
  ticker: string;
  /** YYYY-MM — the month of the move. */
  year_month: string;
  return_pct: number;
  severity: 'caution' | 'high' | 'extreme';
}

export interface BigMovesResponse {
  moves: BigMove[];
}

export interface AskPersonaPayload {
  /** New 3-lens ids OR a legacy id — backend aliases the 9 legacy ids. */
  persona_id: string;
  /** Must match session.current_sim_date — backend re-checks. */
  sim_date: string;
  user_question: string;
  /** Optional pre-populated context, e.g. from a visible event card. */
  event_context?: string;
  /** Optional already-rendered holdings string. Server caps at 2000 chars. */
  portfolio_summary?: string;
}

export interface AskPersonaResponse {
  persona_id: string;
  persona_label: string;
  sim_date: string;
  answer: string;
  source: 'llm' | 'template_fallback';
  model_used: string;
  generated_at: string;
  disclaimer: string;
}

export interface BigMoveSynthesis {
  ticker: string;
  year_month: string;
  return_pct: number;
  severity: 'caution' | 'high' | 'extreme';
  synthesis: string;
  source: 'llm' | 'template_fallback';
  model_used: string;
  generated_at: string;
  refresh_due: string;
  disclaimer: string;
}

export interface ScenariosListResponse {
  scenarios: ScenarioSummary[];
}

export interface CurvePoint {
  sim_date: string;
  value: number;
}

export interface BenchmarkResult {
  available: boolean;
  ticker: string | null;
  label: string | null;
  curve: CurvePoint[];
  total_return_pct: number | null;
  unavailable_reason: string | null;
}

export interface PortfolioPerformance {
  curve: CurvePoint[];
  final_value: number;
  total_return_pct: number;
  time_weighted_return_pct: number;
}

export interface SessionPerformance {
  currency: string;
  starting_cash: number;
  portfolio: PortfolioPerformance;
  benchmark: BenchmarkResult;
}

export const eimSimService = {
  createSession: (payload: CreateSessionPayload) =>
    authPost<SimSession>(`${BASE}/sessions`, payload, 15_000),

  listSessions: (opts: { surface?: SimSurface; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.surface) qs.set('surface', opts.surface);
    if (opts.limit) qs.set('limit', String(opts.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return authGet<SessionListResponse>(`${BASE}/sessions${suffix}`);
  },

  getSession: (sessionId: string) =>
    authGet<SimSession>(`${BASE}/sessions/${encodeURIComponent(sessionId)}`),

  /** Portfolio value curve + total/time-weighted return + Shariah-proxy
   *  benchmark overlay for the played range (W4). Reconstructed server-side;
   *  may take a moment cold (N yfinance fetches). Benchmark may be
   *  `available:false` with a reason when no Shariah series covers the range. */
  getPerformance: (sessionId: string) =>
    authGet<SessionPerformance>(
      `${BASE}/sessions/${encodeURIComponent(sessionId)}/performance`,
    ),

  updateSession: (sessionId: string, payload: UpdateSessionPayload) =>
    authPatch<SimSession>(`${BASE}/sessions/${encodeURIComponent(sessionId)}`, payload),

  recordDecision: (sessionId: string, payload: RecordDecisionPayload) =>
    authPost<DecisionRecordedResponse>(
      `${BASE}/sessions/${encodeURIComponent(sessionId)}/decisions`,
      payload,
      15_000,
    ),

  deleteSession: (sessionId: string) =>
    authDelete<DeleteResponse>(`${BASE}/sessions/${encodeURIComponent(sessionId)}`),

  /** Filter candidate tickers to those with monthly OHLC at or before
   *  start_date. Per D29 (open universe + date-filter) + D37 (24h cache).
   *  Returns `available` + `filtered_out` with explicit per-ticker reasons. */
  getAvailableTickers: (params: { startDate: string; candidates: string[] }) => {
    const qs = new URLSearchParams({
      start_date: params.startDate,
      candidates: params.candidates.join(','),
    });
    return authGet<AvailableTickersResponse>(`${BASE}/available-tickers?${qs.toString()}`);
  },

  /** Tier 1 event corpus query. Frontend typically calls once at session
   *  creation with the session's date range; the SimEngine eagerly loads
   *  them and the state firewall handles visibility (D34). */
  getEvents: (params: {
    dateFrom?: string;
    dateTo?: string;
    category?: SimEventCategory;
    severity?: SimEventSeverity;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.dateFrom) qs.set('date_from', params.dateFrom);
    if (params.dateTo) qs.set('date_to', params.dateTo);
    if (params.category) qs.set('category', params.category);
    if (params.severity) qs.set('severity', params.severity);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return authGet<EventsResponse>(`${BASE}/events${suffix}`);
  },

  /** Tier 2 big-move detection — server-side compute (so the threshold
   *  + severity bands stay consistent across clients). POST so the bars
   *  list isn't URL-encoded. */
  getBigMoves: (params: { ticker: string; bars: MonthlyOhlcBar[]; thresholdPct?: number }) =>
    authPost<BigMovesResponse>(`${BASE}/big-moves`, {
      ticker: params.ticker,
      bars: params.bars,
      threshold_pct: params.thresholdPct ?? 10,
    }, 15_000),

  /** Strategy Comparator (Sprint 5). Stateless backtest — POST a date
   *  range + cash + tickers + strategy list, get back per-strategy
   *  wealth curves + metrics + Haiku commentary. Strict rate-limited
   *  (Haiku call per run + N yfinance fetches). */
  runComparator: (payload: {
    start_date: string;
    end_date: string;
    starting_cash: number;
    tickers: string[];
    strategies: Array<{ id: StrategyId; params?: Record<string, unknown> }>;
  }) =>
    authPost<ComparatorRunResponse>(
      `${BASE}/comparator/run`,
      payload,
      60_000,  // up to N yfinance fetches + 1 Haiku call
    ),

  /** Post-mortem report for an ended session (Sprint 4c). Sonnet 4.6 +
   *  permanent Firestore cache. First call may take several seconds
   *  (cold LLM); re-opens are effectively free. Session must be ended. */
  postMortem: (sessionId: string, opts: { forceRefresh?: boolean } = {}) =>
    authPost<PostMortemReport>(
      `${BASE}/sessions/${encodeURIComponent(sessionId)}/post-mortem`,
      { force_refresh: opts.forceRefresh ?? false },
      45_000,  // cold Sonnet call can take 10-20s
    ),

  /** Smart Interrupt probe (Sprint 4b, D27 layer a). Call after each
   *  step + after each decision. Returns at most ONE interrupt per call;
   *  re-call for the next pending. `current_portfolio_value` lets the
   *  drawdown trigger evaluate against the session-tracked peak. */
  checkInterrupts: (sessionId: string, payload: { current_portfolio_value?: number }) =>
    authPost<CheckInterruptsResponse>(
      `${BASE}/sessions/${encodeURIComponent(sessionId)}/check-interrupts`,
      payload,
      10_000,
    ),

  /** Sim-time user-initiated persona Q&A (Sprint 4a, D27 layer c).
   *  Server validates sim_date matches session.current_sim_date and only
   *  allows idle/paused state. Strict rate-limited (5/min) — paid LLM
   *  hit and no cache applies (Q&A is user-specific). */
  askPersona: (sessionId: string, payload: AskPersonaPayload) =>
    authPost<AskPersonaResponse>(
      `${BASE}/sessions/${encodeURIComponent(sessionId)}/ask-persona`,
      payload,
      30_000,
    ),

  /** Tier 2 LLM event synthesis — explain a big move with a 2-sentence
   *  factual context paragraph. Per D36: Haiku 4.5, 90-day server-side
   *  cache by (ticker, year_month). Strict rate-limited (5/min) so
   *  callers shouldn't fire on tick — fire on explicit user intent. */
  getBigMoveSynthesis: (params: {
    ticker: string;
    yearMonth: string;
    returnPct: number;
    severity?: 'caution' | 'high' | 'extreme';
    forceRefresh?: boolean;
  }) =>
    authPost<BigMoveSynthesis>(`${BASE}/synthesis`, {
      ticker: params.ticker,
      year_month: params.yearMonth,
      return_pct: params.returnPct,
      severity: params.severity ?? 'caution',
      force_refresh: params.forceRefresh ?? false,
    }, 30_000),

  // ── Scenario Lab (Sprint 6) ───────────────────────────────────────────────

  /** List the guided dilemmas. Framing-only summaries — no outcomes (the
   *  user is meant to decide blind before the reveal). */
  listScenarios: () => authGet<ScenariosListResponse>(`${BASE}/scenarios`),

  /** Full dilemma detail: setup, prompt, Islamic lens, options + allocations.
   *  Still carries no outcome data — that's the separate resolve call. */
  getScenario: (scenarioId: string) =>
    authGet<Scenario>(`${BASE}/scenarios/${encodeURIComponent(scenarioId)}`),

  /** The reveal (D31): fast-forward EVERY option to the horizon and return
   *  the comparison + Haiku commentary. `chosenOptionId` flags the user's
   *  pick for highlighting + the reflection. Strict rate-limited (N yfinance
   *  fetches + 1 Haiku call). */
  resolveScenario: (scenarioId: string, chosenOptionId: string | null) =>
    authPost<ScenarioResolveResponse>(
      `${BASE}/scenarios/${encodeURIComponent(scenarioId)}/resolve`,
      { chosen_option_id: chosenOptionId },
      60_000,
    ),

  // ── Projection Engine (Sprint 7) ──────────────────────────────────────────

  /** Forward Monte Carlo projection (§6.R.4). Stateless: POST the plan +
   *  assumptions, get back P10/P50/P90 wealth bands (nominal + real), goal
   *  probability, and dual-tier commentary. A distribution of scenarios —
   *  NOT a forecast. Strict rate-limited (1 Haiku call). */
  runProjection: (payload: ProjectionInput) =>
    authPost<ProjectionRunResponse>(`${BASE}/projection/run`, payload, 45_000),
};
