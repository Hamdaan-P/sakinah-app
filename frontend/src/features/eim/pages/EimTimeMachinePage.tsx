/**
 * Time Machine — the headline simulator surface.
 *
 * Per master plan §6.R.1 + D26 + 2026-05-24 UX feedback round:
 *
 *   - **Step mode** (item 2): no auto-tick timer. Each click on
 *     "Step forward" advances by the chosen step size (1mo / 3mo /
 *     1yr). The user pauses naturally between steps to think, trade,
 *     read events. Killed the play/pause distinction along with the
 *     setInterval driver and the rate-limit pressure that came with it.
 *
 *   - **Trade-from-idle** (item 1): the Trade button is visible from
 *     'idle' state too — users stake an initial portfolio BEFORE the
 *     first step. Backend `record_decision` allows idle as the
 *     "setup phase".
 *
 *   - **Dynamic universe** (item 3): tickers selected at session
 *     creation stay in `session.tickers` regardless of start_date
 *     availability. The Buy modal filters dynamically by
 *     `engine.currentPrice(ticker) !== null` — TSLA appears as
 *     buyable the moment the sim crosses its IPO.
 *
 *   - **Open Positions + Trades Journal split** (item 6): two
 *     separate tables. Open shows currently-held lots with current
 *     price + unrealised %. Trades Journal shows full decisions log
 *     newest-first; realised % on SELL rows is frozen at sell time.
 *
 *   - **Fixed-layout reservation** (item 7): the holdings area has
 *     min-height so synthesis expansion doesn't reflow the page.
 *
 *   - **Collapsible Stats panel** (item 9): allocation pie + realised
 *     P&L bar. Inline SVG, no new deps. Collapsed by default.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CaretLeft, ChatCircleDots, CurrencyCircleDollar, StopCircle } from '@phosphor-icons/react';
import { AskPersonaModal } from '../components/AskPersonaModal';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { FeatureIntro } from '../components/FeatureIntro';
import { SimulationModePill } from '../components/SimulationModePill';
import { SimChartsPanel } from '../components/SimChartsPanel';
import { SimPerformancePanel } from '../components/SimPerformancePanel';
import { SimDecisionModal } from '../components/SimDecisionModal';
import { SimEventCard } from '../components/SimEventCard';
import { SimInterruptBanner } from '../components/SimInterruptBanner';
import { SimReportView } from '../components/SimReportView';
import { SimSessionNameEditor } from '../components/SimSessionNameEditor';
import { SimOnboarding, ONBOARDING_FLAG } from '../components/SimOnboarding';
import { SimStatsPanel } from '../components/SimStatsPanel';
import { SimTickerPicker } from '../components/SimTickerPicker';
import { SimTimeline } from '../components/SimTimeline';
import { computeHoldings } from '../engine/holdings';
import { DEFAULT_TICKERS } from '../data/starterTickers';
import { eimService } from '../services/eim.service';
import {
  eimSimService,
  type AvailableTickersResponse,
  type BigMoveSynthesis,
} from '../services/eimSim.service';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import { ConvertedHint } from '../components/ConvertedHint';
import { getEngine, useSimStore } from '../stores/sim.store';
import type { Currency } from '../stores/currency.store';
import type { InterruptCard, MonthlyOhlcBar, SimEventCard as SimEventCardType, SimSession, SimSessionStatus, SimSpeed } from '../types/eim.types';

/** SimSpeed values map to step sizes (months advanced per Step click). */
const STEP_SIZE_MONTHS: Record<SimSpeed, number> = {
  '1mo_per_sec': 1,
  '3mo_per_sec': 3,
  '1yr_per_sec': 12,
};

const STEP_SIZE_LABELS: Record<SimSpeed, string> = {
  '1mo_per_sec': '1 mo',
  '3mo_per_sec': '3 mo',
  '1yr_per_sec': '1 yr',
};

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Status pill styles for the sessions list — color-coded so the
 *  list view tells you at a glance which sims are done vs in progress. */
const STATUS_STYLES: Record<SimSessionStatus, { cls: string; icon: string }> = {
  idle:    { cls: 'bg-[rgba(212,168,83,0.10)] text-[#7A7363] border border-[rgba(212,168,83,0.20)]', icon: '○' },
  playing: { cls: 'bg-[rgba(212,168,83,0.15)] text-[#D4A853] border border-[rgba(212,168,83,0.35)]', icon: '▶' },
  paused:  { cls: 'bg-[rgba(232,201,122,0.10)] text-[#E8C97A] border border-[rgba(232,201,122,0.35)]', icon: '⏸' },
  ended:   { cls: 'bg-[rgba(122,115,99,0.10)] text-[#7A7363] border border-[rgba(122,115,99,0.30)]', icon: '■' },
};

/** Friendly absolute timestamp — "May 24" if this year, "May 24, 2025"
 *  otherwise, with "today" / "yesterday" shortcuts for recent days. */
function formatTimestamp(iso: string | undefined | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const now = new Date();
  const daysAgo = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (daysAgo === 0) return 'today';
  if (daysAgo === 1) return 'yesterday';
  if (daysAgo < 7) return `${daysAgo} days ago`;
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
}

/** Item 6: 2-decimal precision on all money values. */
const formatUsd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatUsdCompact = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

export function EimTimeMachinePage() {
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const {
    sessions,
    currentSessionId,
    loading,
    error,
    refreshSessions,
    createTimeMachine,
    setCurrentSession,
    attachEngine,
    setStatus,
    advanceSimDate,
    flushSimDate,
    deleteSession,
  } = useSimStore();

  useEffect(() => {
    void refreshSessions().catch(() => { /* surfaced via store.error */ });
  }, [refreshSessions]);

  // Sync the URL :sessionId param into Zustand. URL is the source of
  // truth — bookmarks, back/forward, deep links all work because state
  // derives from the URL rather than the other way around. Sprint 6 Phase 3.
  useEffect(() => {
    if (urlSessionId !== currentSessionId) {
      setCurrentSession(urlSessionId ?? null);
    }
  }, [urlSessionId, currentSessionId, setCurrentSession]);

  // When a session is selected via URL but its engine isn't attached
  // yet (page-load straight to a deep link), fetch OHLC + attach.
  useEffect(() => {
    if (!urlSessionId) return;
    if (getEngine(urlSessionId)) return;
    const session = sessions.find((s) => s.id === urlSessionId);
    if (!session || session.tickers.length === 0) return;
    void loadSessionData(
      session.tickers,
      { dateFrom: session.start_date, dateTo: session.end_date },
    ).then(({ ohlc, events }) => attachEngine(urlSessionId, ohlc, events))
     .catch(() => { /* surfaced via store.error */ });
  }, [urlSessionId, sessions, attachEngine]);

  // Flush current sim_date to backend on tab hide / page unload so the
  // persisted state matches what the user just saw.
  useEffect(() => {
    if (!currentSessionId) return;
    const onHide = () => {
      void flushSimDate(currentSessionId).catch(() => { /* ignore */ });
    };
    window.addEventListener('beforeunload', onHide);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') onHide();
    });
    return () => {
      window.removeEventListener('beforeunload', onHide);
      void flushSimDate(currentSessionId).catch(() => { /* ignore */ });
    };
  }, [currentSessionId, flushSimDate]);

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === currentSessionId) ?? null,
    [sessions, currentSessionId],
  );

  // First-run walkthrough (Sprint 8). Shown once ever; dismissal persisted.
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem(ONBOARDING_FLAG) !== '1';
    } catch {
      return false; // storage unavailable (private mode / SSR) → don't nag.
    }
  });
  const dismissOnboarding = useCallback(() => {
    try { localStorage.setItem(ONBOARDING_FLAG, '1'); } catch { /* ignore */ }
    setShowOnboarding(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      {showOnboarding && <SimOnboarding onClose={dismissOnboarding} />}
      <div className="max-w-6xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim')}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
            aria-label="Back to EIM home"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
              EIM · The Headline Feature
            </div>
            {currentSession ? (
              <SimSessionNameEditor session={currentSession} />
            ) : (
              <h1 className="text-[20px] font-bold text-[#F5E8C7]">Simulator</h1>
            )}
          </div>
          <FeatureIntro featureId="time-machine" autoOpen={false} />
        </header>

        <SimulationModePill />
        <DisclaimerBanner />

        {error && (
          <div className="mx-5 mt-3 px-3 py-2 rounded-lg border border-[rgba(232,67,147,0.3)] bg-[rgba(232,67,147,0.10)] text-[12px] text-[#E84393]">
            {error}
          </div>
        )}

        {currentSession ? (
          currentSession.status === 'ended' ? (
            // Sprint 4c: ended sessions skip the live-sim view and land
            // directly on the post-mortem report (with save-as-portfolio
            // CTA). The decisions are frozen — there's nothing left to
            // step or trade.
            <SimReportView
              session={currentSession}
              onBackToList={() => navigate('/eim/time-machine')}
              onStartNewSim={() => navigate('/eim/time-machine')}
            />
          ) : (
            <ActiveSessionView
              session={currentSession}
              onChangeStatus={(s) => void setStatus(currentSession.id, s)}
              onAdvance={(d) => advanceSimDate(currentSession.id, d)}
              onBackToList={() => navigate('/eim/time-machine')}
              onRecordDecision={(payload) =>
                useSimStore.getState().recordDecision(currentSession.id, payload).then(() => undefined)
              }
            />
          )
        ) : (
          <SessionsListView
            sessions={sessions}
            loading={loading}
            onCreate={async (args) => {
              const session = await createTimeMachine(args);
              const { ohlc, events } = await loadSessionData(
                args.tickers,
                { dateFrom: args.startDate, dateTo: args.endDate },
              );
              attachEngine(session.id, ohlc, events);
              // Navigate to the new session's page (URL becomes the source of truth).
              navigate(`/eim/time-machine/${session.id}`);
              return session;
            }}
            onOpen={(id) => navigate(`/eim/time-machine/${id}`)}
            onDelete={(id) => deleteSession(id).catch(() => { /* surfaced */ })}
          />
        )}
      </div>
    </div>
  );
}

// ── Sessions list / create form ────────────────────────────────────────────

interface CreateFormArgs {
  startDate: string;
  endDate: string;
  startingCash: number;
  tickers: string[];
}

function SessionsListView({
  sessions,
  loading,
  onCreate,
  onOpen,
  onDelete,
}: {
  sessions: SimSession[];
  loading: boolean;
  onCreate: (args: CreateFormArgs) => Promise<SimSession>;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [creating, setCreating] = useState(sessions.length === 0);
  const [startDate, setStartDate] = useState('2008-01-01');
  const [endDate, setEndDate] = useState(todayIso());
  const [startingCash, setStartingCash] = useState(10_000);
  const [tickers, setTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState<AvailableTickersResponse | null>(null);
  const [availChecking, setAvailChecking] = useState(false);

  // Check which of the SELECTED tickers exist at the chosen start date, so
  // we can flag the ones not yet listed (open universe — any ticker may be
  // added via search, not just a fixed palette).
  useEffect(() => {
    if (!startDate || tickers.length === 0) {
      setAvailability(null);
      return;
    }
    setAvailChecking(true);
    const handle = setTimeout(() => {
      void eimSimService
        .getAvailableTickers({ startDate, candidates: tickers })
        .then((r) => setAvailability(r))
        .catch(() => setAvailability(null))
        .finally(() => setAvailChecking(false));
    }, 500);
    return () => clearTimeout(handle);
  }, [startDate, tickers]);

  // Item 3: do NOT drop unavailable tickers from the selection — the
  // user may want TSLA in the universe even when start_date < TSLA IPO,
  // because the sim will eventually cross 2010-06-01. The Buy modal
  // filters dynamically per sim_date.

  const filteredOutMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of availability?.filtered_out ?? []) m.set(f.ticker, f.reason);
    return m;
  }, [availability]);

  const submit = useCallback(async () => {
    if (submitting || tickers.length === 0) return;
    setSubmitting(true);
    try {
      const session = await onCreate({ startDate, endDate, startingCash, tickers });
      void session;
    } finally {
      setSubmitting(false);
    }
  }, [onCreate, startDate, endDate, startingCash, tickers, submitting]);

  // Summary counts for the list header.
  const counts = useMemo(() => {
    let ended = 0;
    let paused = 0;
    let playing = 0;
    let idle = 0;
    for (const s of sessions) {
      if (s.status === 'ended') ended += 1;
      else if (s.status === 'paused') paused += 1;
      else if (s.status === 'playing') playing += 1;
      else idle += 1;
    }
    return { total: sessions.length, ended, paused, playing, idle };
  }, [sessions]);
  const inProgress = counts.paused + counts.playing + counts.idle;

  return (
    <div className="px-3 mt-4 space-y-3">
      {/* Summary header — totals + status breakdown + "+ New" CTA */}
      {sessions.length > 0 && (
        <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
              Your Simulator sessions
            </div>
            <div className="text-[18px] font-bold text-[#F5E8C7] mt-0.5">
              {counts.total} {counts.total === 1 ? 'sim' : 'sims'}
            </div>
            <div className="text-[11px] text-[#7A7363] mt-0.5">
              {counts.ended} ended · {inProgress} in progress
            </div>
          </div>
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="h-10 px-4 rounded-xl text-[12px] font-bold text-[#0A0E16] flex items-center gap-1.5 flex-shrink-0"
              style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
            >
              + New sim
            </button>
          )}
        </div>
      )}

      {sessions.length > 0 && (
        <div className="space-y-2">
          {sessions.map((s) => {
            const displayName = s.name?.trim() || s.portfolio.name;
            const statusInfo = STATUS_STYLES[s.status];
            const createdLabel = `Created ${formatTimestamp(s.created_at)}`;
            const lastTouched = formatTimestamp(s.updated_at);
            const tsLabel = s.status === 'ended'
              ? `Ended ${lastTouched}`
              : `Updated ${lastTouched}`;
            return (
              <button
                key={s.id}
                onClick={() => onOpen(s.id)}
                className="w-full text-left rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 hover:border-[rgba(212,168,83,0.35)] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-bold text-[#F5E8C7] truncate">
                        {displayName}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded ${statusInfo.cls} flex-shrink-0`}
                      >
                        {statusInfo.icon} {s.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#7A7363] tabular-nums">
                      {s.start_date} → <span className="text-[#D4A853]">{s.current_sim_date}</span> → {s.end_date}
                    </div>
                    <div className="text-[10px] text-[#5C5749] flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>{s.tickers.length} ticker{s.tickers.length === 1 ? '' : 's'}</span>
                      <span>·</span>
                      <span>{s.decisions.length} decision{s.decisions.length === 1 ? '' : 's'}</span>
                      <span>·</span>
                      <span>{createdLabel}</span>
                      <span>·</span>
                      <span>{tsLabel}</span>
                    </div>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${displayName}"?`)) onDelete(s.id);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') onDelete(s.id); }}
                    className="text-[11px] text-[#5C5749] hover:text-[#E84393] px-2 py-1 rounded cursor-pointer flex-shrink-0"
                  >
                    Delete
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!creating ? (
        <button
          onClick={() => setCreating(true)}
          className="w-full h-12 rounded-xl text-[13px] font-bold text-[#0A0E16]"
          style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
        >
          + Start a new Simulator session
        </button>
      ) : (
        <div className="rounded-2xl border border-[rgba(212,168,83,0.30)] bg-[#101a2a] p-4 space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold">
            New Simulator session
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldDate label="Start date" value={startDate} onChange={setStartDate} max={todayIso()} />
            <FieldDate label="End date" value={endDate} onChange={setEndDate} min={startDate} max={todayIso()} />
          </div>

          <FieldNumber
            label="Starting cash (USD)"
            value={startingCash}
            onChange={setStartingCash}
            min={100}
            step={500}
            hintUsd={startingCash}
          />

          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold mb-2 flex items-center gap-2">
              <span>Tickers</span>
              {availChecking && <span className="text-[#5C5749] normal-case tracking-normal">checking…</span>}
            </div>
            <SimTickerPicker
              selected={tickers}
              onChange={setTickers}
              filteredOut={filteredOutMap}
            />
            {availability && availability.filtered_out.length > 0 && (
              <div className="mt-2 text-[10px] text-[#7A7363] leading-relaxed">
                {availability.filtered_out.length} selected ticker
                {availability.filtered_out.length === 1 ? '' : 's'} not yet listed at{' '}
                <span className="text-[#D4A853]">{startDate}</span> — they'll become buyable in the sim once their listing date passes. Hover each highlighted chip for the reason.
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setCreating(false)}
              className="flex-1 h-10 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363]"
            >
              Cancel
            </button>
            <button
              onClick={() => void submit()}
              disabled={submitting || tickers.length === 0 || loading}
              className="flex-1 h-10 rounded-xl text-[12px] font-bold text-[#0A0E16] disabled:opacity-60"
              style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
            >
              {submitting ? 'Creating…' : 'Start sim'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Active session view ────────────────────────────────────────────────────

function ActiveSessionView({
  session,
  onChangeStatus,
  onAdvance: _onAdvance,
  onBackToList,
  onRecordDecision,
}: {
  session: SimSession;
  onChangeStatus: (status: 'playing' | 'paused' | 'ended') => void;
  onAdvance: (simDate: string) => Promise<string>;
  onBackToList: () => void;
  onRecordDecision: (payload: {
    kind: 'BUY' | 'SELL';
    sim_date: string;
    ticker: string;
    qty: number;
    price: number;
    reflection_note?: string;
  }) => Promise<void>;
}) {
  const [stepSize, setStepSize] = useState<SimSpeed>(session.speed);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [askPersonaOpen, setAskPersonaOpen] = useState(false);
  /** When the modal is opened from an event card, the event seeds the
   *  prompt's `event_context`. `null` = freeform Q&A from the controls. */
  const [askPersonaEvent, setAskPersonaEvent] = useState<SimEventCardType | null>(null);
  /** Pre-populated text for the AskPersonaModal when the user clicks
   *  "Ask a follow-up" on an interrupt banner. */
  const [askPersonaPrefill, setAskPersonaPrefill] = useState<{ context: string; question: string } | null>(null);
  /** Currently-surfaced Smart Interrupt (Sprint 4b). null = no banner. */
  const [activeInterrupt, setActiveInterrupt] = useState<InterruptCard | null>(null);
  const [stepping, setStepping] = useState(false);
  const engine = getEngine(session.id);
  // Force re-render when engine state changes (engine isn't reactive).
  const [stepCount, setStepCount] = useState(0);

  // Item 2: manual step — advances by stepSize months. Status transitions
  // to 'paused' on first step (was 'idle'); stays 'paused' on subsequent
  // steps; auto-transitions to 'ended' if we hit end_date.
  const handleStep = useCallback(async () => {
    if (!engine || stepping) return;
    // Read status into a local once to avoid TS control-flow narrowing
    // that would persist through the mutation calls below (play/tick
    // can change status, but TS sees them as void-returning and so
    // keeps its earlier narrowing).
    const startStatus = engine.status as SimSessionStatus;
    if (startStatus === 'ended') return;
    setStepping(true);
    try {
      // Bring engine into 'playing' first so advanceTo is legal — then
      // immediately pause so the user can read events / decide.
      if (startStatus === 'idle' || startStatus === 'paused') engine.play();
      try {
        engine.tickMonths(STEP_SIZE_MONTHS[stepSize]);
      } catch {
        // Likely already at endDate.
      }
      const endStatus = engine.status as SimSessionStatus;
      const reachedEnd = endStatus === 'ended';
      if (!reachedEnd) engine.pause();
      setStepCount((n) => n + 1);

      if (reachedEnd) {
        onChangeStatus('ended');
      } else {
        // Single atomic PATCH that includes BOTH status='paused' and the new
        // current_sim_date. setStatus does exactly that. We must NOT use
        // advanceSimDate here because it PATCHes sim_date alone — backend
        // rejects "advance from idle" on the very first step from a fresh
        // session, since session.status is still 'idle' on the backend even
        // though we've called engine.play() locally.
        onChangeStatus('paused');
      }
    } finally {
      setStepping(false);
    }
  }, [engine, stepping, stepSize, onChangeStatus]);

  // Sim amounts are in the session currency; convert to the display currency.
  const { format } = useCurrencyFormat();
  const money = (n: number) => format(n, session.currency as Currency, { maxDecimals: 2 });

  const currentPrices = engine?.currentPrices() ?? {};
  const portfolioValue = useMemo(() => {
    const holdingsValue = session.portfolio.positions.reduce((sum, pos) => {
      const price = currentPrices[pos.ticker];
      return sum + (price ?? pos.buy_price) * pos.qty;
    }, 0);
    return session.portfolio.cash_balance + holdingsValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stepCount drives the recomputation
  }, [session.portfolio, currentPrices, stepCount]);

  const totalReturnPct = ((portfolioValue - session.starting_cash) / session.starting_cash) * 100;

  const tradeEnabled = session.status === 'idle' || session.status === 'paused';

  // Probe for Smart Interrupts after every step or decision. We only probe
  // when there's no banner currently displayed — otherwise rapid stepping
  // would stack banners and confuse the UX. The backend enforces the 5/session
  // cap independently. Cap reached → backend returns interrupt:null, effect is a no-op.
  useEffect(() => {
    if (!engine || activeInterrupt) return;
    if (session.status === 'ended') return;
    // Skip the very first render (stepCount=0, no decisions) when the
    // user has just opened a fresh session — no interrupts should
    // surface before the user has taken any action.
    if (stepCount === 0 && session.decisions.length === 0 && session.interrupts_shown === 0) return;
    let cancelled = false;
    void eimSimService
      .checkInterrupts(session.id, { current_portfolio_value: portfolioValue })
      .then((r) => {
        if (!cancelled && r.interrupt) setActiveInterrupt(r.interrupt);
      })
      .catch(() => { /* swallow — interrupts are best-effort */ });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- portfolioValue + stepCount + decision count drive the probe
  }, [session.id, stepCount, session.decisions.length, session.status]);

  return (
    <div className="px-3 mt-4 space-y-3">
      {/* Smart Interrupt banner (Sprint 4b) — full-width above the two-
          column layout so the lens's voice gets attention regardless of
          which column the user's eyes are on. */}
      {activeInterrupt && (
        <SimInterruptBanner
          interrupt={activeInterrupt}
          onDismiss={() => setActiveInterrupt(null)}
          onAskFollowUp={(intr) => {
            // Pre-populate the AskPersonaModal with the interrupt's
            // context + a useful default question. The user can edit
            // either field before sending.
            setAskPersonaPrefill({
              context: `${intr.persona_label} interrupt — ${intr.headline}\n\n${intr.body}`,
              question: intr.kind === 'drawdown'
                ? 'Walk me through what the lens would weigh first in this drawdown.'
                : 'Help me think through what this means for my current positions.',
            });
            setAskPersonaOpen(true);
            setActiveInterrupt(null);
          }}
        />
      )}

      {/* Two-column layout on md+ breakpoints. Left rail is sticky and
          holds the controls + portfolio value (the things the user
          glances at constantly). Right rail scrolls and holds the
          read-mostly data (holdings, journal, events, stats). Mobile
          collapses to a single vertical column. */}
      <div className="md:grid md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-4 md:items-start space-y-3 md:space-y-0">
        <div className="md:sticky md:top-3 space-y-3">

      {/* Sim date readout */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
          Sim date
          {' · '}
          {session.status === 'idle' && <span className="text-[#D4A853]">○ setup — trade then step</span>}
          {session.status === 'paused' && <span className="text-[#E8C97A]">⏸ paused — trade or step</span>}
          {session.status === 'playing' && <span className="text-[#D4A853]">▶ stepping…</span>}
          {session.status === 'ended' && <span className="text-[#7A7363]">■ ended</span>}
        </div>
        <div className="text-[28px] font-bold text-[#F5E8C7] tracking-wide mt-1">
          {engine?.simDate ?? session.current_sim_date}
        </div>
        <div className="text-[11px] text-[#7A7363]">
          {session.start_date} → {session.end_date}
        </div>
        {engine && (
          <SimTimeline
            startDate={session.start_date}
            simDate={engine.simDate}
            endDate={session.end_date}
            events={engine.visibleEvents()}
          />
        )}
      </div>

      {/* Controls — step-mode (item 2) */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleStep()}
            disabled={session.status === 'ended' || stepping || !engine}
            className="flex-1 h-10 rounded-xl text-[12px] font-bold text-[#0A0E16] flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
          >
            <ArrowRight size={14} weight="bold" />
            {stepping ? 'Stepping…' : `Step +${STEP_SIZE_LABELS[stepSize]}`}
          </button>
          {tradeEnabled && (
            <button
              onClick={() => setDecisionOpen(true)}
              className="h-10 px-3 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.30)] text-[12px] text-[#D4A853] flex items-center gap-1.5"
              aria-label="Open trade panel"
            >
              <CurrencyCircleDollar size={14} weight="bold" /> Trade
            </button>
          )}
          {tradeEnabled && (
            <button
              onClick={() => { setAskPersonaEvent(null); setAskPersonaOpen(true); }}
              className="h-10 px-3 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.30)] text-[12px] text-[#D4A853] flex items-center gap-1.5"
              aria-label="Ask a lens"
              title="Ask a lens at the current sim date"
            >
              <ChatCircleDots size={14} weight="bold" /> Ask
            </button>
          )}
          {session.status !== 'ended' && (
            <button
              onClick={() => onChangeStatus('ended')}
              className="h-10 px-3 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363] flex items-center gap-1.5"
            >
              <StopCircle size={14} weight="bold" /> End
            </button>
          )}
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-1.5">
            Step size
          </div>
          <div className="flex gap-2">
            {(Object.keys(STEP_SIZE_LABELS) as SimSpeed[]).map((s) => (
              <button
                key={s}
                onClick={() => setStepSize(s)}
                className={
                  'flex-1 h-9 rounded-lg text-[12px] font-bold border ' +
                  (stepSize === s
                    ? 'border-[rgba(212,168,83,0.50)] bg-[rgba(212,168,83,0.15)] text-[#F5E8C7]'
                    : 'border-[rgba(212,168,83,0.18)] bg-[#0F1724] text-[#7A7363]')
                }
              >
                {STEP_SIZE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio value */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
          Portfolio value
        </div>
        <div className="text-[24px] font-bold text-[#F5E8C7] mt-1">
          {money(portfolioValue)}
        </div>
        <div className={'text-[13px] font-semibold ' + (totalReturnPct >= 0 ? 'text-[#5FC986]' : 'text-[#E84393]')}>
          {formatPct(totalReturnPct)} since start
        </div>
        <div className="text-[11px] text-[#7A7363] mt-2 flex gap-3 flex-wrap">
          <span>Cash: {money(session.portfolio.cash_balance)}</span>
          <span>Holdings: {session.portfolio.positions.length} lot{session.portfolio.positions.length === 1 ? '' : 's'}</span>
          <span>Decisions: {session.decisions.length}</span>
        </div>
      </div>

        </div>{/* end left rail */}

        {/* Right rail — read-mostly data, scrolls naturally below the
            sticky left rail on md+. */}
        <div className="space-y-3">

      {/* Item 7: holdings + journal area has fixed min-height so the
          synthesis expansion doesn't reflow the surrounding page. */}
      <div className="space-y-3 min-h-[380px]">
        <OpenPositionsTable
          positions={session.portfolio.positions}
          engine={engine}
          currency={session.currency}
        />

        <TradesJournal decisions={session.decisions} currency={session.currency} />
      </div>

      {/* Performance vs Shariah benchmark (W4). Server-reconstructed curve +
          total/time-weighted return. Shown once the user has made a trade. */}
      {session.decisions.length > 0 && (
        <SimPerformancePanel session={session} />
      )}

      {/* Price charts — candlesticks per held ticker with BUY/SELL markers
          (Sprint 6 Phase 4). Engine-driven, state-firewalled to sim_date. */}
      {engine && session.portfolio.positions.length > 0 && (
        <SimChartsPanel session={session} engine={engine} />
      )}

      {/* Tier 1 events — right-rail card stack */}
      {engine && (() => {
        const visible = engine.visibleEvents({ lookbackDays: 60 });
        if (visible.length === 0) return null;
        const cards = [...visible].reverse();
        return (
          <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#0A0E16] p-3 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749] px-1">
              Recent events ({visible.length})
            </div>
            {cards.map((ev) => (
              <SimEventCard
                key={ev.id}
                event={ev}
                simDate={engine.simDate}
                onAskPersona={(e) => {
                  setAskPersonaEvent(e);
                  setAskPersonaOpen(true);
                }}
              />
            ))}
          </div>
        );
      })()}

      {/* Item 9: collapsible analytics */}
      {engine && (
        <SimStatsPanel
          session={session}
          currentPrices={currentPrices}
        />
      )}

      <button
        onClick={onBackToList}
        className="w-full h-10 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363]"
      >
        ← Back to sessions
      </button>

        </div>{/* end right rail */}
      </div>{/* end 2-column grid */}

      {decisionOpen && engine && tradeEnabled && (
        <SimDecisionModal
          session={session}
          engine={engine}
          holdings={computeHoldings(session.portfolio)}
          onClose={() => setDecisionOpen(false)}
          onSubmit={async (payload) => {
            await onRecordDecision({
              ...payload,
              sim_date: engine.simDate,
            });
          }}
        />
      )}

      {askPersonaOpen && engine && tradeEnabled && (
        <AskPersonaModal
          session={session}
          simDate={engine.simDate}
          eventCard={askPersonaEvent ?? undefined}
          portfolioSummary={renderPortfolioSummary(session, engine.currentPrices())}
          initialContext={askPersonaPrefill?.context}
          initialQuestion={askPersonaPrefill?.question}
          onClose={() => { setAskPersonaOpen(false); setAskPersonaEvent(null); setAskPersonaPrefill(null); }}
        />
      )}
    </div>
  );
}

// ── Open Positions table (item 6) ──────────────────────────────────────────

function OpenPositionsTable({
  positions,
  engine,
  currency,
}: {
  positions: SimSession['portfolio']['positions'];
  engine: ReturnType<typeof getEngine> | undefined;
  currency: string;
}) {
  if (positions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-6 text-center">
        <div className="text-[12px] text-[#7A7363]">
          No open positions yet. Tap <span className="text-[#D4A853] font-bold">Trade</span> to buy.
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-3">
        Open positions
      </div>
      {/* Fixed column widths so values don't shift between rows (Sprint 6 Phase 3).
          Ticker is the only flex column (1fr, truncates); numeric columns get
          explicit widths sized to worst-case content. tabular-nums alignment
          on the data rows keeps decimals lined up. */}
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[minmax(0,1fr)_70px_90px_90px_90px] gap-x-3 text-[9px] uppercase tracking-widest text-[#5C5749] mb-1.5 pb-1.5 border-b border-[rgba(212,168,83,0.10)]">
            <span>Ticker</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Bought @</span>
            <span className="text-right">Now</span>
            <span className="text-right">P&L</span>
          </div>
          <div className="space-y-2">
            {positions.map((pos) => {
              const current = engine?.currentPrice(pos.ticker) ?? null;
              const pnlPct = current !== null ? ((current - pos.buy_price) / pos.buy_price) * 100 : null;
              const bars = engine ? engine.visiblePrices(pos.ticker) : [];
              const bigMove = engine ? lastMonthBigMove(bars) : null;
              const yearMonth = bars.length > 0 ? bars[bars.length - 1].time.slice(0, 7) : null;
              return (
                <OpenPositionRow
                  key={pos.id}
                  ticker={pos.ticker}
                  qty={pos.qty}
                  buyPrice={pos.buy_price}
                  buyDate={pos.buy_date}
                  currentPrice={current}
                  pnlPct={pnlPct}
                  bigMove={bigMove}
                  yearMonth={yearMonth}
                  currency={currency}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function OpenPositionRow({
  ticker,
  qty,
  buyPrice,
  buyDate,
  currentPrice,
  pnlPct,
  bigMove,
  yearMonth,
  currency,
}: {
  ticker: string;
  qty: number;
  buyPrice: number;
  buyDate: string;
  currentPrice: number | null;
  pnlPct: number | null;
  bigMove: { return_pct: number; severity: 'caution' | 'high' | 'extreme' } | null;
  yearMonth: string | null;
  currency: string;
}) {
  const { format } = useCurrencyFormat();
  const money = (n: number) => format(n, currency as Currency, { maxDecimals: 2 });
  const [synthesis, setSynthesis] = useState<BigMoveSynthesis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setSynthesis(null);
    setError(null);
    setExpanded(false);
  }, [ticker, yearMonth]);

  // Item 5: TOGGLE expanded — was always setting true.
  const askWhy = async () => {
    if (!bigMove || !yearMonth) return;
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (synthesis || loading) return;
    setLoading(true);
    setError(null);
    try {
      const r = await eimSimService.getBigMoveSynthesis({
        ticker,
        yearMonth,
        returnPct: bigMove.return_pct,
        severity: bigMove.severity,
      });
      setSynthesis(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-[12px]">
      <div className="grid grid-cols-[minmax(0,1fr)_70px_90px_90px_90px] gap-x-3 items-baseline">
        <div className="flex flex-col min-w-0">
          <span className="text-[#F5E8C7] font-bold truncate">{ticker}</span>
          <span className="text-[10px] text-[#5C5749]">bought {buyDate}</span>
        </div>
        <span className="text-right text-[#7A7363] tabular-nums">{qty}</span>
        <span className="text-right text-[#7A7363] tabular-nums">{money(buyPrice)}</span>
        <span className="text-right text-[#F5E8C7] font-semibold tabular-nums">
          {currentPrice !== null ? money(currentPrice) : '—'}
        </span>
        <span className={'text-right font-bold tabular-nums ' + (pnlPct === null ? 'text-[#5C5749]' : pnlPct >= 0 ? 'text-[#5FC986]' : 'text-[#E84393]')}>
          {pnlPct !== null ? formatPct(pnlPct) : '—'}
        </span>
      </div>
      {bigMove && yearMonth && (
        <div className="mt-1 flex items-center gap-2">
          <div
            className={
              'text-[10px] font-semibold uppercase tracking-wider ' +
              (bigMove.severity === 'extreme' ? 'text-[#E84393]'
                : bigMove.severity === 'high' ? 'text-[#E8C97A]'
                : 'text-[#7A7363]')
            }
          >
            Big move {yearMonth}: {bigMove.return_pct >= 0 ? '+' : ''}{bigMove.return_pct.toFixed(1)}%
          </div>
          <button
            onClick={() => void askWhy()}
            className="text-[10px] uppercase tracking-widest text-[#D4A853] hover:text-[#E8C97A] font-semibold"
          >
            {loading ? 'thinking…' : expanded ? 'hide' : 'why?'}
          </button>
        </div>
      )}
      {bigMove && expanded && (synthesis || error || loading) && (
        <div className="mt-1.5 rounded-lg bg-[#0A0E16] border border-[rgba(212,168,83,0.10)] p-2.5 space-y-1.5">
          {loading && !synthesis && (
            <div className="text-[11px] text-[#7A7363]">Loading context…</div>
          )}
          {error && (
            <div className="text-[11px] text-[#E84393]">{error}</div>
          )}
          {synthesis && (
            <>
              <p className="text-[12px] text-[#F5E8C7] leading-relaxed">
                {synthesis.synthesis}
              </p>
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest">
                <span className={
                  'px-1.5 py-0.5 rounded border ' +
                  (synthesis.source === 'llm'
                    ? 'border-[rgba(212,168,83,0.30)] text-[#D4A853]'
                    : 'border-[rgba(232,201,122,0.30)] text-[#E8C97A]')
                }>
                  {synthesis.source === 'llm' ? 'Haiku' : 'Template'}
                </span>
                <span className="text-[#5C5749] normal-case tracking-normal leading-tight">
                  {synthesis.disclaimer}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Trades Journal (item 6) ────────────────────────────────────────────────

function TradesJournal({ decisions, currency }: { decisions: SimSession['decisions']; currency: string }) {
  const { format } = useCurrencyFormat();
  const ccy = currency as Currency;
  const money = (n: number) => format(n, ccy, { maxDecimals: 2 });
  const moneyCompactSigned = (n: number) =>
    `${n < 0 ? '-' : '+'}${format(Math.abs(n), ccy, { maxDecimals: 0 })}`;
  if (decisions.length === 0) return null;
  const ordered = [...decisions].reverse(); // newest first
  // Sprint 6 Phase 3: fixed columns so values don't shift between rows.
  //   Kind badge: 56px (fits "BUY"/"SELL" badge)
  //   Ticker · Date: 1fr (flex, truncates)
  //   Qty: 70px right
  //   @ price: 80px right
  //   Realised: 90px right
  const COLS = 'grid-cols-[56px_minmax(0,1fr)_70px_80px_90px]';
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-3">
        Trades journal ({decisions.length})
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          <div className={`grid ${COLS} gap-x-3 text-[9px] uppercase tracking-widest text-[#5C5749] mb-1.5 pb-1.5 border-b border-[rgba(212,168,83,0.10)]`}>
            <span>Kind</span>
            <span>Ticker · Date</span>
            <span className="text-right">Qty</span>
            <span className="text-right">@</span>
            <span className="text-right">Realised</span>
          </div>
          <div className="space-y-1.5">
            {ordered.slice(0, 12).map((d) => (
              <div key={d.id} className={`grid ${COLS} gap-x-3 items-baseline text-[12px]`}>
                <span className={
                  'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest text-center ' +
                  (d.kind === 'BUY' ? 'bg-[rgba(95,201,134,0.15)] text-[#5FC986]'
                    : d.kind === 'SELL' ? 'bg-[rgba(212,168,83,0.15)] text-[#D4A853]'
                    : 'bg-[rgba(122,115,99,0.15)] text-[#7A7363]')
                }>
                  {d.kind}
                </span>
                <span className="text-[#F5E8C7] text-[11px] truncate min-w-0">
                  {d.ticker ?? '—'} <span className="text-[#5C5749]">· {d.sim_date}</span>
                </span>
                <span className="text-right text-[#7A7363] tabular-nums">{d.qty || '—'}</span>
                <span className="text-right text-[#7A7363] tabular-nums">
                  {d.price > 0 ? money(d.price) : '—'}
                </span>
                <span className={
                  'text-right font-bold tabular-nums ' +
                  (d.kind !== 'SELL' ? 'text-[#5C5749]'
                    : d.realized_pnl >= 0 ? 'text-[#5FC986]' : 'text-[#E84393]')
                }>
                  {d.kind === 'SELL' ? moneyCompactSigned(d.realized_pnl) : '—'}
                </span>
              </div>
            ))}
            {ordered.length > 12 && (
              <div className="text-[10px] text-[#5C5749] pt-1">
                + {ordered.length - 12} earlier decision{ordered.length - 12 === 1 ? '' : 's'}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="text-[10px] text-[#5C5749] mt-2 px-1">
        Realised P&L populates on SELL rows only — BUYs sit on unrealised gains until you close them.
      </div>
    </div>
  );
}

// ── Field helpers ────────────────────────────────────────────────────────

function FieldDate({ label, value, onChange, min, max }: { label: string; value: string; onChange: (v: string) => void; min?: string; max?: string }) {
  const id = `eim-tm-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold block mb-1">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.20)] text-[13px] text-[#F5E8C7]"
      />
    </div>
  );
}

function FieldNumber({ label, value, onChange, min, step, hintUsd }: { label: string; value: number; onChange: (v: number) => void; min?: number; step?: number; hintUsd?: number }) {
  const id = `eim-tm-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold block mb-1">
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full h-10 px-3 rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.20)] text-[13px] text-[#F5E8C7]"
      />
      {hintUsd !== undefined && <ConvertedHint usd={hintUsd} />}
    </div>
  );
}

// ── Utils ────────────────────────────────────────────────────────────────

/** Build a compact, LLM-friendly portfolio summary string for the
 *  ask-persona prompt. Uses sim-time prices from the engine (NOT live
 *  prices). Server caps the string to 2000 chars; we render conservatively. */
function renderPortfolioSummary(
  session: SimSession,
  currentPrices: Record<string, number | null>,
): string {
  const lines: string[] = [
    `Cash: ${formatUsdCompact(session.portfolio.cash_balance)}`,
  ];
  if (session.portfolio.positions.length === 0) {
    lines.push('Holdings: none');
    return lines.join(' · ');
  }
  const aggregated = new Map<string, { qty: number; cost: number }>();
  for (const pos of session.portfolio.positions) {
    const cur = aggregated.get(pos.ticker) ?? { qty: 0, cost: 0 };
    cur.qty += pos.qty;
    cur.cost += pos.qty * pos.buy_price;
    aggregated.set(pos.ticker, cur);
  }
  const positionLines: string[] = [];
  for (const [ticker, { qty, cost }] of aggregated.entries()) {
    const avg = qty > 0 ? cost / qty : 0;
    const cur = currentPrices[ticker] ?? null;
    const tail = cur !== null ? `now ${formatUsd(cur)}` : 'not priced at sim_date';
    positionLines.push(`${ticker} ×${qty} @ avg ${formatUsd(avg)} (${tail})`);
  }
  lines.push('Holdings: ' + positionLines.join('; '));
  return lines.join(' · ');
}

/** Client-side big-move detector — mirrors backend `detect_big_moves`. */
function lastMonthBigMove(
  bars: readonly MonthlyOhlcBar[],
): { return_pct: number; severity: 'caution' | 'high' | 'extreme' } | null {
  if (bars.length < 2) return null;
  const prev = bars[bars.length - 2].close;
  const cur = bars[bars.length - 1].close;
  if (!prev || prev === 0) return null;
  const ret = ((cur - prev) / prev) * 100;
  const abs = Math.abs(ret);
  if (abs < 10) return null;
  const severity = abs >= 25 ? 'extreme' : abs >= 15 ? 'high' : 'caution';
  return { return_pct: ret, severity };
}

/** Fetch monthly OHLC + Tier 1 events in parallel. */
async function loadSessionData(
  tickers: string[],
  window: { dateFrom: string; dateTo: string },
): Promise<{ ohlc: Record<string, MonthlyOhlcBar[]>; events: SimEventCardType[] }> {
  const [ohlcEntries, eventsResp] = await Promise.all([
    Promise.all(
      tickers.map(async (ticker): Promise<[string, MonthlyOhlcBar[]]> => {
        try {
          const r = await eimService.getStockMonthly(ticker, 'max');
          return [ticker, r.bars];
        } catch {
          return [ticker, []];
        }
      }),
    ),
    eimSimService
      .getEvents({ dateFrom: window.dateFrom, dateTo: window.dateTo })
      .catch(() => ({ events: [] as SimEventCardType[] })),
  ]);
  const ohlc: Record<string, MonthlyOhlcBar[]> = {};
  for (const [t, bars] of ohlcEntries) ohlc[t] = bars;
  return { ohlc, events: eventsResp.events };
}

export default EimTimeMachinePage;
