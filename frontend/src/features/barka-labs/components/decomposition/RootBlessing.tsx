/**
 * Top "root blessing" card with sparkle, surrounded by connector dots.
 */

import { motion } from 'framer-motion';
import { Sparkle } from '@phosphor-icons/react';

interface RootBlessingProps {
  blessingText: string;
}

export function RootBlessing({ blessingText }: RootBlessingProps) {
  return (
    <>
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 180 }}
        className="text-center space-y-3"
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0px rgba(215,181,106,0), inset 0 0 0px rgba(215,181,106,0)',
              '0 0 40px rgba(215,181,106,0.25), inset 0 0 20px rgba(215,181,106,0.05)',
              '0 0 0px rgba(215,181,106,0), inset 0 0 0px rgba(215,181,106,0)',
            ],
          }}
          transition={{ repeat: 3, duration: 1.8 }}
          className="inline-flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl max-w-lg"
          style={{
            backgroundColor: 'rgba(215,181,106,0.08)',
            border: '1px solid rgba(215,181,106,0.25)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: 2, ease: 'easeInOut' }}
          >
            <Sparkle size={22} weight="fill" className="text-[#D7B56A]" />
          </motion.div>
          <span className="text-[#EBDCB8] text-sm font-medium leading-relaxed text-start">
            &ldquo;{blessingText}&rdquo;
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[#7F8A9A] text-xs tracking-wide"
        >
          But did you see what&rsquo;s hidden inside?
        </motion.p>
      </motion.div>

      {/* Connector dots */}
      <div className="flex flex-col items-center gap-0.5 py-1">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ delay: 0.6 + dot * 0.1, type: 'spring', stiffness: 300 }}
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: '#D7B56A' }}
          />
        ))}
      </div>
    </>
  );
}
