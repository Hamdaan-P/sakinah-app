/**
 * Hidden blessings list card (header + animated items) for Decomposition Tree.
 */

import { motion } from 'framer-motion';
import { Eye } from '@phosphor-icons/react';

interface HiddenBlessingsCardProps {
  allBlessings: string[];
  surfaceLen: number;
  total: number;
}

export function HiddenBlessingsCard({ allBlessings, surfaceLen, total }: HiddenBlessingsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.5, type: 'spring', damping: 20 }}
      className="rounded-2xl p-4 sm:p-6 space-y-4 relative overflow-hidden"
      style={{
        backgroundColor: 'rgba(215,181,106,0.05)',
        border: '1px solid rgba(215,181,106,0.18)',
      }}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ backgroundPosition: ['200% 200%', '-100% -100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 2 }}
          style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(215,181,106,0.06) 50%, transparent 60%)',
            backgroundSize: '200% 200%',
          }}
        />
      </motion.div>

      {/* Header */}
      <div className="flex items-center gap-3 relative">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(215,181,106,0.12)' }}
        >
          <Eye size={18} weight="duotone" style={{ color: '#D7B56A' }} />
        </motion.div>
        <div>
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className="text-sm font-semibold block"
            style={{ color: '#D7B56A' }}
          >
            Hidden Blessings
          </motion.span>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-[10px] text-[#7F8A9A]"
          >
            What you didn&rsquo;t see at first glance
          </motion.p>
        </div>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: 'spring' }}
          className="ms-auto text-[10px] px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgba(215,181,106,0.12)', color: '#D7B56A' }}
        >
          {total}
        </motion.span>
      </div>

      {/* Items */}
      <div className="space-y-2.5 ps-1">
        {allBlessings.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + i * 0.15, duration: 0.4 }}
            className="flex items-start gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.4, 1] }}
              transition={{ delay: 1.2 + i * 0.15, duration: 0.35 }}
              className="w-2 h-2 rounded-full mt-1.5 shrink-0"
              style={{
                backgroundColor: '#D7B56A',
                boxShadow: i >= surfaceLen ? '0 0 8px rgba(215,181,106,0.5)' : undefined,
              }}
            />
            <p className="text-sm leading-relaxed" style={{ color: '#D5DDEA' }}>
              {item}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
