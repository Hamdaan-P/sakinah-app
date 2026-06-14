/**
 * Depth Badge — visual indicator of blessing depth tier
 */

import { motion } from 'framer-motion';
import type { BlessingDepth } from '../types/barka-labs.types';

const DEPTH_CONFIG: Record<BlessingDepth, { label: string; color: string; bg: string; glow: string }> = {
  common: {
    label: 'Common',
    color: '#A7B1C0',
    bg: 'rgba(167,177,192,0.15)',
    glow: 'rgba(167,177,192,0.3)',
  },
  thoughtful: {
    label: 'Thoughtful',
    color: '#4A9EFF',
    bg: 'rgba(74,158,255,0.15)',
    glow: 'rgba(74,158,255,0.3)',
  },
  profound: {
    label: 'Profound',
    color: '#D7B56A',
    bg: 'rgba(215,181,106,0.15)',
    glow: 'rgba(215,181,106,0.4)',
  },
};

interface DepthBadgeProps {
  depth: BlessingDepth;
  score: number;
  animate?: boolean;
}

export function DepthBadge({ depth, score, animate = false }: DepthBadgeProps) {
  const config = DEPTH_CONFIG[depth];

  return (
    <motion.span
      initial={animate ? { scale: 0, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : undefined}
      transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.3 }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        color: config.color,
        backgroundColor: config.bg,
        boxShadow: animate && depth === 'profound' ? `0 0 12px ${config.glow}` : undefined,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
      <span className="opacity-60">+{score}</span>
    </motion.span>
  );
}
