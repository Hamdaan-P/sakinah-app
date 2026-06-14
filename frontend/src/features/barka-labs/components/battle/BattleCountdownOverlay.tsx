/**
 * 3-2-1-GO countdown overlay shown before BattleArena's active phase.
 */

import { AnimatePresence, motion } from 'framer-motion';

interface BattleCountdownOverlayProps {
  countdown: number;
}

export function BattleCountdownOverlay({ countdown }: BattleCountdownOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center" style={{ backgroundColor: 'rgba(15,23,36,0.95)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={countdown || 'go'}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          {countdown > 0 ? (
            <span className="text-5xl sm:text-7xl font-bold text-[#D7B56A]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {countdown}
            </span>
          ) : (
            <span className="text-4xl sm:text-5xl font-bold text-[#FF6B35]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              GO!
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
