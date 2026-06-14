/**
 * Full-screen overlay shown while the AI is decomposing a blessing into
 * hidden layers (before the DecompositionTree opens).
 */

import { motion } from 'framer-motion';
import { Sparkle } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';

export function BarkaDecomposingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-4"
      style={{ background: 'rgba(13,19,35,0.92)', backdropFilter: 'blur(12px)' }}
    >
      {/* Pulsing ring */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid rgba(215,181,106,0.3)' }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{ border: '1.5px solid rgba(215,181,106,0.5)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <Sparkle size={28} weight="fill" style={{ color: C.gold }} />
      </div>
      <p className="text-sm font-semibold" style={{ color: C.gold, fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
        Uncovering hidden blessings...
      </p>
      <p className="text-xs" style={{ color: '#A7B1C0' }}>
        AI is decomposing your gratitude into layers of meaning
      </p>
    </motion.div>
  );
}
