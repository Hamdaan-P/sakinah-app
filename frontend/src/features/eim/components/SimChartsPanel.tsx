/**
 * SimChartsPanel — collapsible "Price charts" section showing one
 * candlestick chart per held ticker, with BUY/SELL markers overlaid
 * from the session's decisions log. Sprint 6 Phase 4.
 *
 * Pulls bars from the SimEngine (state-firewalled to sim_date) so the
 * live view shows only what's happened up to "now" in sim time. For
 * ended sessions, sim_date == end_date so the chart shows the full
 * traded window.
 */

import { useMemo, useState } from 'react';
import { CaretDown, ChartLineUp } from '@phosphor-icons/react';
import { SimCandlestickChart, type SimChartMarker } from './SimCandlestickChart';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import type { Currency } from '../stores/currency.store';
import type { getEngine } from '../stores/sim.store';
import type { SimDecision, SimSession } from '../types/eim.types';

/** Group decisions for one ticker by (year_month, kind) so multiple
 *  trades in the same month (multiple buys, partial-sell-then-rebuy,
 *  scaling-in DCA-style entries) render as ONE marker per group with
 *  totals in the tooltip. Without this, 3 BUYs in the same month
 *  would stack on top of each other at the same x-coordinate. */
// eslint-disable-next-line react-refresh/only-export-components
export function aggregateTradeMarkers(
  decisions: readonly SimDecision[],
  ticker: string,
  fmtMoney: (n: number) => string = (n) => `$${n.toFixed(2)}`,
): SimChartMarker[] {
  type Bucket = {
    date: string;          // first decision's date in this bucket
    kind: 'BUY' | 'SELL';
    totalQty: number;
    count: number;
    minPrice: number;
    maxPrice: number;
    realisedSum: number;   // for SELL — sum of realised_pnl
  };
  const buckets = new Map<string, Bucket>();
  for (const d of decisions) {
    if (d.ticker !== ticker) continue;
    if (d.kind !== 'BUY' && d.kind !== 'SELL') continue;
    const month = d.sim_date.slice(0, 7);  // YYYY-MM
    const key = `${month}_${d.kind}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.totalQty += d.qty;
      existing.count += 1;
      if (d.price < existing.minPrice) existing.minPrice = d.price;
      if (d.price > existing.maxPrice) existing.maxPrice = d.price;
      existing.realisedSum += d.kind === 'SELL' ? d.realized_pnl : 0;
    } else {
      buckets.set(key, {
        date: d.sim_date,
        kind: d.kind,
        totalQty: d.qty,
        count: 1,
        minPrice: d.price,
        maxPrice: d.price,
        realisedSum: d.kind === 'SELL' ? d.realized_pnl : 0,
      });
    }
  }
  return Array.from(buckets.values()).map((b) => {
    const month = b.date.slice(0, 7);
    const priceLabel = b.minPrice === b.maxPrice
      ? fmtMoney(b.minPrice)
      : `${fmtMoney(b.minPrice)}–${fmtMoney(b.maxPrice)}`;
    const realisedSuffix = b.kind === 'SELL'
      ? ` · realised ${b.realisedSum < 0 ? '-' : '+'}${fmtMoney(Math.abs(b.realisedSum))}`
      : '';
    const label = b.count === 1
      ? `${b.kind} ${b.totalQty} @ ${priceLabel} · ${b.date}${realisedSuffix}`
      : `${b.kind} ×${b.count} trades · ${b.totalQty} qty · ${priceLabel} · ${month}${realisedSuffix}`;
    return { date: b.date, kind: b.kind, label };
  });
}

export interface SimChartsPanelProps {
  session: SimSession;
  engine: ReturnType<typeof getEngine>;
  /** Defaults to true (charts visible). Mostly for testing — UX is
   *  always-expanded with a collapse caret. */
  defaultOpen?: boolean;
}

export function SimChartsPanel({ session, engine, defaultOpen = true }: SimChartsPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  // Sim prices/P&L are in the session currency; convert to display currency.
  const { format } = useCurrencyFormat();
  const ccy = session.currency as Currency;
  const money = (n: number) => format(n, ccy, { maxDecimals: 2 });
  const priceAxis = (n: number) =>
    format(n, ccy, { compact: n >= 1000, maxDecimals: n >= 1 ? 2 : 3 });

  // Distinct tickers the user has held inside this sim (from the
  // decisions log + currently-open positions, deduped). Decisions log
  // is the source of truth for "what was traded" — even if a position
  // got fully sold, we still want to show the chart with the BUY+SELL
  // markers so the user can review their timing.
  const tickers = useMemo(() => {
    const set = new Set<string>();
    for (const d of session.decisions) {
      if (d.ticker) set.add(d.ticker);
    }
    for (const pos of session.portfolio.positions) {
      if (pos.ticker) set.add(pos.ticker);
    }
    return Array.from(set).sort();
  }, [session.decisions, session.portfolio.positions]);

  if (tickers.length === 0 || !engine) return null;

  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <ChartLineUp size={14} weight="bold" className="text-[#D4A853]" />
          <span className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold">
            Price charts ({tickers.length})
          </span>
        </div>
        <CaretDown
          size={12}
          weight="bold"
          className={'text-[#7A7363] transition-transform ' + (open ? '' : '-rotate-90')}
        />
      </button>

      {open && (
        <div className="space-y-3">
          {tickers.map((ticker) => {
            // Sprint 6 Phase 4 fix #1: slice bars to the sim window
            // (start_date → engine.simDate). Without this slice, charts
            // include the ticker's pre-sim yfinance history (e.g. AAPL
            // bars from 1980 in a 2008→2010 sim). For tickers that
            // listed AFTER session.start_date (e.g. TSLA in a 2008 sim),
            // bars naturally start at the listing date — the chart's
            // x-axis still anchors to the actual data we have.
            const allBars = engine.visiblePrices(ticker);
            const bars = allBars.filter(
              (b) => b.time >= session.start_date && b.time <= engine.simDate,
            );

            // Sprint 6 Phase 4 fix #2: aggregate multi-trade-same-month
            // by (year_month, kind) so 3 BUYs in 2008-04 render as ONE
            // marker, not three overlapping triangles. Quantity summed,
            // count surfaced in the tooltip label.
            const markers = aggregateTradeMarkers(session.decisions, ticker, money);

            return (
              <SimCandlestickChart
                key={ticker}
                ticker={ticker}
                bars={bars}
                markers={markers}
                formatPrice={priceAxis}
                asOf={engine.simDate}
                // Shared sim-window axis (Phase 4 follow-up) so all
                // charts in the panel align on the same dates — and
                // late-IPO tickers show empty space at the start
                // instead of stretching their first bar across the
                // entire chart width.
                windowStart={session.start_date}
                windowEnd={engine.simDate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
