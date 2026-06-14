/**
 * Ambient gold-particle backdrop for the Decomposition Tree overlay.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';

export function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 5,
        opacity: 0.1 + Math.random() * 0.2,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, backgroundColor: '#D7B56A' }}
          animate={{ y: [0, -80, -160, -80, 0], x: [0, 20, -10, -20, 0], opacity: [0, p.opacity, p.opacity, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
