/**
 * "How to improve" growth-tips card: lists DIMs sorted by weakest first.
 */

import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { Lightbulb, Target } from '@phosphor-icons/react';
import { cardStyle } from '../../barka-labs.constants';
import type { DimDef } from './_data';

interface GrowthTipsCardProps {
  dims: (DimDef & { score: number })[];
}

export function GrowthTipsCard({ dims }: GrowthTipsCardProps) {
  const { t } = useTranslation('demo');
  const hFont: React.CSSProperties = { fontFamily: getDemoDisplayFont() };

  return (
    <div className="rounded-2xl p-5" style={cardStyle}>
      <div className="flex items-center gap-2 text-base font-semibold mb-4" style={{ ...hFont, color: '#EBDCB8' }}>
        <Lightbulb size={20} style={{ color: '#D7B56A' }} />
        {t('reflection.howToImprove')}
      </div>

      {dims.map((dim, i) => {
        const isFocusArea = i === 0;
        return (
          <div
            key={dim.key}
            className={i < dims.length - 1 ? 'mb-4 pb-4' : ''}
            style={{ borderBottom: i < dims.length - 1 ? '1px solid rgba(240,237,230,0.06)' : 'none' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[13px] font-bold" style={{ color: dim.color }}>{t(`reflection.dim.${dim.key}`)}</span>
              <span className="text-[10px] font-bold" style={{ color: '#7F8A9A' }}>{dim.score}/25</span>
              {isFocusArea && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full ms-auto" style={{ background: 'rgba(224,122,107,0.15)', color: '#E07A6B' }}>
                  <Target size={10} weight="fill" className="inline me-0.5" style={{ verticalAlign: -1 }} />
                  {t('reflection.focusArea')}
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#D5DDEA' }}>{t(`reflection.tip.${dim.key}.growth`)}</p>
          </div>
        );
      })}
    </div>
  );
}
