/**
 * AiDisclaimerBanner
 *
 * Mandatory banner at the top of every AI-touching surface in Rayah Plus
 * Quran. Copy follows the PDF spec (Section 7 — AI Governance + Section 10 —
 * calm aesthetic). No emojis. Source-constraint is explicit.
 */

interface Props {
  /** Compact mode for tight spaces (e.g. inside a side drawer). */
  compact?: boolean;
  className?: string;
}

const FULL_COPY =
  'AI-assisted. Responses are constrained to verified scholarly sources and citation-checked before display. For rulings on sensitive matters, please confirm with a qualified scholar.';

const COMPACT_COPY =
  'AI-assisted · responses cited from verified sources · confirm sensitive rulings with a qualified scholar.';

export function AiDisclaimerBanner({ compact = false, className }: Props) {
  return (
    <div
      role="note"
      aria-label="AI governance notice"
      className={`flex items-start gap-3 rounded-md border border-gold/30 bg-gold/5 text-slate-700 dark:text-slate-200 ${
        compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
      } ${className ?? ''}`}
    >
      <span
        aria-hidden="true"
        className={`shrink-0 inline-flex items-center justify-center rounded-full bg-gold/20 text-gold font-semibold ${
          compact ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-xs'
        }`}
      >
        i
      </span>
      <p className="leading-relaxed">{compact ? COMPACT_COPY : FULL_COPY}</p>
    </div>
  );
}
