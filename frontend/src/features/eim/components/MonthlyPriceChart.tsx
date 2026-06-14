/**
 * MonthlyPriceChart — monthly OHLC candle chart for an EIM position.
 *
 * Per master plan §6.G + D15: monthly is the default and only timeframe
 * exposed here. Daily framing is explicitly excluded everywhere in EIM —
 * it's the gateway to trading psychology the platform exists to prevent.
 *
 * Wraps TradingView's `lightweight-charts` v5 (~35kb). Lazy-fetches OHLC
 * via the new `/api/eim/stock/{ticker}/monthly` endpoint on mount and on
 * range changes, draws a single Candlestick series, and disposes the
 * chart on unmount.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaSeries,
  ColorType,
  createChart,
  CandlestickSeries,
  createSeriesMarkers,
} from 'lightweight-charts';
import type {
  IChartApi,
  ISeriesApi,
  ISeriesMarkersPluginApi,
  SeriesMarker,
  Time,
  UTCTimestamp,
} from 'lightweight-charts';

import { eimService } from '../services/eim.service';
import { CANDLESTICKS } from '../data/knowledge-bank';
import type { CandlestickSignal } from '../data/knowledge-bank/schema';
import {
  detectPatterns,
  dedupeOverlaps,
  type DetectedPattern,
  type PatternConfidence,
} from '../engine/patternDetection';
import { PatternInsightCard } from './PatternInsightCard';
import type { MonthlyOhlcBar, MonthlyOhlcRange } from '../types/eim.types';

interface Props {
  ticker: string;
  defaultRange?: MonthlyOhlcRange;
  /** Optional inline override. The default ~180px sits well in the holding card drawer. */
  heightPx?: number;
  /** Start with the "Spot patterns" overlay already on (e.g. the Pattern Lab). */
  defaultShowPatterns?: boolean;
  /**
   * Which series to draw first. 'area' is the calm beginner-friendly default on
   * learning/portfolio surfaces; the Pattern Lab passes 'candles' because the
   * candle shapes ARE the lesson there. Users can always toggle.
   */
  defaultChartMode?: ChartMode;
}

type ChartMode = 'area' | 'candles';

// EIM brand palette — keep candles in tones that don't read as "daily P&L
// excitement". Greens/reds are the conventional gain/loss colours; we
// soften them slightly so the chart reads as educational rather than a
// trading terminal.
const CANDLE_COLORS = {
  up: '#7BB39A',
  down: '#E84393',
  upBorder: '#7BB39A',
  downBorder: '#E84393',
  upWick: '#7BB39A',
  downWick: '#E84393',
};

const RANGE_OPTIONS: { label: string; value: MonthlyOhlcRange }[] = [
  { label: '1Y', value: '1y' },
  { label: '3Y', value: '3y' },
  { label: '5Y', value: '5y' },
  { label: '10Y', value: '10y' },
];

// Pattern-spotting overlay (Phase B).
const NAME_BY_ID = new Map(CANDLESTICKS.map((c) => [c.id, c.name] as const));
const signalColour = (s: CandlestickSignal): string =>
  s === 'bullish_reversal'
    ? CANDLE_COLORS.up
    : s === 'bearish_reversal'
      ? CANDLE_COLORS.down
      : s === 'continuation'
        ? '#82B1FF'
        : '#9A927E';
/** ISO date → the same UTC-timestamp key the candlestick series uses. */
const toTs = (d: string) =>
  Math.floor(new Date(`${d}T00:00:00Z`).getTime() / 1000) as UTCTimestamp;

export function MonthlyPriceChart({
  ticker,
  defaultRange = '1y',
  heightPx = 180,
  defaultShowPatterns = false,
  defaultChartMode = 'area',
}: Props) {
  const [range, setRange] = useState<MonthlyOhlcRange>(defaultRange);
  const [mode, setMode] = useState<ChartMode>(defaultChartMode);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Area'> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  // Refs keep the (stable) click handler reading the latest patterns/bars.
  const patternsRef = useRef<DetectedPattern[]>([]);
  const barsRef = useRef<MonthlyOhlcBar[]>([]);
  const [showPatterns, setShowPatterns] = useState(defaultShowPatterns);
  const [selected, setSelected] = useState<{ id: string; confidence: PatternConfidence } | null>(null);

  const ohlcQ = useQuery({
    queryKey: ['eim', 'monthly-ohlc', ticker, range],
    queryFn: () => eimService.getStockMonthly(ticker, range),
    staleTime: 60 * 60_000, // matches the 1h server-side cache
  });

  const patterns = useMemo<DetectedPattern[]>(
    () => (showPatterns ? dedupeOverlaps(detectPatterns(ohlcQ.data?.bars ?? [])) : []),
    [showPatterns, ohlcQ.data],
  );

  // Lazy-create the chart on first mount. Re-create it if the container
  // ref ever swaps (it won't, in practice — defensive only).
  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: heightPx,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#7A7363',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(212,168,83,0.20)',
      },
      timeScale: {
        borderColor: 'rgba(212,168,83,0.20)',
        timeVisible: false,
        secondsVisible: false,
      },
      crosshair: {
        // Subtle crosshair — educational chart, not a trading terminal.
        vertLine: { color: 'rgba(212,168,83,0.30)', width: 1 },
        horzLine: { color: 'rgba(212,168,83,0.30)', width: 1 },
      },
      autoSize: false,
    });
    chartRef.current = chart;
    // The price series itself is (re)built in the [mode, data] effect below so
    // the area/candle toggle is a single, simple swap.

    // Click → open the teaching card for the nearest spotted pattern.
    chart.subscribeClick((param) => {
      const target = typeof param.time === 'number' ? param.time : null;
      if (target == null) return;
      const bars = barsRef.current;
      let best: DetectedPattern | null = null;
      let bestDist = Infinity;
      for (const p of patternsRef.current) {
        const bar = bars[p.endIndex];
        if (!bar) continue;
        const dist = Math.abs((toTs(bar.time) as number) - target);
        if (dist < bestDist) {
          bestDist = dist;
          best = p;
        }
      }
      // ~20-day tolerance so a tap near a monthly marker still resolves.
      if (best && bestDist <= 20 * 86_400) {
        setSelected({ id: best.patternId, confidence: best.confidence });
      }
    });

    // Resize observer so the chart tracks the container's width when
    // the drawer animates open or the viewport rotates on mobile.
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({
          width: Math.max(80, Math.floor(entry.contentRect.width)),
          height: heightPx,
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      markersRef.current = null;
    };
  }, [heightPx]);

  // (Re)build the price series for the current mode and push data. Cheap at our
  // scale (<=120 monthly bars) and keeps the area/candle swap dead simple. The
  // markers plugin is bound to the series, so rebuilding the series nulls it —
  // the markers effect below recreates it on the same data tick.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
      markersRef.current = null;
    }
    const data = ohlcQ.data?.bars ?? [];
    // Converting to UTC timestamp dodges any local-tz interpretation on Android
    // Capacitor builds (lightweight-charts also accepts ISO date strings).
    if (mode === 'candles') {
      const s = chart.addSeries(CandlestickSeries, {
        upColor: CANDLE_COLORS.up,
        downColor: CANDLE_COLORS.down,
        borderUpColor: CANDLE_COLORS.upBorder,
        borderDownColor: CANDLE_COLORS.downBorder,
        wickUpColor: CANDLE_COLORS.upWick,
        wickDownColor: CANDLE_COLORS.downWick,
      });
      s.setData(
        data.map((bar) => ({
          time: toTs(bar.time),
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        })),
      );
      seriesRef.current = s;
    } else {
      const s = chart.addSeries(AreaSeries, {
        lineColor: CANDLE_COLORS.up,
        topColor: 'rgba(123,179,154,0.28)',
        bottomColor: 'rgba(123,179,154,0.02)',
        lineWidth: 2,
        priceLineVisible: false,
      });
      s.setData(data.map((bar) => ({ time: toTs(bar.time), value: bar.close })));
      seriesRef.current = s;
    }
    if (data.length > 0) {
      chart.timeScale().fitContent();
    }
  }, [mode, ohlcQ.data]);

  // Keep refs fresh for the click handler bound once at chart creation.
  useEffect(() => {
    patternsRef.current = patterns;
  }, [patterns]);
  useEffect(() => {
    barsRef.current = ohlcQ.data?.bars ?? [];
  }, [ohlcQ.data]);

  // Sync pattern markers onto the series (Phase B). Bullish = arrow below the
  // bar, bearish = arrow above, indecision = a neutral circle.
  useEffect(() => {
    if (!seriesRef.current) return;
    if (!markersRef.current) {
      markersRef.current = createSeriesMarkers(seriesRef.current, []);
    }
    const bars = ohlcQ.data?.bars ?? [];
    const marks = patterns
      .map((p): SeriesMarker<Time> | null => {
        const bar = bars[p.endIndex];
        if (!bar) return null;
        const bullish = p.signal === 'bullish_reversal';
        const bearish = p.signal === 'bearish_reversal';
        return {
          time: toTs(bar.time),
          position: bullish ? 'belowBar' : 'aboveBar',
          color: signalColour(p.signal),
          shape: bullish ? 'arrowUp' : bearish ? 'arrowDown' : 'circle',
          text: NAME_BY_ID.get(p.patternId) ?? p.patternId,
        };
      })
      .filter((m): m is SeriesMarker<Time> => m !== null);
    markersRef.current.setMarkers(marks);
  }, [patterns, ohlcQ.data, mode]);

  const currency = ohlcQ.data?.currency;
  const asOf = useMemo(() => {
    if (!ohlcQ.data?.as_of) return null;
    try {
      return new Date(ohlcQ.data.as_of).toLocaleDateString();
    } catch {
      return null;
    }
  }, [ohlcQ.data?.as_of]);

  return (
    <>
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 text-[10px] text-[#5C5749]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="uppercase tracking-wider font-semibold truncate">
            Monthly · {ticker}
          </span>
          {currency && <span>· {currency}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMode((m) => (m === 'area' ? 'candles' : 'area'))}
            aria-label={mode === 'area' ? 'Switch to candlestick chart' : 'Switch to line chart'}
            title={mode === 'area' ? 'Showing line — tap for candlesticks' : 'Showing candlesticks — tap for line'}
            className="text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded border border-[rgba(212,168,83,0.18)] text-[#5C5749] hover:text-[#D4A853] transition-colors"
          >
            {mode === 'area' ? 'Line' : 'Candles'}
          </button>
          <button
            onClick={() =>
              setShowPatterns((v) => {
                // Candlestick patterns only read on candles — flip the view on
                // when the user turns spotting on from the line chart.
                if (!v) setMode('candles');
                return !v;
              })
            }
            aria-pressed={showPatterns}
            className={
              'text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded border transition-colors ' +
              (showPatterns
                ? 'text-[#D4A853] border-[rgba(212,168,83,0.45)] bg-[rgba(212,168,83,0.12)]'
                : 'text-[#5C5749] border-[rgba(212,168,83,0.18)] hover:text-[#D4A853]')
            }
          >
            {showPatterns ? 'Patterns on' : 'Spot patterns'}
          </button>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setRange(o.value)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  range === o.value
                    ? 'bg-[rgba(212,168,83,0.18)] text-[#D4A853]'
                    : 'text-[#5C5749] hover:text-[#7A7363]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{ height: heightPx, width: '100%' }}
        className="rounded-lg overflow-hidden bg-[rgba(255,255,255,0.02)]"
      />

      <div className="flex items-center justify-between text-[10px] text-[#5C5749]">
        <span>
          {ohlcQ.isLoading
            ? 'Loading…'
            : ohlcQ.isError
              ? 'Monthly data unavailable'
              : `${ohlcQ.data?.bars.length ?? 0} bars`}
        </span>
        {asOf && <span>as of {asOf}</span>}
      </div>

      <p className="text-[10px] text-[#5C5749] leading-relaxed italic">
        Monthly bars — daily noise is intentionally hidden (master plan §6.G).
      </p>

      {showPatterns && patterns.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: colour }} />
                {name}
                {p.confidence === 'moderate' && <span className="opacity-60">· moderate</span>}
              </button>
            );
          })}
        </div>
      )}
      {showPatterns && !ohlcQ.isLoading && patterns.length === 0 && (ohlcQ.data?.bars?.length ?? 0) > 0 && (
        <p className="text-[10px] text-[#7A7363] leading-snug">
          {(ohlcQ.data?.bars?.length ?? 0) < 24
            ? 'No clear patterns yet — switch to 5Y/10Y to give the detector more monthly history.'
            : "No clear textbook patterns in this window — and that's normal. Clean patterns are rarer on monthly charts."}
        </p>
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
