/**
 * Candlestick pattern — stepped reader.
 *
 * Same data shape as the grid (no schema change); the four prose fields
 * + the SVG illustration + the global "observations, not predictions"
 * disclaimer are rebroadcast as 5 ordered steps so chart-literacy
 * content reads like a course, not a paragraph wall.
 *
 * No progress sync to Firestore — chart literacy is pedagogical,
 * not progression-gated.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CaretLeft,
  CaretRight,
  ChartLineUp,
  ChartLineDown,
  CheckCircle,
  Eye,
  Eyeglasses,
  Lightbulb,
  LinkSimple,
  MagnifyingGlass,
  Pulse,
  Sparkle,
  WarningOctagon,
} from '@phosphor-icons/react';
import { eimTrack } from '../analytics';
import { scrollMainToTop } from '@/lib/scroll';
import { CANDLESTICKS } from '../data/knowledge-bank';
import type {
  CandlestickPattern,
  CandlestickSignal,
} from '../data/knowledge-bank';

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

const CATEGORY_LABELS: Record<CandlestickPattern['category'], string> = {
  single: 'Single candle',
  two_candle: 'Two candles',
  three_candle: 'Three candles',
};

interface PatternStep {
  /** Short uppercase tag — "01 · WHAT IT LOOKS LIKE" */
  label: string;
  heading: string;
  /** Lucide-style icon component from Phosphor. */
  Icon: typeof Eye;
  body: string;
  /** Optional inline SVG markup (the first step renders the illustration). */
  svg?: string;
  /** Optional inline SVG of the pattern in market context — used by the
   *  "real example" step so the learner sees the pattern surrounded by
   *  trend candles, not just the isolated shape. */
  contextSvg?: string;
  /** Caption rendered under the SVG (used to label what each diagram is). */
  svgCaption?: string;
  /** Optional warning-styled box (the last step). */
  caution?: boolean;
  /** Optional second-body paragraph for steps that group two related fields
   *  (e.g. confirmation + failure_modes on step 5). */
  body2?: string;
  /** Optional eyebrow above `body2`. */
  body2Label?: string;
}

function buildSteps(p: CandlestickPattern): PatternStep[] {
  const steps: PatternStep[] = [
    {
      label: '01 · What it looks like',
      heading: p.name,
      Icon: Eye,
      body:
        p.aka != null && p.aka.length > 0
          ? `Also known as: ${p.aka}.`
          : 'Study the shape first. The next steps explain what it means.',
      svg: p.svg,
      svgCaption: 'Canonical shape — isolated',
    },
    {
      label: '02 · What it means',
      heading: 'What buyers and sellers did',
      Icon: Lightbulb,
      body: p.meaning,
    },
    {
      label: '03 · How to spot it',
      heading: 'Recognising it on a chart',
      Icon: MagnifyingGlass,
      body: p.recognition,
    },
    {
      label: '04 · A real example',
      heading: 'The pattern in market context',
      Icon: Eyeglasses,
      body: p.example,
      contextSvg: p.example_chart,
      svgCaption: p.example_chart
        ? 'Trend leading in → pattern → trend reacting out'
        : undefined,
    },
  ];

  // Step 5 (conditional) — confirmation + failure modes, rendered only for
  // patterns rich enough to have both fields. This is the most actionable
  // step for an actual reader so we want it as its own moment, not folded
  // into the closing caution.
  if (p.confirmation || p.failure_modes) {
    steps.push({
      label: '05 · How to validate it',
      heading: 'Confirmation & common failures',
      Icon: CheckCircle,
      body: p.confirmation ?? '',
      body2: p.failure_modes,
      body2Label: 'Common failure modes',
    });
  }

  // Final step is always the broad caution + cross-references.
  const lastNumber = String(steps.length + 1).padStart(2, '0');
  steps.push({
    label: `${lastNumber} · A note of caution`,
    heading: 'Observations, not predictions',
    Icon: WarningOctagon,
    body: p.note,
    caution: true,
  });

  return steps;
}

export function EimCandlestickPatternPage() {
  const navigate = useNavigate();
  const { patternId } = useParams<{ patternId: string }>();
  const pattern = useMemo(
    () => CANDLESTICKS.find((p) => p.id === patternId),
    [patternId],
  );

  const steps = useMemo(() => (pattern ? buildSteps(pattern) : []), [pattern]);
  const [stepIdx, setStepIdx] = useState(0);

  // Restart from step 1 whenever the user opens a different pattern via the
  // same component (the route shape is identical, so React keeps the instance).
  // MainLayout already resets <main> scrollTop on route change, but we reset
  // again here as a belt-and-suspenders for the route-pattern-reuse case.
  useEffect(() => {
    setStepIdx(0);
    scrollMainToTop();
  }, [patternId]);

  // Scroll to top on step change — header is sticky so the reader stays oriented.
  // window.scrollTo was a no-op here (the body is overflow-hidden; <main> is the
  // actual scroller) — readers reported landing mid-page after pressing Next.
  useEffect(() => {
    scrollMainToTop();
  }, [stepIdx]);

  // P10 analytics — one event per pattern opened (no properties; the
  // counter just tells us pattern-detail engagement vs grid-only browsing).
  useEffect(() => {
    if (pattern) eimTrack('eim_candlestick_pattern_opened');
  }, [pattern]);

  if (!pattern) {
    return (
      <div className="min-h-screen bg-[#0F1724] flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="text-[12px] uppercase tracking-widest text-[#5C5749] mb-2">
            Pattern not found
          </div>
          <h1 className="text-[18px] font-bold text-[#F5E8C7] mb-3">
            That candlestick isn&apos;t in our catalog
          </h1>
          <button
            onClick={() => navigate('/eim/candlesticks')}
            className="px-4 h-10 rounded-lg bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] text-[12px] font-bold"
          >
            Back to all patterns
          </button>
        </div>
      </div>
    );
  }

  const s = SIGNAL_STYLE[pattern.signal];
  const current = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;
  const isFirst = stepIdx === 0;

  return (
    <div className="min-h-screen bg-[#0F1724] pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Sticky header — step counter + pattern name + signal badge */}
        <header className="sticky top-0 z-10 bg-[#0F1724]/95 backdrop-blur-sm px-5 pt-5 pb-3 border-b border-[rgba(212,168,83,0.10)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/eim/candlesticks')}
              aria-label="Back to all patterns"
              className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
                EIM · Chart Literacy · {CATEGORY_LABELS[pattern.category]}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <h1 className="text-[16px] font-bold text-[#F5E8C7] truncate">
                  {pattern.name}
                </h1>
                <div
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0"
                  style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
                >
                  <s.Icon size={9} weight="bold" />
                  {s.label}
                </div>
              </div>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mt-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all"
                style={{
                  background:
                    i <= stepIdx
                      ? 'linear-gradient(90deg, #D4A853, #E8C97A)'
                      : 'rgba(212,168,83,0.14)',
                }}
              />
            ))}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mt-1.5">
            Step {stepIdx + 1} of {steps.length}
          </div>
        </header>

        {/* Step body */}
        <article className="px-5 mt-5">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#D4A853] mb-2">
            {current.label}
          </div>
          <h2 className="text-[20px] font-bold text-[#F5E8C7] flex items-center gap-2.5 mb-3">
            <current.Icon size={20} weight="bold" className="text-[#D4A853] shrink-0" />
            {current.heading}
          </h2>

          {(current.svg || current.contextSvg) && (
            <figure className="mb-4">
              {/* Context charts are 3:1; canonical-shape charts are 2:1.
                  Using aspect-ratio (not min-height) keeps the SVG snug to
                  its drawing area on every screen width — no letterboxed
                  empty space on mobile. Padding is intentionally light so
                  the chart fills the card edge-to-edge. */}
              <div
                className={
                  'rounded-2xl bg-[#0B121F] border border-[rgba(212,168,83,0.18)] p-2 sm:p-3 ' +
                  (current.contextSvg ? 'aspect-[3/1.05]' : 'aspect-[2/1.1] max-w-xs mx-auto')
                }
                dangerouslySetInnerHTML={{
                  __html: (current.contextSvg || current.svg) as string,
                }}
              />
              {current.svgCaption && (
                <figcaption className="mt-2 text-center text-[10px] sm:text-[10.5px] uppercase tracking-widest text-[#5C5749] font-semibold">
                  {current.svgCaption}
                </figcaption>
              )}
            </figure>
          )}

          <div
            className={
              current.caution
                ? 'rounded-xl sm:rounded-2xl border border-[rgba(251,191,36,0.30)] bg-[rgba(251,191,36,0.05)] p-3.5 sm:p-4 text-[13px] sm:text-[13.5px] text-[#D1D9E5] leading-relaxed'
                : 'text-[13.5px] sm:text-[14px] text-[#D1D9E5] leading-relaxed'
            }
          >
            {current.body}
          </div>

          {/* Second-body block (used by step 5 for failure modes alongside
              confirmation). Distinct visual treatment so the two fields read
              as paired-but-separate. */}
          {current.body2 && (
            <div className="mt-3.5 sm:mt-4 rounded-xl sm:rounded-2xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.04)] p-3.5 sm:p-4">
              {current.body2Label && (
                <div className="text-[10px] uppercase tracking-widest font-bold text-[#FCA5A5] mb-1.5">
                  {current.body2Label}
                </div>
              )}
              <div className="text-[13px] sm:text-[13.5px] text-[#D1D9E5] leading-relaxed">
                {current.body2}
              </div>
            </div>
          )}

          {/* Related-patterns cross-reference on the last step. Encourages
              the reader to learn families of patterns together rather than
              in isolation — which is how chart-readers actually use them. */}
          {isLast && pattern.related && pattern.related.length > 0 && (
            <RelatedPatterns ids={pattern.related} currentId={pattern.id} />
          )}

          {/* Closing CTA on the last step */}
          {isLast && (
            <div className="mt-6 rounded-2xl border border-[rgba(56,189,248,0.30)] bg-[rgba(56,189,248,0.04)] p-4 text-[12.5px] text-[#D1D9E5] leading-relaxed">
              <strong className="text-[#F5E8C7]">Try it next:</strong> open a halal stock
              in the simulator, switch to the monthly view, and see if you can spot this
              shape near a major turning point. Confirmation matters more than the
              pattern alone — wait for the next period&apos;s candle.
            </div>
          )}
        </article>

        {/* Bottom nav — Prev / Next.
            On mobile (<md), MainLayout's BottomNavBar (z-40) lives at bottom-0,
            so we must sit ABOVE it: offset by its 4rem height + safe-area.
            On md+, BottomNavBar is hidden — sit flush at bottom-0. */}
        <nav className="fixed left-0 right-0 z-20 bg-[#0F1724]/95 backdrop-blur-sm border-t border-[rgba(212,168,83,0.10)] bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0">
          <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
            <button
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              className="h-10 px-3 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] text-[#7A7363] text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CaretLeft size={14} weight="bold" />
              Prev
            </button>
            <div className="flex-1 text-center text-[10px] uppercase tracking-widest text-[#5C5749]">
              {current.label.split(' · ')[1]}
            </div>
            {isLast ? (
              <button
                onClick={() => navigate('/eim/candlesticks')}
                className="h-10 px-4 rounded-lg bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] text-[12px] font-bold flex items-center gap-1.5"
              >
                Browse more
                <CaretRight size={14} weight="bold" />
              </button>
            ) : (
              <button
                onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
                className="h-10 px-4 rounded-lg bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] text-[12px] font-bold flex items-center gap-1.5"
              >
                Next
                <CaretRight size={14} weight="bold" />
              </button>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default EimCandlestickPatternPage;


/** Cross-references to other patterns the reader should know alongside
 *  this one. Renders a small grid of clickable cards — each shows the
 *  related pattern's name, signal, and a thumbnail of its canonical shape
 *  (drawn from the same CANDLESTICKS data). */
function RelatedPatterns({ ids, currentId }: { ids: string[]; currentId: string }) {
  const navigate = useNavigate();
  // Look up by id; drop any that no longer exist + the self-reference
  // (defensive — a pattern that lists itself in `related` is a data bug
  // but shouldn't crash the page).
  const items = ids
    .filter((id) => id !== currentId)
    .map((id) => CANDLESTICKS.find((p) => p.id === id))
    .filter((p): p is CandlestickPattern => p !== undefined);

  if (items.length === 0) return null;

  return (
    <div className="mt-5 rounded-xl sm:rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#0B121F] p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
        <LinkSimple size={13} weight="bold" className="text-[#D4A853]" />
        <div className="text-[10px] sm:text-[10.5px] uppercase tracking-widest font-bold text-[#D4A853]">
          Related patterns to learn together
        </div>
      </div>
      {/* 2-col on mobile (~140px cards), 3-col on sm+. gap-2 on mobile for
          a tighter rhythm; the cards themselves are touchable buttons so
          no extra spacing is needed for tap accuracy. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
        {items.map((p) => {
          const s = SIGNAL_STYLE[p.signal];
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/eim/candlesticks/${p.id}`)}
              className="text-left rounded-lg sm:rounded-xl border border-[rgba(212,168,83,0.12)] bg-[#0F1724] hover:border-[rgba(212,168,83,0.30)] active:border-[rgba(212,168,83,0.50)] transition-colors p-2 sm:p-2.5 flex flex-col gap-1.5"
            >
              {/* Canonical-shape thumbnail. Mobile aspect a hair shorter
                  (2/0.95) so the SVG drawing isn't squashed into a sliver
                  at narrow widths. */}
              <div
                className="rounded-md bg-[#0B121F] border border-[rgba(212,168,83,0.12)] aspect-[2/1] overflow-hidden"
                dangerouslySetInnerHTML={{ __html: p.svg }}
              />
              <div className="text-[11.5px] sm:text-[12px] font-bold text-[#F5E8C7] leading-tight line-clamp-2">
                {p.name}
              </div>
              <div
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider self-start whitespace-nowrap"
                style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
              >
                <s.Icon size={8} weight="bold" />
                {s.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
