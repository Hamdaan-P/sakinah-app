/**
 * Quran reading view — surah picker, view-mode toggle, streak chip, and
 * the sample verses panel. Phase 5 split.
 */

import { COLORS } from '../_constants';
import { SURAHS, type Surah } from '../_data';
import type { ReadingViewMode } from '../_types';
import { QuranVerseRow } from './QuranVerseRow';

interface Props {
  selectedReadingSurah: Surah;
  readingViewMode: ReadingViewMode;
  bookmarkedVerses: Set<number>;
  quranStreak: number;
  onChangeReadingSurah: (surah: Surah) => void;
  onChangeViewMode: (mode: ReadingViewMode) => void;
  onToggleBookmark: (verseNumber: number) => void;
}

export function QuranReadingView({
  selectedReadingSurah,
  readingViewMode,
  bookmarkedVerses,
  quranStreak,
  onChangeReadingSurah,
  onChangeViewMode,
  onToggleBookmark,
}: Props) {
  return (
    <div>
      {/* Reading Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        {/* Surah Selector */}
        <select
          value={selectedReadingSurah.number}
          onChange={(e) => {
            const surah = SURAHS.find((s) => s.number === parseInt(e.target.value));
            if (surah) onChangeReadingSurah(surah);
          }}
          style={{
            padding: '12px 16px',
            backgroundColor: COLORS.navy.tertiary,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            color: COLORS.text.cream,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {SURAHS.map((surah) => (
            <option key={surah.number} value={surah.number}>
              {surah.number}. {surah.english} - {surah.arabic}
            </option>
          ))}
        </select>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['focus', 'ayah', 'page'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onChangeViewMode(mode)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: readingViewMode === mode ? COLORS.gold.primary : COLORS.navy.tertiary,
                color: readingViewMode === mode ? COLORS.navy.primary : COLORS.text.secondary,
                textTransform: 'capitalize',
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Streak Display */}
        <div style={{
          marginLeft: 'auto',
          padding: '8px 16px',
          backgroundColor: COLORS.navy.tertiary,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '18px' }}>🔥</span>
          <span style={{ fontSize: '14px', color: COLORS.text.cream }}>
            Day {quranStreak} streak
          </span>
        </div>
      </div>

      {/* Reading Content */}
      <div style={{
        backgroundColor: COLORS.navy.secondary,
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: COLORS.gold.secondary,
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          {selectedReadingSurah.arabic} - {selectedReadingSurah.english}
        </h2>

        {/* Sample Verses */}
        {[1, 2, 3].map((verseNum) => (
          <QuranVerseRow
            key={verseNum}
            verseNum={verseNum}
            surahNumber={selectedReadingSurah.number}
            bookmarked={bookmarkedVerses.has(verseNum)}
            onToggleBookmark={() => onToggleBookmark(verseNum)}
          />
        ))}
      </div>
    </div>
  );
}
