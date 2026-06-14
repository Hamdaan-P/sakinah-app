/**
 * Tarbiyah card — Quranic principle anchor (Mizan-style).
 * Closes every lesson and appears on the EIM home as the daily verse.
 */

import type { TarbiyahVerse } from '../types/eim.types';

interface Props {
  verse: TarbiyahVerse;
  compact?: boolean;
}

export function TarbiyahCard({ verse, compact = false }: Props) {
  return (
    <div
      className="rounded-2xl border border-[rgba(123,158,137,0.20)] p-5"
      style={{
        background:
          'linear-gradient(135deg, rgba(42,157,111,0.10) 0%, rgba(123,158,137,0.04) 100%)',
      }}
    >
      <div className="text-[10px] uppercase tracking-widest text-[#7BB39A] font-semibold mb-2.5">
        🌿 Tarbiyah — Principle
      </div>
      <p
        className="text-right text-[#F5E8C7] font-medium mb-3 leading-loose"
        style={{ fontFamily: "'Amiri', serif", fontSize: compact ? '18px' : '22px' }}
        dir="rtl"
      >
        {verse.arabic}
      </p>
      <p className="text-[#C9D4E0] text-sm leading-relaxed italic mb-1.5">
        &ldquo;{verse.translation}&rdquo;
      </p>
      <p className="text-[#5C5749] text-[11px]">— {verse.citation}</p>
    </div>
  );
}
