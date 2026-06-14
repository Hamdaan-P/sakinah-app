/**
 * BlessingLeaf — DOM overlay leaf used by an alternate JSX-based stem render.
 * Currently unused at runtime; kept for the future toggle path.
 */

import { motion } from 'framer-motion';
import type { Blessing, BlessingDepth } from '../../types/barka-labs.types';

const LEAF_STYLE: Record<BlessingDepth, {
  color: string; glow: string; bg: string; label: string;
}> = {
  profound: {
    color: '#D7B56A', glow: '0 0 20px rgba(215,181,106,0.5)', bg: 'rgba(215,181,106,0.12)', label: 'Golden Flower',
  },
  thoughtful: {
    color: '#4A9EFF', glow: '0 0 12px rgba(74,158,255,0.3)', bg: 'rgba(74,158,255,0.1)', label: 'Green Leaf',
  },
  common: {
    color: '#A7B1C0', glow: '0 0 6px rgba(167,177,192,0.2)', bg: 'rgba(167,177,192,0.08)', label: 'Small Bud',
  },
};

export function _BlessingLeaf({ blessing, x, y, goUp, index, onClick, isSelected }: {
  blessing: Blessing; x: number; y: number; goUp: boolean; index: number;
  onClick: () => void; isSelected: boolean;
}) {
  const style = LEAF_STYLE[blessing.depth];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, delay: index * 0.08 }}
      className="absolute pointer-events-auto cursor-pointer"
      style={{ left: x - 60, top: y - (goUp ? 75 : -10), width: 120 }}
      onClick={onClick}
    >
      <motion.div
        whileHover={{ scale: 1.08, y: -3 }}
        className="rounded-2xl px-3 py-2.5 text-center relative"
        style={{
          backgroundColor: isSelected ? style.bg : 'rgba(15,23,36,0.7)',
          border: `1px solid ${isSelected ? style.color + '50' : style.color + '20'}`,
          backdropFilter: 'blur(12px)',
          boxShadow: isSelected ? style.glow : 'none',
        }}
      >
        {/* Depth indicator dot */}
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: style.color, boxShadow: style.glow }} />
          <span className="text-[8px] uppercase tracking-widest font-semibold" style={{ color: style.color }}>
            {blessing.depth}
          </span>
        </div>

        {/* Blessing text */}
        <p className="text-[10px] text-[#EBDCB8] leading-relaxed line-clamp-2">
          {blessing.text}
        </p>

        {/* Score */}
        <span className="text-[8px] mt-1 block" style={{ color: style.color }}>
          +{blessing.score} pts
        </span>

        {/* Profound bloom effect */}
        {blessing.depth === 'profound' && (
          <motion.div
            className="absolute -inset-1 rounded-2xl pointer-events-none"
            style={{ border: `1px solid rgba(215,181,106,0.15)` }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Connecting line to stem */}
      <div
        className="absolute left-1/2 w-px"
        style={{
          backgroundColor: `${style.color}30`,
          height: 20,
          top: goUp ? 'auto' : -20,
          bottom: goUp ? -20 : 'auto',
          transform: 'translateX(-50%)',
        }}
      />
    </motion.div>
  );
}
