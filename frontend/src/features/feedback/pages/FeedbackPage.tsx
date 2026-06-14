/**
 * FeedbackPage — dedicated feedback drop at /feedback.
 *
 * Reuses CommunityVoiceForm (the existing form component used on the old
 * dashboard "Shape Zaryah" block) so submission shape stays identical to
 * the legacy `community_voices` Firestore collection. This page just hosts
 * the form on its own route with a back button and breathing room.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, Megaphone, CheckCircle } from '@phosphor-icons/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { useAuthStore } from '@/core/stores/auth.store';
import { PremiumIslamicBackground } from '@/components/shared/PremiumIslamicBackground';
import { CommunityVoiceForm } from '@/features/home/components/community-voice/CommunityVoiceForm';

export function FeedbackPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [message, setMessage] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!message.trim() && selectedTags.length === 0) return;
    setSubmitting(true);
    try {
      const MIN_VISIBLE_MS = 450;
      await Promise.all([
        addDoc(collection(db, 'community_voices'), {
          userId: user?.id ?? 'anonymous',
          userName: user?.displayName ?? null,
          message: message.trim(),
          tags: selectedTags,
          rating,
          source: 'feedback_page',
          createdAt: serverTimestamp(),
        }),
        new Promise((resolve) => setTimeout(resolve, MIN_VISIBLE_MS)),
      ]);
      setSubmitted(true);
      setMessage('');
      setSelectedTags([]);
      setRating(0);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const hasContent = message.trim().length > 0 || selectedTags.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0A0E16] overflow-y-auto">
      <PremiumIslamicBackground variant="hero" className="rounded-none">
        {/* Header */}
        <div
          className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b border-[#D4A853]/15"
          style={{ background: 'rgba(15,23,36,0.85)', backdropFilter: 'blur(10px)' }}
        >
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Back"
          >
            <CaretLeft size={18} className="text-[#F5E8C7]" />
          </button>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#D4A853]/80 font-semibold">
              Help shape Zaryah
            </p>
            <h1 className="text-[17px] font-bold text-[#F5E8C7] leading-tight">Send feedback</h1>
          </div>
        </div>

        <div className="px-4 py-6 max-w-2xl mx-auto w-full">
          {/* Intro card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#D4A853]/25 bg-gradient-to-br from-[#0F141F]/95 to-[#0A0E16]/95 backdrop-blur-xl p-5 mb-5 shadow-[0_8px_32px_rgba(212,168,83,0.1)]"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #D4A853, #E8C97A)' }}
              >
                <Megaphone size={24} weight="fill" className="text-[#0A0E16]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F5E8C7] mb-1">
                  Your voice shapes Zaryah<span className="text-[#E8C97A] text-[0.75em] align-super">+</span>
                </h2>
                <p className="text-xs text-[#7A7363] leading-relaxed">
                  Tell us what's working, what's broken, or what you'd love to see next. We read every single response — InshaAllah.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Form / success state */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-white/8 bg-[#0A0E16]/70 backdrop-blur-xl p-5"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center py-8 gap-3 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                  >
                    <CheckCircle size={36} weight="fill" className="text-white" />
                  </motion.div>
                  <p className="text-lg font-bold text-[#F5E8C7]">JazakAllahu Khairan!</p>
                  <p className="text-sm text-[#7A7363] max-w-[260px]">
                    Your voice matters. We've received your feedback and will reflect on it.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 rounded-full text-xs font-semibold border border-[#D4A853]/40 text-[#E8C97A] hover:bg-[#D4A853]/10 transition-colors"
                    >
                      Send another
                    </button>
                    <button
                      onClick={() => navigate(-1)}
                      className="px-4 py-2 rounded-full text-xs font-bold text-[#0A0E16]"
                      style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
                    >
                      Back home
                    </button>
                  </div>
                </motion.div>
              ) : (
                <CommunityVoiceForm
                  message={message}
                  setMessage={setMessage}
                  selectedTags={selectedTags}
                  toggleTag={toggleTag}
                  rating={rating}
                  setRating={setRating}
                  submitting={submitting}
                  hasContent={hasContent}
                  onSubmit={handleSubmit}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </PremiumIslamicBackground>
    </div>
  );
}

export default FeedbackPage;
