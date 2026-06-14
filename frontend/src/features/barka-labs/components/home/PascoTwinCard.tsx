/**
 * PascoTwinCard — "Build your AI assistant" combined PASCO + Twin progress card.
 * Reads `pasco_result` from localStorage for dimension scores when available.
 */

import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { Brain, ArrowRight } from '@phosphor-icons/react';
import { card, cardHover } from './_styles';

interface PascoTwinCardProps {
  twinPct: number;
  onClick: () => void;
}

export function PascoTwinCard({ twinPct, onClick }: PascoTwinCardProps) {
  const { t } = useTranslation('demo');
  const displayFont = getDemoDisplayFont();

  let pascoData: { dimensionScores: Record<string, number>; archetype: { name: string } } | null = null;
  try { const s = localStorage.getItem('pasco_result'); if (s) pascoData = JSON.parse(s); } catch { /* best-effort */ }

  const dims = [
    { key: 'P', color: '#5B8DEF' },
    { key: 'A', color: '#2A9D6F' },
    { key: 'S', color: '#D7B56A' },
    { key: 'CO', color: '#8B7EC8' },
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      className={`rounded-2xl p-5 md:p-7 cursor-pointer ${cardHover}`}
      style={{ ...card, borderColor: 'rgba(91,141,239,0.2)' }}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      {/* Header: title + twin % */}
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(91,141,239,0.15), rgba(139,126,200,0.15))' }}>
            <Brain size={24} weight="duotone" className="text-[#5B8DEF]" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-[#EBDCB8] leading-tight" style={{ fontFamily: displayFont }}>{t('home.pasco.title')}</h3>
            {pascoData && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: 'rgba(139,126,200,0.12)', color: '#8B7EC8' }}>{t(`pasco.archetype.${pascoData.archetype.name}`)}</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl md:text-3xl font-bold text-[#5B8DEF]" style={{ fontFamily: displayFont }}>{twinPct}%</span>
          <p className="text-[9px] text-[#7F8A9A] mt-0.5">{t('home.twin.title')}</p>
        </div>
      </div>

      {/* Twin progress bar */}
      <div className="h-2.5 md:h-3 rounded-full mb-4 md:mb-5" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${twinPct}%`, background: 'linear-gradient(90deg, #5B8DEF, #8B7EC8)' }} />
      </div>

      {pascoData ? (
        <>
          {/* 4 dimension bars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {dims.map(d => {
              const val = pascoData!.dimensionScores[d.key] || 0;
              return (
                <div key={d.key} className="flex items-center gap-2">
                  <span className="text-[11px] md:text-[12px] text-[#A7B1C0] font-medium">{t(`pasco.dim.${d.key}`)}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${val}%`, background: d.color }} />
                  </div>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: d.color }}>{val}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[#5B8DEF] flex items-center gap-1.5 font-medium">
            {t('report.tapBreakdown')} <ArrowRight size={12} />
          </p>
        </>
      ) : (
        <>
          {/* CTA to start assessment */}
          <p className="text-sm mb-3" style={{ color: '#A7B1C0' }}>{t('home.pasco.ctaDesc')}</p>
          <p className="text-xs text-[#5B8DEF] flex items-center gap-1.5 font-semibold">
            {t('home.pasco.ctaAction')} <ArrowRight size={12} />
          </p>
        </>
      )}
    </div>
  );
}
