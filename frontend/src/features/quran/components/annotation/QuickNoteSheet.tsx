/**
 * QuickNoteSheet — slide-up inline note composer (non-blocking, small footprint)
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { PRESET_ANNOTATION_TAGS } from '../../types/quran.types';
import { createAnnotation } from '../../services/annotationManager';

interface QuickProps {
  open: boolean;
  verseKey: string;
  surahId: number;
  wordPosition?: number;
  pageNumber?: number;
  onClose: () => void;
}

/**
 * Preset templates matching (and extending) the reference app's dropdown.
 * Each template auto-fills the comment and a suggested tag so the user
 * can save in two taps.
 */
const TEMPLATES: Array<{ label: string; tag: string }> = [
  { label: 'I find this word difficult to pronounce', tag: 'pronunciation' },
  { label: 'I find this word difficult to memorize', tag: 'difficult-word' },
  { label: 'I forget the next ayah', tag: 'forgot-next' },
  { label: 'Transition mistake here', tag: 'transition' },
  { label: 'Tajweed rule to review', tag: 'tajweed' },
  { label: 'Meaning unclear — look up tafsir', tag: 'meaning' },
];

export function QuickNoteSheet({ open, verseKey, surahId, wordPosition, pageNumber, onClose }: QuickProps) {
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setComment('');
      setTags([]);
    }
  }, [open]);

  const submit = () => {
    if (!comment.trim()) {
      onClose();
      return;
    }
    createAnnotation({ verseKey, surahId, wordPosition, pageNumber, comment, tags });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="fixed left-0 right-0 bottom-0 z-50 rounded-t-2xl bg-[#0A0E16] border-t border-[#D4A853]/20 shadow-2xl"
        >
          <div className="max-w-xl mx-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] text-white/40">Note on</p>
                <p className="text-sm font-semibold text-white">Verse {verseKey}{wordPosition ? ` · word ${wordPosition}` : ''}</p>
              </div>
              <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-white/60">
                <X size={18} />
              </button>
            </div>
            {/* Preset templates — tap to prefill */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => {
                    setComment(t.label);
                    setTags((cur) => (cur.includes(t.tag) ? cur : [...cur, t.tag]));
                  }}
                  className="whitespace-nowrap px-2 py-1 text-[11px] rounded-full bg-[#D4A853]/10 border border-[#D4A853]/25 text-[#D4A853] hover:bg-[#D4A853]/20"
                >
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              // eslint-disable-next-line jsx-a11y/no-autofocus -- user-action-triggered annotation sheet; auto-focus is expected UX
              autoFocus
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
                if (e.key === 'Escape') onClose();
              }}
              placeholder="Quick note… (⌘+Enter to save)"
              className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4A853]/40 resize-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_ANNOTATION_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => setTags((t) => (active ? t.filter((x) => x !== tag) : [...t, tag]))}
                    className={cn(
                      'px-2 py-0.5 text-[11px] rounded-full border transition-colors',
                      active
                        ? 'bg-[#D4A853]/20 border-[#D4A853]/40 text-[#D4A853]'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80',
                    )}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-2 mt-3">
              <button onClick={onClose} className="px-3 py-1.5 text-xs text-white/60 hover:text-white">
                Cancel
              </button>
              <button
                onClick={submit}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#D4A853]/20 border border-[#D4A853]/40 text-[#D4A853] hover:bg-[#D4A853]/30"
              >
                Save note
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
