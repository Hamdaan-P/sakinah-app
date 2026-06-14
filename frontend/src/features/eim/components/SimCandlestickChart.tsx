/**
 * SimCandlestickChart — hand-rolled SVG monthly candlesticks for the
 * Time Machine (Sprint 6 Phase 4).
 *
 * Renders bars provided by the caller; the caller is responsible for
 * passing only firewall-safe data (e.g. `engine.visiblePrices(ticker)`
 * which already filters to time <= sim_date).
 *
 * Overlays BUY/SELL markers at the trade dates so the user can see
 * where their entries/exits landed on the price action — the most
 * pedagogically useful overlay for "did I time this well?".
 *
 * No new dependencies — inline SVG. Same approach as SimStatsPanel
 * and EimStrategyComparatorPage charts.
 */

import { useMemo, useState } from 'react';
import type { MonthlyOhlcBar } from '../types/eim.types';
import { CANDLESTICKS } from '../data/knowledge-bank';
import type { CandlestickSignal } from '../data/knowledge-bank/schema';
import {
  detectPatterns,
  dedupeOverlaps,
  type DetectedPattern,
  type PatternConfidence,
} from '../engine/patternDetection';
import { PatternInsightCard } from './PatternInsightCard';

export interface SimChartMarker {
  /** ISO YYYY-MM-DD — used to position the marker on the x-axis. */
  date: string;
  /** 'BUY' or 'SELL' — drives colour + direction of the triangle. */
  kind: 'BUY' | 'SELL';
  /** Optional tooltip text (browser native title). */
  label?: string;
}

export interface SimCandlestickChartProps {
  ticker: string;
  bars: readonly MonthlyOhlcBar[];
  markers?: readonly SimChartMarker[];
  /** Optional caption (e.g. "as of 2010-03-20"). */
  asOf?: string;
  /** Visual height (px) — width is fluid. */
  height?: number;
  /** Anchor the x-axis to a specific date window (ISO YYYY-MM-DD).
   *  When both are supplied, bars are positioned proportionally within
   *  [windowStart, windowEnd] — so a late-listed ticker (IPO mid-window)
   *  shows empty space before its first bar and all charts in a panel
   *  share the same x-axis. When omitted, x-axis falls back to the
   *  first/last bar dates. */
  windowStart?: string;
  windowEnd?: string;
  /** Optional Y-axis price formatter. Defaults to a USD-style formatter;
   *  sim callers pass one bound to the session/display currency. */
  formatPrice?: (n: number) => string;
  /** Show the opt-in "Spot patterns" toggle + on-chart annotations.
   *  Default true; the toggle itself starts OFF (calm chart by default). */
  enablePatterns?: boolean;
  /** Start with the overlay already on (e.g. the Pattern Lab examples). */
  defaultShowPatterns?: boolean;
  /** Which series to draw first — 'area' (calm line, default) or 'candles'.
   *  Users can always flip via the in-chart toggle. */
  defaultChartMode?: SimChartMode;
}

type SimChartMode = 'area' | 'candles';

const UP_COLOUR = '#5FC986';
const DOWN_COLOUR = '#E84393';
const DOJI_COLOUR = '#7A7363';
const GRID_COLOUR = 'rgba(212,168,83,0.10)';
const AXIS_COLOUR = '#7A7363';

// Pattern-spotting overlay (Phase B).
const NAME_BY_ID = new Map(CANDLESTICKS.map((c) => [c.id, c.name] as const));
const signalColour = (s: CandlestickSignal): string =>
  s === 'bullish_reversal'
    ? UP_COLOUR
    : s === 'bearish_reversal'
      ? DOWN_COLOUR
      : s === 'continuation'
        ? '#82B1FF'
        : DOJI_COLOUR;

const defaultFormatPrice = (n: number) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(3)}`;
};

/** Days between two ISO dates (rough — treats months as 30.44 days
 *  via UTC parsing). Used to position bars proportionally on a shared
 *  date axis across multiple charts. */
function daysBetween(start: string, end: string): number {
  const s = new Date(`${start}T00:00:00Z`).getTime();
  const e = new Date(`${end}T00:00:00Z`).getTime();
  if (isNaN(s) || isNaN(e)) return 0;
  return Math.max(0, (e - s) / 86_400_000);
}

export function SimCandlestickChart({
  ticker,
  bars,
  markers = [],
  asOf,
  height = 220,
  windowStart,
  windowEnd,
  formatPrice = defaultFormatPrice,
  enablePatterns = true,
  defaultShowPatterns = false,
  defaultChartMode = 'area',
}: SimCandlestickChartProps) {
  const [mode, setMode] = useState<SimChartMode>(defaultChartMode);
  const [showPatterns, setShowPatterns] = useState(defaultShowPatterns);
  const [selected, setSelected] = useState<{ id: string; confidence: PatternConfidence } | null>(null);
  // viewBox is fixed-aspect; the wrapper sizes width responsively.
  const W = 720;
  const H = height;
  const PADDING = { top: 12, right: 12, bottom: 24, left: 48 };
  const innerW = W - PADDING.left - PADDING.right;
  const innerH = H - PADDING.top - PADDING.bottom;

  // Hooks must be called unconditionally on every render (rules-of-hooks),
  // so all useMemo calls live BEFORE the early-return for empty bars.
  // When bars is empty: stats → null, indexByMonth → empty Map,
  // markerPositions → empty array. The early-return below renders an
  // empty-state placeholder and never touches the downstream values.

  const stats = useMemo(() => {
    if (bars.length === 0) {
      return null;
    }
    let lo = bars[0].low;
    let hi = bars[0].high;
    for (const b of bars) {
      if (b.low < lo) lo = b.low;
      if (b.high > hi) hi = b.high;
    }
    if (!isFinite(lo) || !isFinite(hi)) return null;
    const range = Math.max(hi - lo, hi * 0.01);
    return { lo: lo - range * 0.05, hi: hi + range * 0.05 };
  }, [bars]);

  const indexByMonth = useMemo(() => {
    const m = new Map<string, number>();
    bars.forEach((b, i) => m.set(b.time.slice(0, 7), i));
    return m;
  }, [bars]);

  // Two x-axis modes:
  //   (a) windowStart + windowEnd supplied → date-based positioning.
  //       Bars are placed proportionally within the window. Late-IPO
  //       tickers show empty space before their first bar; all charts
  //       in a multi-ticker panel share the same x-axis.
  //   (b) Neither supplied → legacy index-based positioning (bars
  //       fill the chart width regardless of dates).
  const useDateAxis = !!(windowStart && windowEnd);
  const windowSpanDays = useDateAxis ? Math.max(1, daysBetween(windowStart!, windowEnd!)) : 0;
  const slotW = useDateAxis ? 0 : innerW / Math.max(1, bars.length);

  const markerPositions = useMemo(() => {
    return markers.map((mk) => {
      if (useDateAxis) {
        const offset = daysBetween(windowStart!, mk.date);
        const frac = Math.max(0, Math.min(1, offset / windowSpanDays));
        return { ...mk, x: PADDING.left + frac * innerW };
      }
      const month = mk.date.slice(0, 7);
      const idx = indexByMonth.get(month);
      if (idx === undefined) return null;
      return { ...mk, x: PADDING.left + slotW * (idx + 0.5) };
    }).filter((m): m is (typeof markers[number] & { x: number }) => m !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, indexByMonth, useDateAxis, windowStart, windowEnd, slotW, windowSpanDays]);

  // Spotted patterns (Phase B) — deduped so overlapping detections don't
  // clutter the chart. Empty unless the user opts in. Detection runs on the
  // bars we were handed, which the caller already firewalled to <= sim_date.
  const patterns = useMemo<DetectedPattern[]>(
    () => (showPatterns && enablePatterns ? dedupeOverlaps(detectPatterns(bars)) : []),
    [showPatterns, enablePatterns, bars],
  );

  if (bars.length === 0 || stats === null) {
    return (
      <div className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#0A0E16] p-6 text-center text-[11px] text-[#7A7363]">
        No price data for <span className="text-[#F5E8C7] font-bold">{ticker}</span> yet at this sim date.
      </div>
    );
  }

  const { lo, hi } = stats;
  const n = bars.length;

  const xForDate = (date: string): number => {
    if (!useDateAxis) return PADDING.left;
    const offset = daysBetween(windowStart!, date);
    const frac = Math.max(0, Math.min(1, offset / windowSpanDays));
    return PADDING.left + frac * innerW;
  };
  const candleW = useDateAxis
    // Approximate one month's width on the date axis (sim windows are
    // multi-year, so ~30 days of innerW). Cap so single-bar charts
    // don't render a fat blob.
    ? Math.max(2, Math.min((innerW / Math.max(1, windowSpanDays / 30)) * 0.6, 14))
    : Math.max(2, Math.min((innerW / n) * 0.6, 14));

  const xCentre = (i: number) => useDateAxis
    ? xForDate(bars[i].time)
    : PADDING.left + slotW * (i + 0.5);
  const yFor = (price: number) => PADDING.top + (1 - (price - lo) / (hi - lo)) * innerH;

  // Y-axis gridlines.
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => lo + (i / yTicks) * (hi - lo));

  // Line/area geometry — close-price polyline + a fill down to the axis. Built
  // once per render (cheap; <=120 bars). Used only when mode === 'area'.
  const baseY = H - PADDING.bottom;
  const linePath = bars
    .map((b, i) => `${i === 0 ? 'M' : 'L'} ${xCentre(i).toFixed(1)},${yFor(b.close).toFixed(1)}`)
    .join(' ');
  const areaPath =
    n > 0 ? `${linePath} L ${xCentre(n - 1).toFixed(1)},${baseY} L ${xCentre(0).toFixed(1)},${baseY} Z` : '';

  return (
    <>
    <div className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#0A0E16] p-3 space-y-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 px-1">
        <div className="text-[12px] font-bold text-[#F5E8C7] min-w-0 truncate">
          {ticker}
          <span className="text-[10px] text-[#5C5749] font-normal ml-2 uppercase tracking-widest">
            {bars.length} mo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode((m) => (m === 'area' ? 'candles' : 'area'))}
            aria-label={mode === 'area' ? 'Switch to candlestick chart' : 'Switch to line chart'}
            title={mode === 'area' ? 'Showing line — tap for candlesticks' : 'Showing candlesticks — tap for line'}
            className="text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded border border-[rgba(212,168,83,0.18)] text-[#7A7363] hover:text-[#D4A853] transition-colors"
          >
            {mode === 'area' ? 'Line' : 'Candles'}
          </button>
          {enablePatterns && (
            <button
              onClick={() =>
                setShowPatterns((v) => {
                  // Candlestick patterns only read on candles — flip the view on.
                  if (!v) setMode('candles');
                  return !v;
                })
              }
              aria-pressed={showPatterns}
              className={
                'text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded border transition-colors ' +
                (showPatterns
                  ? 'text-[#D4A853] border-[rgba(212,168,83,0.45)] bg-[rgba(212,168,83,0.12)]'
                  : 'text-[#7A7363] border-[rgba(212,168,83,0.18)] hover:text-[#D4A853]')
              }
            >
              {showPatterns ? 'Patterns on' : 'Spot patterns'}
            </button>
          )}
          {asOf && (
            <div className="text-[10px] text-[#5C5749] uppercase tracking-widest">
              as of {asOf}
            </div>
          )}
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[320px]"
          style={{ height: 'auto' }}
        >
          {/* Y gridlines + price labels */}
          {yTickValues.map((v, i) => (
            <g key={i}>
              <line
                x1={PADDING.left}
                x2={W - PADDING.right}
                y1={yFor(v)}
                y2={yFor(v)}
                stroke={GRID_COLOUR}
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 6}
                y={yFor(v) + 3}
                textAnchor="end"
                fontSize={9}
                fill={AXIS_COLOUR}
              >
                {formatPrice(v)}
              </text>
            </g>
          ))}

          {/* Price series — line/area (calm default) or candlesticks. */}
          {mode === 'area' ? (
            <>
              <path d={areaPath} fill={UP_COLOUR} fillOpacity={0.1} stroke="none" />
              <path d={linePath} fill="none" stroke={UP_COLOUR} strokeWidth={1.5} strokeLinejoin="round" />
            </>
          ) : (
            bars.map((bar, i) => {
              const up = bar.close >= bar.open;
              const colour = bar.close === bar.open ? DOJI_COLOUR : up ? UP_COLOUR : DOWN_COLOUR;
              const x = xCentre(i);
              const yHigh = yFor(bar.high);
              const yLow = yFor(bar.low);
              const yOpen = yFor(bar.open);
              const yClose = yFor(bar.close);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));
              return (
                <g key={`${bar.time}-${i}`}>
                  {/* Wick */}
                  <line
                    x1={x}
                    x2={x}
                    y1={yHigh}
                    y2={yLow}
                    stroke={colour}
                    strokeWidth={1}
                  />
                  {/* Body */}
                  <rect
                    x={x - candleW / 2}
                    y={bodyTop}
                    width={candleW}
                    height={bodyHeight}
                    fill={colour}
                    fillOpacity={up ? 0.85 : 1}
                    stroke={colour}
                    strokeWidth={0.5}
                  />
                </g>
              );
            })
          )}

          {/* Pattern-spotting overlay (Phase B) — signal-coloured bracket +
              numbered tag around each spotted pattern; tap → teaching card.
              Only meaningful on candles, so suppress it in line mode. */}
          {mode === 'candles' && patterns.map((p, idx) => {
            const left = xCentre(p.startIndex) - candleW / 2 - 3;
            const right = xCentre(p.endIndex) + candleW / 2 + 3;
            let pHi = -Infinity;
            let pLo = Infinity;
            for (let k = p.startIndex; k <= p.endIndex; k++) {
              const bk = bars[k];
              if (!bk) continue;
              if (bk.high > pHi) pHi = bk.high;
              if (bk.low < pLo) pLo = bk.low;
            }
            if (!isFinite(pHi) || !isFinite(pLo)) return null;
            const top = yFor(pHi) - 5;
            const bottom = yFor(pLo) + 5;
            const colour = signalColour(p.signal);
            const cx = (left + right) / 2;
            const tagY = Math.max(8, top - 8);
            const name = NAME_BY_ID.get(p.patternId) ?? p.patternId;
            return (
              <g
                key={`pat-${idx}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected({ id: p.patternId, confidence: p.confidence })}
              >
                <title>{name}</title>
                <rect
                  x={left}
                  y={top}
                  width={Math.max(6, right - left)}
                  height={Math.max(6, bottom - top)}
                  rx={4}
                  fill={colour}
                  fillOpacity={0.08}
                  stroke={colour}
                  strokeOpacity={p.confidence === 'strong' ? 0.8 : 0.45}
                  strokeWidth={1}
                  strokeDasharray={p.confidence === 'strong' ? undefined : '3 2'}
                />
                <circle cx={cx} cy={tagY} r={7} fill={colour} stroke="#0A0E16" strokeWidth={0.75} />
                <text x={cx} y={tagY + 3} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#0A0E16">
                  {idx + 1}
                </text>
              </g>
            );
          })}

          {/* BUY/SELL markers — small triangles at the bottom (BUY) /
              top (SELL) of the chart, pointing toward the price action */}
          {markerPositions.map((mk, i) => {
            const x = mk.x;
            const isBuy = mk.kind === 'BUY';
            const colour = isBuy ? UP_COLOUR : DOWN_COLOUR;
            const y = isBuy ? H - PADDING.bottom - 2 : PADDING.top + 2;
            // Triangle points: BUY points up, SELL points down
            const points = isBuy
              ? `${x},${y - 7} ${x - 5},${y} ${x + 5},${y}`
              : `${x},${y + 7} ${x - 5},${y} ${x + 5},${y}`;
            return (
              <polygon
                key={`mk-${i}`}
                points={points}
                fill={colour}
                stroke="#0A0E16"
                strokeWidth={0.5}
              >
                {mk.label && <title>{mk.label}</title>}
              </polygon>
            );
          })}

          {/* X-axis endpoint labels — show the sim window when a date
              axis is in use (so all charts label the same dates),
              otherwise fall back to the first/last bar's month. */}
          <text
            x={PADDING.left}
            y={H - PADDING.bottom + 14}
            fontSize={9}
            fill={AXIS_COLOUR}
          >
            {(useDateAxis ? windowStart! : bars[0].time).slice(0, 7)}
          </text>
          <text
            x={W - PADDING.right}
            y={H - PADDING.bottom + 14}
            textAnchor="end"
            fontSize={9}
            fill={AXIS_COLOUR}
          >
            {(useDateAxis ? windowEnd! : bars[n - 1].time).slice(0, 7)}
          </text>
        </svg>
      </div>
      {markers.length > 0 && (
        <div className="flex items-center gap-3 text-[10px] text-[#7A7363] px-1 pt-0.5">
          <span className="flex items-center gap-1">
            <span className="inline-block w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent" style={{ borderBottomColor: UP_COLOUR }} />
            Buy
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent" style={{ borderTopColor: DOWN_COLOUR }} />
            Sell
          </span>
        </div>
      )}

      {showPatterns && enablePatterns && (
        patterns.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 px-1 pt-1">
            {patterns.map((p, idx) => {
              const colour = signalColour(p.signal);
              const name = NAME_BY_ID.get(p.patternId) ?? p.patternId;
              return (
                <button
                  key={`leg-${idx}`}
                  onClick={() => setSelected({ id: p.patternId, confidence: p.confidence })}
                  className="inline-flex items-center gap-1 px-1.5 h-6 rounded-md text-[10px] font-semibold border"
                  style={{ borderColor: colour, color: colour, background: `${colour}14` }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] text-[#0A0E16]"
                    style={{ background: colour }}
                  >
                    {idx + 1}
                  </span>
                  {name}
                  {p.confidence === 'moderate' && <span className="opacity-60">· moderate</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] text-[#7A7363] px-1 pt-1 leading-snug">
            No clear textbook patterns in view — and that's normal. Clean patterns are rarer on
            monthly charts; try a wider window or another ticker.
          </p>
        )
      )}
    </div>
    {selected && (
      <PatternInsightCard
        patternId={selected.id}
        confidence={selected.confidence}
        onClose={() => setSelected(null)}
      />
    )}
    </>
  );
}
