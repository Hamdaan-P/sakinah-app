/**
 * 7-day reflection-score trend chart for the Reflection detail screen.
 */

import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { TrendUp } from '@phosphor-icons/react';
import { cardStyle } from '../../barka-labs.constants';

interface TrendChartProps {
  trend: { day: string; avg: number; count: number }[];
  trendMax: number;
}

export function TrendChart({ trend, trendMax }: TrendChartProps) {
  const { t } = useTranslation('demo');
  const hFont: React.CSSProperties = { fontFamily: getDemoDisplayFont() };

  return (
    <div className="rounded-2xl p-5" style={cardStyle}>
      <div className="flex items-center gap-2 text-[15px] font-semibold mb-4" style={{ ...hFont, color: '#EBDCB8' }}>
        <TrendUp size={18} style={{ color: '#D7B56A' }} />
        {t('reflection.trend')}
      </div>

      {trend.every(d => d.avg === 0) ? (
        <p className="text-xs text-center py-6" style={{ color: '#7F8A9A' }}>{t('reflection.trendEmpty')}</p>
      ) : (
        <div className="flex items-end justify-between gap-1.5" style={{ height: 140 }}>
          {trend.map((d) => {
            const pct = trendMax > 0 ? (d.avg / trendMax) * 100 : 0;
            const isHigh = d.avg >= 60;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
                {d.avg > 0 && (
                  <span className="text-[10px] font-semibold mb-1" style={{ color: isHigh ? '#D7B56A' : '#2A9D6F' }}>
                    {d.avg}
                  </span>
                )}
                <div
                  className="w-full max-w-[32px] rounded-md transition-all duration-500"
                  style={{
                    height: d.avg > 0 ? `${pct}%` : '4px',
                    background: d.avg > 0
                      ? isHigh ? 'linear-gradient(180deg, #E8C97A, #D7B56A)' : 'linear-gradient(180deg, #2A9D6F, #1B6B4A)'
                      : 'rgba(255,255,255,0.06)',
                    minHeight: 4,
                  }}
                />
                <span className="text-[10px] mt-1.5" style={{ color: d.count > 0 ? '#A7B1C0' : '#7F8A9A' }}>{d.day}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
