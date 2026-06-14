/**
 * DnzRewardToast — Global popup animation when users earn DinarZ.
 * Shows a gold coin animation with the amount earned.
 * Renders globally via providers.tsx — auto-dismisses after 3.5s.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from '@phosphor-icons/react';
import { useWalletStore } from '../stores/wallet.store';

export function DnzRewardToast() {
  const lastAward = useWalletStore((s) => s.lastAward);
  const clearLastAward = useWalletStore((s) => s.clearLastAward);

  // Auto-dismiss after 3.5 seconds
  useEffect(() => {
    if (!lastAward?.awarded) return;
    const timer = setTimeout(clearLastAward, 3500);
    return () => clearTimeout(timer);
  }, [lastAward, clearLastAward]);

  const show = !!lastAward?.awarded && lastAward.amount > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="dnz-toast"
          initial={{ opacity: 0, y: -60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
          style={{ top: 'calc(env(safe-area-inset-top) + 1.25rem)' }}
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#10151F] to-[#0F141F] border border-[#D4A853]/30 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(212,168,83,0.15)]">
            {/* Animated coin */}
            <motion.div
              initial={{ rotate: -30, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.1 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center shadow-[0_4px_16px_rgba(212,168,83,0.4)]"
            >
              <Coins size={22} weight="fill" className="text-[#0A0E16]" />
            </motion.div>

            <div>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="text-[#E8C97A] font-bold text-base leading-tight"
              >
                +{lastAward!.amount} DNZ
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-[#7A7363] text-[11px]"
              >
                {lastAward!.reason}
              </motion.p>
            </div>

            {/* Sparkle particles */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-[#E8C97A]"
                initial={{
                  opacity: 1,
                  x: 20,
                  y: 0,
                  scale: 1,
                }}
                animate={{
                  opacity: 0,
                  x: 20 + (i % 2 === 0 ? 1 : -1) * (15 + i * 8),
                  y: -20 - i * 10,
                  scale: 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + i * 0.1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
