/**
 * SpeedoGauge — premium half-circle speedometer used inside AnimatedCounter.
 * On mount: needle + arc sweep to 100% then settle to actual value.
 */

import { motion, useTransform, useMotionValue, animate } from 'framer-motion';
import { useEffect, useId, useRef, useMemo } from 'react';
import {
  toRad,
  describeArc,
  computeZones,
  computeTicks,
  computeLabels,
} from './_gaugeGeometry';
import { GaugeDefs } from './_GaugeDefs';

export function SpeedoGauge({ value, maxValue, compact }: { value: number; maxValue: number; compact?: boolean }) {
  const uid = useId();

  // ── Dimensions ──
  const W = 500;
  const H = 280;
  const cx = W / 2;
  const cy = H - 30;
  const outerR = 210;
  const innerR = 175;
  const needleLen = innerR - 8;

  // ── Arc angles: 180° sweep (9-o'clock to 3-o'clock) ──
  const SA = 180; // left
  const EA = 360; // right
  const SW = EA - SA;

  const targetPct = Math.min(value / maxValue, 1);

  // ── Animated values ──
  const needleAngle = useMotionValue(SA);
  const arcProgress = useMotionValue(0); // 0→1
  const needleTipX = useTransform(needleAngle, (a) => cx + needleLen * Math.cos(toRad(a)));
  const needleTipY = useTransform(needleAngle, (a) => cy + needleLen * Math.sin(toRad(a)));
  // Needle base (wider base for tapered look)
  const needleBaseL_X = useTransform(needleAngle, (a) => cx + 6 * Math.cos(toRad(a + 90)));
  const needleBaseL_Y = useTransform(needleAngle, (a) => cy + 6 * Math.sin(toRad(a + 90)));
  const needleBaseR_X = useTransform(needleAngle, (a) => cx + 6 * Math.cos(toRad(a - 90)));
  const needleBaseR_Y = useTransform(needleAngle, (a) => cy + 6 * Math.sin(toRad(a - 90)));
  const needlePath = useTransform(
    [needleTipX, needleTipY, needleBaseL_X, needleBaseL_Y, needleBaseR_X, needleBaseR_Y],
    ([tx, ty, lx, ly, rx, ry]) => `M ${lx} ${ly} L ${tx} ${ty} L ${rx} ${ry} Z`
  );

  const zones = useMemo(() => computeZones({ cx, cy, outerR, innerR, SA, SW }), [cx, cy, outerR, innerR, SA, SW]);
  const ticks = useMemo(() => computeTicks({ cx, cy, outerR, innerR, SA, SW }, maxValue), [maxValue, cx, cy, outerR, innerR, SA, SW]);
  const labels = useMemo(() => computeLabels({ cx, cy, innerR, SA, SW }, maxValue), [maxValue, cx, cy, innerR, SA, SW]);

  // ── Animation ──
  const mountCount = useRef(0);
  const prevValue = useRef(value);

  useEffect(() => {
    mountCount.current += 1;

    // Reset motion values to start position every mount (handles Strict Mode double-fire)
    needleAngle.set(SA);
    arcProgress.set(0);

    // On first/second mount (Strict Mode): always do the full sweep intro
    // On value change after mount: just animate to new position
    const isValueChange = mountCount.current > 2 && prevValue.current !== value;
    prevValue.current = value;

    if (isValueChange) {
      animate(needleAngle, SA + SW * targetPct, { duration: 0.8, ease: 'easeOut' });
      animate(arcProgress, targetPct, { duration: 0.8, ease: 'easeOut' });
      return;
    }

    // Phase 1: smooth sweep to 100% (no overshoot)
    const c1 = animate(needleAngle, EA, { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] });
    const c2 = animate(arcProgress, 1, { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] });

    // Phase 2: settle to actual value (smooth deceleration, no bounce)
    const t = setTimeout(() => {
      animate(needleAngle, SA + SW * targetPct, { duration: 1.2, ease: [0.4, 0, 0.2, 1] });
      animate(arcProgress, targetPct, { duration: 1.2, ease: [0.4, 0, 0.2, 1] });
    }, 1500);

    return () => { c1.stop(); c2.stop(); clearTimeout(t); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, maxValue]);

  // Animated fill arc
  const fillArcLength = (SW / 360) * 2 * Math.PI * ((outerR + innerR) / 2);
  const fillDashOffset = useTransform(arcProgress, (p) => fillArcLength * (1 - p));

  const bandW = outerR - innerR + 4;
  const midR = (outerR + innerR) / 2;
  const fillArcPath = describeArc(cx, cy, midR, SA, EA);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{
        width: '100%',
        maxWidth: compact ? 340 : 520,
        height: 'auto',
        display: 'block',
        margin: '0 auto',
      }}
      preserveAspectRatio="xMidYMid meet"
    >
      <GaugeDefs uid={uid} />

      <ellipse cx={cx} cy={cy} rx={outerR + 30} ry={outerR * 0.4} fill={`url(#${uid}-bgGlow)`} />

      {zones.map((z, i) => (
        <path
          key={i}
          d={z.path}
          fill="none"
          stroke={z.color}
          strokeWidth={bandW}
          strokeLinecap="butt"
          opacity={0.08}
        />
      ))}

      <path
        d={describeArc(cx, cy, outerR + 3, SA, EA)}
        fill="none"
        stroke="rgba(215,181,106,0.12)"
        strokeWidth={1}
        strokeLinecap="round"
      />
      <path
        d={describeArc(cx, cy, innerR - 3, SA, EA)}
        fill="none"
        stroke="rgba(215,181,106,0.08)"
        strokeWidth={0.5}
        strokeLinecap="round"
      />

      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.major ? 'rgba(215,181,106,0.55)' : 'rgba(215,181,106,0.15)'}
          strokeWidth={t.major ? 2 : 0.8}
          strokeLinecap="round"
        />
      ))}

      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(215,181,106,0.45)"
          fontSize={compact ? 9 : 11}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight={600}
        >
          {l.text}
        </text>
      ))}

      <motion.path
        d={fillArcPath}
        fill="none"
        stroke={`url(#${uid}-fillGrad)`}
        strokeWidth={bandW}
        strokeLinecap="butt"
        strokeDasharray={fillArcLength}
        style={{ strokeDashoffset: fillDashOffset }}
      />

      <motion.path
        d={needlePath}
        fill="#EBDCB8"
        style={{ filter: 'drop-shadow(0 0 3px rgba(215,181,106,0.5))' }}
      />

      <circle cx={cx} cy={cy} r={16} fill={`url(#${uid}-dotGlow)`} />
      <circle cx={cx} cy={cy} r={10} fill="#1E293A" stroke="#D7B56A" strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={4} fill="#D7B56A" />
    </svg>
  );
}
