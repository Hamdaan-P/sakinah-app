/**
 * Candlestick Pattern Library — browsable grid + stepped reader per pattern.
 *
 * The grid lists every pattern as a compact, one-line-teaser card; tapping
 * a card opens `EimCandlestickPatternPage` which paces the same four prose
 * fields + the SVG + the global caution as 5 ordered steps.
 *
 * Master plan §6.G philosophy: patterns are observations, not predictions.
 * EIM defaults to monthly timeframe; daily/weekly views appear only in
 * lesson mode.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CaretLeft,
  ChartLineUp,
  ChartLineDown,
  Pulse,
  Sparkle,
  Info,
  WarningOctagon,
} from '@phosphor-icons/react';
import { eimTrack } from '../analytics';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { YouTubeEmbed } from '../components/YouTubeEmbed';
import { CANDLESTICKS } from '../data/knowledge-bank';
import type {
  CandlestickCategory,
  CandlestickPattern,
  CandlestickSignal,
} from '../data/knowledge-bank';

/** Optional overview video for the Candlestick Library landing page.
 *  Drop a YouTube URL here (e.g. "how to read candlestick charts") to surface
 *  a player above the pattern grid. Empty string → no video is shown. */
const CANDLESTICK_INTRO_VIDEO = '';

type CategoryFilter = 'all' | CandlestickCategory;
type SignalFilter = 'all' | CandlestickSignal;

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  single: 'Single candle',
  two_candle: 'Two candles',
  three_candle: 'Three candles',
};

const SIGNAL_LABELS: Record<SignalFilter, string> = {
  all: 'All signals',
  bullish_reversal: 'Bullish reversal',
  bearish_reversal: 'Bearish reversal',
  continuation: 'Continuation',
  indecision: 'Indecision',
};

const SIGNAL_STYLE: Record<
  CandlestickSignal,
  { label: string; bg: string; border: string; text: string; Icon: typeof ChartLineUp }
> = {
  bullish_reversal: {
    label: 'Bullish reversal',
    bg: 'rgba(34,197,94,0.10)',
    border: 'rgba(34,197,94,0.35)',
    text: '#86EFAC',
    Icon: ChartLineUp,
  },
  bearish_reversal: {
    label: 'Bearish reversal',
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.35)',
    text: '#FCA5A5',
    Icon: ChartLineDown,
  },
  continuation: {
    label: 'Continuation',
    bg: 'rgba(56,189,248,0.10)',
    border: 'rgba(56,189,248,0.35)',
    text: '#7DD3FC',
    Icon: Sparkle,
  },
  indecision: {
    label: 'Indecision',
    bg: 'rgba(168,85,247,0.10)',
    border: 'rgba(168,85,247,0.35)',
    text: '#D8B4FE',
    Icon: Pulse,
  },
};

export function EimCandlesticksPage() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('all');

  const filtered = useMemo(
    () =>
      CANDLESTICKS.filter(
        (p) =>
          (categoryFilter === 'all' || p.category === categoryFilter) &&
          (signalFilter === 'all' || p.signal === signalFilter),
      ),
    [categoryFilter, signalFilter],
  );

  // P10 analytics — one event per page open, not per pattern.
  useEffect(() => {
    eimTrack('eim_candlesticks_opened');
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-5xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim')}
            aria-label="Back to EIM home"
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
              EIM · Chart Literacy
            </div>
            <h1 className="text-[20px] font-bold text-[#F5E8C7]">
              Candlestick Pattern Library
            </h1>
          </div>
        </header>

        <DisclaimerBanner />

        {/* The honest disclaimer that anchors the whole page */}
        <section className="px-5 mt-3">
          <div className="rounded-xl border border-[rgba(251,191,36,0.30)] bg-[rgba(251,191,36,0.05)] p-4">
            <div className="flex items-start gap-3">
              <WarningOctagon
                size={20}
                weight="fill"
                color="#FBBF24"
                className="shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <div className="text-[12px] uppercase tracking-widest font-bold text-[#FCD34D] mb-1">
                  Observations, not predictions
                </div>
                <div className="text-[12.5px] text-[#D1D9E5] leading-relaxed">
                  Candlestick patterns describe what buyers and sellers <em>did</em> over
                  a period. They do not predict what either party will do next.
                  Most patterns work often enough to be worth studying and often enough
                  to lose money on. EIM defaults to the <strong>monthly timeframe</strong> —
                  daily charts amplify noise and trigger trading behaviour, which is exactly
                  the speculation culture EIM exists to avoid.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Optional overview video (renders only when CANDLESTICK_INTRO_VIDEO set) */}
        {CANDLESTICK_INTRO_VIDEO && (
          <section className="px-5 mt-4">
            <YouTubeEmbed
              url={CANDLESTICK_INTRO_VIDEO}
              title="How to read candlestick charts"
              label="Watch: candlestick basics"
            />
          </section>
        )}

        {/* Filter bar */}
        <section className="px-5 mt-4">
          <div className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-3 space-y-2">
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#D4A853]">
              By candle count
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'single', 'two_candle', 'three_candle'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className="h-8 px-3 rounded-lg text-[11.5px] font-semibold transition-all"
                  style={{
                    background:
                      categoryFilter === c
                        ? 'linear-gradient(90deg, #D4A853, #E8C97A)'
                        : 'rgba(212,168,83,0.06)',
                    color: categoryFilter === c ? '#0A0E16' : '#7A7363',
                    border:
                      categoryFilter === c
                        ? '1px solid transparent'
                        : '1px solid rgba(212,168,83,0.18)',
                  }}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#D4A853] pt-1">
              By signal
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  'all',
                  'bullish_reversal',
                  'bearish_reversal',
                  'continuation',
                  'indecision',
                ] as const
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => setSignalFilter(s)}
                  className="h-8 px-3 rounded-lg text-[11.5px] font-semibold transition-all"
                  style={{
                    background:
                      signalFilter === s
                        ? 'linear-gradient(90deg, #D4A853, #E8C97A)'
                        : 'rgba(212,168,83,0.06)',
                    color: signalFilter === s ? '#0A0E16' : '#7A7363',
                    border:
                      signalFilter === s
                        ? '1px solid transparent'
                        : '1px solid rgba(212,168,83,0.18)',
                  }}
                >
                  {SIGNAL_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="px-5 mt-3 text-[11px] text-[#5C5749]">
          Showing {filtered.length} of {CANDLESTICKS.length} patterns
        </div>

        {/* Pattern grid — each card opens the stepped reader. */}
        <section className="px-3 mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <PatternCard
              key={p.id}
              pattern={p}
              onOpen={() => navigate(`/eim/candlesticks/${p.id}`)}
            />
          ))}
        </section>

        {filtered.length === 0 && (
          <div className="px-5 mt-8 text-center text-[12px] text-[#5C5749] italic">
            No patterns match these filters.
          </div>
        )}

        {/* Pedagogical footer */}
        <section className="px-5 mt-6">
          <div className="rounded-xl border border-[rgba(56,189,248,0.30)] bg-[rgba(56,189,248,0.04)] p-4 flex items-start gap-3">
            <Info size={16} weight="fill" color="#38BDF8" className="shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#D1D9E5] leading-relaxed">
              <strong className="text-[#F5E8C7]">How to use these:</strong> open a halal stock
              in the simulator, switch to the monthly view, and look for these shapes near major
              turning points. Confirmation matters more than the pattern alone — wait for the
              next period's candle before treating any signal as meaningful. Patterns appearing
              in choppy, sideways markets carry far less weight than the same pattern at the end
              of a clear, extended trend.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function PatternCard({
  pattern,
  onOpen,
}: {
  pattern: CandlestickPattern;
  onOpen: () => void;
}) {
  const s = SIGNAL_STYLE[pattern.signal];
  // One-line teaser — the first sentence of the meaning, capped so the grid
  // stops looking like a wall of text. The stepped reader carries the full
  // prose.
  const teaser = oneLine(pattern.meaning);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${pattern.name} pattern lesson`}
      className="text-left rounded-2xl border bg-[#101a2a] p-4 hover:border-[rgba(212,168,83,0.45)] hover:bg-[#121f31] transition-all flex flex-col"
      style={{ borderColor: 'rgba(212,168,83,0.18)' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] font-bold text-[#F5E8C7] truncate">{pattern.name}</div>
          {pattern.aka && (
            <div className="text-[10.5px] text-[#5C5749] italic mt-0.5 truncate">aka {pattern.aka}</div>
          )}
        </div>
        <div
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0"
          style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
        >
          <s.Icon size={11} weight="bold" />
          {s.label}
        </div>
      </div>

      {/* SVG illustration — kept; the visual is the point of the card. */}
      <div
        className="rounded-xl bg-[#0B121F] border border-[rgba(212,168,83,0.10)] mb-3 p-3"
        style={{ height: 100 }}
        dangerouslySetInnerHTML={{ __html: pattern.svg }}
      />

      {/* One-line teaser + open-lesson hint */}
      <div className="text-[12px] text-[#7A7363] leading-relaxed line-clamp-2 mb-2 min-h-[2.6em]">
        {teaser}
      </div>
      <div className="text-[10.5px] uppercase tracking-widest font-bold text-[#D4A853] flex items-center gap-1.5 mt-auto">
        Read the 5-step lesson
        <span aria-hidden="true">→</span>
      </div>
    </button>
  );
}

function oneLine(s: string): string {
  // First sentence (split on . ! ? but keep an ellipsis if the sentence
  // didn't end cleanly).
  const m = s.match(/^[^.!?]+[.!?]/);
  return m ? m[0].trim() : s;
}

export default EimCandlesticksPage;
