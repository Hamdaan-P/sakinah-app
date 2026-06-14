/**
 * "Time!" overlay shown when the battle's 60-second window expires while
 * scoring is being finalized.
 */

import { motion } from 'framer-motion';
import { Spinner } from '@phosphor-icons/react';

export function BattleEndedOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center space-y-2"
      >
        <p className="text-3xl font-bold text-[#D7B56A]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Time!
        </p>
        <p className="text-sm text-[#A7B1C0]">Scoring blessings...</p>
        <Spinner size={24} className="text-[#D7B56A] animate-spin mx-auto" />
      </motion.div>
    </div>
  );
}
