/**
 * EIM Strategy Comparator (Sprint 5).
 *
 * The second EIM Simulator surface after the Time Machine. Where Time
 * Machine asks "what would YOU have decided?", Comparator asks "what
 * would different STRATEGIES have produced?" — Lump Sum vs DCA vs
 * Rebalanced 60/40 (and more in Sprint 5b).
 *
 * Stateless: each Run POSTs the params, gets back wealth curves +
 * metrics + Haiku commentary, renders. No session persistence. Users
 * tweak params and re-Run as often as they like.
 *
 * Layout: two-column on md+ (sticky controls left, results right);
 * single-column on mobile.
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft, ChartLine, Warning } from '@phosphor-icons/react';
import { ConvertedHint } from '../components/ConvertedHint';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { FeatureIntro } from '../components/FeatureIntro';
import { SimulationModePill } from '../components/SimulationModePill';
import { SimTickerPicker } from '../components/SimTickerPicker';
import { DEFAULT_TICKERS } from '../data/starterTickers';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import { eimSimService } from '../services/eimSim.service';
import type {
  ComparatorRunResponse,
  StrategyId,
  StrategyMetrics,
  StrategyOutcome,
} from '../types/eim.types';

// Comparator runs cap at 20 tickers server-side.
const MAX_COMPARATOR_TICKERS = 20;

const STRATEGY_OPTIONS: ReadonlyArray<{
  id: StrategyId;
  label: string;
  blurb: string;
  shariahFlag?: string;
}> = [
  {
    id: 'lump_sum',
    label: 'Lump Sum (passive)',
    blurb: 'Invest all cash on day one, equal-weight, hold to end.',
  },
  {
    id: 'dca_monthly',
    label: 'DCA (monthly)',
    blurb: 'Split cash into equal monthly tranches, equal-weight each tranche.',
  },
  {
    id: 'rebalanced_60_40',
    label: '60/40 (rebalanced)',
    blurb: '60% equity / 40% TLT. Rebalances quarterly.',
    shariahFlag: 'TLT is interest-bearing — not Shariah-compliant. Shariah variant in 5b.',
  },
];

const LINE_COLOURS: Record<StrategyId, string> = {
  lump_sum: '#D4A853',
  dca_monthly: '#5FC986',
  rebalanced_60_40: '#82B1FF',
};

const todayIso = () => new Date().toISOString().slice(0, 10);

function useUsdMoney() {
  const { format } = useCurrencyFormat();
  return {
    money: (n: number) => format(n, 'USD', { maxDecimals: 2 }),
    moneyWhole: (n: number) => format(n, 'USD', { maxDecimals: 0 }),
  };
}

const formatPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

export function EimStrategyComparatorPage() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('2010-01-01');
  const [endDate, setEndDate] = useState(todayIso());
  const [startingCash, setStartingCash] = useState(10_000);
  const [tickers, setTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [strategies, setStrategies] = useState<StrategyId[]>(['lump_sum', 'dca_monthly']);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ComparatorRunResponse | null>(null);

  const toggleStrategy = useCallback((id: StrategyId) => {
    setStrategies((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 5
          ? prev
          : [...prev, id],
    );
  }, []);

  const canRun = tickers.length > 0 && strategies.length >= 1 && !running && startDate < endDate;

  const handleRun = useCallback(async () => {
    if (!canRun) return;
    setRunning(true);
    setError(null);
    try {
      const r = await eimSimService.runComparator({
        start_date: startDate,
        end_date: endDate,
        starting_cash: startingCash,
        tickers,
        strategies: strategies.map((id) => ({ id, params: {} })),
      });
      setResponse(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }, [canRun, startDate, endDate, startingCash, tickers, strategies]);

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim')}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
            aria-label="Back to EIM home"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
              EIM · Tools
            </div>
            <h1 className="text-[20px] font-bold text-[#F5E8C7]">Strategy Comparator</h1>
          </div>
          <FeatureIntro featureId="strategy-comparator" />
        </header>

        <SimulationModePill />
        <DisclaimerBanner />

        {error && (
          <div className="mx-5 mt-3 px-3 py-2 rounded-lg border border-[rgba(232,67,147,0.3)] bg-[rgba(232,67,147,0.10)] text-[12px] text-[#E84393]">
            {error}
          </div>
        )}

        <div className="px-3 mt-4 md:grid md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-4 md:items-start space-y-3 md:space-y-0">
          {/* Left rail — controls (sticky) */}
          <div className="md:sticky md:top-3 space-y-3">
            <ControlsPanel
              startDate={startDate}
              endDate={endDate}
              startingCash={startingCash}
              tickers={tickers}
              strategies={strategies}
              onChangeStart={setStartDate}
              onChangeEnd={setEndDate}
              onChangeCash={setStartingCash}
              onChangeTickers={setTickers}
              onToggleStrategy={toggleStrategy}
            />

            <button
              onClick={handleRun}
              disabled={!canRun}
              className="w-full h-11 rounded-xl text-[13px] font-bold text-[#0A0E16] flex items-center justify-center gap-1.5 disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
            >
              {running
                ? 'Running backtest…'
                : <><ChartLine size={14} weight="bold" /> Run comparison</>}
            </button>
            {!response && (
              <div className="text-[11px] text-[#7A7363] px-1">
                Pick 1-5 strategies, 1+ tickers, and a date range. The backtest
                runs server-side on monthly OHLC and a Haiku-written commentary
                explains each result.
              </div>
            )}
          </div>

          {/* Right rail — results */}
          <div className="space-y-3 min-h-[480px]">
            {!response && !running && (
              <div className="rounded-2xl border border-dashed border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-8 text-center">
                <ChartLine size={32} weight="duotone" className="mx-auto text-[#5C5749] mb-2" />
                <div className="text-[13px] text-[#7A7363]">
                  Results will appear here.
                </div>
              </div>
            )}
            {running && !response && (
              <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-8 text-center">
                <div className="text-[13px] text-[#D4A853] animate-pulse">
                  Fetching {tickers.length + (strategies.includes('rebalanced_60_40') ? 1 : 0)} tickers
                  and running {strategies.length} {strategies.length === 1 ? 'strategy' : 'strategies'}…
                </div>
              </div>
            )}
            {response && (
              <ResultsView response={response} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Controls ───────────────────────────────────────────────────────────────

function ControlsPanel({
  startDate, endDate, startingCash, tickers, strategies,
  onChangeStart, onChangeEnd, onChangeCash, onChangeTickers, onToggleStrategy,
}: {
  startDate: string;
  endDate: string;
  startingCash: number;
  tickers: string[];
  strategies: StrategyId[];
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
  onChangeCash: (v: number) => void;
  onChangeTickers: (next: string[]) => void;
  onToggleStrategy: (id: StrategyId) => void;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.30)] bg-[#101a2a] p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FieldDate label="Start" value={startDate} onChange={onChangeStart} max={todayIso()} />
        <FieldDate label="End" value={endDate} onChange={onChangeEnd} min={startDate} max={todayIso()} />
      </div>
      <FieldNumber label="Starting cash (USD)" value={startingCash} onChange={onChangeCash} min={100} step={500} hintUsd={startingCash} />

      <div>
        <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold mb-2">
          Tickers
        </div>
        <SimTickerPicker selected={tickers} onChange={onChangeTickers} max={MAX_COMPARATOR_TICKERS} />
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold mb-2">
          Strategies ({strategies.length}/5)
        </div>
        <div className="space-y-2">
          {STRATEGY_OPTIONS.map((opt) => {
            const active = strategies.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => onToggleStrategy(opt.id)}
                className={
                  'w-full text-left rounded-lg p-3 border transition-colors ' +
                  (active
                    ? 'border-[rgba(212,168,83,0.50)] bg-[rgba(212,168,83,0.10)]'
                    : 'border-[rgba(212,168,83,0.18)] bg-[#0F1724] hover:border-[rgba(212,168,83,0.30)]')
                }
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ background: LINE_COLOURS[opt.id], opacity: active ? 1 : 0.3 }}
                  />
                  <span className={'text-[12px] font-bold ' + (active ? 'text-[#F5E8C7]' : 'text-[#7A7363]')}>
                    {opt.label}
                  </span>
                </div>
                <div className="text-[10px] text-[#7A7363] mt-1 leading-snug">
                  {opt.blurb}
                </div>
                {opt.shariahFlag && (
                  <div className="text-[10px] text-[#E8C97A] mt-1 leading-snug flex items-start gap-1">
                    <Warning size={11} weight="fill" className="mt-0.5 flex-shrink-0" />
                    <span>{opt.shariahFlag}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Results ────────────────────────────────────────────────────────────────

function ResultsView({ response }: { response: ComparatorRunResponse }) {
  const { result, commentary } = response;
  const skippedOnly = result.metrics.every((m) => m.skipped_reason);

  return (
    <div className="space-y-3">
      {/* Overlay chart */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-2">
          Wealth curves · {result.start_date} → {result.end_date}
        </div>
        {skippedOnly ? (
          <div className="text-[12px] text-[#7A7363] py-8 text-center">
            All strategies were skipped — see reasons in the table below.
          </div>
        ) : (
          <WealthOverlayChart outcomes={result.outcomes} startingCash={result.starting_cash} />
        )}
      </div>

      {/* Metrics table */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 overflow-x-auto">
        <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-2">
          Comparison
        </div>
        {/* Sprint 6 Phase 3: table-fixed + explicit col widths so numeric
            columns never resize between rows. Strategy name is the only
            elastic column (auto, truncates). */}
        <table className="w-full min-w-[640px] table-fixed">
          <colgroup>
            <col />
            <col className="w-[100px]" />
            <col className="w-[80px]" />
            <col className="w-[80px]" />
            <col className="w-[80px]" />
            <col className="w-[90px]" />
            <col className="w-[70px]" />
          </colgroup>
          <thead>
            <tr className="text-[9px] uppercase tracking-widest text-[#5C5749] border-b border-[rgba(212,168,83,0.10)]">
              <th className="text-left py-1.5 pr-2">Strategy</th>
              <th className="text-right py-1.5 px-2">End value</th>
              <th className="text-right py-1.5 px-2">Total %</th>
              <th className="text-right py-1.5 px-2">CAGR</th>
              <th className="text-right py-1.5 px-2">Max DD</th>
              <th className="text-right py-1.5 px-2">Volatility</th>
              <th className="text-right py-1.5 pl-2">Trades</th>
            </tr>
          </thead>
          <tbody>
            {result.metrics.map((m) => (
              <MetricRow key={m.strategy_id} metrics={m} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-strategy commentary */}
      <div className="space-y-2">
        {commentary.items.map((c) => (
          <div
            key={c.strategy_id}
            className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: LINE_COLOURS[c.strategy_id as StrategyId] }}
              />
              <span className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold">
                {c.label}
              </span>
            </div>
            <p className="text-[12px] text-[#C9C0AB] leading-relaxed">{c.paragraph}</p>
          </div>
        ))}
        <div className="text-[10px] text-[#5C5749] px-1">
          {commentary.source === 'llm' ? `Haiku · ${commentary.model_used}` : 'Template fallback'}
          {' · '}{commentary.disclaimer}
        </div>
      </div>
    </div>
  );
}

function MetricRow({ metrics: m }: { metrics: StrategyMetrics }) {
  const { money } = useUsdMoney();
  if (m.skipped_reason) {
    return (
      <tr className="border-b border-[rgba(212,168,83,0.06)]">
        <td className="py-2 pr-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: LINE_COLOURS[m.strategy_id], opacity: 0.4 }} />
            <span className="text-[12px] text-[#7A7363]">{m.label}</span>
          </div>
        </td>
        <td colSpan={6} className="py-2 text-right text-[11px] text-[#E8C97A]">
          Skipped: {m.skipped_reason}
        </td>
      </tr>
    );
  }
  const totalCls = m.total_return_pct >= 0 ? 'text-[#5FC986]' : 'text-[#E84393]';
  const cagrCls = m.cagr_pct >= 0 ? 'text-[#5FC986]' : 'text-[#E84393]';
  return (
    <tr className="border-b border-[rgba(212,168,83,0.06)]">
      <td className="py-2 pr-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: LINE_COLOURS[m.strategy_id] }} />
          <span className="text-[12px] font-semibold text-[#F5E8C7]">{m.label}</span>
        </div>
      </td>
      <td className="py-2 px-2 text-right text-[12px] text-[#F5E8C7] tabular-nums">{money(m.ending_value)}</td>
      <td className={`py-2 px-2 text-right text-[12px] font-bold tabular-nums ${totalCls}`}>{formatPct(m.total_return_pct)}</td>
      <td className={`py-2 px-2 text-right text-[12px] font-bold tabular-nums ${cagrCls}`}>{formatPct(m.cagr_pct)}</td>
      <td className="py-2 px-2 text-right text-[12px] text-[#E8C97A] tabular-nums">{m.max_drawdown_pct.toFixed(1)}%</td>
      <td className="py-2 px-2 text-right text-[12px] text-[#7A7363] tabular-nums">{m.volatility_annualised_pct.toFixed(1)}%</td>
      <td className="py-2 pl-2 text-right text-[12px] text-[#7A7363] tabular-nums">{m.n_decisions}</td>
    </tr>
  );
}

// ── Inline SVG overlay chart ───────────────────────────────────────────────

function WealthOverlayChart({
  outcomes,
  startingCash,
}: {
  outcomes: StrategyOutcome[];
  startingCash: number;
}) {
  const { moneyWhole } = useUsdMoney();
  const drawable = outcomes.filter((o) => !o.skipped_reason && o.wealth_curve.length > 0);
  const allValues = useMemo(() => {
    const vals: number[] = [startingCash];
    for (const o of drawable) {
      for (const p of o.wealth_curve) vals.push(p.value);
    }
    return vals;
  }, [drawable, startingCash]);

  if (drawable.length === 0 || allValues.length === 0) {
    return <div className="text-[12px] text-[#7A7363] py-8 text-center">No data to chart.</div>;
  }

  const W = 720;
  const H = 280;
  const PADDING = { top: 16, right: 16, bottom: 28, left: 56 };
  const innerW = W - PADDING.left - PADDING.right;
  const innerH = H - PADDING.top - PADDING.bottom;

  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  // Add 5% headroom so lines don't graze the edge.
  const valueRange = Math.max(1, maxV - minV);
  const yMin = minV - valueRange * 0.05;
  const yMax = maxV + valueRange * 0.05;

  // X axis is shared across strategies — use the longest wealth curve
  // as the index spine. All curves have the same monthly tick cadence
  // when the backtest period is identical.
  const longest = drawable.reduce(
    (a, b) => (b.wealth_curve.length > a.wealth_curve.length ? b : a),
    drawable[0],
  );
  const xCount = longest.wealth_curve.length;

  const xFor = (i: number) => PADDING.left + (i / Math.max(1, xCount - 1)) * innerW;
  const yFor = (v: number) => PADDING.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;

  // Grid + axis ticks: 4 horizontal gridlines including top + bottom.
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (i / yTicks) * (yMax - yMin));

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" style={{ height: 'auto' }}>
        {/* Y-axis gridlines + labels */}
        {yTickValues.map((v, i) => (
          <g key={i}>
            <line
              x1={PADDING.left}
              x2={W - PADDING.right}
              y1={yFor(v)}
              y2={yFor(v)}
              stroke="rgba(212,168,83,0.10)"
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 6}
              y={yFor(v) + 3}
              textAnchor="end"
              fontSize={9}
              fill="#7A7363"
            >
              {moneyWhole(v)}
            </text>
          </g>
        ))}

        {/* X-axis endpoint labels */}
        <text
          x={PADDING.left}
          y={H - PADDING.bottom + 14}
          fontSize={9}
          fill="#7A7363"
        >
          {longest.wealth_curve[0]?.sim_date.slice(0, 7)}
        </text>
        <text
          x={W - PADDING.right}
          y={H - PADDING.bottom + 14}
          textAnchor="end"
          fontSize={9}
          fill="#7A7363"
        >
          {longest.wealth_curve[xCount - 1]?.sim_date.slice(0, 7)}
        </text>

        {/* Starting-cash reference line */}
        <line
          x1={PADDING.left}
          x2={W - PADDING.right}
          y1={yFor(startingCash)}
          y2={yFor(startingCash)}
          stroke="rgba(245,232,199,0.20)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* Wealth curves */}
        {drawable.map((o) => {
          const colour = LINE_COLOURS[o.strategy_id];
          const path = o.wealth_curve
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.value)}`)
            .join(' ');
          return (
            <path
              key={o.strategy_id}
              d={path}
              fill="none"
              stroke={colour}
              strokeWidth={1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="flex items-center gap-3 mt-1 flex-wrap px-2">
        {drawable.map((o) => (
          <div key={o.strategy_id} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: LINE_COLOURS[o.strategy_id] }}
            />
            <span className="text-[10px] text-[#C9C0AB]">{o.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Field helpers ──────────────────────────────────────────────────────────

function FieldDate({ label, value, onChange, min, max }: { label: string; value: string; onChange: (v: string) => void; min?: string; max?: string }) {
  const id = `comp-${label.toLowerCase()}`;
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
  const id = `comp-${label.toLowerCase().replace(/\s+/g, '-')}`;
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

export default EimStrategyComparatorPage;
