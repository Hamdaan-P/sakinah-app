/**
 * Halal Trading — Watchlist (read-only T1). Resolves the persisted symbol list
 * against the screened universe and shows compact rows.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Star } from '@phosphor-icons/react';
import { tradingService } from '../services/trading.service';
import { StockRow } from '../components/StockRow';
import { TradingTabBar } from '../components/TradingTabBar';
import { useWatchlistStore } from '../stores/watchlist.store';

export function WatchlistPage() {
  const navigate = useNavigate();
  const symbols = useWatchlistStore((s) => s.symbols);

  const stocksQ = useQuery({
    queryKey: ['trading', 'stocks'],
    queryFn: tradingService.getStocks,
    staleTime: 5 * 60_000,
  });

  const watched = useMemo(() => {
    const set = new Set(symbols);
    return (stocksQ.data ?? []).filter((s) => set.has(s.symbol));
  }, [stocksQ.data, symbols]);

  return (
    <div className="min-h-screen bg-[#0F1724] pb-28">
      <div className="max-w-3xl mx-auto">
        <header className="px-5 pt-6 pb-2">
          <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-1">
            ZaryahPlus · Halal Trading
          </div>
          <h1 className="text-[24px] font-bold text-[#F5E8C7]">Watchlist</h1>
        </header>

        <div className="px-3 mt-3">
          {symbols.length === 0 ? (
            <div className="rounded-2xl border border-[rgba(212,168,83,0.16)] bg-[#101a2a] px-4 py-8 text-center">
              <Star size={24} weight="duotone" className="text-[#D4A853] mx-auto mb-2" />
              <p className="text-[12px] text-[#7A7363] leading-relaxed">
                No stocks yet. Open a stock and tap the{' '}
                <Star size={11} weight="fill" className="inline text-[#D4A853]" /> to add it here.
              </p>
              <button
                onClick={() => navigate('/trading')}
                className="mt-3 text-[12px] font-semibold text-[#D4A853] hover:underline"
              >
                Explore stocks →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {watched.map((s) => (
                <StockRow key={s.symbol} stock={s} />
              ))}
            </div>
          )}
        </div>
      </div>

      <TradingTabBar active="watchlist" />
    </div>
  );
}

export default WatchlistPage;
