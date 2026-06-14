/**
 * SimInterruptBanner — Smart Interrupt surface for the Time Machine.
 * Sprint 4b — D9 + D27 layer a.
 *
 * Renders a single high-priority interrupt at the top of the active
 * session view. The user can dismiss it or escalate to a follow-up
 * Q&A with the same lens via the existing AskPersonaModal (pre-
 * populated with the interrupt's event context).
 *
 * Capped per-session at the backend's MAX_INTERRUPTS_PER_SESSION (5).
 * The banner itself does not enforce the cap — the backend's
 * /check-interrupts endpoint refuses to return more than 5.
 */

import { ChatCircleDots, WarningCircle, X } from '@phosphor-icons/react';
import type { InterruptCard } from '../types/eim.types';

const SEVERITY_STYLES: Record<InterruptCard['severity'], { border: string; text: string; bg: string }> = {
  caution: {
    border: 'border-[rgba(232,201,122,0.40)]',
    text: 'text-[#E8C97A]',
    bg: 'bg-[rgba(232,201,122,0.10)]',
  },
  high: {
    border: 'border-[rgba(212,168,83,0.55)]',
    text: 'text-[#D4A853]',
    bg: 'bg-[rgba(212,168,83,0.10)]',
  },
  extreme: {
    border: 'border-[rgba(232,67,147,0.55)]',
    text: 'text-[#E84393]',
    bg: 'bg-[rgba(232,67,147,0.08)]',
  },
};

/** Tiny inline **bold** renderer for the pre-can body strings. Matches
 *  the style used by other EIM surfaces (no markdown library — the
 *  content vocabulary is intentionally narrow). */
function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-[#F5E8C7] font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export interface SimInterruptBannerProps {
  interrupt: InterruptCard;
  onDismiss: () => void;
  onAskFollowUp: (interrupt: InterruptCard) => void;
}

export function SimInterruptBanner({ interrupt, onDismiss, onAskFollowUp }: SimInterruptBannerProps) {
  const styles = SEVERITY_STYLES[interrupt.severity];
  return (
    <div
      role="alert"
      className={`rounded-2xl border ${styles.border} ${styles.bg} p-4 space-y-3`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <WarningCircle size={16} weight="fill" className={styles.text} />
          <span className={`text-[10px] uppercase tracking-widest font-semibold ${styles.text}`}>
            {interrupt.kind === 'drawdown' ? 'Drawdown alert' : 'A lens has a thought'}
          </span>
          <span className="text-[10px] text-[#7A7363]">·</span>
          <span className="text-[10px] uppercase tracking-widest text-[#7A7363]">
            {interrupt.persona_label}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#7A7363] hover:text-[#F5E8C7] -mt-1 -mr-1 p-1"
          aria-label="Dismiss interrupt"
        >
          <X size={14} weight="bold" />
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="text-[14px] font-bold text-[#F5E8C7] leading-snug">
          {interrupt.headline}
        </h3>
        <div className="text-[12px] text-[#C9C0AB] leading-relaxed space-y-2">
          {interrupt.body.split(/\n\s*\n/).map((para, i) => (
            <p key={i}>{renderInlineBold(para)}</p>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onAskFollowUp(interrupt)}
          className="h-9 px-3 rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.30)] text-[11px] font-semibold text-[#D4A853] flex items-center gap-1.5 hover:border-[rgba(212,168,83,0.55)]"
        >
          <ChatCircleDots size={13} weight="bold" /> Ask a follow-up
        </button>
        <button
          onClick={onDismiss}
          className="h-9 px-3 rounded-lg text-[11px] text-[#7A7363] hover:text-[#F5E8C7]"
        >
          Got it
        </button>
        <div className="ml-auto text-[10px] text-[#5C5749] uppercase tracking-widest">
          sim · {interrupt.sim_date}
        </div>
      </div>
    </div>
  );
}
