/**
 * GoldParticles
 *
 * Drifts ~14 tiny gold dots upward across the parent (which must be
 * `position: relative`). Pure framer-motion — no canvas, no asset.
 * Cheap enough to leave running on hero sections; respects reduced motion.
 */

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  count?: number;
  color?: string;
  /** Approx vertical drift duration in seconds. Lower = faster. Default 14. */
  durationSec?: number;
}

interface Particle {
  id: number;
  left: number;     // 0..100 (%)
  size: number;     // px
  delay: number;    // s
  drift: number;    // horizontal sway in px
  opacity: number;  // peak opacity
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function GoldParticles({ count = 14, color = '#E8C97A', durationSec = 14 }: Props) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: rand(0, 100),
        size: rand(2, 4),
        delay: rand(0, durationSec),
        drift: rand(-30, 30),
        opacity: rand(0.25, 0.65),
      })),
    [count, durationSec],
  );

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: -10,
            width: p.size,
            height: p.size,
            background: color,
            boxShadow: `0 0 ${p.size * 2}px ${color}`,
          }}
          initial={{ y: 0, x: 0, opacity: 0 }}
          animate={{
            y: ['0%', `-${300 + Math.random() * 200}%`],
            x: [0, p.drift, 0],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: durationSec,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.15, 0.85, 1],
          }}
        />
      ))}
    </div>
  );
}
