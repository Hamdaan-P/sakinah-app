/**
 * Quran tab — wraps the recitation/reading sub-tab switcher. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { COLORS } from '../_constants';
import { QuranRecitationView } from './QuranRecitationView';
import { QuranReadingView } from './QuranReadingView';
import type { QuranSubTab, ReadingViewMode } from '../_types';
import type { Surah } from '../_data';

interface Props {
  quranSubTab: QuranSubTab;
  selectedReciter: string;
  showReciterDropdown: boolean;
  playingSurah: number | null;
  selectedReadingSurah: Surah;
  readingViewMode: ReadingViewMode;
  bookmarkedVerses: Set<number>;
  quranStreak: number;
  onChangeSubTab: (sub: QuranSubTab) => void;
  onChangeReciter: (reciter: string) => void;
  onToggleReciterDropdown: () => void;
  onTogglePlaySurah: (number: number) => void;
  onChangeReadingSurah: (surah: Surah) => void;
  onChangeViewMode: (mode: ReadingViewMode) => void;
  onToggleBookmark: (verseNumber: number) => void;
}

export function QuranTab(props: Props) {
  const { quranSubTab, onChangeSubTab } = props;

  return (
    <motion.div
      key="quran"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {[
          { id: 'recitation' as const, label: 'Recitation' },
          { id: 'reading' as const, label: 'Reading' },
        ].map((subTab) => (
          <button
            key={subTab.id}
            onClick={() => onChangeSubTab(subTab.id)}
            style={{
              padding: '10px 24px',
              borderRadius: '24px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: quranSubTab === subTab.id ? COLORS.teal : COLORS.navy.tertiary,
              color: COLORS.text.cream,
            }}
          >
            {subTab.label}
          </button>
        ))}
      </div>

      {quranSubTab === 'recitation' && (
        <QuranRecitationView
          selectedReciter={props.selectedReciter}
          showReciterDropdown={props.showReciterDropdown}
          playingSurah={props.playingSurah}
          onChangeReciter={props.onChangeReciter}
          onToggleReciterDropdown={props.onToggleReciterDropdown}
          onTogglePlaySurah={props.onTogglePlaySurah}
        />
      )}

      {quranSubTab === 'reading' && (
        <QuranReadingView
          selectedReadingSurah={props.selectedReadingSurah}
          readingViewMode={props.readingViewMode}
          bookmarkedVerses={props.bookmarkedVerses}
          quranStreak={props.quranStreak}
          onChangeReadingSurah={props.onChangeReadingSurah}
          onChangeViewMode={props.onChangeViewMode}
          onToggleBookmark={props.onToggleBookmark}
        />
      )}
    </motion.div>
  );
}
