/**
 * ChatFeedbackPopup — Triggered after 3 user messages or via floating button.
 * Asks for honest feedback about the AI experience.
 * Saves to Firestore `community_voices` collection.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, PaperPlaneTilt, Sparkle } from '@phosphor-icons/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { useAuthStore } from '@/core/stores/auth.store';
import { cn } from '@/lib/utils';

interface ChatFeedbackPopupProps {
  open: boolean;
  onClose: () => void;
}

export function ChatFeedbackPopup({ open, onClose }: ChatFeedbackPopupProps) {
  const user = useAuthStore((s) => s.user);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 && !message.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'community_voices'), {
        userId: user?.id ?? 'anonymous',
        userName: user?.displayName ?? null,
        message: message.trim(),
        rating,
        source: 'chat_popup',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        // Reset after animation
        setTimeout(() => {
          setSubmitted(false);
          setRating(0);
          setMessage('');
        }, 300);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-[90vw] max-w-[380px] rounded-2xl',
              'bg-gradient-to-b from-[#10151F] to-[#0F141F]',
              'border border-[#D4A853]/25 shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
              'p-6'
            )}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-[#5C5749] hover:text-[#F5E8C7] hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-4 gap-2"
                >
                  <Sparkle size={36} weight="duotone" className="text-[#E8C97A]" />
                  <p className="text-base font-semibold text-[#F5E8C7]">JazakAllahu Khairan!</p>
                  <p className="text-xs text-[#7A7363] text-center">
                    Your voice helps us serve the Ummah better
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }}>
                  {/* Header */}
                  <div className="text-center mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#D4A853]/15 flex items-center justify-center mx-auto mb-3">
                      <Sparkle size={22} weight="duotone" className="text-[#E8C97A]" />
                    </div>
                    <h3 className="text-base font-semibold text-[#F5E8C7] mb-1">
                      We're still in Beta
                    </h3>
                    <p className="text-xs text-[#7A7363] leading-relaxed">
                      Your honest reviews and suggestions matter a lot to us.
                      Help us shape Zaryah Plus into something truly worthy of the Ummah.
                    </p>
                  </div>

                  {/* Star rating */}
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRating(n === rating ? 0 : n)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          size={28}
                          weight={n <= rating ? 'fill' : 'regular'}
                          className={cn(
                            'transition-colors',
                            n <= rating ? 'text-[#E8C97A]' : 'text-[#5C5749]/40'
                          )}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Message */}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What can we do better? What do you need most?"
                    rows={3}
                    className={cn(
                      'w-full bg-[#0A0E16]/60 border border-white/10 rounded-xl px-3.5 py-2.5',
                      'text-sm text-[#F5E8C7] placeholder:text-[#5C5749] resize-none',
                      'focus:outline-none focus:border-[#D4A853]/40 transition-colors mb-4'
                    )}
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[#7A7363] hover:text-[#F5E8C7] hover:bg-white/5 transition-colors"
                    >
                      Maybe later
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || (rating === 0 && !message.trim())}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                        rating > 0 || message.trim()
                          ? 'bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] hover:shadow-[0_2px_12px_rgba(212,168,83,0.3)]'
                          : 'bg-white/5 text-[#5C5749] cursor-not-allowed'
                      )}
                    >
                      <PaperPlaneTilt size={14} weight="bold" />
                      {submitting ? 'Sending...' : 'Share'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
