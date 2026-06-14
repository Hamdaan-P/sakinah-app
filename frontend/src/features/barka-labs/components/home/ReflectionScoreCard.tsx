/**
 * ReflectionScoreCard — 4-dimension reflection score breakdown (uniqueness,
 * depth, specificity, perspective).
 */

import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { Sparkle } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';
import { card, cardHover } from './_styles';

interface ReflectionScoreCardProps {
  creativity: { total: number; uniqueness: number; depth: number; specificity: number; perspective: number };
  onClick: () => void;
}

export function ReflectionScoreCard({ creativity, onClick }: ReflectionScoreCardProps) {
  const { t } = useTranslation('demo');
  const displayFont = getDemoDisplayFont();

  return (
    <div
      role="button"
      tabIndex={0}
      className={`rounded-2xl p-4 md:p-6 cursor-pointer ${cardHover}`}
      style={card}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(215,181,106,0.12)' }}>
            <Sparkle size={20} weight="duotone" style={{ color: '#D7B56A' }} />
          </div>
          <div>
            <span className="text-[13px] md:text-[15px] font-bold text-[#EBDCB8]">{t('home.reflection.title')}</span>
            <p className="text-[10px] m-0" style={{ color: C.t3 }}>{t('home.reflection.subtitle')}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl md:text-3xl font-bold text-[#D7B56A]" style={{ fontFamily: displayFont }}>{creativity.total}</span>
          <span className="text-xs text-[#A7B1C0]">/100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${creativity.total}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldL})` }} />
      </div>

      {/* 4 dimensions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: t('reflection.dim.uniqueness'), value: creativity.uniqueness, max: 25, color: '#3ABFAD' },
          { label: t('reflection.dim.depth'), value: creativity.depth, max: 25, color: '#2A9D6F' },
          { label: t('reflection.dim.specificity'), value: creativity.specificity, max: 25, color: '#5B8DEF' },
          { label: t('reflection.dim.perspective'), value: creativity.perspective, max: 25, color: '#8B7EC8' },
        ].map(d => (
          <div key={d.label} className="text-center">
            <div className="text-base md:text-lg font-bold" style={{ fontFamily: displayFont, color: d.color }}>{d.value}</div>
            <div className="h-1 rounded-full overflow-hidden mb-1 mx-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: `${(d.value / d.max) * 100}%`, background: d.color }} />
            </div>
            <span className="text-[9px] font-medium" style={{ color: C.t3 }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
