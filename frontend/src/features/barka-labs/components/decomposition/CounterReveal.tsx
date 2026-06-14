/**
 * Counter reveal section: animated counter + burst particles + Quran verse.
 */

import { motion } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';

interface CounterRevealProps {
  total: number;
  counterDelay: number;
}

export function CounterReveal({ total, counterDelay }: CounterRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: counterDelay, type: 'spring' }}
      className="text-center py-6 space-y-3"
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: counterDelay + 0.2 }}
        className="text-[#7F8A9A] text-sm"
      >
        Hidden blessings uncovered
      </motion.p>

      <AnimatedCounter target={total} delay={counterDelay + 0.3} />

      {/* Gold burst particles */}
      <div className="relative h-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-0 w-1 h-1 rounded-full"
            style={{ backgroundColor: '#D7B56A' }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: Math.cos((i / 12) * Math.PI * 2) * (50 + Math.random() * 30),
              y: Math.sin((i / 12) * Math.PI * 2) * (50 + Math.random() * 30),
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{ delay: counterDelay + 1.2 + Math.random() * 0.3, duration: 0.8, ease: 'easeOut' }}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: counterDelay + 1.8 }}
        className="text-[#A7B1C0] text-xs italic mt-4 leading-relaxed"
      >
        &ldquo;If you are grateful, I will surely increase you.&rdquo;
        <span className="block mt-1 text-[#7F8A9A]">Quran 14:7</span>
      </motion.p>
    </motion.div>
  );
}
