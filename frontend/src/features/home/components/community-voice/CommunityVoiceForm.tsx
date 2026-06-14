/**
 * CommunityVoiceForm — rating + quick-tag chips + message body. Presentational;
 * parent owns submit state.
 */

import { motion } from 'framer-motion';
import { PaperPlaneTilt, Star, ChatCircleDots, Lightbulb, Heart } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const QUICK_TAGS = [
  { label: 'Love it!', icon: Heart, color: '#EF4444' },
  { label: 'More AI features', icon: Lightbulb, color: '#D4A853' },
  { label: 'Better Quran tools', icon: ChatCircleDots, color: '#4FB892' },
  { label: 'Community features', icon: ChatCircleDots, color: '#22C55E' },
  { label: 'Financial tools', icon: Lightbulb, color: '#A78BFA' },
  { label: 'Education content', icon: Lightbulb, color: '#F59E0B' },
];

interface Props {
  message: string;
  setMessage: (v: string) => void;
  selectedTags: string[];
  toggleTag: (label: string) => void;
  rating: number;
  setRating: (v: number) => void;
  submitting: boolean;
  hasContent: boolean;
  onSubmit: () => void;
}

export function CommunityVoiceForm({
  message,
  setMessage,
  selectedTags,
  toggleTag,
  rating,
  setRating,
  submitting,
  hasContent,
  onSubmit,
}: Props) {
  return (
    <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Star rating — prominent */}
      <div className="flex flex-col items-center mb-4 py-3 rounded-xl bg-[#0A0E16]/60 border border-white/5">
        <p className="text-xs text-[#7A7363] mb-2 font-medium">How's your experience so far?</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.button
              key={n}
              onClick={() => setRating(n === rating ? 0 : n)}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.15 }}
            >
              <Star
                size={28}
                weight={n <= rating ? 'fill' : 'regular'}
                className={cn(
                  'transition-colors',
                  n <= rating ? 'text-[#E8C97A] drop-shadow-[0_0_6px_rgba(212,168,83,0.5)]' : 'text-[#5C5749]/40'
                )}
              />
            </motion.button>
          ))}
        </div>
        {rating > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-[#D4A853] mt-1.5 font-medium"
          >
            {rating <= 2 ? "We'll do better, InshaAllah" : rating <= 4 ? 'Alhamdulillah!' : 'MashaAllah, thank you!'}
          </motion.p>
        )}
      </div>

      {/* Quick tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_TAGS.map((tag) => {
          const selected = selectedTags.includes(tag.label);
          const TagIcon = tag.icon;
          return (
            <motion.button
              key={tag.label}
              onClick={() => toggleTag(tag.label)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                selected
                  ? 'border-[#D4A853]/50 text-[#E8C97A]'
                  : 'bg-white/5 border-white/10 text-[#7A7363] hover:border-white/25'
              )}
              style={selected ? { background: `${tag.color}20`, borderColor: `${tag.color}60` } : undefined}
            >
              <TagIcon size={12} weight={selected ? 'fill' : 'regular'} style={selected ? { color: tag.color } : undefined} />
              {tag.label}
            </motion.button>
          );
        })}
      </div>

      {/* Text input */}
      <div className="relative mb-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your thoughts, ideas, or what you'd love to see next..."
          rows={3}
          className={cn(
            'w-full bg-[#0A0E16]/80 border border-white/10 rounded-xl px-4 py-3',
            'text-sm text-[#F5E8C7] placeholder:text-[#5C5749]/60 resize-none',
            'focus:outline-none focus:border-[#D4A853]/50 focus:shadow-[0_0_0_2px_rgba(212,168,83,0.1)] transition-all'
          )}
        />
      </div>

      {/* Submit button — full width, bold */}
      <motion.button
        onClick={onSubmit}
        disabled={submitting || !hasContent}
        whileTap={hasContent ? { scale: 0.98 } : undefined}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all',
          hasContent
            ? 'text-[#0A0E16] shadow-[0_4px_20px_rgba(212,168,83,0.3)] hover:shadow-[0_6px_24px_rgba(212,168,83,0.4)]'
            : 'bg-white/5 text-[#5C5749] cursor-not-allowed'
        )}
        style={hasContent ? { background: 'linear-gradient(90deg, #D4A853, #E8C97A)' } : undefined}
      >
        <PaperPlaneTilt size={18} weight="bold" />
        {submitting ? 'Sending...' : 'Share Your Voice'}
      </motion.button>
    </motion.div>
  );
}
