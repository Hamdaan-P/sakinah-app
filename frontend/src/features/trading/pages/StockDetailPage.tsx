/**
 * Halal Trading — stock detail (read-only T1).
 *
 * Layout per design doc 08: price header → chart → COMPLIANCE PANEL (hero, above
 * fundamentals) → key stats. A watchlist star + a disabled "Trade" CTA (the live
 * order ticket arrives at T3, ★-gated).
 */

import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { CaretLeft, Lock, Star } from '@phosphor-icons/react';
import { tradingService } from '../services/trading.service';
import { CompliancePanel } from '../components/CompliancePanel';
import { TerminalChart } from '../components/TerminalChart';
import { TradingDisclaimer } from '../components/TradingDisclaimer';
import { useWatchlistStore } from '../stores/watchlist.store';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#101a2a] border border-[rgba(212,168,83,0.14)] px-3 py-2.5">
      <div className="text-[10px] text-[#5C5749] uppercase tracking-wide">{label}</div>
      <div className="text-[13px] font-semibold text-[#F5E8C7] mt-0.5">{value}</div>
    </div>
  );
}

export function StockDetailPage() {
  const { symbol = '' } = useParams();
  const navigate = useNavigate();
  const watched = useWatchlistStore((s) => s.isWatched(symbol.toUpperCase()));
  const toggle = useWatchlistStore((s) => s.toggle);

  const stockQ = useQuery({
    queryKey: ['trading', 'stock', symbol],
    queryFn: () => tradingService.getStock(symbol),
    staleTime: 5 * 60_000,
  });
  const stock = stockQ.data;
  const up = (stock?.changePct ?? 0) >= 0;

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-3xl mx-auto">
        <header className="px-4 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853]"
            aria-label="Back"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">Halal Trading</div>
            <h1 className="text-[18px] font-bold text-[#F5E8C7] truncate">
              {stock ? stock.symbol : symbol.toUpperCase()}
            </h1>
          </div>
          {stock && (
            <button
              onClick={() => toggle(stock.symbol)}
              className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center"
              aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Star size={16} weight={watched ? 'fill' : 'regular'} className="text-[#D4A853]" />
            </button>
          )}
        </header>

        <TradingDisclaimer />

        {stockQ.isLoading && (
          <div className="px-5 py-10 text-[12px] text-[#7A7363]">Loading…</div>
        )}
        {!stockQ.isLoading && !stock && (
          <div className="px-5 py-10 text-[12px] text-[#7A7363]">
            Unknown symbol “{symbol}”.
          </div>
        )}

        {stock && (
          <div className="px-3 mt-4 space-y-4">
            {/* Price header */}
            <div className="px-1">
              <div className="text-[13px] text-[#7A7363]">{stock.name}</div>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-[26px] font-bold text-[#F5E8C7] tabular-nums">
                  ₹{stock.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className="text-[13px] font-semibold tabular-nums"
                  style={{ color: up ? '#7BB39A' : '#E84393' }}
                >
                  {up ? '+' : ''}
                  {stock.changePct.toFixed(2)}%
                </span>
              </div>
            </div>

            <TerminalChart symbol={stock.symbol} />

            {/* Compliance is the hero — above fundamentals. */}
            <CompliancePanel stock={stock} />

            {/* Key stats */}
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Mkt cap" value={`₹${(stock.marketCapCr / 1000).toFixed(1)}k Cr`} />
              <Stat label="Sector" value={stock.sector.split(' ')[0]} />
              <Stat label="Listing" value={stock.exchange} />
            </div>

            {/* Disabled trade CTA — live order ticket lands at T3 (broker-gated). */}
            <button
              disabled
              className="w-full h-12 rounded-xl text-[13px] font-bold text-[#5C5749] bg-[#101a2a] border border-[rgba(212,168,83,0.14)] flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Lock size={15} weight="bold" />
              Trading coming soon — connect a broker
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StockDetailPage;
