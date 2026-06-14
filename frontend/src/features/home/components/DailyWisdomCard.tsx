/**
 * DailyWisdomCard
 * Shows ONE companion's wisdom per day (deterministic from day-of-year).
 * All 12 companions rotate, with per-companion accent color theming.
 *
 * SOURCING: Every quote is from a verified Islamic source.
 * - Sahaba/Sahabiyat athar: their own documented words
 * - Hadith: words of the Prophet ﷺ, narrated by the companion shown (prefixed clearly)
 * - Imam statements: from their documented works or reliable biographical sources
 * - Raya: original (AI character, not attributed to any historical figure)
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getDailyWisdom } from './daily-wisdom/_wisdomData';

export function DailyWisdomCard() {
  const navigate = useNavigate();
  const wisdom = useMemo(() => getDailyWisdom(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="px-4"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border p-5',
          'bg-gradient-to-br from-[#0F141F]/60 to-[#0A0E16]/80'
        )}
        style={{ borderColor: `${wisdom.accentColor}25` }}
      >
        {/* Subtle accent glow */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: wisdom.accentColor }}
        />

        {/* Header */}
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${wisdom.accentColor}15` }}
          >
            {wisdom.companionIcon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: wisdom.accentColor }}>
              {wisdom.companionName}
            </p>
            <p className="text-[10px] text-white/40">{wisdom.companionTitle}</p>
          </div>
          <span
            className="px-2 py-0.5 rounded-full text-[9px] font-medium"
            style={{
              backgroundColor: `${wisdom.accentColor}12`,
              color: `${wisdom.accentColor}CC`,
              border: `1px solid ${wisdom.accentColor}20`,
            }}
          >
            {wisdom.topic}
          </span>
        </div>

        {/* Wisdom quote */}
        <div className="relative z-10 mb-2">
          <span
            className="text-2xl leading-none font-display"
            style={{ color: `${wisdom.accentColor}40` }}
          >
            &ldquo;
          </span>
          <p className="text-sm text-[#F5E8C7] italic leading-relaxed pl-2 -mt-2">
            {wisdom.wisdom}
          </p>
        </div>

        {/* Source reference */}
        <p className="relative z-10 text-[10px] text-white/30 mb-4 pl-2">
          {wisdom.source}
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate(`/ai-assistant?companion=${wisdom.companionId}`)}
          className="relative z-10 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: `linear-gradient(135deg, ${wisdom.accentColor}, ${wisdom.accentColor}CC)`,
            color: '#0A0E16',
            boxShadow: `0 2px 12px ${wisdom.accentColor}30`,
          }}
        >
          Ask {wisdom.companionName.split(' ')[0]}
        </button>
      </div>
    </motion.div>
  );
}
