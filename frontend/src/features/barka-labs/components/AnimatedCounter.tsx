/**
 * Animated rolling digit counter with premium speedometer gauge.
 * The gauge wraps around the digits as a dramatic half-circle.
 * On mount: needle + arc sweep to 100%, then settle back to actual value.
 */

import { type MotionValue, motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { SpeedoGauge } from './animated-counter/SpeedoGauge';

/* ── Single digit that rolls vertically ── */
function Digit({ place, value, height, digitStyle }: {
  place: number;
  value: number;
  height: number;
  digitStyle?: React.CSSProperties;
}) {
  const valueAtPlace = Math.floor(value / place) % 10;
  const animatedValue = useSpring(valueAtPlace, { stiffness: 80, damping: 20 });

  useEffect(() => {
    animatedValue.set(Math.floor(value / place));
  }, [animatedValue, value, place]);

  return (
    <span
      className="relative inline-flex overflow-hidden"
      style={{ height, width: '1ch', fontVariantNumeric: 'tabular-nums', ...digitStyle }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <RollingNumber key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </span>
  );
}

function RollingNumber({ mv, number, height }: { mv: MotionValue<number>; number: number; height: number }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) memo -= 10 * height;
    return memo;
  });

  return (
    <motion.span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', y }}>
      {number}
    </motion.span>
  );
}

interface AnimatedCounterProps {
  value: number;
  digits?: number;
  fontSize?: number;
  gap?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: React.CSSProperties['fontWeight'];
  gradientFrom?: string;
  showSpeedo?: boolean;
  speedoMax?: number;
}

export function AnimatedCounter({
  value,
  digits = 3,
  fontSize = 96,
  gap = 6,
  color = '#D7B56A',
  fontFamily = 'Cormorant Garamond, serif',
  fontWeight = 800,
  gradientFrom = '#1E293A',
  showSpeedo = false,
  speedoMax = 1000,
}: AnimatedCounterProps) {
  const height = fontSize;
  const places: number[] = [];
  for (let i = digits - 1; i >= 0; i--) places.push(Math.pow(10, i));
  const compact = fontSize <= 100;

  const digitBlock = (
    <span className="relative inline-block">
      <span
        style={{
          fontSize,
          display: 'flex',
          gap,
          overflow: 'hidden',
          borderRadius: 8,
          lineHeight: 1,
          color,
          fontWeight,
          fontFamily,
        }}
      >
        {places.map((place) => (
          <Digit key={place} place={place} value={value} height={height} />
        ))}
      </span>
      <span className="pointer-events-none absolute inset-0 flex flex-col justify-between">
        <span style={{ height: 16, background: `linear-gradient(to bottom, ${gradientFrom}, transparent)` }} />
        <span style={{ height: 16, background: `linear-gradient(to top, ${gradientFrom}, transparent)` }} />
      </span>
    </span>
  );

  if (!showSpeedo) return digitBlock;

  return (
    <div className="flex flex-col items-center">
      <SpeedoGauge value={value} maxValue={speedoMax} compact={compact} />
      <div style={{ marginTop: compact ? 8 : 12 }}>
        {digitBlock}
      </div>
    </div>
  );
}
