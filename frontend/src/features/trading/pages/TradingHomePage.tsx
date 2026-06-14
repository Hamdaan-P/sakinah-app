/**
 * Halal Trading — Explore (section home, read-only T1).
 *
 * Primary grouping is by Shariah STANDARD (DJIM / AAOIFI / TASIS) — the
 * differentiator — with a sector breakdown and a light search inside the
 * selected standard. Powered by the trading service (mock now; indianapi.in
 * later). Part of the separate "Halal Trading" section (Model A / A1).
 */

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlass, Storefront } from '@phosphor-icons/react';
import { tradingService } from '../services/trading.service';
import {
  COMPLIANCE_STANDARDS,
  STANDARD_META,
  passesStandard,
  type ComplianceStandard,
  type Stock,
} from '../types/trading.types';
import { StockRow } from '../components/StockRow';
import { TradingDisclaimer } from '../components/TradingDisclaimer';
import { TradingTabBar } from '../components/TradingTabBar';

export function TradingHomePage() {
  const [standard, setStandard] = useState<ComplianceStandard>('AAOIFI');
  const [query, setQuery] = useState('');

  const stocksQ = useQuery({
    queryKey: ['trading', 'stocks'],
    queryFn: tradingService.getStocks,
    staleTime: 5 * 60_000,
  });

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const compliant = (stocksQ.data ?? []).filter(
      (s) =>
        passesStandard(s, standard) &&
        (q === '' || s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)),
    );
    // Group by sector, preserving first-seen order.
    const bySector = new Map<string, Stock[]>();
    for (const s of compliant) {
      const arr = bySector.get(s.sector) ?? [];
      arr.push(s);
      bySector.set(s.sector, arr);
    }
    return Array.from(bySector.entries());
  }, [stocksQ.data, standard, query]);

  const total = groups.reduce((n, [, arr]) => n + arr.length, 0);

  return (
    <div className="min-h-screen bg-[#0F1724] pb-28">
      <div className="max-w-3xl mx-auto">
        <header className="px-5 pt-6 pb-1">
          <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-1">
            ZaryahPlus · Halal Trading
          </div>
          <h1 className="text-[24px] font-bold text-[#F5E8C7]">Explore</h1>
          <p className="text-[12px] text-[#7A7363] mt-1">
            Shariah-screened stocks, grouped by standard.
          </p>
        </header>

        <TradingDisclaimer />

        <div className="px-3 mt-4">
          {/* Standard selector — the primary grouping. */}
          <div className="flex gap-2">
            {COMPLIANCE_STANDARDS.map((s) => {
              const active = s === standard;
              return (
                <button
                  key={s}
                  onClick={() => setStandard(s)}
                  className={
                    'flex-1 rounded-xl px-2 py-2.5 text-center transition-all border ' +
                    (active
                      ? 'bg-[rgba(123,179,154,0.12)] border-[rgba(123,179,154,0.40)]'
                      : 'bg-[#101a2a] border-[rgba(212,168,83,0.14)] hover:border-[rgba(212,168,83,0.30)]')
                  }
                >
                  <div className={`text-[13px] font-bold ${active ? 'text-[#7BB39A]' : 'text-[#F5E8C7]'}`}>
                    {STANDARD_META[s].label}
                  </div>
                  <div className="text-[9.5px] text-[#5C5749] mt-0.5">{STANDARD_META[s].thresholdPct}%</div>
                </button>
              );
            })}
          </div>
          <p className="text-[10.5px] text-[#5C5749] mt-1.5 px-1">{STANDARD_META[standard].note}</p>

          {/* Search */}
          <div className="mt-3 flex items-center gap-2 px-3 h-11 rounded-xl bg-[#101a2a] border border-[rgba(212,168,83,0.16)]">
            <MagnifyingGlass size={16} weight="bold" className="text-[#5C5749] shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a stock…"
              className="flex-1 bg-transparent text-[13px] text-[#F5E8C7] placeholder:text-[#5C5749] focus:outline-none"
            />
          </div>

          <div className="mt-3 text-[10px] uppercase tracking-widest text-[#5C5749] font-semibold px-1">
            {stocksQ.isLoading ? 'Loading…' : `${total} compliant`}
          </div>

          {/* Sector groups */}
          <div className="mt-2 space-y-4">
            {groups.map(([sector, arr]) => (
              <section key={sector}>
                <div className="flex items-center gap-1.5 px-1 mb-2">
                  <Storefront size={12} weight="bold" className="text-[#7A7363]" />
                  <h2 className="text-[11px] uppercase tracking-widest text-[#7A7363] font-semibold">
                    {sector}
                  </h2>
                </div>
                <div className="space-y-2">
                  {arr.map((s) => (
                    <StockRow key={s.symbol} stock={s} />
                  ))}
                </div>
              </section>
            ))}
            {!stocksQ.isLoading && total === 0 && (
              <p className="text-[12px] text-[#7A7363] px-1 py-6 text-center">
                No compliant stocks match — try a looser standard or clear the search.
              </p>
            )}
          </div>
        </div>
      </div>

      <TradingTabBar active="explore" />
    </div>
  );
}

export default TradingHomePage;
