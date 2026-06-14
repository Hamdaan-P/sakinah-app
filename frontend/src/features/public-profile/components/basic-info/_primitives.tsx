/**
 * Small presentational primitives shared between BasicInfoEditor views.
 */

export function Field({
  label,
  children,
  optional,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] uppercase tracking-wider text-[#D4A853]/70 font-semibold">
          {label}
          {optional && <span className="ml-1 text-[#5C5749] normal-case tracking-normal">(optional)</span>}
        </label>
        {hint && <span className="text-[10px] text-[#5C5749]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function GenderChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
      style={{
        background: active ? 'linear-gradient(90deg, #D4A853, #E8C97A)' : 'rgba(36,50,70,0.7)',
        color: active ? '#0A0E16' : '#C9C0A8',
        border: active ? '1px solid rgba(212,168,83,0.4)' : '1px solid rgba(212,168,83,0.15)',
      }}
    >
      {label}
    </button>
  );
}

export function PreviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span className="text-[#5C5749] w-20 flex-shrink-0">{label}</span>
      <span className="text-[#C9C0A8] truncate">{value}</span>
    </div>
  );
}
