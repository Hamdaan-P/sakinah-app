/**
 * SimEventCard — Tier 1 event card surfaced in the Time Machine
 * right-rail (Sprint 3).
 *
 * Per master plan §6.R cross-cutting infrastructure. Renders when
 * sim_date crosses (or recently crossed) the event date — the engine
 * filters via `visibleEvents({ lookbackDays })`, so this component
 * never receives future-dated events.
 *
 * The "ask persona" CTA is a Sprint 4 wiring point — for v1 it logs
 * the intent so we can see how often users would tap it.
 */

import { useState } from 'react';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import type { SimEventCard as SimEventCardType, SimEventSeverity } from '../types/eim.types';

const SEVERITY_STYLES: Record<SimEventSeverity, { dot: string; chip: string; label: string }> = {
  low: { dot: 'bg-[#5C5749]', chip: 'text-[#7A7363] border-[rgba(122,115,99,0.30)]', label: 'low' },
  moderate: { dot: 'bg-[#5FC986]', chip: 'text-[#5FC986] border-[rgba(95,201,134,0.30)]', label: 'moderate' },
  high: { dot: 'bg-[#E8C97A]', chip: 'text-[#E8C97A] border-[rgba(232,201,122,0.30)]', label: 'high' },
  extreme: { dot: 'bg-[#E84393]', chip: 'text-[#E84393] border-[rgba(232,67,147,0.30)]', label: 'extreme' },
};

const CATEGORY_LABELS: Record<string, string> = {
  financial_crisis: 'Financial crisis',
  pandemic: 'Pandemic',
  geopolitical: 'Geopolitical',
  central_bank: 'Central bank',
  tech: 'Tech',
  commodity: 'Commodity',
  policy: 'Policy',
  election: 'Election',
};

export interface SimEventCardProps {
  event: SimEventCardType;
  /** Sim-date when this card is rendered — controls the "today" / "X days
   *  ago" label so the user understands the temporal proximity. */
  simDate: string;
  /** Sprint 4 wiring point — not used in v1, just emits intent. */
  onAskPersona?: (event: SimEventCardType) => void;
}

function daysBetween(from: string, to: string): number {
  const a = Date.parse(from);
  const b = Date.parse(to);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

export function SimEventCard({ event, simDate, onAskPersona }: SimEventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_STYLES[event.severity];
  const daysAgo = daysBetween(event.date, simDate);
  const proximityLabel =
    daysAgo === 0 ? 'today'
    : daysAgo === 1 ? '1 day ago'
    : daysAgo < 30 ? `${daysAgo} days ago`
    : daysAgo < 365 ? `${Math.round(daysAgo / 30)} months ago`
    : `${(daysAgo / 365).toFixed(1)} years ago`;

  return (
    <article className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
      {/* Item 8: bigger, more legible type. */}
      <header className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={'w-2.5 h-2.5 rounded-full ' + sev.dot} aria-hidden />
        <span className={'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ' + sev.chip}>
          {sev.label}
        </span>
        <span className="text-[11px] text-[#7A7363] font-medium">
          {CATEGORY_LABELS[event.category] ?? event.category}
        </span>
        <span className="ml-auto text-[11px] text-[#7A7363]">
          {event.date} · {proximityLabel}
        </span>
      </header>

      <h3 className="text-[15px] font-bold text-[#F5E8C7] leading-snug tracking-tight">
        {event.headline}
      </h3>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-2.5 flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#D4A853] font-semibold hover:text-[#E8C97A]"
        aria-expanded={expanded}
      >
        {expanded ? 'Less' : 'More'}
        {expanded ? <CaretUp size={11} weight="bold" /> : <CaretDown size={11} weight="bold" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <p className="text-[14px] text-[#C9C0A8] leading-relaxed whitespace-pre-wrap">
            {event.context}
          </p>
          {event.islamic_lens && (
            <div className="text-[13px] text-[#D4A853] leading-relaxed border-l-2 border-[rgba(212,168,83,0.40)] pl-3 py-1">
              <span className="text-[10px] uppercase tracking-wider font-bold block mb-1 text-[#E8C97A]">
                Halal Lens
              </span>
              {event.islamic_lens}
            </div>
          )}
          {onAskPersona && (
            <button
              onClick={() => onAskPersona(event)}
              className="text-[11px] uppercase tracking-wider text-[#5C5749] hover:text-[#D4A853] font-semibold"
            >
              Ask the Steward →
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default SimEventCard;
