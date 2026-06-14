/**
 * AyahMinimap
 * Thin right-edge rail showing a dot per ayah. Each dot is colored by
 * hifz status + bookmark + mistake presence. Tap to scroll to that ayah.
 * Hides on narrow screens (where the rail would crowd the reader).
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { AyahHifzRecord, QuranLine } from '../types/quran.types';

interface Props {
  lines: QuranLine[];
  records: AyahHifzRecord[];
  bookmarkedKeys: Set<string>;
  activeKey?: string | null;
  onJump: (verseKey: string) => void;
}

const STATUS_COLOR: Record<string, string> = {
  new:       'bg-white/15',
  learning:  'bg-[#D4A853]',
  memorized: 'bg-[#4FB892]',
  mastered:  'bg-emerald-400',
};

export function AyahMinimap({ lines, records, bookmarkedKeys, activeKey, onJump }: Props) {
  const recordByKey = useMemo(() => {
    const m = new Map<string, AyahHifzRecord>();
    for (const r of records) m.set(r.verseKey, r);
    return m;
  }, [records]);

  if (lines.length === 0) return null;

  return (
    <div className="hidden md:flex fixed right-2 top-1/2 -translate-y-1/2 z-20 max-h-[75vh] flex-col items-center gap-[3px] overflow-y-auto px-1 py-2 rounded-full bg-[#0A0E16]/80 border border-white/5 backdrop-blur">
      {lines.map((line) => {
        const rec = recordByKey.get(line.verseKey);
        const status = rec?.status ?? 'new';
        const hasMistakes = !!rec?.mistakeCount;
        const isActive = activeKey === line.verseKey;
        const isBookmarked = bookmarkedKeys.has(line.verseKey);
        return (
          <button
            key={line.verseKey}
            onClick={() => onJump(line.verseKey)}
            title={`${line.verseKey}${rec ? ` · ${rec.status}` : ''}${hasMistakes ? ` · ${rec?.mistakeCount} mistakes` : ''}`}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              STATUS_COLOR[status],
              isActive && 'w-3 h-3 ring-2 ring-[#D4A853] ring-offset-1 ring-offset-[#0A0E16]',
              hasMistakes && !isActive && 'ring-1 ring-red-400/60',
              isBookmarked && 'outline outline-1 outline-offset-1 outline-[#D4A853]/70',
            )}
          />
        );
      })}
    </div>
  );
}
