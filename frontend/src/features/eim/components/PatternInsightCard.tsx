/**
 * PatternInsightCard — the shared teaching popover for a candlestick pattern
 * spotted on a live chart (EIM Pattern Spotting, Phase A).
 *
 * Given a catalog `patternId` (from `engine/patternDetection.ts`), it resolves
 * the full entry in `knowledge-bank/candlesticks.ts` and teaches it the way the
 * founder asked: the shape, **what usually comes before**, **what often happens
 * after** — always framed as a *tendency, not a prediction* and wrapped in a
 * non-dismissible disclaimer (per §6.G: patterns are observations, not signals
 * to trade on; on monthly bars they're weaker and confirmation matters more).
 *
 * Presentational + self-contained: render it with a `patternId` to open, pass
 * `null` to keep it closed. "Learn the full pattern" routes to the existing
 * stepped reader at /eim/candlesticks/:id.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChartLineDown, ChartLineUp, Pulse, Sparkle, Warning, X } from '@phosphor-icons/react';
import { CANDLESTICKS } from '../data/knowledge-bank';
import type { CandlestickSignal } from '../data/knowledge-bank/schema';
import type { PatternConfidence } from '../engine/patternDetection';

const SIGNAL_STYLE: Record<
  CandlestickSignal,
  { label: string; bg: string; border: string; text: string; Icon: typeof ChartLineUp }
> = {
  bullish_reversal: { label: 'Bullish reversal', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.35)', text: '#86EFAC', Icon: ChartLineUp },
  bearish_reversal: { label: 'Bearish reversal', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)', text: '#FCA5A5', Icon: ChartLineDown },
  continuation: { label: 'Continuation', bg: 'rgba(56,189,248,0.10)', border: 'rgba(56,189,248,0.35)', text: '#7DD3FC', Icon: Sparkle },
  indecision: { label: 'Indecision', bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.35)', text: '#D8B4FE', Icon: Pulse },
};

const CATEGORY_LABELS = {
  single: 'Single candle',
  two_candle: 'Two candles',
  three_candle: 'Three candles',
} as const;

export interface PatternInsightCardProps {
  /** Catalog id of the spotted pattern, or null to render nothing. */
  patternId: string | null;
  /** Detection confidence — surfaced as an honest chip. */
  confidence?: PatternConfidence;
  onClose: () => void;
}

export function PatternInsightCard({ patternId, confidence, onClose }: PatternInsightCardProps) {
  const navigate = useNavigate();

  // Close on Escape while open.
  useEffect(() => {
    if (!patternId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [patternId, onClose]);

  if (!patternId) return null;
  const pattern = CANDLESTICKS.find((c) => c.id === patternId);
  if (!pattern) return null;

  const sig = SIGNAL_STYLE[pattern.signal];
  const titleId = `pattern-insight-${pattern.id}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />

      {/* Card */}
      <div className="relative w-full sm:max-w-md max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-[rgba(212,168,83,0.30)] bg-[#101a2a] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start gap-3 p-4 bg-[#101a2a] border-b border-[rgba(212,168,83,0.14)]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-widest font-semibold"
                style={{ background: sig.bg, border: `1px solid ${sig.border}`, color: sig.text }}
              >
                <sig.Icon size={10} weight="bold" /> {sig.label}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#5C5749] px-1.5 py-0.5 rounded border border-[rgba(212,168,83,0.16)]">
                {CATEGORY_LABELS[pattern.category]}
              </span>
              {confidence && (
                <span
                  className={
                    'text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border ' +
                    (confidence === 'strong'
                      ? 'text-[#D4A853] border-[rgba(212,168,83,0.40)] bg-[rgba(212,168,83,0.10)]'
                      : 'text-[#9A927E] border-[rgba(154,146,126,0.30)] bg-[rgba(154,146,126,0.08)]')
                  }
                  title={
                    confidence === 'strong'
                      ? 'Clear textbook form on this monthly chart.'
                      : 'Looser monthly form — weaker evidence; weigh it lightly.'
                  }
                >
                  {confidence} match
                </span>
              )}
            </div>
            <h2 id={titleId} className="text-[17px] font-bold text-[#F5E8C7] leading-tight">
              {pattern.name}
            </h2>
            {pattern.aka && (
              <div className="text-[10px] text-[#7A7363] mt-0.5">also: {pattern.aka}</div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7363] hover:text-[#F5E8C7] hover:bg-[rgba(255,255,255,0.06)] flex-shrink-0"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div
          className="p-4 space-y-3.5"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Shape */}
          <div className="rounded-xl border border-[rgba(212,168,83,0.16)] bg-[#0A0E16] p-3">
            <div
              className="mx-auto"
              style={{ width: 120, height: 64 }}
              aria-hidden
              dangerouslySetInnerHTML={{ __html: pattern.svg }}
            />
          </div>

          <Section label="What it is" body={pattern.meaning} />
          {pattern.context_before && (
            <Section label="What usually comes before" body={pattern.context_before} accent="#82B1FF" />
          )}
          {pattern.typical_after && (
            <Section label="What often happens after" body={pattern.typical_after} accent="#5FC986" />
          )}
          {pattern.failure_modes && (
            <Section label="When it fizzles" body={pattern.failure_modes} accent="#E8C97A" />
          )}

          {/* Mandatory disclaimer — never dismissible. */}
          <div className="rounded-xl border border-[rgba(232,201,122,0.30)] bg-[rgba(232,201,122,0.07)] p-3 flex items-start gap-2">
            <Warning size={14} weight="fill" className="text-[#E8C97A] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#D9CFB4] leading-relaxed">
              A pattern is an <strong>observation of past price behaviour, not a prediction</strong>.
              The "after" above is a historical tendency that often fails — on monthly charts the signal
              is weaker, and what the <em>next</em> month does matters more than the shape itself. This is
              educational, not financial advice.
            </p>
          </div>

          {/* Learn more */}
          <button
            onClick={() => {
              onClose();
              navigate(`/eim/candlesticks/${pattern.id}`);
            }}
            className="w-full h-10 rounded-xl text-[12px] font-bold text-[#0A0E16] flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
          >
            Learn the full pattern <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, body, accent }: { label: string; body: string; accent?: string }) {
  return (
    <div>
      <div
        className="text-[10px] uppercase tracking-widest font-semibold mb-1"
        style={{ color: accent ?? '#D4A853' }}
      >
        {label}
      </div>
      <p className="text-[12px] text-[#C9C0AB] leading-relaxed">{body}</p>
    </div>
  );
}

export default PatternInsightCard;
