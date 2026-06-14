/**
 * SimReportView — post-mortem display + save-as-portfolio CTA.
 * Sprint 4c.
 *
 * Renders inside EimTimeMachinePage when session.status === 'ended'.
 * Replaces the live-sim ActiveSessionView so re-opening an ended
 * session lands directly on the report.
 *
 * Layout:
 *   - Top numeric summary (sim period, starting → ending, % return)
 *   - At-a-glance LLM paragraph
 *   - 3 narrative sections (decisions critique, behavioural patterns,
 *     what to carry forward)
 *   - Decisions journal (full, chronological — frozen)
 *   - Save-as-EIM-portfolio CTA + "Start a new sim" + "Back to sessions"
 *
 * The post-mortem is fetched once via eimSimService.postMortem and
 * cached server-side forever (sessions are immutable post-end), so
 * re-opens are effectively free.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookmarkSimple, ChartLine, CheckCircle, Compass, TrendUp, Trophy, WarningCircle } from '@phosphor-icons/react';
import { SimChartsPanel } from './SimChartsPanel';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import { eimSimService } from '../services/eimSim.service';
import type { Currency } from '../stores/currency.store';
import { useEimStore } from '../stores/eim.store';
import { getEngine, useSimStore } from '../stores/sim.store';
import type { PostMortemReport, SimSession } from '../types/eim.types';

const formatPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

/** Money formatters bound to a session's currency, converting into the user's
 *  chosen display currency (no-op when equal; native fallback until FX loads).
 *  Used by both SimReportView and the FrozenOpenPositions sub-component. */
function useSessionMoney(session: SimSession) {
  const { format } = useCurrencyFormat();
  const ccy = session.currency as Currency;
  return {
    money: (n: number) => format(n, ccy, { maxDecimals: 2 }),
    moneySigned: (n: number) => `${n < 0 ? '-' : '+'}${format(Math.abs(n), ccy, { maxDecimals: 2 })}`,
  };
}

/** Tiny **bold** renderer — same convention as SimInterruptBanner. */
function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-[#F5E8C7] font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export interface SimReportViewProps {
  session: SimSession;
  onBackToList: () => void;
  onStartNewSim: () => void;
}

export function SimReportView({ session, onBackToList, onStartNewSim }: SimReportViewProps) {
  const { money, moneySigned } = useSessionMoney(session);
  const [report, setReport] = useState<PostMortemReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [savedPortfolioId, setSavedPortfolioId] = useState<string | null>(null);
  const createPortfolio = useEimStore((s) => s.createPortfolio);
  const buy = useEimStore((s) => s.buy);
  const setStatus = useSimStore((s) => s.setStatus);
  // Subscribe to engineVersion so this component re-renders when the
  // engine attaches async-after-mount (re-opened session).
  const engineVersion = useSimStore((s) => s.engineVersion);
  const engine = getEngine(session.id);

  // Client-side fallback for the headline numbers: works without the
  // post-mortem report so the stats are never blank even if the LLM
  // call failed or the session is stuck mid-transition. Uses
  // engine.currentPrice() at the session's sim_date (firewall-safe).
  const clientStats = useMemo(() => {
    let holdingsValue = 0;
    for (const pos of session.portfolio.positions) {
      const cur = engine?.currentPrice(pos.ticker) ?? null;
      holdingsValue += (cur ?? pos.buy_price) * pos.qty;
    }
    const endingValue = session.portfolio.cash_balance + holdingsValue;
    const totalReturnPct = session.starting_cash > 0
      ? ((endingValue - session.starting_cash) / session.starting_cash) * 100
      : 0;
    // Realised = sum of realized_pnl across SELL decisions (the cash
    // actually crystallised). Unrealised = total return minus realised
    // (the paper gain/loss still riding on open positions).
    const realisedPnl = session.decisions.reduce(
      (sum, d) => sum + (d.kind === 'SELL' ? d.realized_pnl : 0),
      0,
    );
    const unrealisedPnl = (endingValue - session.starting_cash) - realisedPnl;
    return { endingValue, totalReturnPct, realisedPnl, unrealisedPnl };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- engineVersion drives the recompute
  }, [session.portfolio, session.starting_cash, session.decisions, engineVersion]);

  const fetchPostMortem = (force = false) => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    eimSimService
      .postMortem(session.id, { forceRefresh: force })
      .then((r) => { if (!cancelled) setReport(r); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  };

  useEffect(() => {
    return fetchPostMortem();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, [session.id]);

  // Recovery path: if the post-mortem 400'd because the backend session
  // is still 'paused' (the End PATCH never landed), let the user re-end
  // the session and retry. Common cause: PATCH was lost to a network
  // blip; the optimistic Zustand state put us on this page anyway.
  const isStuckInPaused = !!error && /current status is 'paused'/.test(error);
  const handleRetryEnd = async () => {
    if (recovering) return;
    setRecovering(true);
    setError(null);
    try {
      await setStatus(session.id, 'ended');
      // setStatus updates Zustand from backend response — give the
      // store a microtask to settle, then retry post-mortem.
      await new Promise((r) => setTimeout(r, 50));
      fetchPostMortem(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRecovering(false);
    }
  };

  const handleSaveAsPortfolio = () => {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    try {
      const displayName = session.name?.trim() || session.portfolio.name;
      const name = `${displayName} (saved from sim)`;
      const newPortfolio = createPortfolio(name, session.user_id, {
        startingCash: session.portfolio.cash_balance,
        currency: session.portfolio.currency,
      });
      // Replay each open lot as a BUY into the new portfolio so the
      // FIFO ledger + transactions journal reflect the sim history.
      // Uses the lot's buy_price / buy_date — preserves cost basis.
      for (const pos of session.portfolio.positions) {
        try {
          buy({
            portfolioId: newPortfolio.id,
            ticker: pos.ticker,
            qty: pos.qty,
            price: pos.buy_price,
            when: pos.buy_date,
            note: `Carried over from the Simulator (ended ${session.current_sim_date})`,
          });
        } catch {
          // If the user's localStorage cash is short of replaying every
          // lot (rare — createPortfolio just seeded it with the sim's
          // cash), skip silently. The portfolio still gets the rest.
        }
      }
      setSavedPortfolioId(newPortfolio.id);
      setSaveState('saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaveState('idle');
    }
  };

  return (
    <div className="px-3 mt-4 space-y-3 max-w-3xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.30)] bg-[#101a2a] p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold">
          <Trophy size={12} weight="fill" /> Simulator — session complete
        </div>
        <div className="text-[20px] font-bold text-[#F5E8C7] mt-1 leading-tight">
          {session.name?.trim() || session.portfolio.name}
        </div>
        <div className="text-[11px] text-[#7A7363] mt-0.5">
          {report?.sim_period ?? `${session.start_date} → ${session.current_sim_date}`}
        </div>
      </div>

      {/* Numeric summary — always rendered from client-side compute even
          when the post-mortem call is in flight or has failed. The
          report's values override ours when it loads, but the numbers
          are never blank. */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 space-y-3">
        {/* Row 1: position-level snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Starting cash" value={money(session.starting_cash)} />
          <Stat
            label="Ending value"
            value={money(report?.ending_value ?? clientStats.endingValue)}
          />
          <Stat label="Decisions" value={String(session.decisions.length)} />
          <Stat label="Open positions" value={String(session.portfolio.positions.length)} />
        </div>
        {/* Row 2: the P&L split — the part the user actually cares about */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[rgba(212,168,83,0.10)]">
          <Stat
            label="Realised P&L"
            value={moneySigned(report?.realised_pnl ?? clientStats.realisedPnl)}
            tone={(report?.realised_pnl ?? clientStats.realisedPnl) >= 0 ? 'positive' : 'negative'}
            footer="from SELL decisions"
          />
          <Stat
            label="Unrealised P&L"
            value={moneySigned(report?.unrealised_pnl ?? clientStats.unrealisedPnl)}
            tone={(report?.unrealised_pnl ?? clientStats.unrealisedPnl) >= 0 ? 'positive' : 'negative'}
            footer="on still-open positions"
          />
          <Stat
            label="Total return"
            value={formatPct(report?.total_return_pct ?? clientStats.totalReturnPct)}
            tone={(report?.total_return_pct ?? clientStats.totalReturnPct) >= 0 ? 'positive' : 'negative'}
            footer="realised + unrealised"
          />
        </div>
      </div>

      {/* Open Positions panel — frozen at sim_date close. Only when
          there are still-open holdings; otherwise the user has
          flattened out and there's nothing to mark. */}
      {session.portfolio.positions.length > 0 && (
        <FrozenOpenPositions session={session} engine={engine} />
      )}

      {/* Price charts (Sprint 6 Phase 4) — candlesticks with BUY/SELL
          markers for every ticker the user ever traded in this sim,
          frozen at end-date. Lets the user review entry/exit timing
          against the actual price action. */}
      {engine && (session.portfolio.positions.length > 0 || session.decisions.some((d) => d.ticker)) && (
        <SimChartsPanel session={session} engine={engine} />
      )}

      {/* LLM narrative */}
      {loading && (
        <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 text-[12px] text-[#7A7363]">
          The Compass lens is reflecting on your session…
        </div>
      )}
      {error && !isStuckInPaused && (
        <div className="rounded-2xl border border-[rgba(232,67,147,0.35)] bg-[rgba(232,67,147,0.08)] p-4 text-[12px] text-[#E84393] flex items-start gap-2">
          <WarningCircle size={14} weight="fill" className="mt-0.5" />
          <div className="flex-1">
            <div>Couldn't load the post-mortem reflection: {error}</div>
            <button
              onClick={() => fetchPostMortem(true)}
              className="mt-2 text-[11px] underline hover:text-[#F5E8C7]"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {isStuckInPaused && (
        <div className="rounded-2xl border border-[rgba(232,201,122,0.40)] bg-[rgba(232,201,122,0.10)] p-4 text-[12px] text-[#E8C97A] space-y-2">
          <div className="flex items-start gap-2">
            <WarningCircle size={14} weight="fill" className="mt-0.5 flex-shrink-0" />
            <div>
              The server still has this session marked as <strong>paused</strong> — the End
              request never landed. Your local view jumped to the report ahead of the server.
              Hit the button below to finalise the session on the server and load your post-mortem.
            </div>
          </div>
          <button
            onClick={() => void handleRetryEnd()}
            disabled={recovering}
            className="h-9 px-3 rounded-lg bg-[#0F1724] border border-[rgba(232,201,122,0.50)] text-[11px] font-semibold text-[#E8C97A] disabled:opacity-60"
          >
            {recovering ? 'Ending session…' : 'End session and load post-mortem'}
          </button>
        </div>
      )}
      {report && (
        <>
          <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold">
              At a glance
            </div>
            <p className="text-[13px] text-[#F5E8C7] leading-relaxed">
              {renderInlineBold(report.at_a_glance)}
            </p>
          </div>

          {report.sections.map((section, i) => (
            <div key={i} className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 space-y-2">
              <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold">
                {section.heading}
              </div>
              <p className="text-[12px] text-[#C9C0AB] leading-relaxed">
                {renderInlineBold(section.body)}
              </p>
              {section.items.length > 0 && (
                <ul className="space-y-1 mt-1">
                  {section.items.map((item, j) => (
                    <li key={j} className="text-[12px] text-[#C9C0AB] leading-relaxed flex items-start gap-2">
                      <span className="text-[#D4A853] mt-1">•</span>
                      <span>{renderInlineBold(item)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="text-[10px] text-[#5C5749] px-1 flex items-center justify-between gap-2 flex-wrap">
            <span>
              {report.source === 'llm' ? `Sonnet · ${report.model_used}` : 'Template fallback'}
              {' · '}{report.disclaimer}
            </span>
            <button
              onClick={() => fetchPostMortem(true)}
              disabled={loading}
              className="text-[10px] text-[#D4A853] hover:text-[#E8C97A] underline disabled:opacity-50 whitespace-nowrap"
              title="Re-run Sonnet against the latest sim-date prices"
            >
              {loading ? 'regenerating…' : 'regenerate'}
            </button>
          </div>
        </>
      )}

      {/* Decisions journal (full, frozen) — fixed column widths per Phase 3. */}
      {session.decisions.length > 0 && (
        <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-3">
            Decisions journal ({session.decisions.length})
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
          <div className="grid grid-cols-[56px_minmax(0,1fr)_70px_90px_100px] gap-x-3 text-[9px] uppercase tracking-widest text-[#5C5749] mb-1.5 pb-1.5 border-b border-[rgba(212,168,83,0.10)]">
            <span>Kind</span>
            <span>Ticker · Date</span>
            <span className="text-right">Qty</span>
            <span className="text-right">@</span>
            <span className="text-right">Realised</span>
          </div>
          <div className="space-y-1.5">
            {session.decisions.map((d) => (
              <div key={d.id} className="grid grid-cols-[56px_minmax(0,1fr)_70px_90px_100px] gap-x-3 items-baseline text-[12px]">
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
                  {d.kind === 'SELL' ? moneySigned(d.realized_pnl) : '—'}
                </span>
              </div>
            ))}
          </div>
            </div>
          </div>
          <div className="text-[10px] text-[#5C5749] mt-2 px-1">
            Realised P&L is shown only on SELL rows. Unrealised gain/loss on still-open positions is in the <strong className="text-[#7A7363]">Open positions</strong> panel above.
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 space-y-3">
        <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold">
          What now
        </div>
        {session.portfolio.positions.length > 0 ? (
          <button
            onClick={handleSaveAsPortfolio}
            disabled={saveState !== 'idle'}
            className="w-full h-11 rounded-xl text-[13px] font-bold text-[#0A0E16] flex items-center justify-center gap-1.5 disabled:opacity-70"
            style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
          >
            {saveState === 'saved'
              ? <><CheckCircle size={14} weight="bold" /> Saved as EIM portfolio</>
              : saveState === 'saving'
                ? 'Saving…'
                : <><BookmarkSimple size={14} weight="bold" /> Save final portfolio as EIM portfolio</>}
          </button>
        ) : (
          <div className="text-[11px] text-[#7A7363]">
            No open positions at session end — nothing to carry forward.
          </div>
        )}
        {saveState === 'saved' && savedPortfolioId && (
          <div className="text-[11px] text-[#5FC986]">
            The final portfolio is now in your EIM portfolios list — open it from the
            EIM home to keep tracking those positions.
          </div>
        )}

        <WhereToNext session={session} />

        <button
          onClick={onStartNewSim}
          className="w-full h-10 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.30)] text-[12px] font-semibold text-[#D4A853] flex items-center justify-center gap-1.5"
        >
          <ArrowRight size={13} weight="bold" /> Start a new Simulator session
        </button>
        <button
          onClick={onBackToList}
          className="w-full h-10 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363]"
        >
          ← Back to sessions
        </button>
      </div>
    </div>
  );
}

// ── Where to next (Sprint 8) ────────────────────────────────────────────────
// Cross-surface nudges after a completed run, so the loop doesn't dead-end at
// the post-mortem. Era pulled from the session for relevance.

function WhereToNext({ session }: { session: SimSession }) {
  const navigate = useNavigate();
  const era = `${session.start_date.slice(0, 4)}–${session.end_date.slice(0, 4)}`;
  const recs: Array<{ icon: typeof Compass; label: string; sub: string; path: string; accent: string }> = [
    {
      icon: Compass,
      label: 'Scenario Lab',
      sub: 'Face a guided crisis dilemma and branch the outcomes',
      path: '/eim/scenario-lab',
      accent: '#E8A0C0',
    },
    {
      icon: ChartLine,
      label: 'Strategy Comparator',
      sub: 'See how Lump Sum vs DCA vs 60/40 would have run',
      path: '/eim/strategy-comparator',
      accent: '#82B1FF',
    },
    {
      icon: TrendUp,
      label: 'Projection Engine',
      sub: 'Project a savings plan forward — a range, not a forecast',
      path: '/eim/projection',
      accent: '#5FC986',
    },
  ];
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-1">Where to next</div>
      <p className="text-[11px] text-[#7A7363] mb-2.5">
        You just lived {era}. Keep the momentum with another lens:
      </p>
      <div className="space-y-2">
        {recs.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.path}
              onClick={() => navigate(r.path)}
              className="w-full text-left rounded-xl border border-[rgba(212,168,83,0.16)] bg-[#0F1724] p-3 flex items-center gap-3 hover:border-[rgba(212,168,83,0.32)] transition-colors"
            >
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${r.accent}18`, color: r.accent }}
              >
                <Icon size={18} weight="bold" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-[#F5E8C7]">{r.label}</span>
                <span className="block text-[11px] text-[#7A7363] leading-snug">{r.sub}</span>
              </span>
              <ArrowRight size={14} weight="bold" className="ml-auto text-[#5C5749] flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  footer,
}: {
  label: string;
  value: string;
  tone?: 'positive' | 'negative';
  footer?: string;
}) {
  const colour = tone === 'positive' ? 'text-[#5FC986]' : tone === 'negative' ? 'text-[#E84393]' : 'text-[#F5E8C7]';
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">{label}</div>
      <div className={`text-[16px] font-bold ${colour} mt-0.5`}>{value}</div>
      {footer && (
        <div className="text-[9px] text-[#5C5749] mt-0.5 leading-tight">{footer}</div>
      )}
    </div>
  );
}

// ── Frozen Open Positions panel (Sprint 6 Phase 2) ─────────────────────────

function FrozenOpenPositions({
  session,
  engine,
}: {
  session: SimSession;
  engine: ReturnType<typeof getEngine>;
}) {
  const { money, moneySigned } = useSessionMoney(session);
  // Aggregate lots by ticker → one row per ticker with avg cost.
  const rows = useMemo(() => {
    const byTicker = new Map<string, { qty: number; cost: number; firstBuy: string }>();
    for (const pos of session.portfolio.positions) {
      const cur = byTicker.get(pos.ticker) ?? { qty: 0, cost: 0, firstBuy: pos.buy_date };
      cur.qty += pos.qty;
      cur.cost += pos.qty * pos.buy_price;
      if (pos.buy_date < cur.firstBuy) cur.firstBuy = pos.buy_date;
      byTicker.set(pos.ticker, cur);
    }
    return Array.from(byTicker.entries()).map(([ticker, { qty, cost, firstBuy }]) => {
      const avgCost = qty > 0 ? cost / qty : 0;
      const current = engine?.currentPrice(ticker) ?? null;
      const marketValue = (current ?? avgCost) * qty;
      const unrealisedPnl = marketValue - cost;
      const unrealisedPct = cost > 0 ? (unrealisedPnl / cost) * 100 : 0;
      return { ticker, qty, avgCost, current, marketValue, unrealisedPnl, unrealisedPct, firstBuy };
    }).sort((a, b) => a.ticker.localeCompare(b.ticker));
  }, [session.portfolio.positions, engine]);

  // Sprint 6 Phase 3: fixed column widths so values don't shift between rows.
  //   Ticker (incl. first-buy date sub-line): 1fr, truncate
  //   Qty: 70px right
  //   Avg cost: 90px right
  //   Now: 90px right
  //   Mkt value: 100px right
  //   Unrealised: 110px right (signed dollars + % on a sub-line)
  const COLS = 'grid-cols-[minmax(0,1fr)_70px_90px_90px_100px_110px]';

  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-3">
        Open positions at session end ({rows.length})
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className={`grid ${COLS} gap-x-3 text-[9px] uppercase tracking-widest text-[#5C5749] mb-1.5 pb-1.5 border-b border-[rgba(212,168,83,0.10)]`}>
            <span>Ticker</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Avg cost</span>
            <span className="text-right">Now</span>
            <span className="text-right">Mkt value</span>
            <span className="text-right">Unrealised</span>
          </div>
          <div className="space-y-2">
            {rows.map((r) => {
              const tone = r.unrealisedPnl >= 0 ? 'text-[#5FC986]' : 'text-[#E84393]';
              return (
                <div key={r.ticker} className={`grid ${COLS} gap-x-3 items-baseline text-[12px]`}>
                  <div className="min-w-0">
                    <div className="text-[#F5E8C7] font-bold truncate">{r.ticker}</div>
                    <div className="text-[10px] text-[#5C5749]">since {r.firstBuy}</div>
                  </div>
                  <span className="text-right text-[#7A7363] tabular-nums">{r.qty}</span>
                  <span className="text-right text-[#7A7363] tabular-nums">{money(r.avgCost)}</span>
                  <span className="text-right text-[#F5E8C7] font-semibold tabular-nums">
                    {r.current !== null ? money(r.current) : '—'}
                  </span>
                  <span className="text-right text-[#F5E8C7] tabular-nums">{money(r.marketValue)}</span>
                  <span className={`text-right font-bold tabular-nums ${tone}`}>
                    {moneySigned(r.unrealisedPnl)}
                    <span className="block text-[10px] font-semibold">{formatPct(r.unrealisedPct)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="text-[10px] text-[#5C5749] mt-2">
        Marked-to-market using the close price at the session's end-date. Unrealised P&L is the gain you would have booked had you sold every lot at session end.
      </div>
    </div>
  );
}
