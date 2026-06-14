/**
 * TerminalChart — stock-detail price chart for the Halal Trading terminal.
 *
 * Per design doc 08: AREA series is the calm default; candlesticks are an opt-in
 * toggle (not the default — daily-trader framing is avoided). Wraps TradingView
 * `lightweight-charts` v5 (already a repo dependency, Apache-2.0). Data comes
 * from the trading service (mock now, indianapi.in later).
 */

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaSeries, CandlestickSeries, ColorType, createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { tradingService } from '../services/trading.service';

const toTs = (d: string) =>
  Math.floor(new Date(`${d}T00:00:00Z`).getTime() / 1000) as UTCTimestamp;

const RANGES: { label: string; months: number }[] = [
  { label: '1Y', months: 12 },
  { label: '3Y', months: 36 },
  { label: '5Y', months: 60 },
];

const UP = '#7BB39A';
const DOWN = '#E84393';

export function TerminalChart({ symbol, heightPx = 220 }: { symbol: string; heightPx?: number }) {
  const [months, setMonths] = useState(36);
  const [mode, setMode] = useState<'area' | 'candles'>('area');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | ISeriesApi<'Candlestick'> | null>(null);

  const q = useQuery({
    queryKey: ['trading', 'ohlc', symbol, months],
    queryFn: () => tradingService.getMonthlySeries(symbol, months),
    staleTime: 5 * 60_000,
  });

  // Create the chart once.
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
      rightPriceScale: { borderColor: 'rgba(212,168,83,0.20)' },
      timeScale: { borderColor: 'rgba(212,168,83,0.20)', timeVisible: false, secondsVisible: false },
      crosshair: {
        vertLine: { color: 'rgba(212,168,83,0.30)', width: 1 },
        horzLine: { color: 'rgba(212,168,83,0.30)', width: 1 },
      },
      autoSize: false,
    });
    chartRef.current = chart;

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
    };
  }, [heightPx]);

  // (Re)build the series for the current mode and push data. Cheap at our scale
  // (<=60 monthly bars), and keeps the area/candle swap dead simple.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }
    const bars = q.data ?? [];
    if (mode === 'area') {
      const s = chart.addSeries(AreaSeries, {
        lineColor: UP,
        topColor: 'rgba(123,179,154,0.28)',
        bottomColor: 'rgba(123,179,154,0.02)',
        lineWidth: 2,
        priceLineVisible: false,
      });
      s.setData(bars.map((b) => ({ time: toTs(b.time), value: b.close })));
      seriesRef.current = s;
    } else {
      const s = chart.addSeries(CandlestickSeries, {
        upColor: UP,
        downColor: DOWN,
        borderUpColor: UP,
        borderDownColor: DOWN,
        wickUpColor: UP,
        wickDownColor: DOWN,
      });
      s.setData(
        bars.map((b) => ({ time: toTs(b.time), open: b.open, high: b.high, low: b.low, close: b.close })),
      );
      seriesRef.current = s;
    }
    if (bars.length > 0) chart.timeScale().fitContent();
  }, [mode, q.data]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.months}
              onClick={() => setMonths(r.months)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                months === r.months
                  ? 'bg-[rgba(212,168,83,0.18)] text-[#D4A853]'
                  : 'text-[#5C5749] hover:text-[#7A7363]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setMode((m) => (m === 'area' ? 'candles' : 'area'))}
          className="px-2 py-0.5 rounded text-[10px] font-semibold border border-[rgba(212,168,83,0.18)] text-[#7A7363] hover:text-[#D4A853]"
        >
          {mode === 'area' ? 'Candles' : 'Area'}
        </button>
      </div>

      <div
        ref={containerRef}
        style={{ height: heightPx, width: '100%' }}
        className="rounded-lg overflow-hidden bg-[rgba(255,255,255,0.02)]"
      />

      <div className="text-[10px] text-[#5C5749]">
        {q.isLoading ? 'Loading…' : `${q.data?.length ?? 0} monthly bars · illustrative`}
      </div>
    </div>
  );
}
