/**
 * Single portfolio — positions list + add-position wizard + run-analysis CTA.
 *
 * Simulator v2 changes:
 *   - Add-position flow is now a 3-step wizard (ticker search → date+qty →
 *     confirm), open to any yfinance-listed ticker. The curated ASSETS list
 *     is shown as "suggested starters" inside step 1.
 *   - Holding cards render from the buy-date-aware performance response, so
 *     non-whitelisted tickers display correctly. Each card has a lazy
 *     "Fundamentals" drawer showing the last 4 quarters.
 *   - Per-position "Since you bought" labels appear automatically when a
 *     position is younger than the 30/365-day window.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CaretDown, CaretLeft, CaretUp, ChartLineUp, Plus, Sparkle, TrashSimple } from '@phosphor-icons/react';
import { eimTrack } from '../analytics';
import { AddPositionWizard } from '../components/AddPositionWizard';
import { CurrencyPicker } from '../components/CurrencyPicker';
import { DataQualityStrip } from '../components/DataQualityStrip';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { FeatureIntro } from '../components/FeatureIntro';
import { FetchError } from '../components/FetchError';
import { InvestabilityRing } from '../components/InvestabilityRing';
import { MonthlyPriceChart } from '../components/MonthlyPriceChart';
import { QuarterlyDrawer } from '../components/QuarterlyDrawer';
import { SimulationModePill } from '../components/SimulationModePill';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import type { Currency } from '../stores/currency.store';
import { TimeTravelPanel } from '../components/TimeTravelPanel';
import { TripleShariahRings } from '../components/TripleShariahRings';
import { useEimStreakHeartbeat } from '../hooks/useEimStreakHeartbeat';
import { eimService } from '../services/eim.service';
import type { PortfolioPositionPerf } from '../services/eim.service';
import { useEimStore } from '../stores/eim.store';
import type { Asset, Position } from '../types/eim.types';

/** Collapsible monthly price chart drawer — only fetches OHLC when opened.
 *  Lazy on purpose: a portfolio with 12 positions shouldn't fire 12 history
 *  requests on mount. The user opens the drawers they care about. */
function MonthlyPriceDrawer({ ticker }: { ticker: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 pt-3 border-t border-[rgba(212,168,83,0.10)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#D4A853]">
          <ChartLineUp size={12} weight="bold" />
          Monthly chart
        </span>
        {open ? (
          <CaretUp size={12} weight="bold" className="text-[#5C5749]" />
        ) : (
          <CaretDown size={12} weight="bold" className="text-[#5C5749]" />
        )}
      </button>
      {open && (
        <div className="mt-3">
          <MonthlyPriceChart ticker={ticker} />
        </div>
      )}
    </div>
  );
}

/** Lazy-loads the investability score for one ticker and renders the ring. */
function PositionInvestabilityRing({ ticker }: { ticker: string }) {
  const q = useQuery({
    queryKey: ['eim', 'investability', ticker],
    queryFn: () => eimService.getInvestability(ticker),
    staleTime: 5 * 60_000,
  });
  return (
    <div className="mt-3 pt-3 border-t border-[rgba(212,168,83,0.10)]">
      <InvestabilityRing score={q.data} loading={q.isLoading} size="md" drilldown="collapsed" />
    </div>
  );
}

/** A single holding row. Pulls live snapshot (price, name, Shariah) lazily,
 *  then renders the quarterly drawer + investability ring underneath.
 *  Reports its converted total value via `onValueChange` so the hero can
 *  sum across positions in the user's chosen display currency. */
function HoldingCard({
  position,
  curated,
  perf,
  onRemove,
  onOpenUlama,
  onValueChange,
}: {
  position: Position;
  curated: Asset | undefined;
  perf: PortfolioPositionPerf | undefined;
  onRemove: () => void;
  onOpenUlama: (topic: string) => void;
  onValueChange?: (id: string, valueInDisplayCcy: number | null) => void;
}) {
  const snapQ = useQuery({
    queryKey: ['eim', 'snapshot', position.ticker],
    queryFn: () => eimService.getStockSnapshot(position.ticker),
    staleTime: 5 * 60_000,
  });
  const { format, convert, ratesReady } = useCurrencyFormat();
  const snap = snapQ.data;
  const name = curated?.name || snap?.name || position.ticker;
  const currentPrice = perf?.current_price ?? snap?.quote.close ?? position.buy_price;
  const value = perf?.current_value ?? currentPrice * position.qty;
  // The holding's native currency — snapshot is authoritative; curated
  // assets are seed USD; fall back to USD if neither is available yet.
  const nativeCcy = (snap?.currency as Currency | undefined) || 'USD';
  const triple = curated?.triple_shariah ?? snap?.shariah ?? null;
  const isCrypto = curated?.asset_class === 'crypto';

  // Bubble the converted value up so the hero can sum positions even when
  // they span multiple home currencies.
  useEffect(() => {
    if (!onValueChange) return;
    if (!ratesReady && nativeCcy !== 'USD') {
      onValueChange(position.id, null);
      return;
    }
    onValueChange(position.id, convert(value, nativeCcy));
  }, [position.id, value, nativeCcy, ratesReady, convert, onValueChange]);

  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.14)] bg-[#101a2a] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-[#F5E8C7]">{position.ticker}</span>
            <span className="text-[10px] text-[#5C5749]">·</span>
            <span className="text-[11px] text-[#7A7363] truncate">{name}</span>
          </div>
          <div className="text-[10px] text-[#5C5749] mt-0.5">
            {position.qty} × {format(currentPrice, nativeCcy)} ={' '}
            <span className="text-[#D4A853] font-semibold">
              {format(value, nativeCcy)}
            </span>
          </div>
          {perf?.anchored_to_buy_date && perf.since_buy_pct != null && (
            <div className="text-[10px] mt-1">
              <span className={perf.since_buy_pct >= 0 ? 'text-[#22C55E]' : 'text-[#E84393]'}>
                {perf.since_buy_pct >= 0 ? '▲' : '▼'} {Math.abs(perf.since_buy_pct).toFixed(2)}%
              </span>{' '}
              <span className="text-[#5C5749]">{perf.since_buy_label}</span>
            </div>
          )}
        </div>
        <button
          onClick={onRemove}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C5749] hover:text-[#E84393] hover:bg-[rgba(232,67,147,0.10)]"
          aria-label="Remove position"
        >
          <TrashSimple size={14} weight="bold" />
        </button>
      </div>

      {snap?.data_quality && snap.data_quality.severity !== 'none' && (
        <div className="mt-3">
          <DataQualityStrip dq={snap.data_quality} compact />
        </div>
      )}

      {triple && (
        <div className="mt-3">
          <TripleShariahRings data={triple} />
        </div>
      )}

      <PositionInvestabilityRing ticker={position.ticker} />
      <MonthlyPriceDrawer ticker={position.ticker} />
      <QuarterlyDrawer ticker={position.ticker} />

      {isCrypto && (
        <button
          onClick={() => onOpenUlama('bitcoin')}
          className="mt-2.5 w-full text-left text-[11px] text-[#A855F7] hover:underline italic"
        >
          ⚠ Scholarly disagreement — open Ulama Screening (Bitcoin) →
        </button>
      )}
    </div>
  );
}

export function EimPortfolioPage() {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  useEimStreakHeartbeat();
  const portfolio = useEimStore((s) => s.portfolios.find((p) => p.id === portfolioId));
  const addPosition = useEimStore((s) => s.addPosition);
  const removePosition = useEimStore((s) => s.removePosition);
  const [wizardOpen, setWizardOpen] = useState(false);
  const { format, displayCurrency } = useCurrencyFormat();

  // Map: positionId → converted-into-display-currency value. Holdings push
  // into this via the onValueChange callback once their snapshot loads.
  const [convertedValues, setConvertedValues] = useState<Record<string, number | null>>({});
  const handleValueChange = useCallback((id: string, v: number | null) => {
    setConvertedValues((prev) => (prev[id] === v ? prev : { ...prev, [id]: v }));
  }, []);

  const assetsQ = useQuery({
    queryKey: ['eim', 'assets'],
    queryFn: eimService.getAssets,
    staleTime: 5 * 60_000,
  });
  const assets = assetsQ.data;

  const perfQ = useQuery({
    queryKey: ['eim', 'portfolio-perf', portfolio?.id, portfolio?.positions.length],
    queryFn: () => eimService.getPortfolioPerformance(portfolio!),
    enabled: !!portfolio && portfolio.positions.length > 0,
    staleTime: 60_000,
  });
  const perf = perfQ.data;
  const perfByTicker = new Map((perf?.positions ?? []).map((p) => [p.ticker, p]));

  // Hero total — sum the per-holding values *after* conversion into the
  // user's chosen display currency. Falls back to the curated-asset price
  // (USD) when a holding's snapshot hasn't loaded yet, so the hero never
  // flashes empty. Must run before the early-return below to satisfy
  // rules-of-hooks; handles the null-portfolio case internally.
  const heroTotal = useMemo(() => {
    if (!portfolio) return { value: 0, allConverted: true };
    let sum = 0;
    let allConverted = true;
    for (const pos of portfolio.positions) {
      const v = convertedValues[pos.id];
      if (v == null) {
        const a = assets?.find((x) => x.ticker === pos.ticker);
        sum += a ? a.price * pos.qty : pos.buy_price * pos.qty;
        allConverted = false;
      } else {
        sum += v;
      }
    }
    return { value: sum, allConverted };
  }, [portfolio, convertedValues, assets]);

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-[#0F1724] flex flex-col items-center justify-center text-[#5C5749] text-[13px]">
        Portfolio not found.
        <button
          onClick={() => navigate('/eim/simulator')}
          className="mt-3 px-4 py-2 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.20)] text-[#D4A853] text-[12px]"
        >
          Back to portfolios
        </button>
      </div>
    );
  }

  const handleAdd = (input: {
    ticker: string;
    qty: number;
    buy_price: number;
    buy_date: string;
  }) => {
    addPosition(portfolio.id, input);
    eimTrack('eim_simulator_position_added');
    setWizardOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0F1724] pb-28">
      <div className="max-w-3xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim/simulator')}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853]"
            aria-label="Back"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">Portfolio</div>
            <h1 className="text-[20px] font-bold text-[#F5E8C7] truncate">{portfolio.name}</h1>
          </div>
          <CurrencyPicker />
          <FeatureIntro featureId="portfolio" />
        </header>

        <SimulationModePill />
        <DisclaimerBanner />

        {assetsQ.error && (
          <FetchError
            error={assetsQ.error}
            retry={() => void assetsQ.refetch()}
            context="asset list"
          />
        )}

        <div className="px-3 mt-4 space-y-3">
          {/* Hero */}
          <div className="rounded-2xl border border-[rgba(212,168,83,0.20)] bg-[#101a2a] p-5">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-1 flex items-center justify-between">
              <span>Simulated value · {displayCurrency}</span>
              {!heroTotal.allConverted && portfolio.positions.length > 0 && (
                <span className="text-[#5C5749] normal-case tracking-normal text-[10px] italic">
                  converting…
                </span>
              )}
            </div>
            <div className="text-[28px] font-bold text-[#F5E8C7]">
              {format(heroTotal.value, displayCurrency, { compact: heroTotal.value >= 100_000 })}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px]">
              {perf && perf.positions_priced > 0 ? (
                <>
                  <span className={perf.monthly_pct >= 0 ? 'text-[#22C55E]' : 'text-[#E84393]'}>
                    {perf.monthly_pct >= 0 ? '▲' : '▼'} {Math.abs(perf.monthly_pct).toFixed(2)}% this month
                  </span>
                  <span className={perf.yearly_pct >= 0 ? 'text-[#22C55E]' : 'text-[#E84393]'}>
                    {perf.yearly_pct >= 0 ? '▲' : '▼'} {Math.abs(perf.yearly_pct).toFixed(2)}% YoY
                  </span>
                </>
              ) : perfQ.isLoading && portfolio.positions.length > 0 ? (
                <span className="text-[#5C5749]">computing performance…</span>
              ) : null}
              <span className="text-[#5C5749]">· Monthly &amp; yearly only — no daily P&amp;L</span>
            </div>
          </div>

          {/* Add position — button or wizard */}
          {!wizardOpen ? (
            <button
              onClick={() => setWizardOpen(true)}
              className="w-full h-11 rounded-xl bg-[#101a2a] border border-dashed border-[rgba(212,168,83,0.30)] hover:border-[rgba(212,168,83,0.50)] text-[#D4A853] text-[13px] font-semibold flex items-center justify-center gap-2"
            >
              <Plus size={14} weight="bold" /> Add a position
            </button>
          ) : (
            <AddPositionWizard
              suggestedStarters={assets ?? []}
              onCancel={() => setWizardOpen(false)}
              onSubmit={handleAdd}
            />
          )}

          {/* Positions */}
          {portfolio.positions.length === 0 ? (
            <div className="text-center py-8 text-[12px] text-[#5C5749]">
              Empty portfolio. Add a position to begin.
            </div>
          ) : (
            <div className="space-y-2.5">
              {portfolio.positions.map((pos) => {
                const curated = assets?.find((x) => x.ticker === pos.ticker);
                return (
                  <HoldingCard
                    key={pos.id}
                    position={pos}
                    curated={curated}
                    perf={perfByTicker.get(pos.ticker)}
                    onRemove={() => removePosition(portfolio.id, pos.id)}
                    onOpenUlama={(topic) => navigate(`/eim/ulama?topic=${topic}`)}
                    onValueChange={handleValueChange}
                  />
                );
              })}
            </div>
          )}

          {portfolio.positions.length > 0 && (
            <>
              <TimeTravelPanel portfolio={portfolio} />
              <button
                onClick={() => navigate(`/eim/mentor?portfolio=${portfolio.id}`)}
                className="w-full h-12 rounded-xl text-[13px] font-bold text-[#0A0E16] flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(90deg, #2A9D6F, #7BB39A)' }}
              >
                <Sparkle size={16} weight="bold" /> Run AI Mentor analysis →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EimPortfolioPage;
