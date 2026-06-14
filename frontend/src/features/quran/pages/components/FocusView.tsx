/**
 * FocusView — focus-mode (one ayah at a time) renderer for QuranReadingPage.
 * Verbatim from QuranReadingPage — no behavior changes.
 */

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { QuranLine } from '../../types/quran.types';
import { VerseCard } from './VerseCard';

export function FocusView({
  line,
  index,
  total,
  getArabic,
  arabicFontFamily,
  showTranslation,
  showTransliteration,
  showRoots,
  playingKey,
  bookmarkedKeys,
  tafsirCache,
  tafsirLoading,
  expandedTafsir,
  onPrev,
  onNext,
  onPlay,
  onBookmark,
  onTafsir,
  onAskRaya,
  onAnnotate,
  onVerseVisible,
}: {
  line: QuranLine;
  index: number;
  total: number;
  getArabic: (l: QuranLine) => string;
  arabicFontFamily?: string;
  showTranslation: boolean;
  showTransliteration: boolean;
  showRoots: boolean;
  playingKey: string | null;
  bookmarkedKeys: Set<string>;
  tafsirCache: Record<string, string>;
  tafsirLoading: Set<string>;
  expandedTafsir: string | null;
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  onBookmark: () => void;
  onTafsir: () => void;
  onAskRaya: () => void;
  onAnnotate?: () => void;
  onVerseVisible: (l: QuranLine) => void;
}) {
  useEffect(() => {
    onVerseVisible(line);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the verse key changes; line object and callback are read via closure
  }, [line.verseKey]);

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={line.verseKey}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg"
        >
          <VerseCard
            line={line}
            getArabic={getArabic}
            arabicFontFamily={arabicFontFamily}
            showTranslation={showTranslation}
            showTransliteration={showTransliteration}
            showRoots={showRoots}
            isPlaying={playingKey === line.verseKey}
            isBookmarked={bookmarkedKeys.has(line.verseKey)}
            tafsirText={tafsirCache[line.verseKey]}
            tafsirIsLoading={tafsirLoading.has(line.verseKey)}
            tafsirExpanded={expandedTafsir === line.verseKey}
            onPlay={onPlay}
            onBookmark={onBookmark}
            onTafsir={onTafsir}
            onAskRaya={onAskRaya}
            onAnnotate={onAnnotate}
            onVisible={() => {}}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="px-4 py-2 rounded-lg bg-white/5 text-white/60 disabled:opacity-30"
        >
          Previous
        </button>
        <span className="text-white/40 text-sm">{index + 1} / {total}</span>
        <button
          onClick={onNext}
          disabled={index === total - 1}
          className="px-4 py-2 rounded-lg bg-[#D4A853]/20 text-[#D4A853] disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}

