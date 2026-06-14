/**
 * Stock Screener Page
 * Shariah compliance screening using AAOIFI SS 21 / TASIS methodology.
 * 3-stage pipeline: Primary → Business → Financial screening.
 * Converted from: screener_page.dart + islamic_stock_detail_page.dart
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerModal } from '@/components/shared';
import { trackFeature } from '@/lib/analytics';
import { useDisclaimerSeen } from '@/features/legal/hooks/useDisclaimerSeen';
import {
  MagnifyingGlass, X, ShieldCheck, ShieldWarning, ArrowsClockwise, Shield, Funnel,
} from '@phosphor-icons/react';
import {
  getActiveStandard,
  setActiveStandard,
  getStandardInfo,
} from '@/features/shariah/services/shariahService';
import type { ScreeningStandard } from '@/features/shariah/types/shariahData';
import { fetchBatchScreen, fetchScreenerFull, searchStocks } from '@/features/chatbot/services/chatbotService';
import type { ShariahScreenResult as BackendScreenResult } from '@/features/chatbot/types/chatbot.types';
import {
  formatVolume, formatMarketCap, loadCachedScreenerData, saveCachedScreenerData,
  getCacheAgeMs, CACHE_FRESH_TTL, LOADING_MESSAGES,
} from './components/_cache';
import type { LiveStockData, FilterType } from './components/_cache';
import { LiveStockRow } from './components/LiveStockRow';
import { LiveStockDetailSheet } from './components/LiveStockDetailSheet';

export function ScreenerPage() {
  useEffect(() => { trackFeature('screener'); }, []);
  const [screenerSeen, markScreenerSeen] = useDisclaimerSeen('screener');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [standard, setStandard] = useState<ScreeningStandard>(getActiveStandard());
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  // Lazy init from cache so the first paint already shows last-known data
  // (no skeleton flash). Later effects refresh when needed.
  const initialCache = useMemo(() => loadCachedScreenerData(standard), []);  // eslint-disable-line react-hooks/exhaustive-deps
  const [liveData, setLiveData] = useState<Record<string, LiveStockData>>(initialCache ?? {});
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(!!initialCache);
  const [searchResults, setSearchResults] = useState<LiveStockData[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(!initialCache);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Cycle loading messages every 3 seconds
  useEffect(() => {
    if (!liveLoading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [liveLoading]);

  // Backend search: debounced, searches any stock in the market
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!query || query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchStocks(query);
        if (results.length === 0) {
          setSearchResults([]);
          setSearchLoading(false);
          return;
        }

        // Filter out stocks already in liveData
        const newSymbols = results
          .filter(r => !liveData[r.symbol])
          .map(r => r.symbol)
          .slice(0, 10);

        // Build search results from already-loaded stocks that match
        const q = query.toLowerCase();
        const alreadyLoaded: LiveStockData[] = Object.values(liveData).filter(s =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.backendScreen?.sector ?? '').toLowerCase().includes(q) ||
          (s.backendScreen?.industry ?? '').toLowerCase().includes(q)
        );

        // Screen new symbols — one batch call instead of N parallel singles.
        if (newSymbols.length > 0) {
          let screenedResults: LiveStockData[] = [];
          try {
            const batch = await fetchBatchScreen(newSymbols, standard);
            screenedResults = batch.results.map(screen => {
              const match = results.find(r => r.symbol === screen.symbol);
              return {
                symbol: screen.symbol,
                name: screen.name || match?.name || screen.symbol,
                price: screen.current_price ?? 0,
                change: 0,
                changePct: 0,
                volume: '—',
                marketCapLabel: '—',
                backendScreen: screen,
              };
            });
          } catch (err) {
            console.warn('Batch search screen failed:', err);
          }

          // Merge into liveData so detail-sheet clicks work without a refetch.
          if (screenedResults.length > 0) {
            const newEntries: Record<string, LiveStockData> = {};
            for (const s of screenedResults) newEntries[s.symbol] = s;
            setLiveData(prev => ({ ...prev, ...newEntries }));
          }

          setSearchResults([...alreadyLoaded, ...screenedResults]);
        } else {
          setSearchResults(alreadyLoaded);
        }
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, [liveData, standard]);

  // Fetch the watchlist as parallel batches. A single 105-symbol request can
  // exceed 30s on a cold yfinance hit; sequential batches feel like a waterfall.
  // Parallel batches give us: first rows in ~3-5s, full list in ~8-10s, and
  // one slow batch doesn't kill the others (Promise.allSettled).
  const fetchLiveData = useCallback(async () => {
    setLiveLoading(true);
    setLoadingMsgIdx(0);

    const BATCH_SIZE = 25;
    const offsets = [0, 25, 50, 75, 100]; // covers the 105-symbol watchlist
    const allFresh: Record<string, LiveStockData> = {};

    await Promise.allSettled(offsets.map(async (offset) => {
      try {
        const data = await fetchScreenerFull(standard, BATCH_SIZE, offset);
        if (data.status !== 'success' || !data.stocks?.length) return;

        const batch: Record<string, LiveStockData> = {};
        for (const stock of data.stocks) {
          const entry: LiveStockData = {
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price ?? 0,
            change: stock.change ?? 0,
            changePct: stock.change_pct ?? 0,
            volume: formatVolume(stock.volume ?? 0),
            marketCapLabel: formatMarketCap(stock.market_cap ?? 0),
            backendScreen: stock.screen as BackendScreenResult,
          };
          batch[stock.symbol] = entry;
          allFresh[stock.symbol] = entry;
        }
        // Render this batch as soon as it lands — progressive paint.
        setLiveData(prev => ({ ...prev, ...batch }));
        setLiveMode(true);
        setShowLoadingOverlay(false);
      } catch (err) {
        console.warn(`Screener batch at offset ${offset} failed:`, err);
      }
    }));

    if (Object.keys(allFresh).length > 0) {
      saveCachedScreenerData(allFresh, standard);
    }
    setLiveLoading(false);
  }, [standard]);

  // Side effect: persist standard selection.
  useEffect(() => {
    setActiveStandard(standard);
  }, [standard]);

  // Load policy: re-runs on mount AND when standard changes. Cache short-circuits
  // a refetch when the entry is fresh (<60s) — beyond that we re-render the cache
  // immediately and refresh in the background (stale-while-revalidate).
  useEffect(() => {
    const cached = loadCachedScreenerData(standard);
    const age = getCacheAgeMs(standard);

    if (cached) {
      setLiveData(cached);
      setLiveMode(true);
      setShowLoadingOverlay(false);
      if (age !== null && age < CACHE_FRESH_TTL) return;  // fresh — no refetch
    } else {
      setLiveData({});
      setLiveMode(false);
      setShowLoadingOverlay(true);
    }
    fetchLiveData();
  }, [standard, fetchLiveData]);

  // Live mode counts & filtering
  const liveStocks = Object.values(liveData);
  const liveCompliant = liveStocks.filter(s => s.backendScreen?.is_compliant).length;

  const filteredLive = useMemo(() => {
    let result = liveStocks;
    if (filter === 'compliant') result = result.filter(s => s.backendScreen?.is_compliant);
    if (filter === 'non-compliant') result = result.filter(s => !s.backendScreen?.is_compliant);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.backendScreen?.sector ?? '').toLowerCase().includes(q) ||
        (s.backendScreen?.industry ?? '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [liveStocks, filter, searchQuery]);

  const compliantCount = liveCompliant;
  const totalCount = liveStocks.length;
  const standardInfo = getStandardInfo(standard);

  const selectedLiveStock = selectedSymbol ? liveData[selectedSymbol] : null;

  return (
    <div className="min-h-screen pb-8 relative">
      {!screenerSeen && <DisclaimerModal contentId="INVESTMENT" onAccept={markScreenerSeen} />}

      {/* Loading overlay — shown on page visit while fetching, dismissible */}
      <AnimatePresence>
        {showLoadingOverlay && liveLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-[#0A0E16]/80 backdrop-blur-md rounded-b-3xl"
          >
            <button
              onClick={() => setShowLoadingOverlay(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-[#7B8DA0]" />
            </button>
            <div className="text-center px-6 max-w-sm">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Funnel size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#F5E8C7] mb-2">Setting up your Screener</h2>
              <p className="text-[#7A7363] text-sm mb-6">
                Fetching live data and running Shariah compliance checks on every stock.
              </p>
              <div className="flex items-center justify-center gap-2 mb-3 h-6 overflow-hidden">
                <ArrowsClockwise size={16} className="text-[#D4A853] animate-spin shrink-0" />
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingMsgIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-[#D4A853] text-sm font-medium"
                  >
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <p className="text-[#5C5749] text-[10px]">This will be instant next time</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative overflow-hidden rounded-b-3xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-[#10151F] to-[#161D2C]" />
        <div className="relative px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Funnel size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5E8C7]">Shariah Screener</h1>
              <p className="text-sm text-[#B8C4D4]">AAOIFI SS 21 / TASIS Methodology</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} weight="fill" className="text-emerald-400" />
              <span className="text-emerald-400 font-bold text-sm">{compliantCount}</span>
              <span className="text-[#7B8DA0] text-xs">compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldWarning size={16} weight="fill" className="text-red-400" />
              <span className="text-red-400 font-bold text-sm">{totalCount - compliantCount}</span>
              <span className="text-[#7B8DA0] text-xs">non-compliant</span>
            </div>
            <span className="text-[#3A4D65]">|</span>
            <span className="text-[#7B8DA0] text-xs">{totalCount} total</span>
            <span className="text-[#3A4D65]">|</span>
            <button
              onClick={() => fetchLiveData()}
              disabled={liveLoading}
              className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                liveMode
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-[#D4A853]/20 text-[#D4A853] hover:bg-[#D4A853]/30'
              } ${liveLoading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {liveLoading ? (
                <span className="flex items-center gap-1"><ArrowsClockwise size={10} className="animate-spin" /> Screening...</span>
              ) : liveMode ? (
                <span className="flex items-center gap-1"><ArrowsClockwise size={10} /> Refresh</span>
              ) : (
                'Fetch Live'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Standard Toggle + Search + Filters */}
      <div className="px-4 space-y-3 mb-4">
        {/* Standard toggle */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0A0E16] border border-[#3A4D65]">
          <Shield size={16} className="text-[#D4A853] shrink-0" />
          <span className="text-[10px] text-[#7B8DA0] shrink-0">Standard:</span>
          {(['AAOIFI', 'TASIS'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStandard(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                standard === s
                  ? 'bg-[#D4A853] text-[#0A0E16]'
                  : 'bg-[#10151F] text-[#B8C4D4] hover:text-[#F5E8C7]'
              }`}
            >
              {s}
            </button>
          ))}
          <span className="text-[9px] text-[#7B8DA0] ml-auto hidden sm:block">{standardInfo.description}</span>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8DA0]" />
          <input
            type="text"
            placeholder="Search any stock — e.g. AAPL, Tesla, Aramco..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#10151F] border border-[#3A4D65] text-[#F5E8C7] text-sm placeholder-[#7B8DA0] focus:outline-none focus:border-emerald-500/50"
          />
          {searchLoading && (
            <ArrowsClockwise size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4A853] animate-spin" />
          )}
          {searchQuery && !searchLoading && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-[#7B8DA0] hover:text-[#F5E8C7]" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {([['all', 'All Stocks'], ['compliant', 'Compliant'], ['non-compliant', 'Non-Compliant']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === id
                  ? 'bg-[#D4A853] text-[#0A0E16]'
                  : 'bg-[#10151F] text-[#B8C4D4] border border-[#3A4D65] hover:border-[#D4A853]/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Count */}
      <div className="px-4 mb-3">
        <p className="text-[#7B8DA0] text-xs">
          {searchQuery.length >= 2
            ? searchLoading
              ? 'Searching & screening...'
              : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
            : liveLoading && liveStocks.length === 0
              ? 'Loading stocks...'
              : `${filteredLive.length} of ${liveStocks.length} stocks${liveLoading ? ' — refreshing...' : ' screened'}`
          }
        </p>
      </div>

      {/* Stock List */}
      <div className="px-4 space-y-2">
        {searchQuery.length >= 2 ? (
          /* Search mode: show search results from backend */
          <>
            {searchLoading && searchResults.length === 0 ? (
              <SkeletonList count={4} />
            ) : (
              <>
                {searchResults.map((stock, i) => (
                  <LiveStockRow key={stock.symbol} stock={stock} index={i} onClick={() => setSelectedSymbol(stock.symbol)} />
                ))}
                {searchResults.length === 0 && !searchLoading && (
                  <p className="text-center text-[#7B8DA0] text-sm py-8">No stocks found for &quot;{searchQuery}&quot;. Try a different symbol or name.</p>
                )}
              </>
            )}
          </>
        ) : (
          /* Live mode (or loading): render from backend data */
          <>
            {liveStocks.length === 0 && liveLoading ? (
              <SkeletonList count={8} />
            ) : (
              <>
                {filteredLive.map((stock, i) => (
                  <LiveStockRow key={stock.symbol} stock={stock} index={i} onClick={() => setSelectedSymbol(stock.symbol)} />
                ))}
                {filteredLive.length === 0 && !liveLoading && (
                  <p className="text-center text-[#7B8DA0] text-sm py-8">No stocks match your filters.</p>
                )}
              </>
            )}
            {liveLoading && liveStocks.length > 0 && (
              <div className="flex items-center justify-center gap-2 py-4">
                <ArrowsClockwise size={14} className="text-[#D4A853] animate-spin" />
                <p className="text-[#7B8DA0] text-xs">Refreshing…</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stock Detail Sheet */}
      <AnimatePresence>
        {selectedLiveStock?.backendScreen ? (
          <LiveStockDetailSheet
            stock={selectedLiveStock}
            onClose={() => setSelectedSymbol(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#0F141F] border border-[#3A4D65]/50 animate-pulse">
          <div className="w-10 h-10 rounded-lg bg-[#0A0E16]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-[#0A0E16] rounded w-24" />
            <div className="h-2 bg-[#0A0E16] rounded w-40" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-3 bg-[#0A0E16] rounded w-16 ml-auto" />
            <div className="h-2 bg-[#0A0E16] rounded w-12 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ScreenerPage;
