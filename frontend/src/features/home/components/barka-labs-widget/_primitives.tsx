/**
 * Small primitives + loading state for BarkaLabsWidget.
 */

import { cn } from '@/lib/utils';

export function MiniStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
      style={{
        background: 'rgba(10,14,22,0.5)',
        border: '1px solid rgba(212,168,83,0.08)',
      }}
    >
      <span style={{ color }} className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className="text-xs font-bold text-white block leading-none">{value}</span>
        <span className="text-[9px] text-white/40 block mt-0.5">{label}</span>
      </div>
    </div>
  );
}

export function DepthDot({ depth }: { depth: string }) {
  const color =
    depth === 'profound' ? '#D4A853' :
    depth === 'thoughtful' ? '#3ABFAD' :
    '#5B8DEF';
  return (
    <div className="relative shrink-0">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}50` }}
      />
    </div>
  );
}

export function BarkaLabsLoadingState({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-2xl overflow-hidden', className)}
      style={{
        background: 'linear-gradient(135deg, #10151F 0%, #0A0E16 50%, #0F141F 100%)',
        border: '1px solid rgba(212,168,83,0.25)',
      }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#1B6B4A] via-[#D4A853] to-[#1B6B4A]" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
          <div className="space-y-1.5">
            <div className="w-24 h-4 rounded bg-white/5 animate-pulse" />
            <div className="w-16 h-2.5 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-[72px] h-[72px] rounded-full bg-white/5 animate-pulse" />
          <div className="flex-1 grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
