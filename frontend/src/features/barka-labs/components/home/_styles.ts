/**
 * BarkaLabsHome shared card styles + helpers.
 */

export const card: React.CSSProperties = {
  background: 'rgba(44,60,85,0.55)',
  border: '1px solid rgba(215,181,106,0.15)',
  borderRadius: 16,
  backdropFilter: 'blur(8px)',
};

export const cardHover = 'transition-all duration-200 hover:border-[rgba(215,181,106,0.35)] hover:shadow-[0_4px_24px_rgba(215,181,106,0.08)]';

export const CHALLENGE_COUNT = 10;

export function getWeekOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

import type { BarkaLabsStats } from '../../types/barka-labs.types';

export function computeTwinPercent(kycTier: number, stats: BarkaLabsStats): number {
  let pct = kycTier >= 2 ? 40 : kycTier >= 1 ? 15 : 0;
  pct += Math.min(stats.total_blessings / 100, 1) * 20;
  pct += Math.min(stats.current_streak / 30, 1) * 15;
  const profoundRatio = stats.total_blessings > 0 ? stats.profound_count / stats.total_blessings : 0;
  pct += Math.min(profoundRatio, 0.5) * 2 * 15;
  pct += Math.min(stats.avg_depth_score / 5, 1) * 10;
  return Math.min(Math.round(pct), 100);
}
