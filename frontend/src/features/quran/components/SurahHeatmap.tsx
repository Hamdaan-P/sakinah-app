/**
 * SurahHeatmap
 * Grid of cells, one per ayah, colored by hifz status and mistake count.
 * Shows the entire surah at a glance — great for progress dashboards.
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { AyahHifzRecord } from '../types/quran.types';

interface Props {
  surahId: number;
  versesCount: number;
  records: AyahHifzRecord[];
  onCellClick?: (verseKey: string) => void;
  cellSize?: number;
}

const STATUS_COLOR: Record<string, string> = {
  new:         '#2A3347',  // empty
  learning:    '#D4A853',  // gold
  memorized:   '#4FB892',  // teal
  mastered:    '#7FC98A',  // green
};

export function SurahHeatmap({ surahId, versesCount, records, onCellClick, cellSize = 18 }: Props) {
  const byKey = useMemo(() => {
    const m = new Map<string, AyahHifzRecord>();
    for (const r of records) if (r.surahId === surahId) m.set(r.verseKey, r);
    return m;
  }, [surahId, records]);

  // Compute max mistakes for shading
  const maxMistakes = useMemo(() => {
    let max = 0;
    for (const r of records) if (r.surahId === surahId && r.mistakeCount > max) max = r.mistakeCount;
    return max || 1;
  }, [surahId, records]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-[10px] text-white/50">
        <Legend color={STATUS_COLOR.new} label="New" />
        <Legend color={STATUS_COLOR.learning} label="Learning" />
        <Legend color={STATUS_COLOR.memorized} label="Memorized" />
        <Legend color={STATUS_COLOR.mastered} label="Mastered" />
        <span className="ml-auto opacity-60">Red tint = mistake density</span>
      </div>
      <div
        className="flex flex-wrap gap-[3px]"
        style={{ width: '100%' }}
      >
        {Array.from({ length: versesCount }).map((_, i) => {
          const verseNum = i + 1;
          const verseKey = `${surahId}:${verseNum}`;
          const rec = byKey.get(verseKey);
          const status = rec?.status ?? 'new';
          const bg = STATUS_COLOR[status];
          const mistakeIntensity = rec ? Math.min(1, rec.mistakeCount / maxMistakes) : 0;
          return (
            <button
              key={verseKey}
              onClick={() => onCellClick?.(verseKey)}
              title={`${verseKey} · ${status}${rec?.mistakeCount ? ` · ${rec.mistakeCount} mistakes` : ''}`}
              className={cn(
                'rounded-[3px] relative transition-transform hover:scale-125 hover:z-10',
                onCellClick ? 'cursor-pointer' : 'cursor-default',
              )}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: bg,
                boxShadow: mistakeIntensity > 0 ? `inset 0 0 0 2px rgba(232,113,113,${mistakeIntensity.toFixed(2)})` : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
