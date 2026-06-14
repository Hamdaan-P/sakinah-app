/**
 * Progression title card — shows the user's current level (Foundations,
 * Asset Basics, ...). Hero card on the EIM home.
 */

interface Props {
  titleEn: string;
  levelOrder: number;
  description: string;
  progressPct: number;
  nextTitle?: string;
}

export function ProgressTitleCard({
  titleEn,
  levelOrder,
  description,
  progressPct,
  nextTitle,
}: Props) {
  return (
    <div
      className="rounded-2xl border border-[rgba(212,168,83,0.25)] p-5"
      style={{
        background:
          'linear-gradient(135deg, rgba(212,168,83,0.12) 0%, rgba(42,157,111,0.04) 100%)',
      }}
    >
      <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold mb-2">
        Your Investor Persona
      </div>
      <div className="text-[#D4A853] text-[12px] font-semibold mb-1 uppercase tracking-widest">
        Level {levelOrder}
      </div>
      <div className="text-[#F5E8C7] text-[28px] font-extrabold mb-1 leading-tight">
        {titleEn}
      </div>
      <div className="text-[12px] text-[#7A7363] mb-3 italic">{description}</div>
      <div className="h-1.5 rounded-full bg-[rgba(212,168,83,0.15)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.max(2, Math.min(100, progressPct))}%`,
            background: 'linear-gradient(90deg, #D4A853, #E8C97A)',
          }}
        />
      </div>
      {nextTitle && (
        <div className="text-[10px] text-[#5C5749] mt-2">
          {Math.round(progressPct)}% · Next: <span className="text-[#D4A853]">{nextTitle}</span>
        </div>
      )}
    </div>
  );
}
