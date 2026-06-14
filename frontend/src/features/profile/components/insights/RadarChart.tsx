/**
 * RadarChart — pure-SVG spider chart for the InsightsReport profile-at-a-glance.
 */

import { motion } from 'framer-motion';
import type { RadarScore } from '../_insightsTypes';

export function RadarChart({ scores }: { scores: RadarScore[] }) {
  // Generous viewBox so long labels like "Self-Awareness" / "Emotional Depth" have room to breathe
  const W = 500;
  const H = 420;
  const cx = W / 2;
  const cy = H / 2;
  const maxR = 110;
  const levels = 4;
  const n = scores.length;
  if (n < 3) return null;

  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  function polarToXY(angle: number, r: number): [number, number] {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  // Grid rings
  const rings = Array.from({ length: levels }, (_, i) => {
    const r = (maxR / levels) * (i + 1);
    const points = Array.from({ length: n }, (__, j) => {
      const [x, y] = polarToXY(startAngle + j * angleStep, r);
      return `${x},${y}`;
    }).join(' ');
    return <polygon key={i} points={points} fill="none" stroke="rgba(212,168,83,0.08)" strokeWidth="1" />;
  });

  // Axis lines
  const axes = scores.map((_, i) => {
    const [x, y] = polarToXY(startAngle + i * angleStep, maxR);
    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(212,168,83,0.12)" strokeWidth="1" />;
  });

  // Data polygon
  const dataPoints = scores.map((s, i) => {
    const r = (s.value / 100) * maxR;
    const [x, y] = polarToXY(startAngle + i * angleStep, r);
    return [x, y] as [number, number];
  });
  const dataPath = dataPoints.map(([x, y]) => `${x},${y}`).join(' ');

  // Labels — stacked vertically (label on top, value below in color) for cleaner look
  const labels = scores.map((s, i) => {
    const angle = startAngle + i * angleStep;
    const labelR = maxR + 28;
    const [lx, ly] = polarToXY(angle, labelR);

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const isTop = sin < -0.5;
    const isBottom = sin > 0.5;
    const isLeft = cos < -0.1;
    const isRight = cos > 0.1;

    const textAnchor = isLeft ? 'end' : isRight ? 'start' : 'middle';

    // Stack label + value vertically. Top axes: value above label. Bottom: value below.
    const labelY = isTop ? ly - 8 : isBottom ? ly + 4 : ly - 6;
    const valueY = isTop ? ly - 22 : isBottom ? ly + 18 : ly + 10;

    return (
      <g key={i}>
        <text
          x={lx}
          y={labelY}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fill="#7A7363"
          fontSize="12"
          fontFamily="'DM Sans', sans-serif"
        >
          {s.axis}
        </text>
        <text
          x={lx}
          y={valueY}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fill={s.color}
          fontSize="13"
          fontWeight="700"
          fontFamily="'DM Sans', sans-serif"
        >
          {s.value}
        </text>
      </g>
    );
  });

  // Data dots
  const dots = dataPoints.map(([x, y], i) => (
    <motion.circle
      key={i}
      cx={x}
      cy={y}
      r={4.5}
      fill={scores[i].color}
      stroke="#0A0E16"
      strokeWidth="2"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 + i * 0.08 }}
    />
  ));

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="mx-auto block"
      style={{ maxWidth: W, height: 'auto' }}
    >
      {rings}
      {axes}
      <motion.polygon
        points={dataPath}
        fill="rgba(212,168,83,0.15)"
        stroke="#D4A853"
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      />
      {dots}
      {labels}
    </svg>
  );
}
