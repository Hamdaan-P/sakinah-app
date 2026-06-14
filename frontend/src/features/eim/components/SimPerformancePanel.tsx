/**
 * SimPerformancePanel — portfolio value curve vs. Shariah benchmark (W4).
 *
 * Calls GET /api/eim/sim/sessions/{id}/performance, which reconstructs the
 * portfolio curve server-side from the decisions log and pairs it with a
 * Shariah ETF-proxy benchmark indexed to the same starting capital. Shows
 * total return, time-weighted return, and the benchmark line — or an explicit
 * "benchmark unavailable" reason when no Shariah series covers the date range
 * (spec §0.4: never show guessed numbers).
 *
 * Fetched on mount per session + via a manual refresh (each call does N
 * yfinance fetches, so we don't auto-refetch on every sim tick).
 */

import { useEffect, useMemo, useState } from 'react';
import { ArrowsClockwise, ChartLine, Info } from '@phosphor-icons/react';
import { eimSimService, type SessionPerformance } from '../services/eimSim.service';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import type { Currency } from '../stores/currency.store';
import type { SimSession } from '../types/eim.types';

const PORTFOLIO_COLOUR = '#D4A853';
const BENCHMARK_COLOUR = '#82B1FF';

function pct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

function returnColour(n: number): string {
  return n > 0 ? '#5FC986' : n < 0 ? '#E8A0C0' : '#7A7363';
}

interface Series {
  label: string;
  colour: string;
  points: { sim_date: string; value: number }[];
}

function TwoLineChart({
  series,
  startingCash,
  money,
}: {
  series: Series[];
  startingCash: number;
  money: (n: number) => string;
}) {
  const drawable = series.filter((s) => s.points.length > 1);
  const allValues = useMemo(() => {
    const vals: number[] = [startingCash];
    for (const s of drawable) for (const p of s.points) vals.push(p.value);
    return vals;
  }, [drawable, startingCash]);

  if (drawable.length === 0) {
    return <div className="text-[12px] text-[#7A7363] py-6 text-center">Not enough data to chart yet.</div>;
  }

  const W = 720;
  const H = 240;
  const PADDING = { top: 14, right: 14, bottom: 26, left: 54 };
  const innerW = W - PADDING.left - PADDING.right;
  const innerH = H - PADDING.top - PADDING.bottom;

  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const range = Math.max(1, maxV - minV);
  const yMin = minV - range * 0.05;
  const yMax = maxV + range * 0.05;

  const longest = drawable.reduce((a, b) => (b.points.length > a.points.length ? b : a), drawable[0]);
  const yFor = (v: number) => PADDING.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;
  // Each series spaced over its own index range so curves of slightly
  // different length still span the full width with the same start/end.
  const xForSeries = (s: Series, i: number) =>
    PADDING.left + (i / Math.max(1, s.points.length - 1)) * innerW;

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (i / yTicks) * (yMax - yMin));

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[460px]" style={{ height: 'auto' }}>
        {yTickValues.map((v, i) => (
          <g key={i}>
            <line x1={PADDING.left} x2={W - PADDING.right} y1={yFor(v)} y2={yFor(v)} stroke="rgba(212,168,83,0.10)" strokeWidth={1} />
            <text x={PADDING.left - 6} y={yFor(v) + 3} textAnchor="end" fontSize={9} fill="#7A7363">
              {money(v)}
            </text>
          </g>
        ))}

        <text x={PADDING.left} y={H - PADDING.bottom + 14} fontSize={9} fill="#7A7363">
          {longest.points[0]?.sim_date.slice(0, 7)}
        </text>
        <text x={W - PADDING.right} y={H - PADDING.bottom + 14} textAnchor="end" fontSize={9} fill="#7A7363">
          {longest.points[longest.points.length - 1]?.sim_date.slice(0, 7)}
        </text>

        {/* Starting-capital reference line */}
        <line
          x1={PADDING.left}
          x2={W - PADDING.right}
          y1={yFor(startingCash)}
          y2={yFor(startingCash)}
          stroke="rgba(245,232,199,0.20)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {drawable.map((s) => {
          const path = s.points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xForSeries(s, i)} ${yFor(p.value)}`)
            .join(' ');
          return (
            <path key={s.label} d={path} fill="none" stroke={s.colour} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
          );
        })}
      </svg>
      <div className="flex items-center gap-3 mt-1 flex-wrap px-2">
        {drawable.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.colour }} />
            <span className="text-[11px] text-[#7A7363]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, colour }: { label: string; value: string; colour?: string }) {
  return (
    <div className="flex-1 min-w-[90px]">
      <div className="text-[10px] uppercase tracking-wide text-[#7A7363]">{label}</div>
      <div className="text-[15px] font-bold" style={{ color: colour ?? '#F5E8C7' }}>{value}</div>
    </div>
  );
}

export function SimPerformancePanel({ session }: { session: SimSession }) {
  const [data, setData] = useState<SessionPerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { format } = useCurrencyFormat();
  const ccy = session.currency as Currency;
  const money = (n: number) => format(n, ccy, { compact: n >= 1000, maxDecimals: n >= 1 ? 0 : 2 });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    eimSimService
      .getPerformance(session.id)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((e) => { if (!cancelled) setError(e?.message ?? 'Failed to load performance'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // Intentionally keyed on session.id only — not current_sim_date — to
    // avoid an N-fetch recompute on every tick. Manual refresh below.
  }, [session.id]);

  const refresh = () => {
    setLoading(true);
    setError(null);
    eimSimService
      .getPerformance(session.id)
      .then(setData)
      .catch((e) => setError(e?.message ?? 'Failed to load performance'))
      .finally(() => setLoading(false));
  };

  const series: Series[] = useMemo(() => {
    if (!data) return [];
    const out: Series[] = [
      { label: 'Your portfolio', colour: PORTFOLIO_COLOUR, points: data.portfolio.curve },
    ];
    if (data.benchmark.available) {
      out.push({
        label: data.benchmark.label ?? 'Benchmark',
        colour: BENCHMARK_COLOUR,
        points: data.benchmark.curve,
      });
    }
    return out;
  }, [data]);

  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ChartLine size={14} weight="bold" className="text-[#D4A853]" />
          <span className="text-[13px] font-bold text-[#F5E8C7]">Performance vs benchmark</span>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1 text-[11px] text-[#7A7363] disabled:opacity-50"
          aria-label="Refresh performance"
        >
          <ArrowsClockwise size={13} weight="bold" className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && !data && (
        <div className="text-[12px] text-[#7A7363] py-6 text-center">Computing performance…</div>
      )}
      {error && (
        <div className="text-[12px] text-[#E8A0C0] py-2">{error}</div>
      )}

      {data && (
        <>
          <div className="flex gap-3 flex-wrap">
            <Metric
              label="Total return"
              value={pct(data.portfolio.total_return_pct)}
              colour={returnColour(data.portfolio.total_return_pct)}
            />
            <Metric
              label="Time-weighted"
              value={pct(data.portfolio.time_weighted_return_pct)}
              colour={returnColour(data.portfolio.time_weighted_return_pct)}
            />
            <Metric
              label={data.benchmark.label ? `${data.benchmark.label}` : 'Benchmark'}
              value={
                data.benchmark.available && data.benchmark.total_return_pct != null
                  ? pct(data.benchmark.total_return_pct)
                  : '—'
              }
              colour={
                data.benchmark.available && data.benchmark.total_return_pct != null
                  ? returnColour(data.benchmark.total_return_pct)
                  : '#7A7363'
              }
            />
          </div>

          <TwoLineChart series={series} startingCash={data.starting_cash} money={money} />

          {!data.benchmark.available && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-[rgba(130,177,255,0.06)] border border-[rgba(130,177,255,0.18)]">
              <Info size={14} weight="bold" className="text-[#82B1FF] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-[#7A7363]">
                Benchmark unavailable: {data.benchmark.unavailable_reason}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
