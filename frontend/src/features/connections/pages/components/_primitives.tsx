/**
 * Small presentational primitives used by the Connections page.
 */

export function Avatar({
  name,
  photoUrl,
  size = 44,
  ring = true,
}: {
  name: string;
  photoUrl: string | null | undefined;
  size?: number;
  ring?: boolean;
}) {
  const initial = (name[0] || 'Z').toUpperCase();
  const inner = size - (ring ? 4 : 0);
  return (
    <div
      className="flex-shrink-0 rounded-2xl flex items-center justify-center"
      style={{
        width: size,
        height: size,
        padding: ring ? 2 : 0,
        background: ring
          ? 'linear-gradient(135deg, rgba(212,168,83,0.6), rgba(232,201,122,0.15))'
          : 'transparent',
      }}
    >
      <div
        className="rounded-[14px] flex items-center justify-center overflow-hidden"
        style={{
          width: inner,
          height: inner,
          background: 'linear-gradient(135deg, #E8C97A, #B8943E)',
          color: '#0A0E16',
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
          fontSize: Math.round(inner * 0.44),
        }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </div>
    </div>
  );
}

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

export function IconBtn({
  children,
  onClick,
  label,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  tone: 'success' | 'muted' | 'primary';
}) {
  const styles =
    tone === 'success'
      ? { background: 'linear-gradient(90deg, #2A9D6F, #47B585)', color: '#fff' }
      : tone === 'primary'
        ? { background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }
        : {
            background: 'rgba(127,138,154,0.15)',
            color: '#7A7363',
            border: '1px solid rgba(212,168,83,0.1)',
          };
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-105"
      style={styles}
    >
      {children}
    </button>
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
