/**
 * QuickStats — 2x2 / 1x4 grid of high-level metrics (gratitudes, streak,
 * profound, percentile) that link to detail screens.
 */

import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { Sparkle, Fire, Users, BookOpen } from '@phosphor-icons/react';
import type { BarkaLabsStats, PercentileData } from '../../types/barka-labs.types';
import type { BarkaLabsScreen } from '../../pages/BarkaLabsPage';
import { card, cardHover } from './_styles';
import { SectionTitle } from './SectionTitle';

interface QuickStatsProps {
  stats: BarkaLabsStats;
  percentile: PercentileData | null;
  go: (s: BarkaLabsScreen) => void;
}

export function QuickStats({ stats, percentile, go }: QuickStatsProps) {
  const { t } = useTranslation('demo');
  const displayFont = getDemoDisplayFont();

  const items = [
    { label: t('home.stats.gratitudes'), value: stats.total_blessings, icon: BookOpen, color: '#8B7EC8', onClick: () => go('journal') },
    { label: t('home.stats.streak'), value: `${stats.current_streak}d`, icon: Fire, color: '#F5C842', onClick: () => go('journal') },
    { label: t('home.stats.profound'), value: stats.profound_count, icon: Sparkle, color: '#D7B56A', onClick: () => go('journal') },
    { label: t('home.stats.percentile'), value: percentile?.percentile != null ? `Top ${Math.round(100 - percentile.percentile)}%` : '—', icon: Users, color: '#3ABFAD', onClick: () => go('community') },
  ];

  return (
    <div>
      <SectionTitle>{t('home.stats.title')}</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {items.map(m => (
          <div
            key={m.label}
            role="button"
            tabIndex={0}
            className={`rounded-2xl p-4 md:p-6 cursor-pointer flex items-center gap-3 md:gap-4 ${cardHover}`}
            style={card}
            onClick={m.onClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); m.onClick(); } }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${m.color}15` }}>
              <m.icon size={20} weight="duotone" style={{ color: m.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] md:text-[13px] text-[#A7B1C0]">{m.label}</p>
              <p className="text-xl md:text-2xl font-bold text-[#EBDCB8]" style={{ fontFamily: displayFont }}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
