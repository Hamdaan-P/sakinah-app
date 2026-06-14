/**
 * Warm, on-brand loading state for EIM learning pages.
 *
 * Replaces the bare "Loading…" text with a gentle pulsing skeleton that
 * mirrors the shape of a level/lesson card, plus a friendly line of copy.
 * Keeps the user oriented (they can see *what* is coming) instead of staring
 * at a dead string.
 */

interface EimLoadingProps {
  /** Friendly line shown under the skeleton. */
  label?: string;
  /** How many skeleton card rows to show (defaults to 3). */
  rows?: number;
}

export function EimLoading({ label = 'Getting your lessons ready…', rows = 3 }: EimLoadingProps) {
  return (
    <div className="px-3 mt-4" role="status" aria-live="polite">
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[rgba(212,168,83,0.12)] bg-[#101a2a] p-4 animate-pulse"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl shrink-0 bg-[rgba(212,168,83,0.08)]" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-2.5 w-20 rounded-full bg-[rgba(212,168,83,0.10)]" />
                <div className="h-3.5 w-3/5 rounded-full bg-[rgba(212,168,83,0.10)]" />
                <div className="h-1.5 w-full rounded-full bg-[rgba(212,168,83,0.06)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-center text-[11.5px] text-[#7A7363]">{label}</div>
    </div>
  );
}

export default EimLoading;
