/**
 * CoinParticles — gold-coin burst layer used by RewardCelebration.
 * Animation differs in burst vs collect phase.
 */

import { motion } from 'framer-motion';
import type { Particle } from './_particleFactory';

interface Props {
  particles: Particle[];
  phase: 'burst' | 'count' | 'collect' | 'done';
}

export function CoinParticles({ particles, phase }: Props) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: '50%',
            width: p.size,
            height: p.size,
            background: `linear-gradient(135deg, #D4A853, #E8C97A, #D4A853)`,
            boxShadow: '0 0 6px rgba(212,168,83,0.6)',
          }}
          initial={{ y: 0, x: 0, opacity: 0, scale: 0, rotate: 0 }}
          animate={
            phase === 'collect'
              ? {
                  y: -window.innerHeight * 0.3,
                  x: 0,
                  opacity: [1, 0],
                  scale: [1, 0.3],
                  rotate: p.rotation + 180,
                }
              : {
                  y: [0, -(150 + Math.random() * 200)],
                  x: [0, p.drift],
                  opacity: [0, 1, 1, 0.6],
                  scale: [0, 1.2, 1],
                  rotate: p.rotation,
                }
          }
          transition={{
            duration: phase === 'collect' ? 0.6 : p.duration,
            delay: phase === 'collect' ? p.delay * 0.3 : p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
