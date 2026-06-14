import { useId } from 'react';
import { C } from '../barka-labs.constants';

interface ShukrGaugeProps {
  score: number;
  maxScore?: number;
}

const SIZE = 180;
const STROKE = 9;
const GLOW_STROKE = 14;
const RADIUS = (SIZE - GLOW_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ShukrGauge({ score, maxScore = 100 }: ShukrGaugeProps) {
  const uid = useId();
  const gradId = `shukr-grad-${uid}`;
  const textGradId = `shukr-text-grad-${uid}`;
  const animId = `shukr-anim-${uid}`;

  const clamped = Math.max(0, Math.min(score, maxScore));
  const pct = clamped / maxScore;
  const dashOffset = CIRCUMFERENCE * (1 - pct);

  return (
    <>
      {/* Keyframe animation for stroke-dashoffset on mount */}
      <style>{`
        @keyframes ${animId} {
          from { stroke-dashoffset: ${CIRCUMFERENCE}; }
          to   { stroke-dashoffset: ${dashOffset}; }
        }
      `}</style>

      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ display: 'block', margin: '0 auto' }}
      >
        <defs>
          {/* Stroke gradient: green to gold */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.em} />
            <stop offset="50%" stopColor={C.emL} />
            <stop offset="100%" stopColor={C.gold} />
          </linearGradient>

          {/* Text gradient for center score */}
          <linearGradient id={textGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.emL} />
            <stop offset="100%" stopColor={C.gold} />
          </linearGradient>
        </defs>

        {/* Background ring */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(240,237,230,0.04)"
          strokeWidth={STROKE}
        />

        {/* Glow ring (behind fill) */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={GLOW_STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{
            opacity: 0.12,
            filter: 'blur(5px)',
            animation: `${animId} 2s ease-out 0.8s both`,
          }}
        />

        {/* Fill ring */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{
            animation: `${animId} 2s ease-out 0.8s both`,
          }}
        />

        {/* Center score text */}
        <text
          x={SIZE / 2}
          y={SIZE / 2 - 4}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 44,
            fontWeight: 700,
            fill: `url(#${textGradId})`,
          }}
        >
          {clamped}
        </text>

        {/* "/ 100" subtitle */}
        <text
          x={SIZE / 2}
          y={SIZE / 2 + 28}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 14,
            fontWeight: 400,
            fill: C.t3,
          }}
        >
          / {maxScore}
        </text>
      </svg>
    </>
  );
}
