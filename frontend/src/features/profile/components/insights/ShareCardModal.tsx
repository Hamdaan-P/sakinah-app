/**
 * ShareCardModal — full-screen overlay wrapping the ShareableCard.
 */

import { motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { ShareableCard } from './ShareableCard';

interface ShareCardModalProps {
  onClose: () => void;
  name: string;
  archetype?: string;
  imanLevel?: number;
  topEmotions: string[];
  moodTrend: string;
  totalConversations: number;
  completeness: number;
  quote?: string;
}

export function ShareCardModal({
  onClose, name, archetype, imanLevel, topEmotions, moodTrend,
  totalConversations, completeness, quote,
}: ShareCardModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-[420px]"
      >
        <div className="flex justify-end mb-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#0F141F]/80 text-[#7A7363] hover:text-[#F5E8C7] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <ShareableCard
          name={name}
          archetype={archetype}
          imanLevel={imanLevel}
          topEmotions={topEmotions}
          moodTrend={moodTrend}
          totalConversations={totalConversations}
          completeness={completeness}
          quote={quote}
        />
      </motion.div>
    </motion.div>
  );
}
