/**
 * Expandable quarterly drawer for each portfolio holding.
 *
 * Lazy-loads `getStockQuarterly(ticker)` only when expanded, so the
 * portfolio list stays snappy. Renders the last 4 quarters of sales,
 * net profit, EPS, and operating margin in a compact mobile-first table.
 *
 * Source flag:
 *   - "screener+yfinance" — Indian tickers, higher fidelity
 *   - "yfinance"          — US/EU/global, the default
 *   - "unavailable"       — no quarterly available; we show a graceful note
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import { eimService } from '../services/eim.service';
import type { QuarterlyRow, StockQuarterly } from '../types/eim.types';

interface Props {
  ticker: string;
}

function _fmt(val: number | null, ccy: string, scale: 'units' | 'thousands' = 'units'): string {
  if (val == null) return '—';
  const symbol = ccy === 'INR' ? '₹' : ccy === 'GBP' ? '£' : ccy === 'EUR' ? '€' : '$';
  let display = val;
  let suffix = '';
  if (Math.abs(val) >= 1e9) {
    display = val / 1e9;
    suffix = 'B';
  } else if (Math.abs(val) >= 1e6) {
    display = val / 1e6;
    suffix = 'M';
  } else if (Math.abs(val) >= 1e3 && scale === 'units') {
    display = val / 1e3;
    suffix = 'K';
  }
  return `${symbol}${display.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`;
}

function _pct(val: number | null): string {
  if (val == null) return '—';
  return `${val.toFixed(1)}%`;
}

function _eps(val: number | null, ccy: string): string {
  if (val == null) return '—';
  const symbol = ccy === 'INR' ? '₹' : ccy === 'GBP' ? '£' : ccy === 'EUR' ? '€' : '$';
  return `${symbol}${val.toFixed(2)}`;
}

export function QuarterlyDrawer({ ticker }: Props) {
  const [open, setOpen] = useState(false);

  const q = useQuery({
    queryKey: ['eim', 'quarterly', ticker],
    queryFn: () => eimService.getStockQuarterly(ticker),
    enabled: open,
    staleTime: 60 * 60_000,
  });

  return (
    <div className="mt-3 pt-3 border-t border-[rgba(212,168,83,0.10)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-[11px] text-[#7A7363] hover:text-[#D4A853]"
      >
        <span className="uppercase tracking-widest text-[10px] font-semibold">
          Fundamentals · last 4 quarters
        </span>
        {open ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />}
      </button>

      {open && (
        <div className="mt-2">
          {q.isLoading && (
            <div className="text-[11px] text-[#5C5749] py-2">Loading quarterly data…</div>
          )}
          {q.error && (
            <div className="text-[11px] text-[#E84393] py-2">
              Couldn't load quarterly data for {ticker}.
            </div>
          )}
          {q.data && <QuarterlyTable data={q.data} />}
        </div>
      )}
    </div>
  );
}

function QuarterlyTable({ data }: { data: StockQuarterly }) {
  if (!data.quarters || data.quarters.length === 0) {
    return (
      <div className="text-[11px] text-[#5C5749] py-2">
        No recent quarterly filings available.
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] text-[#7A7363]">
          <thead>
            <tr className="border-b border-[rgba(212,168,83,0.10)]">
              <th className="text-left py-1.5 px-1 font-semibold text-[#5C5749] uppercase tracking-wider">
                Quarter
              </th>
              <th className="text-right py-1.5 px-1 font-semibold text-[#5C5749] uppercase tracking-wider">
                Sales
              </th>
              <th className="text-right py-1.5 px-1 font-semibold text-[#5C5749] uppercase tracking-wider">
                Net&nbsp;profit
              </th>
              <th className="text-right py-1.5 px-1 font-semibold text-[#5C5749] uppercase tracking-wider">
                EPS
              </th>
              <th className="text-right py-1.5 px-1 font-semibold text-[#5C5749] uppercase tracking-wider">
                Op&nbsp;margin
              </th>
            </tr>
          </thead>
          <tbody>
            {data.quarters.map((row: QuarterlyRow, idx) => (
              <tr
                key={`${row.quarter}-${idx}`}
                className="border-b border-[rgba(212,168,83,0.06)]"
              >
                <td className="py-1.5 px-1 text-[#F5E8C7] font-semibold">{row.quarter}</td>
                <td className="py-1.5 px-1 text-right">{_fmt(row.sales, data.currency)}</td>
                <td className="py-1.5 px-1 text-right">{_fmt(row.net_profit, data.currency)}</td>
                <td className="py-1.5 px-1 text-right">{_eps(row.eps, data.currency)}</td>
                <td className="py-1.5 px-1 text-right">{_pct(row.operating_margin_pct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1.5 text-[9px] text-[#5C5749]">
        Source: {data.source.replace('+', ' + ')} · {data.currency}
      </div>
    </div>
  );
}

export default QuarterlyDrawer;
