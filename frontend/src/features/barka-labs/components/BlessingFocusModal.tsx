/**
 * BlessingFocusModal — focused-input overlay triggered by the hero
 * "Count a Blessing" CTA. Dims + blurs the home page behind, surfaces a
 * compact card with the live OthersStream above the InlineLogCard.
 *
 * Close paths:
 *   - Click backdrop (outside the modal card)
 *   - Press Escape
 *   - Click the X button
 *   - Successful submit (auto-closes ~1.2s after the "Alhamdulillah!" beat)
 *
 * Responsive:
 *   - Mobile (default): full-bleed safe-area padding, modal hugs viewport
 *   - Desktop (md+): centred, max-width 28rem
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { C } from '../barka-labs.constants';
import { OthersStream } from './community/OthersStream';
import { InlineLogCard } from './journal/InlineLogCard';

interface BlessingFocusModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
  submitting: boolean;
  /** Called after the auto-close beat completes, so the parent can navigate
      (e.g. take the user to the Community page). */
  onSubmitted?: () => void;
}

export function BlessingFocusModal({ open, onClose, onSubmit, submitting, onSubmitted }: BlessingFocusModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Esc-to-close + body-scroll lock while the modal is mounted.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Auto-close ~1.2s after a successful submit. InlineLogCard's "done" state
  // lives inside that component, so we wrap onSubmit to time the close from
  // here once the promise resolves.
  const handleSubmit = async (text: string) => {
    await onSubmit(text);
    setTimeout(() => {
      onClose();
      onSubmitted?.();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
          style={{
            background: 'rgba(8,13,24, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={(e) => {
            // Only close when the click lands on the backdrop itself,
            // not when it bubbles up from the modal card.
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label="Count a Blessing"
            className="w-full md:max-w-[28rem] mx-auto md:rounded-2xl rounded-t-2xl p-3 md:p-4 relative"
            style={{
              background: 'linear-gradient(180deg, rgba(30,41,58,0.96), rgba(13,19,35,0.96))',
              border: `1px solid ${C.cardB}`,
              boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
              paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Close affordance — top-right */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/5 active:scale-95"
              style={{ color: C.t3 }}
            >
              <X size={16} weight="bold" />
            </button>

            {/* Tiny title — keeps the user oriented; the visuals do the rest */}
            <div className="mb-2 pr-8">
              <p
                className="text-[15px] md:text-base font-semibold"
                style={{
                  color: C.t1,
                  fontFamily: 'Cormorant Garamond, serif',
                  letterSpacing: '-0.01em',
                }}
              >
                Count a Blessing
              </p>
              <p className="text-[11px] md:text-[12px]" style={{ color: C.t3 }}>
                Read what others are grateful for, then add yours.
              </p>
            </div>

            <OthersStream />

            {/* InlineLogCard already owns voice input, char count, submit UX —
                we re-use it verbatim so behaviour stays consistent with the
                Gratitude Journal screen. The flying-card animation is a no-op
                in the modal context (there's no journal list below to fly into). */}
            <InlineLogCard
              onSubmit={handleSubmit}
              submitting={submitting}
              onFlyingCard={() => { /* no-op inside the modal */ }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
