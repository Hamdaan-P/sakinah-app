/**
 * SimTimeline — Market Rewind progress + event-marker bar (Sprint 8).
 *
 * Per master plan §6.R deps (`SimTimeline.tsx`) + D35. Gives the user
 * spatial awareness of where they are in the historical window: a filled
 * progress track from start → current sim date → end, with markers for the
 * events they've already crossed.
 *
 * READ-ONLY by design. D35 envisioned a draggable scrubber, but after the
 * step-mode pivot (manual "Step" replaced continuous play) a drag-to-jump
 * interaction fights three things: sim_date is forward-only (D34), arbitrary
 * jumps would skip the per-step interrupt + event surfacing that carry the
 * pedagogy, and the state firewall forbids revealing where *future* events
 * sit. So the bar shows only crossed events and never accepts backward (or
 * skip-ahead) input — advancing stays the job of the Step control. This is
 * the mobile-first spatial cue D35 wanted, minus the fragile gesture.
 *
 * FIREWALL: callers must pass only events with date <= simDate (i.e.
 * `engine.visibleEvents()`); plotting a future event's position would leak
 * "something big happens at X".
 */

import type { SimEventCard } from '../types/eim.types';

const SEVERITY_TINT: Record<string, string> = {
  extreme: '#E84393',
  high: '#E8C97A',
  moderate: '#82B1FF',
  low: '#7BB39A',
};

function toMs(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1);
}

/** Fraction (0..1) of `at` within [start, end]; clamped. */
function fraction(start: string, end: string, at: string): number {
  const t0 = toMs(start);
  const t1 = toMs(end);
  if (t1 <= t0) return 0;
  const f = (toMs(at) - t0) / (t1 - t0);
  return Math.max(0, Math.min(1, f));
}

export function SimTimeline({
  startDate,
  simDate,
  endDate,
  events,
}: {
  startDate: string;
  simDate: string;
  endDate: string;
  /** Crossed events only (date <= simDate) — see firewall note above. */
  events: readonly SimEventCard[];
}) {
  const progress = fraction(startDate, endDate, simDate);
  const pct = Math.round(progress * 100);

  return (
    <div
      className="mt-3"
      role="img"
      aria-label={`Timeline: ${pct}% through the period from ${startDate} to ${endDate}. Current sim date ${simDate}. ${events.length} event${events.length === 1 ? '' : 's'} seen so far.`}
    >
      <div className="relative h-6">
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-[#0A0E16] border border-[rgba(212,168,83,0.12)]" />
        {/* Filled progress */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, rgba(212,168,83,0.5), #D4A853)' }}
        />
        {/* Crossed-event markers */}
        {events.map((ev) => {
          const f = fraction(startDate, endDate, ev.date);
          return (
            <span
              key={ev.id}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-[#0F1724]"
              style={{ left: `${f * 100}%`, background: SEVERITY_TINT[ev.severity] ?? '#7A7363' }}
              title={`${ev.date} · ${ev.headline}`}
            />
          );
        })}
        {/* "You are here" handle */}
        <span
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#F5E8C7] border-2 border-[#D4A853] shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1 text-[9px] text-[#5C5749] tabular-nums">
        <span>{startDate.slice(0, 7)}</span>
        <span className="text-[#9A927E]">{pct}% through</span>
        <span>{endDate.slice(0, 7)}</span>
      </div>
    </div>
  );
}

export default SimTimeline;
