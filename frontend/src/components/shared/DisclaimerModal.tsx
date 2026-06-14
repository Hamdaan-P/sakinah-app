/**
 * DisclaimerModal — one-time gate shown on first visit to sensitive features
 * Follows DeepKycModal visual pattern
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from '@phosphor-icons/react';
import { DISCLAIMERS } from '@/features/legal/types/disclaimer.types';

interface DisclaimerModalProps {
  contentId: string;
  onAccept: () => void;
  onDismiss?: () => void;
  acceptLabel?: string;
}

export function DisclaimerModal({
  contentId,
  onAccept,
  onDismiss,
  acceptLabel = 'I Understand',
}: DisclaimerModalProps) {
  const content = DISCLAIMERS[contentId];
  if (!content) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
      />
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-sm bg-gradient-to-b from-[#0F141F] to-[#0A0E16] rounded-2xl border border-[rgba(212,168,83,0.2)] shadow-2xl overflow-hidden"
        >
          {/* Header glow */}
          <div className="relative px-6 pt-6 pb-4 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-[#D4A853]/10 blur-3xl rounded-full" />
            <div className="relative w-14 h-14 mx-auto rounded-full bg-[#D4A853]/15 flex items-center justify-center mb-3">
              <ShieldCheck size={28} className="text-[#D4A853]" />
            </div>
            <h3 className="text-lg font-semibold text-[#F5E8C7]">{content.title}</h3>
            {content.arabicPhrase && (
              <p className="mt-1 text-sm text-[#D4A853]/60 font-['Amiri']">{content.arabicPhrase}</p>
            )}
          </div>

          {/* Body */}
          <div className="px-6 pb-4">
            <p className="text-sm text-[#7A7363] leading-relaxed">{content.body}</p>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-1 py-2.5 rounded-lg border border-[rgba(212,168,83,0.2)] text-[#7A7363] text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Go Back
              </button>
            )}
            <button
              onClick={onAccept}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
            >
              {acceptLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
