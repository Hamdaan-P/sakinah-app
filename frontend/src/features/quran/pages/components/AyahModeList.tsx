/**
 * Vertical list of VerseCard cells used in QuranReadingPage "ayah" mode.
 * Verbatim — no behavior changes.
 */

import { motion } from 'framer-motion';
import type { QuranLine, QuranWord } from '../../types/quran.types';
import { VerseCard } from './VerseCard';

interface Props {
  lines: QuranLine[];
  wordsByKey: Record<string, QuranWord[]>;
  highlightTick: number;
  annotationTick: number;
  getArabic: (line: QuranLine) => string;
  showTranslation: boolean;
  showTransliteration: boolean;
  showRoots: boolean;
  tajweedEnabled: boolean;
  arabicFontSize: number;
  arabicLineHeight: number;
  arabicFontFamily?: string;
  playingKey: string | null;
  bookmarkedKeys: Set<string>;
  selectedAyah: string | null;
  tafsirCache: Record<string, string>;
  tafsirLoading: Set<string>;
  expandedTafsir: string | null;
  onPlay: (line: QuranLine) => void;
  onStopAudio: () => void;
  onBookmark: (line: QuranLine) => void;
  onTafsir: (line: QuranLine) => void;
  onAskRaya: (line: QuranLine) => void;
  onAnnotate?: (line: QuranLine) => void;
  onVerseVisible: (line: QuranLine) => void;
  onWordTap: (word: QuranWord, x: number, y: number) => void;
  onAyahTap: (verseKey: string) => void;
}

export function AyahModeList({
  lines, wordsByKey, highlightTick, annotationTick, getArabic, showTranslation,
  showTransliteration, showRoots, tajweedEnabled, arabicFontSize, arabicLineHeight, arabicFontFamily,
  playingKey, bookmarkedKeys, selectedAyah, tafsirCache, tafsirLoading, expandedTafsir,
  onPlay, onStopAudio, onBookmark, onTafsir, onAskRaya, onAnnotate, onVerseVisible,
  onWordTap, onAyahTap,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {lines.map((line, i) => (
        <motion.div
          key={line.verseKey + '-' + highlightTick + '-' + annotationTick}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.02, 0.2) }}
        >
          <VerseCard
            line={line}
            words={wordsByKey[line.verseKey]}
            getArabic={getArabic}
            showTranslation={showTranslation}
            showTransliteration={showTransliteration}
            showRoots={showRoots}
            tajweedEnabled={tajweedEnabled}
            arabicFontSize={arabicFontSize}
            arabicLineHeight={arabicLineHeight}
            arabicFontFamily={arabicFontFamily}
            isPlaying={playingKey === line.verseKey}
            isBookmarked={bookmarkedKeys.has(line.verseKey)}
            isSelected={selectedAyah === line.verseKey}
            tafsirText={tafsirCache[line.verseKey]}
            tafsirIsLoading={tafsirLoading.has(line.verseKey)}
            tafsirExpanded={expandedTafsir === line.verseKey}
            onPlay={() => (playingKey === line.verseKey ? onStopAudio() : onPlay(line))}
            onBookmark={() => onBookmark(line)}
            onTafsir={() => onTafsir(line)}
            onAskRaya={() => onAskRaya(line)}
            onAnnotate={onAnnotate ? () => onAnnotate(line) : undefined}
            onVisible={() => onVerseVisible(line)}
            onWordTap={(word, x, y) => onWordTap(word, x, y)}
            onAyahTap={() => onAyahTap(line.verseKey)}
          />
        </motion.div>
      ))}
    </div>
  );
}
