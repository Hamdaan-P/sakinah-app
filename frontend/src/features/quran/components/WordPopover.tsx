/**
 * WordPopover
 * Lightweight, non-blocking popover shown next to a tapped word.
 * Shows: Arabic, transliteration, translation, root, and "Ask Raya" CTA.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChatCircle, X } from '@phosphor-icons/react';
import type { QuranWord } from '../types/quran.types';
import { fetchWordMorphology, type WordMorphology } from '../services/morphologyService';
import { isAyahInTadabburPilot, TADABBUR_PILOT_SURAH_NAMES } from '../config/tadabbur';

interface Props {
  word: QuranWord;
  x: number;
  y: number;
  onClose: () => void;
  onAskRaya?: (word: QuranWord) => void;
  /** Called when the user taps "View root" — parent opens RootOccurrencesSheet. */
  onViewRoot?: (root: string) => void;
}

export function WordPopover({ word, x, y, onClose, onAskRaya, onViewRoot }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [morph, setMorph] = useState<WordMorphology | null>(null);
  const [morphLoaded, setMorphLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMorphLoaded(false);
    fetchWordMorphology(word.verseKey, word.position)
      .then((r) => { if (!cancelled) { setMorph(r); setMorphLoaded(true); } })
      .catch(() => { if (!cancelled) setMorphLoaded(true); });
    return () => { cancelled = true; };
  }, [word.verseKey, word.position]);

  const root = morph?.root ?? word.root ?? null;
  // Morphology data (root, lemma, POS, gloss) is authored per-verse and
  // currently only covers the pilot surahs. On an unsupported surah we
  // explain why the linguistic details are missing rather than silently
  // hiding them — otherwise the popover feels broken on every tap.
  const showPilotHint = morphLoaded && !morph && !isAyahInTadabburPilot(word.verseKey);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKey);
    // Slight delay so the opening tap doesn't immediately re-close it
    const t = window.setTimeout(() => document.addEventListener('mousedown', onClick), 50);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
      window.clearTimeout(t);
    };
  }, [onClose]);

  // Clamp to viewport width — prefer left-align but flip if it would overflow
  const approxWidth = 260;
  const left = Math.max(8, Math.min(x - approxWidth / 2, window.innerWidth - approxWidth - 8));
  const top = Math.max(8, y - 8);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      className="fixed z-50 w-64 rounded-xl border border-[#D4A853]/30 bg-[#0A0E16] shadow-2xl shadow-black/50 backdrop-blur-sm"
      style={{ left, top, transform: 'translateY(-100%)' }}
    >
      <div className="flex items-start justify-between px-3 pt-2.5 pb-1.5 border-b border-white/5">
        <p className="text-xl font-arabic text-[#E8C97A]" dir="rtl">{word.arabic}</p>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-white/10 text-white/40">
          <X size={14} />
        </button>
      </div>
      <div className="px-3 py-2 space-y-1">
        {word.transliteration && (
          <p className="text-[11px] text-[#4FB892] italic">{word.transliteration}</p>
        )}
        {word.translation && (
          <p className="text-xs text-white/80 leading-snug">{word.translation}</p>
        )}
        {root && (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-white/40 uppercase tracking-wide">Root</span>
            {onViewRoot ? (
              <button
                type="button"
                onClick={() => onViewRoot(root)}
                className="text-sm font-arabic text-[#D4A853] hover:underline"
                dir="rtl"
                aria-label={`View all occurrences of root ${root}`}
              >
                {root}
              </button>
            ) : (
              <span className="text-sm font-arabic text-[#D4A853]" dir="rtl">{root}</span>
            )}
          </div>
        )}
        {morph?.lemma && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/40 uppercase tracking-wide">Lemma</span>
            <span className="text-sm font-arabic text-[#F5E8C7]" dir="rtl">{morph.lemma}</span>
          </div>
        )}
        {morph?.pos && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/40 uppercase tracking-wide">Part of speech</span>
            <span className="text-[11px] text-white/70">{morph.pos}</span>
          </div>
        )}
        {morph?.gloss && (
          <p className="text-[11px] text-white/60 italic pt-1 leading-snug">
            Gloss: {morph.gloss}
          </p>
        )}
        {showPilotHint && (
          <p className="text-[10px] text-[#D7B56A]/80 italic pt-1 leading-snug">
            Word-by-word morphology is piloting on {TADABBUR_PILOT_SURAH_NAMES}. Coming to more surahs soon.
          </p>
        )}
      </div>
      {onAskRaya && (
        <div className="px-2.5 pb-2.5">
          <button
            onClick={() => onAskRaya(word)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] text-[11px] font-medium hover:bg-[#D4A853]/25"
          >
            <ChatCircle size={13} weight="fill" />
            Ask Raya about this word
          </button>
        </div>
      )}
    </motion.div>
  );
}
