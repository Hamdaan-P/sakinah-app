/**
 * RewardCelebration — Full-page overlay animation when DNZ is awarded.
 * Gold coin burst, amount counter, and coin-to-wallet fly effect.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Wallet } from '@phosphor-icons/react';
import { generateParticles } from './reward-celebration/_particleFactory';
import { CoinParticles } from './reward-celebration/CoinParticles';
import { CollectOverlay } from './reward-celebration/CollectOverlay';

interface RewardCelebrationProps {
  amount: number;
  reason: string;
  newBalance: number;
  onComplete: () => void;
}

export function RewardCelebration({ amount, reason, newBalance, onComplete }: RewardCelebrationProps) {
  const [phase, setPhase] = useState<'burst' | 'count' | 'collect' | 'done'>('burst');
  const [displayAmount, setDisplayAmount] = useState(0);

  const particles = useMemo(() => generateParticles(24), []);

  // Phase transitions
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase('count'), 600));
    timers.push(setTimeout(() => setPhase('collect'), 2200));
    timers.push(setTimeout(() => setPhase('done'), 3200));
    timers.push(setTimeout(() => onComplete(), 3600));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Count-up animation
  useEffect(() => {
    if (phase !== 'count' && phase !== 'collect' && phase !== 'done') return;
    const steps = 30;
    const stepTime = 800 / steps;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setDisplayAmount(Math.round((current / steps) * amount));
      if (current >= steps) clearInterval(interval);
    }, stepTime);
    return () => clearInterval(interval);
  }, [phase, amount]);

  const handleDismiss = useCallback(() => {
    setPhase('done');
    setTimeout(onComplete, 300);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={handleDismiss}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Radial glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-80 h-80 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.4, 0.2] }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                background: 'radial-gradient(circle, rgba(212,168,83,0.3) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Gold coin particles */}
          <CoinParticles particles={particles} phase={phase} />

          {/* Central content */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          >
            {/* Coin icon with pulse */}
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, #D4A853, #E8C97A)',
                boxShadow: '0 0 40px rgba(212,168,83,0.4), 0 0 80px rgba(212,168,83,0.2)',
              }}
              animate={
                phase === 'collect'
                  ? { scale: [1, 1.3, 0], y: [0, -20, -60], opacity: [1, 1, 0] }
                  : { scale: [1, 1.08, 1] }
              }
              transition={
                phase === 'collect'
                  ? { duration: 0.7, ease: 'easeIn' }
                  : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <Coins size={48} weight="fill" className="text-[#0A0E16]" />
            </motion.div>

            {/* Reward text */}
            <motion.div
              className="text-center"
              animate={phase === 'collect' ? { opacity: 0, y: -20 } : { opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.p
                className="text-[#D4A853] text-sm font-semibold uppercase tracking-widest mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Reward Claimed!
              </motion.p>

              <motion.div
                className="flex items-baseline justify-center gap-2 mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', damping: 12 }}
              >
                <span className="text-6xl font-bold text-[#F5E8C7]">
                  +{displayAmount}
                </span>
                <span className="text-2xl font-bold text-[#D4A853]">DNZ</span>
              </motion.div>

              <motion.p
                className="text-[#7A7363] text-sm mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {reason}
              </motion.p>

              <motion.div
                className="flex items-center justify-center gap-2 text-[#5C5749] text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <Wallet size={14} />
                <span>New balance: {newBalance.toLocaleString()} DNZ</span>
              </motion.div>
            </motion.div>

            {/* Collect phase — wallet icon flying in */}
            <CollectOverlay show={phase === 'collect'} newBalance={newBalance} />

            {/* Tap to dismiss hint */}
            <motion.p
              className="absolute -bottom-16 text-[#5C5749] text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.5 }}
            >
              Tap anywhere to dismiss
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
