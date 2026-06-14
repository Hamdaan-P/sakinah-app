/**
 * Side-by-side timeframe comparison panel.
 *
 * Renders the moment a user picks a buy date in the AddPositionWizard:
 *
 *   ┌─────┬──────┬──────┬──────┬──────┬──────────┐
 *   │Today│ 1mo  │ 6mo  │ 1yr  │ 5yr  │ Buy date │
 *   │ $X  │ ...  │ ...  │ ...  │ ...  │ (anchor) │
 *   │  +% │ +%   │ +%   │ +%   │ +%   │   +%     │
 *   └─────┴──────┴──────┴──────┴──────┴──────────┘
 *
 * Fed by `getStockSnapshot(ticker)` (4 fixed horizons) +
 * `getHistoricalAt(ticker, date)` (the picked anchor).
 *
 * §D15: no horizons shorter than 1 month. The buy-date column is the
 * anchor for P&L, not a daily-trading affordance.
 */

import type React from 'react';
import { useQuery } from '@tanstack/react-query';
import { eimService } from '../services/eim.service';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import type { Currency } from '../stores/currency.store';
import type { StockSnapshot, HistoricalAtResult } from '../types/eim.types';

type HorizonKey = '1mo' | '6mo' | '1yr' | '5yr';
const HORIZONS: { key: HorizonKey; label: string }[] = [
  { key: '1mo', label: '1mo' },
  { key: '6mo', label: '6mo' },
  { key: '1yr', label: '1yr' },
  { key: '5yr', label: '5yr' },
];

interface Props {
  ticker: string;
  buyDate: string; // ISO YYYY-MM-DD
  /** Override the stock's native currency. Falls back to snapshot.currency.
   *  The user's chosen display currency is layered on top via useCurrencyFormat. */
  currency?: string;
}

function _pct(p: number | null | undefined): React.ReactNode {
  if (p == null) return <span className="text-[#5C5749]">—</span>;
  const up = p >= 0;
  return (
    <span className={up ? 'text-[#22C55E]' : 'text-[#E84393]'}>
      {up ? '+' : ''}
      {p.toFixed(2)}%
    </span>
  );
}

export function TimeframeComparePanel({ ticker, buyDate, currency }: Props) {
  const snapQ = useQuery({
    queryKey: ['eim', 'snapshot', ticker],
    queryFn: () => eimService.getStockSnapshot(ticker),
    enabled: !!ticker,
    staleTime: 5 * 60_000,
  });

  const anchorQ = useQuery({
    queryKey: ['eim', 'historical-at', ticker, buyDate],
    queryFn: () => eimService.getHistoricalAt(ticker, buyDate),
    enabled: !!ticker && !!buyDate,
    staleTime: 60 * 60_000, // historical past prices don't change
  });

  const snap: StockSnapshot | undefined = snapQ.data;
  const anchor: HistoricalAtResult | undefined = anchorQ.data;
  const ccy = (currency || snap?.currency || 'USD') as Currency;
  const { format } = useCurrencyFormat();
  const _fmt = (price: number | null) =>
    price == null ? '—' : format(price, ccy);

  if (snapQ.isLoading) {
    return (
      <div className="rounded-xl border border-[rgba(212,168,83,0.14)] bg-[#0F1724] p-3 text-[11px] text-[#5C5749]">
        Loading historical comparison…
      </div>
    );
  }

  if (snapQ.error || !snap) {
    return (
      <div className="rounded-xl border border-[rgba(232,67,147,0.30)] bg-[rgba(232,67,147,0.06)] p-3 text-[11px] text-[#E84393]">
        Couldn't load historical data for {ticker}. The ticker may not be
        recognised — try a different symbol.
      </div>
    );
  }

  const today = snap.quote.close;

  return (
    <div className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#0F1724] p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold">
          What this stock was worth then
        </div>
        <div className="text-[10px] text-[#5C5749]">monthly &amp; up — no daily</div>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {/* Today */}
        <Cell
          title="Today"
          price={_fmt(today)}
          pctNode={<span className="text-[#5C5749]">now</span>}
          highlight={false}
        />

        {/* Fixed horizons */}
        {HORIZONS.map((h) => {
          const cell = snap.horizons[h.key];
          return (
            <Cell
              key={h.key}
              title={h.label}
              price={cell.available ? _fmt(cell.price) : 'n/a'}
              pctNode={cell.available ? _pct(cell.change_pct) : (
                <span className="text-[#5C5749]" title={cell.note}>—</span>
              )}
              highlight={false}
            />
          );
        })}

        {/* Buy-date anchor */}
        <Cell
          title="Buy date"
          subtitle={buyDate}
          price={anchorQ.isLoading ? '…' : _fmt(anchor?.price ?? null)}
          pctNode={
            anchorQ.isLoading
              ? <span className="text-[#5C5749]">…</span>
              : anchor?.available
                ? _pct(anchor?.change_pct ?? null)
                : <span className="text-[#5C5749]">no data</span>
          }
          highlight={true}
        />
      </div>

      <div className="mt-2 text-[10px] text-[#5C5749]">
        % shows change from that date to today. Past performance is educational
        only — it doesn't predict future outcomes.
      </div>
    </div>
  );
}

function Cell({
  title,
  subtitle,
  price,
  pctNode,
  highlight,
}: {
  title: string;
  subtitle?: string;
  price: string;
  pctNode: React.ReactNode;
  highlight: boolean;
}) {
  return (
    <div
      className={[
        'rounded-lg p-2 text-center min-w-0',
        highlight
          ? 'bg-[rgba(212,168,83,0.10)] border border-[rgba(212,168,83,0.40)]'
          : 'bg-[#101a2a] border border-[rgba(212,168,83,0.10)]',
      ].join(' ')}
    >
      <div className="text-[9px] uppercase tracking-widest text-[#5C5749] truncate">
        {title}
      </div>
      {subtitle && (
        <div className="text-[8px] text-[#5C5749] truncate">{subtitle}</div>
      )}
      <div className="text-[11px] font-bold text-[#F5E8C7] mt-0.5 truncate">
        {price}
      </div>
      <div className="text-[10px] mt-0.5">{pctNode}</div>
    </div>
  );
}

export default TimeframeComparePanel;
