/**
 * HighlightPalette
 * Small bubble of category swatches shown on top of the floating toolbar.
 * Tapping a swatch applies that category to the active selection.
 */

import { motion } from 'framer-motion';
import type { HighlightCategory } from '../types/quran.types';
import { HIGHLIGHT_CATEGORY_COLORS } from '../types/quran.types';
import { cn } from '@/lib/utils';

interface Props {
  onPick: (category: HighlightCategory) => void;
  active?: HighlightCategory;
}

const LABELS: Record<HighlightCategory, string> = {
  favorite: 'Favorite',
  review: 'Review',
  mistake: 'Mistake',
  note: 'Note',
  custom: 'Other',
};

export function HighlightPalette({ onPick, active }: Props) {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 10, opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.12 }}
      className="fixed left-1/2 -translate-x-1/2 bottom-24 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#0A0E16]/95 border border-white/10 shadow-2xl backdrop-blur-md"
    >
      {(Object.keys(HIGHLIGHT_CATEGORY_COLORS) as HighlightCategory[]).map((cat) => {
        const color = HIGHLIGHT_CATEGORY_COLORS[cat];
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => onPick(cat)}
            title={LABELS[cat]}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium transition-all',
              isActive ? 'ring-2 ring-offset-2 ring-offset-[#0A0E16]' : 'hover:opacity-90',
            )}
            style={{
              backgroundColor: `${color}30`,
              color,
              // @ts-expect-error — tailwind doesn't know about CSS vars here
              '--tw-ring-color': color,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {LABELS[cat]}
          </button>
        );
      })}
    </motion.div>
  );
}
