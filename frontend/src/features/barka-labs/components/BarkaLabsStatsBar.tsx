/**
 * Barka Labs Stats Bar — streak, total blessings, depth breakdown, avg score
 */

import { motion } from 'framer-motion';
import { Fire, Sparkle, Star, TrendUp } from '@phosphor-icons/react';
import type { BarkaLabsStats } from '../types/barka-labs.types';

interface BarkaLabsStatsBarProps {
  stats: BarkaLabsStats;
}

export function BarkaLabsStatsBar({ stats }: BarkaLabsStatsBarProps) {
  const items = [
    {
      icon: Sparkle,
      label: 'Blessings',
      value: stats.total_blessings,
      color: '#D7B56A',
    },
    {
      icon: Fire,
      label: 'Streak',
      value: `${stats.current_streak}d`,
      color: '#FF6B35',
    },
    {
      icon: TrendUp,
      label: 'Avg Depth',
      value: stats.avg_depth_score.toFixed(1),
      color: '#4A9EFF',
    },
    {
      icon: Star,
      label: 'Profound',
      value: stats.profound_count,
      color: '#E7CF8C',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-center"
          style={{
            backgroundColor: 'rgba(36,50,70,0.5)',
            border: '1px solid rgba(215,181,106,0.1)',
          }}
        >
          <item.icon size={20} weight="duotone" style={{ color: item.color }} />
          <span className="text-lg font-semibold text-[#EBDCB8]">{item.value}</span>
          <span className="text-[10px] text-[#7F8A9A] uppercase tracking-wider">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
