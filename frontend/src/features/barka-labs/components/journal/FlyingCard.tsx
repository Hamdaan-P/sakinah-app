/**
 * FlyingCard — temporary card that animates from the input down to the stack
 * while a blessing is being scored.
 */

import { motion } from 'framer-motion';
import { Sparkle } from '@phosphor-icons/react';
import { C, cardStyle } from '../../barka-labs.constants';

export function FlyingCard({ text, onDone }: { text: string; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      animate={{
        y: [0, 20, 80],
        scale: [1, 0.95, 0.9],
        rotateX: [0, -3, 0],
        opacity: [1, 1, 0],
      }}
      transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1], times: [0, 0.4, 1] }}
      onAnimationComplete={onDone}
      className="rounded-2xl p-4"
      style={{
        ...cardStyle,
        borderColor: C.gold,
        boxShadow: '0 8px 32px rgba(215,181,106,0.25)',
        transformOrigin: 'center top',
        position: 'relative',
        zIndex: 5,
      }}
    >
      <p className="text-sm italic m-0" style={{ color: '#EBDCB8' }}>
        &ldquo;{text}&rdquo;
      </p>
      <div className="flex items-center gap-1.5 mt-2">
        <Sparkle size={12} weight="fill" style={{ color: C.gold }} />
        <span className="text-[11px] font-semibold" style={{ color: C.gold }}>Scoring...</span>
      </div>
    </motion.div>
  );
}
