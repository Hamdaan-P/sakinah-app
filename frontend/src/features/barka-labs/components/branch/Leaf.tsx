/**
 * Leaf — single SVG leaf with readable blessing text inside.
 */

import { motion } from 'framer-motion';
import type { Blessing, BlessingDepth } from '../../types/barka-labs.types';
import { LEAF_COLORS, LEAF_W, LEAF_H } from './_constants';

interface LeafProps {
  x: number; y: number; angle: number;
  depth: BlessingDepth; blessing: Blessing;
  isSelected: boolean; onClick: () => void; index: number;
}

export function Leaf({
  x, y, angle, depth, blessing, isSelected, onClick, index,
}: LeafProps) {
  const c = LEAF_COLORS[depth];
  const lw = LEAF_W;
  const lh = LEAF_H;

  // Leaf-shaped SVG path (pointed oval)
  const leafPath = `
    M ${-lw / 2} 0
    Q ${-lw / 2} ${-lh / 2}, 0 ${-lh / 2}
    Q ${lw / 2} ${-lh / 2}, ${lw / 2 + 10} 0
    Q ${lw / 2} ${lh / 2}, 0 ${lh / 2}
    Q ${-lw / 2} ${lh / 2}, ${-lw / 2} 0
    Z
  `;

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 150, delay: index * 0.07 }}
      style={{ cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Glow behind leaf */}
        {depth === 'profound' && (
          <ellipse cx={5} cy={0} rx={lw * 0.55} ry={lh * 0.55}
            fill={c.glow} filter="url(#leafGlow)" />
        )}

        {/* Gradient def */}
        <defs>
          <linearGradient id={`lg-${blessing.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.bg1} />
            <stop offset="100%" stopColor={c.bg2} />
          </linearGradient>
        </defs>

        {/* Leaf shape */}
        <path d={leafPath}
          fill={`url(#lg-${blessing.id})`}
          stroke={c.border} strokeWidth={1.2}
          opacity={isSelected ? 1 : 0.92}
        />

        {/* Center vein */}
        <line x1={-lw * 0.35} y1={0} x2={lw * 0.4} y2={0}
          stroke={c.vein} strokeWidth={1} />

        {/* Side veins */}
        {[-0.2, 0, 0.2].map((off, i) => (
          <g key={i}>
            <line x1={lw * off} y1={0}
              x2={lw * (off + 0.12)} y2={-lh * 0.3}
              stroke={c.vein} strokeWidth={0.6} />
            <line x1={lw * off} y1={0}
              x2={lw * (off + 0.12)} y2={lh * 0.3}
              stroke={c.vein} strokeWidth={0.6} />
          </g>
        ))}

        {/* Selected ring */}
        {isSelected && (
          <motion.path d={`
            M ${-lw / 2 - 5} 0
            Q ${-lw / 2 - 5} ${-lh / 2 - 5}, 0 ${-lh / 2 - 5}
            Q ${lw / 2 + 15} ${-lh / 2 - 5}, ${lw / 2 + 15} 0
            Q ${lw / 2 + 15} ${lh / 2 + 5}, 0 ${lh / 2 + 5}
            Q ${-lw / 2 - 5} ${lh / 2 + 5}, ${-lw / 2 - 5} 0 Z
          `}
            fill="none" stroke={c.bg1} strokeWidth={2}
            strokeDasharray="6 4" opacity={0.7}
            animate={{ strokeDashoffset: [0, 20] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Text inside leaf via foreignObject */}
        <foreignObject x={-lw / 2 + 8} y={-lh / 2 + 6} width={lw - 12} height={lh - 12}>
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '2px 4px',
            overflow: 'hidden',
          }}>
            {/* Depth badge */}
            <span style={{
              fontSize: 7, fontWeight: 700, letterSpacing: 1,
              textTransform: 'uppercase', color: c.badge,
              marginBottom: 2,
            }}>
              ● {depth}
            </span>

            {/* Blessing text */}
            <p style={{
              fontSize: 9, lineHeight: 1.3, color: c.text,
              margin: 0, fontWeight: 500,
              display: '-webkit-box', WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {blessing.text}
            </p>

            {/* Score */}
            <span style={{ fontSize: 7, color: c.badge, fontWeight: 600, marginTop: 1 }}>
              +{blessing.score}
            </span>
          </div>
        </foreignObject>
      </g>
    </motion.g>
  );
}
