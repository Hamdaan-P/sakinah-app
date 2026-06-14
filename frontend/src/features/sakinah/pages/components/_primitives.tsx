/**
 * Small presentational primitives used by the Sakinah pages.
 */

export function StatPill({
  icon,
  label,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{
        background: accent ? 'rgba(212,168,83,0.12)' : 'rgba(36,50,70,0.6)',
        color: accent ? '#D4A853' : '#7A7363',
        border: `1px solid ${accent ? 'rgba(212,168,83,0.28)' : 'rgba(212,168,83,0.12)'}`,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

export function LoadingShell() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 rounded-2xl bg-[#0F141F]/40 animate-pulse" />
      ))}
    </div>
  );
}
