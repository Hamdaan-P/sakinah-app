/**
 * Shared presentational primitives for the Raya hub + dashboard tabs.
 * Extracted so the tab components and the page share one visual language:
 * dark (#0A0E16 / #10151F) + gold (#D4A853).
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { CaretDown } from '@phosphor-icons/react';

export const GOLD = '#D4A853';

/**
 * Renders the first `initial` of `items`, with a "Show all N / Show less"
 * toggle when there are more. Keeps long lists (actions, reminders) compact.
 */
export function Collapsible<T>({
  items,
  initial = 5,
  render,
}: {
  items: T[];
  initial?: number;
  render: (item: T) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, initial);
  const hidden = items.length - shown.length;
  return (
    <>
      <div className="space-y-2">{shown.map(render)}</div>
      {(hidden > 0 || open) && items.length > initial && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#D4A853]/20 text-[#D4A853] text-xs font-semibold hover:bg-[#D4A853]/5 transition-colors"
        >
          {open ? 'Show less' : `Show all ${items.length}`}
          <CaretDown size={13} weight="bold" className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
      )}
    </>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#D4A853]/15 bg-gradient-to-br from-[#10151F] to-[#0A0E16] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4 px-1">
      <h2 className="text-[#F5E8C7] text-lg font-semibold tracking-tight">{children}</h2>
      {hint && <p className="text-[#C9C0A8]/60 text-xs mt-0.5">{hint}</p>}
    </div>
  );
}

/** Centered empty/placeholder state used by every tab when there's no data. */
export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <Card className="p-8 flex flex-col items-center text-center">
      {icon && <div className="mb-3 opacity-60">{icon}</div>}
      <p className="text-[#F5E8C7] text-sm font-medium">{title}</p>
      {hint && <p className="text-[#C9C0A8]/55 text-xs mt-1 max-w-xs">{hint}</p>}
    </Card>
  );
}

/** Simple shimmer row block for loading states. */
export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-2xl border border-[#D4A853]/10 bg-[#10151F]/60 animate-pulse"
        />
      ))}
    </div>
  );
}
