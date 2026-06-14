/**
 * SplashScreen — matches Flutter loading screen exactly
 * Pure black bg, animated gold particle dots, centered Z+ logo with pulse,
 * "ZaryahPlus" / "Islamic Super Agent" text in Poppins
 */

import { motion, AnimatePresence } from 'framer-motion';
import logoGold from '@/assets/zaryah-logo-gold.png';
import { useEffect, useMemo, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.5 + Math.random() * 3.5,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 4,
    opacity: 0.15 + Math.random() * 0.45,
  }));
}

export function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const particles = useMemo(() => generateParticles(100), []);
  const [phase, setPhase] = useState<'particles' | 'logo' | 'text' | 'done'>('particles');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('logo'), 300),
      setTimeout(() => setPhase('text'), 900),
      setTimeout(() => setPhase('done'), 2200),
      setTimeout(onFinished, 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onFinished]);

  return (
    <AnimatePresence>
      {phase !== 'done' ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Gold particles — matches Flutter's ParticleBackground */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: '#FFAE00',
                boxShadow: `0 0 ${p.size * 2}px rgba(255,174,0, 0.3)`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, p.opacity, p.opacity * 0.4, p.opacity],
                scale: [0, 1, 0.7, 1],
                y: [0, -20 * (0.5 + Math.random()), 10, -15],
                x: [0, 5 * (Math.random() - 0.5), -5, 3],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Z+ Logo — 160px like Flutter, with pulse animation */}
            <motion.img
              src={logoGold}
              alt="ZaryahPlus logo"
              className="w-40 h-40 object-contain"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(212,168,83, 0.25))',
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={
                phase === 'logo' || phase === 'text'
                  ? {
                      opacity: 1,
                      scale: [1, 1.05, 1],
                    }
                  : { opacity: 0, scale: 0.5 }
              }
              transition={
                phase === 'logo' || phase === 'text'
                  ? {
                      opacity: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                      scale: {
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                      },
                    }
                  : { duration: 0.6 }
              }
            />

            {/* App name — Cormorant Garamond, matching login page */}
            <motion.h1
              className="mt-6 text-5xl font-bold text-[#D4A853]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={
                phase === 'text'
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 12 }
              }
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Zaryah<span className="text-[#E8C97A] text-[0.75em] align-super">+</span>
            </motion.h1>

            {/* Subtitle — Cormorant Garamond, matching login page */}
            <motion.p
              className="mt-3 text-lg tracking-wide"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: 'rgba(212,168,83, 0.7)',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={
                phase === 'text'
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 8 }
              }
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              The World's First Islamic Super Agent
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
