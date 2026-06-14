/**
 * SimStatsPanel — collapsible analytics for the Time Machine.
 *
 * Per master plan §6.R + 2026-05-24 UX feedback item 9. Two simple
 * hand-rolled SVG charts (no new deps):
 *
 *   - **Allocation pie** — current portfolio value split per ticker +
 *     a cash slice. Recomputed on every step.
 *   - **Realised P&L bars** — one bar per SELL decision, green/red
 *     by sign. Reads the decisions journal directly so it shows the
 *     full trade history.
 *
 * Collapsed by default to keep the active-sim view focused.
 */

import { useMemo, useState } from 'react';
import { CaretDown, CaretUp, ChartPie } from '@phosphor-icons/react';
import { computeHoldings } from '../engine/holdings';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import type { Currency } from '../stores/currency.store';
import type { SimSession } from '../types/eim.types';

const SLICE_COLORS = ['#D4A853', '#5FC986', '#7BA7E8', '#E8C97A', '#C97BD4', '#F5E8C7'];

export function SimStatsPanel({
  session,
  currentPrices,
}: {
  session: SimSession;
  currentPrices: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  // Sim amounts are in the session currency; convert to the display currency.
  const { format } = useCurrencyFormat();
  const ccy = session.currency as Currency;
  const money = (n: number) => format(n, ccy, { maxDecimals: 2 });
  const moneySigned = (n: number) =>
    `${n < 0 ? '-' : '+'}${format(Math.abs(n), ccy, { maxDecimals: 2 })}`;

  // Allocation slices include a cash slice last (gold colour); sized by
  // current portfolio currency value.
  const allocation = useMemo(() => {
    const holdings = computeHoldings(session.portfolio);
    const slices: { label: string; value: number }[] = [];
    for (const h of holdings) {
      const price = currentPrices[h.ticker] ?? h.avg_cost;
      const value = price * h.total_qty;
      if (value > 0) slices.push({ label: h.ticker, value });
    }
    if (session.portfolio.cash_balance > 0) {
      slices.push({ label: 'Cash', value: session.portfolio.cash_balance });
    }
    const total = slices.reduce((s, x) => s + x.value, 0);
    return { slices, total };
  }, [session.portfolio, currentPrices]);

  // Realised P&L bars — one per SELL decision in chronological order.
  const realisedBars = useMemo(() => {
    const sells = session.decisions.filter((d) => d.kind === 'SELL');
    return sells.map((d) => ({
      key: d.id,
      ticker: d.ticker ?? '—',
      sim_date: d.sim_date,
      pnl: d.realized_pnl,
    }));
  }, [session.decisions]);

  const realisedTotal = realisedBars.reduce((s, b) => s + b.pnl, 0);

  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[rgba(212,168,83,0.05)]"
      >
        <div className="flex items-center gap-2">
          <ChartPie size={14} weight="bold" className="text-[#D4A853]" />
          <span className="text-[11px] uppercase tracking-widest text-[#D4A853] font-bold">
            Stats
          </span>
          <span className="text-[10px] text-[#5C5749]">
            {allocation.slices.length} slice{allocation.slices.length === 1 ? '' : 's'} ·{' '}
            {realisedBars.length} closed trade{realisedBars.length === 1 ? '' : 's'}
          </span>
        </div>
        {open
          ? <CaretUp size={14} weight="bold" className="text-[#7A7363]" />
          : <CaretDown size={14} weight="bold" className="text-[#7A7363]" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-[rgba(212,168,83,0.10)]">
          {/* Allocation pie */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-2 mt-3">
              Current allocation
            </div>
            {allocation.total > 0 ? (
              <div className="flex items-center gap-4">
                <PieChart slices={allocation.slices} size={120} />
                <ul className="flex-1 space-y-1 text-[11px]">
                  {allocation.slices.map((s, i) => {
                    const pct = (s.value / allocation.total) * 100;
                    return (
                      <li key={s.label} className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }}
                          aria-hidden
                        />
                        <span className="text-[#F5E8C7] font-bold w-12">{s.label}</span>
                        <span className="text-[#7A7363]">{pct.toFixed(1)}%</span>
                        <span className="ml-auto text-[#5C5749]">{money(s.value)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="text-[12px] text-[#7A7363] py-2">
                Nothing held yet — buy something to see allocation.
              </div>
            )}
          </div>

          {/* Realised P&L bars */}
          <div className="pt-3 border-t border-[rgba(212,168,83,0.10)]">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-2 flex items-center justify-between">
              <span>Realised P&L per closed trade</span>
              {realisedBars.length > 0 && (
                <span className={realisedTotal >= 0 ? 'text-[#5FC986]' : 'text-[#E84393]'}>
                  Total {moneySigned(realisedTotal)}
                </span>
              )}
            </div>
            {realisedBars.length > 0 ? (
              <BarChart bars={realisedBars} moneySigned={moneySigned} />
            ) : (
              <div className="text-[12px] text-[#7A7363] py-2">
                No closed trades yet. Once you sell, each closure shows up here.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline SVG charts (no deps) ──────────────────────────────────────────

function PieChart({ slices, size }: { slices: { label: string; value: number }[]; size: number }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total <= 0) return null;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  // Single-slice edge case: draw a full circle instead of a degenerate arc.
  if (slices.length === 1) {
    return (
      <svg width={size} height={size} role="img" aria-label="Allocation pie chart">
        <circle cx={cx} cy={cy} r={r} fill={SLICE_COLORS[0]} />
      </svg>
    );
  }

  let angle = -Math.PI / 2; // start at 12 o'clock
  const paths = slices.map((s, i) => {
    const slice = (s.value / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += slice;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const largeArc = slice > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return (
      <path
        key={s.label}
        d={d}
        fill={SLICE_COLORS[i % SLICE_COLORS.length]}
        stroke="#101a2a"
        strokeWidth="1"
      />
    );
  });

  return (
    <svg width={size} height={size} role="img" aria-label="Allocation pie chart">
      {paths}
    </svg>
  );
}

function BarChart({
  bars,
  moneySigned,
}: {
  bars: { key: string; ticker: string; sim_date: string; pnl: number }[];
  moneySigned: (n: number) => string;
}) {
  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.pnl)), 1);
  return (
    <div className="space-y-1.5">
      {bars.map((b) => {
        const pct = (Math.abs(b.pnl) / maxAbs) * 100;
        const positive = b.pnl >= 0;
        return (
          <div key={b.key} className="text-[11px]">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[#F5E8C7] font-semibold">
                {b.ticker} <span className="text-[#5C5749] font-normal">· {b.sim_date}</span>
              </span>
              <span className={positive ? 'text-[#5FC986] font-bold' : 'text-[#E84393] font-bold'}>
                {moneySigned(b.pnl)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#0A0E16] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: positive ? '#5FC986' : '#E84393',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SimStatsPanel;
