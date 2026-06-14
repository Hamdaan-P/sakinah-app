/**
 * Animated count-up display used in the Decomposition Tree counter reveal.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function AnimatedCounter({ target, delay }: { target: number; delay: number }) {
  const [count, setCount] = useState(1);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started || count >= target) {
      if (started && count >= target) setDone(true);
      return;
    }
    const step = Math.max(1, Math.floor(target / 50));
    const interval = setInterval(() => {
      setCount((c) => Math.min(c + step, target));
    }, 40);
    return () => clearInterval(interval);
  }, [started, count, target]);

  return (
    <div className="relative inline-flex items-center justify-center">
      {done && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{ border: '1px solid rgba(215,181,106,0.3)' }}
            initial={{ width: 60, height: 60, opacity: 1 }}
            animate={{ width: 140, height: 140, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ border: '1px solid rgba(215,181,106,0.2)' }}
            initial={{ width: 60, height: 60, opacity: 1 }}
            animate={{ width: 180, height: 180, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
          />
        </>
      )}
      <motion.span
        key={count}
        initial={{ scale: 1.4, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-4xl sm:text-6xl font-bold tabular-nums relative z-10"
        style={{
          color: '#D7B56A',
          textShadow: '0 0 30px rgba(215,181,106,0.5), 0 0 60px rgba(215,181,106,0.2)',
          fontFamily: 'Cormorant Garamond, serif',
        }}
      >
        {count}
      </motion.span>
    </div>
  );
}
