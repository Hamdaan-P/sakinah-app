/**
 * Reflection Score Detail — Real data trends, dynamic tips, best blessings, PASCO connection.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { ArrowLeft, Sparkle, Trophy, Brain } from '@phosphor-icons/react';
import { cardStyle, computeReflectionScore } from '../barka-labs.constants';
import type { Blessing, BarkaLabsStats } from '../types/barka-labs.types';
import type { PascoResult } from '../data/pasco-scoring';
import { DIMS, ARCHETYPE_INSIGHTS, buildDailyTrend, findBestBlessings } from './creativity/_data';
import { TrendChart } from './creativity/TrendChart';
import { BestReflectionsCard } from './creativity/BestReflectionsCard';
import { GrowthTipsCard } from './creativity/GrowthTipsCard';

type BarkaLabsScreen = 'home' | 'report' | 'levels' | 'creativity' | 'journal' | 'challenge' | 'dnz' | 'community';

interface Props {
  stats: BarkaLabsStats;
  blessings: Blessing[];
  go: (s: BarkaLabsScreen) => void;
}

export function CreativityDetail({ stats, blessings, go }: Props) {
  const { t } = useTranslation('demo');
  const hFont: React.CSSProperties = { fontFamily: getDemoDisplayFont() };
  // Use real per-blessing reflection data when available, fall back to formula
  const cs = useMemo(() => {
    const withReflection = blessings.filter(b => b.reflection);
    if (withReflection.length >= 3) {
      // Compute averages from real AI-scored dimensions (1-5 → scale to 0-25)
      const avg = (key: 'uniqueness' | 'depth_score' | 'specificity' | 'perspective') => {
        const sum = withReflection.reduce((s, b) => s + (b.reflection?.[key] || 0), 0);
        return Math.round((sum / withReflection.length) * 5); // 1-5 avg → 5-25 scale
      };
      const uniqueness = Math.min(25, avg('uniqueness'));
      const depth = Math.min(25, avg('depth_score'));
      const specificity = Math.min(25, avg('specificity'));
      const perspective = Math.min(25, avg('perspective'));
      return {
        total: Math.min(100, uniqueness + depth + specificity + perspective),
        uniqueness, depth, specificity, perspective,
      };
    }
    // Fallback: formula-based for old blessings without reflection data
    return computeReflectionScore(stats.avg_depth_score, stats.total_blessings, stats.profound_count, stats.current_streak);
  }, [blessings, stats]);

  const trend = useMemo(() => buildDailyTrend(blessings), [blessings]);
  const trendMax = Math.max(1, ...trend.map(d => d.avg));
  const bestBlessings = useMemo(() => findBestBlessings(blessings), [blessings]);

  // Sort dimensions by score for dynamic tips
  const dimScores = DIMS.map(d => ({ ...d, score: cs[d.key] }));
  const strongest = [...dimScores].sort((a, b) => b.score - a.score)[0];
  const sortedByWeakest = [...dimScores].sort((a, b) => a.score - b.score);

  // Load PASCO result
  const pascoResult = useMemo<PascoResult | null>(() => {
    try {
      const s = localStorage.getItem('pasco_result');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  }, []);

  const archetypeInsight = pascoResult?.archetype?.name
    ? ARCHETYPE_INSIGHTS[pascoResult.archetype.name] || null
    : null;

  return (
    <div className="space-y-4">
      {/* -- Header -- */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => go('home')} className="w-9 h-9 rounded-full flex items-center justify-center" style={cardStyle}>
          <ArrowLeft size={18} className="text-[#EBDCB8]" />
        </button>
        <span className="text-lg font-semibold" style={{ color: '#EBDCB8' }}>{t('reflection.title')}</span>
      </div>

      {/* -- Hero -- */}
      <div className="rounded-2xl p-6 text-center" style={cardStyle}>
        <Sparkle size={28} className="mx-auto mb-2" style={{ color: '#D7B56A' }} />
        <div
          className="text-6xl font-bold leading-none"
          style={{ ...hFont, background: 'linear-gradient(135deg, #D7B56A, #E8C97A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          {cs.total}
        </div>
        <div className="text-sm mt-2" style={{ color: '#A7B1C0' }}>{t('reflection.outOf100')}</div>
      </div>

      {/* -- 4 Dimensions with progress bars -- */}
      <div className="grid grid-cols-2 gap-3">
        {DIMS.map((dim) => {
          const score = cs[dim.key];
          const isStrongest = dim.key === strongest.key;
          return (
            <div key={dim.key} className="rounded-2xl p-4 relative" style={{ ...cardStyle, borderColor: isStrongest ? `${dim.color}40` : undefined }}>
              {isStrongest && (
                <span className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${dim.color}20`, color: dim.color }}>
                  {t('reflection.strongest')}
                </span>
              )}
              <div className="text-[10px] font-bold tracking-[1.5px] uppercase mb-2" style={{ color: '#A7B1C0' }}>
                {t(`reflection.dim.${dim.key}`)}
              </div>
              <div className="text-3xl font-bold leading-none mb-2" style={{ ...hFont, color: dim.color }}>
                {score}<span className="text-sm font-normal text-[#7F8A9A]">/25</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(score / 25) * 100}%`, background: dim.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* -- Your Strength -- */}
      <div className="rounded-2xl p-5" style={{ ...cardStyle, borderColor: `${strongest.color}25` }}>
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={18} weight="duotone" style={{ color: strongest.color }} />
          <span className="text-sm font-bold" style={{ color: strongest.color }}>{t('reflection.yourStrength', { dim: t(`reflection.dim.${strongest.key}`) })}</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#D5DDEA' }}>{t(`reflection.tip.${strongest.key}.strength`)}</p>
      </div>

      <TrendChart trend={trend} trendMax={trendMax} />

      <BestReflectionsCard blessings={bestBlessings} />

      <GrowthTipsCard dims={sortedByWeakest} />

      {/* -- PASCO Connection -- */}
      {pascoResult && archetypeInsight && (
        <div className="rounded-2xl p-5" style={{ ...cardStyle, borderColor: 'rgba(139,126,200,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain size={20} weight="duotone" style={{ color: '#8B7EC8' }} />
            <span className="text-[15px] font-semibold" style={{ ...hFont, color: '#EBDCB8' }}>{t('reflection.reflectionStyle')}</span>
          </div>
          <div className="p-3 rounded-xl mb-3" style={{ background: 'rgba(139,126,200,0.08)', border: '1px solid rgba(139,126,200,0.15)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#8B7EC8' }}>{pascoResult.archetype.name}</p>
            <p className="text-xs leading-relaxed" style={{ color: '#D5DDEA' }}>{archetypeInsight.insight}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(215,181,106,0.06)', border: '1px solid rgba(215,181,106,0.12)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#D7B56A' }}>{t('reflection.growthChallenge')}</p>
            <p className="text-xs leading-relaxed" style={{ color: '#A7B1C0' }}>{archetypeInsight.challenge}</p>
          </div>
        </div>
      )}

      {/* -- Back -- */}
      <button
        onClick={() => go('home')}
        className="w-full py-3.5 rounded-xl text-sm font-bold"
        style={{ background: 'linear-gradient(135deg, #2A9D6F, #0F4A32)', color: '#EBDCB8' }}
      >
        {t('reflection.backToDashboard')}
      </button>
    </div>
  );
}
