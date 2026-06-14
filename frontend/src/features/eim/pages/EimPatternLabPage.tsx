/**
 * EIM Pattern Lab (Pattern Spotting, Phase C).
 *
 * The dedicated home for learning to *read a chart*. Two modes:
 *   - Explore — pick any stock; its monthly chart opens with pattern-spotting
 *     already on, so a beginner immediately sees patterns marked and can tap
 *     each to learn what usually comes before + after (with disclaimers).
 *   - Famous examples — curated real historical windows (from each pattern's
 *     `example_ref`) rendered in-context, so teaching never depends on a live
 *     chart happening to contain a clean pattern.
 *
 * All detection is the deterministic frontend engine (`patternDetection.ts`);
 * the charts own the detection + annotation (Phase B), this page just frames
 * them and routes the teaching card.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CaretLeft, MagnifyingGlass, GraduationCap } from '@phosphor-icons/react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { FeatureIntro } from '../components/FeatureIntro';
import { MonthlyPriceChart } from '../components/MonthlyPriceChart';
import { SimCandlestickChart } from '../components/SimCandlestickChart';
import { PatternInsightCard } from '../components/PatternInsightCard';
import { SimTickerPicker } from '../components/SimTickerPicker';
import { CANDLESTICKS } from '../data/knowledge-bank';
import type { CandlestickPattern, CandlestickSignal } from '../data/knowledge-bank/schema';
import { eimService } from '../services/eim.service';

const signalColour = (s: CandlestickSignal): string =>
  s === 'bullish_reversal'
    ? '#5FC986'
    : s === 'bearish_reversal'
      ? '#E84393'
      : s === 'continuation'
        ? '#82B1FF'
        : '#9A927E';

const MONTH_LABEL = (m: string) => {
  // m is YYYY-MM
  const [y, mm] = m.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const idx = Number(mm) - 1;
  return `${names[idx] ?? mm} ${y}`;
};

export function EimPatternLabPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'explore' | 'examples'>('explore');
  // SimTickerPicker is array-based; we keep only the most recent pick (single-select).
  const [exploreTickers, setExploreTickers] = useState<string[]>(['AAPL']);
  const [activeExampleId, setActiveExampleId] = useState<string | null>(null);
  const [learnId, setLearnId] = useState<string | null>(null);

  const exploreTicker = exploreTickers[0];
  const examples = useMemo(() => CANDLESTICKS.filter((c) => c.example_ref), []);
  const activeExample = activeExampleId
    ? CANDLESTICKS.find((c) => c.id === activeExampleId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-3xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim')}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
            aria-label="Back to EIM home"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">EIM · Learn</div>
            <h1 className="text-[20px] font-bold text-[#F5E8C7]">Pattern Lab</h1>
          </div>
          <FeatureIntro featureId="pattern-lab" />
        </header>

        <DisclaimerBanner />

        {/* Intro */}
        <div className="mx-3 mt-3 rounded-2xl border border-[rgba(212,168,83,0.20)] bg-[#101a2a] p-4">
          <p className="text-[12px] text-[#C9C0AB] leading-relaxed">
            Learn to <span className="text-[#F5E8C7] font-semibold">read the chart itself</span>.
            Patterns are highlighted for you — tap any marked one to learn what usually comes
            <span className="text-[#82B1FF]"> before</span> it and what often happens
            <span className="text-[#5FC986]"> after</span>. Remember: a pattern is an observation of
            past price action, <span className="text-[#E8C97A]">not a prediction</span>, and on
            monthly charts it's weaker — what the next month does matters more than the shape.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="mx-3 mt-3 flex gap-1.5">
          {(['explore', 'examples'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={
                'flex-1 h-9 rounded-lg text-[12px] font-bold border transition-colors ' +
                (mode === m
                  ? 'border-[rgba(212,168,83,0.50)] bg-[rgba(212,168,83,0.12)] text-[#F5E8C7]'
                  : 'border-[rgba(212,168,83,0.18)] bg-[#101a2a] text-[#7A7363] hover:text-[#D4A853]')
              }
            >
              {m === 'explore' ? 'Explore a stock' : 'Famous examples'}
            </button>
          ))}
        </div>

        {mode === 'explore' ? (
          <div className="mx-3 mt-3 space-y-3">
            <div className="rounded-2xl border border-[rgba(212,168,83,0.20)] bg-[#101a2a] p-4">
              <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold mb-2">
                Pick any stock
              </div>
              <SimTickerPicker
                selected={exploreTickers}
                onChange={(next) => setExploreTickers(next.length ? [next[next.length - 1]] : [])}
              />
            </div>

            {exploreTicker ? (
              <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-3">
                <MonthlyPriceChart
                  ticker={exploreTicker}
                  defaultRange="10y"
                  heightPx={280}
                  defaultShowPatterns
                  defaultChartMode="candles"
                />
                <p className="text-[10px] text-[#7A7363] leading-snug mt-2 px-1">
                  Spotting is on. Tap a marker or a chip to learn the pattern. Seeing none? Clean
                  patterns are rarer on monthly charts — widen to 10Y or try another stock.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-8 text-center">
                <MagnifyingGlass size={28} weight="duotone" className="mx-auto text-[#5C5749] mb-2" />
                <div className="text-[12px] text-[#7A7363]">Search or tap a stock to start spotting.</div>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-3 mt-3 space-y-3">
            {!activeExample ? (
              <>
                <p className="text-[11px] text-[#7A7363] px-1 leading-relaxed">
                  Real historical moments where each pattern showed up. Open one to see it in context —
                  the chart highlights what the detector finds in that window.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {examples.map((c) => {
                    const colour = signalColour(c.signal);
                    const ref = c.example_ref!;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveExampleId(c.id)}
                        className="text-left rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-3 hover:border-[rgba(212,168,83,0.35)] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colour }} />
                          <span className="text-[13px] font-bold text-[#F5E8C7]">{c.name}</span>
                        </div>
                        <div className="text-[11px] text-[#9A927E] mt-1">
                          {ref.ticker} · {MONTH_LABEL(ref.start_month)} – {MONTH_LABEL(ref.end_month)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setActiveExampleId(null)}
                  className="text-[11px] text-[#D4A853] flex items-center gap-1 hover:underline"
                >
                  <CaretLeft size={12} weight="bold" /> All examples
                </button>
                <div>
                  <h2 className="text-[16px] font-bold text-[#F5E8C7]">{activeExample.name}</h2>
                  <div className="text-[11px] text-[#9A927E]">
                    Documented on {activeExample.example_ref!.ticker} ·{' '}
                    {MONTH_LABEL(activeExample.example_ref!.start_month)} –{' '}
                    {MONTH_LABEL(activeExample.example_ref!.end_month)}
                  </div>
                </div>

                <FamousExampleChart pattern={activeExample} />

                <button
                  onClick={() => setLearnId(activeExample.id)}
                  className="w-full h-10 rounded-xl text-[12px] font-bold text-[#0A0E16] flex items-center justify-center gap-1.5"
                  style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
                >
                  <GraduationCap size={15} weight="bold" /> Learn the {activeExample.name}
                </button>
                <p className="text-[10px] text-[#7A7363] leading-snug px-1">
                  The chart highlights what the detector finds in this window — tap any bracket, or use
                  the button for this pattern's full lesson. Detection on monthly bars is conservative,
                  so it may bracket the moment slightly differently than the textbook ideal.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {learnId && <PatternInsightCard patternId={learnId} onClose={() => setLearnId(null)} />}
    </div>
  );
}

/** Fetches the documented ticker's full history, slices to the example window,
 *  and renders it with pattern-spotting on. */
function FamousExampleChart({ pattern }: { pattern: CandlestickPattern }) {
  const ref = pattern.example_ref!;
  const start = `${ref.start_month}-01`;
  const end = `${ref.end_month}-28`;

  const q = useQuery({
    queryKey: ['eim', 'monthly-ohlc', ref.ticker, 'max'],
    queryFn: () => eimService.getStockMonthly(ref.ticker, 'max'),
    staleTime: 60 * 60_000,
  });

  const bars = useMemo(
    () => (q.data?.bars ?? []).filter((b) => b.time >= start && b.time <= end),
    [q.data, start, end],
  );

  const currency = q.data?.currency;
  const formatPrice = useMemo(() => {
    const suffix = currency && currency !== 'USD' ? ` ${currency}` : '';
    const prefix = !currency || currency === 'USD' ? '$' : '';
    return (n: number) =>
      n >= 1000 ? `${prefix}${(n / 1000).toFixed(1)}k${suffix}` : `${prefix}${n.toFixed(2)}${suffix}`;
  }, [currency]);

  if (q.isLoading) {
    return (
      <div className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#0A0E16] p-8 text-center text-[12px] text-[#D4A853] animate-pulse">
        Loading {ref.ticker}…
      </div>
    );
  }
  if (q.isError || bars.length === 0) {
    return (
      <div className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#0A0E16] p-6 text-center text-[11px] text-[#7A7363]">
        Couldn't load the chart for <span className="text-[#F5E8C7] font-bold">{ref.ticker}</span> right
        now. The full lesson below still covers the pattern.
      </div>
    );
  }

  return (
    <SimCandlestickChart
      ticker={ref.ticker}
      bars={bars}
      windowStart={start}
      windowEnd={end}
      asOf={ref.end_month}
      formatPrice={formatPrice}
      defaultShowPatterns
      defaultChartMode="candles"
    />
  );
}

export default EimPatternLabPage;
