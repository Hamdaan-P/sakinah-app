/**
 * CommunityVoiceCard — "Shape Zaryah+" bold feedback section for the dashboard.
 * Users share reviews, feature requests, and rate their experience.
 * Saves to Firestore collection `community_voices`.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, CheckCircle } from '@phosphor-icons/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { useAuthStore } from '@/core/stores/auth.store';
import { cn } from '@/lib/utils';
import { CommunityVoiceForm } from './community-voice/CommunityVoiceForm';

export function CommunityVoiceCard() {
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
      // Pair the Firestore write with a minimum visible duration so the
      // "Sending…" state always renders. Firestore on a warm cache often
      // resolves in <50ms, which makes the submit feel ignored — adding a
      // short floor reads as deliberate acknowledgement (perceived trust
      // > raw speed for low-frequency / high-stakes actions like feedback).
      const MIN_VISIBLE_MS = 450;
      await Promise.all([
        addDoc(collection(db, 'community_voices'), {
          userId: user?.id ?? 'anonymous',
          userName: user?.displayName ?? null,
          message: message.trim(),
          tags: selectedTags,
          rating,
          source: 'dashboard',
          createdAt: serverTimestamp(),
        }),
        new Promise((resolve) => setTimeout(resolve, MIN_VISIBLE_MS)),
      ]);
      setSubmitted(true);
      setMessage('');
      setSelectedTags([]);
      setRating(0);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Failed to submit voice:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const hasContent = message.trim().length > 0 || selectedTags.length > 0;

  return (
    <div className="px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn(
          'rounded-xl overflow-hidden border border-[#D4A853]/30',
          'bg-gradient-to-br from-[#0F141F]/95 to-[#0A0E16]/95 backdrop-blur-xl',
          'shadow-[0_8px_32px_rgba(212,168,83,0.12),0_0_24px_rgba(43,111,107,0.15),0_4px_16px_rgba(0,0,0,0.4)]'
        )}
      >

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #D4A853, #E8C97A)' }}
            >
              <Megaphone size={24} weight="fill" className="text-[#0A0E16]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F5E8C7]">
                Shape Zaryah<span className="text-[#E8C97A] text-[0.75em] align-super">+</span>
              </h3>
              <p className="text-xs text-[#7A7363]">
                We're a small team working towards a larger goal — your feedback shapes everything
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center py-8 gap-3"
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
                <p className="text-sm text-[#7A7363] text-center max-w-[240px]">
                  Your voice matters. We read every single response.
                </p>
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
        </div>
      </motion.div>
    </div>
  );
}
