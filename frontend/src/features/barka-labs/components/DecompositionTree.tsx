/**
 * Decomposition Tree — Simplified single-panel view
 * Shows all hidden blessings in one flat list, then actions.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { ActionableGratitude } from './ActionableGratitude';
import type { DecompositionResponse } from '../types/barka-labs.types';
import { FloatingParticles } from './decomposition/FloatingParticles';
import { RootBlessing } from './decomposition/RootBlessing';
import { HiddenBlessingsCard } from './decomposition/HiddenBlessingsCard';
import { CounterReveal } from './decomposition/CounterReveal';

interface DecompositionTreeProps {
  data: DecompositionResponse;
  onClose: () => void;
}

export function DecompositionTree({ data, onClose }: DecompositionTreeProps) {
  const { decomposition, actions, blessing_text } = data;
  const [showActions, setShowActions] = useState(false);

  // Flatten into one list
  const allBlessings = useMemo(() => [
    ...(decomposition.surface || []),
    ...(decomposition.divine_design || []),
  ], [decomposition]);

  const total = allBlessings.length;
  const surfaceLen = decomposition.surface?.length || 0;

  // Show actions after items finish revealing
  useEffect(() => {
    const revealTime = 1.2 + allBlessings.length * 0.15 + 1.5;
    const timer = setTimeout(() => setShowActions(true), revealTime * 1000);
    return () => clearTimeout(timer);
  }, [allBlessings.length]);

  const counterDelay = 1.2 + allBlessings.length * 0.15 + 0.3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] flex items-start justify-center overflow-y-auto"
      style={{ backgroundColor: 'rgba(12,18,30,0.97)' }}
    >
      <FloatingParticles />

      {/* Close */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onClose}
        className="fixed right-4 z-[9999] p-2.5 rounded-full text-[#7F8A9A] hover:text-[#EBDCB8] transition-colors"
        style={{ top: 'calc(env(safe-area-inset-top) + 1rem)', backgroundColor: 'rgba(36,50,70,0.8)', backdropFilter: 'blur(8px)' }}
      >
        <X size={18} />
      </motion.button>

      <div className="max-w-xl w-full px-3 py-6 sm:px-5 sm:py-10 space-y-5 relative z-10">
        <RootBlessing blessingText={blessing_text} />

        <HiddenBlessingsCard
          allBlessings={allBlessings}
          surfaceLen={surfaceLen}
          total={total}
        />

        <CounterReveal total={total} counterDelay={counterDelay} />

        {/* Actions */}
        <AnimatePresence>
          {showActions && actions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <ActionableGratitude actions={actions} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-8" />
      </div>
    </motion.div>
  );
}
