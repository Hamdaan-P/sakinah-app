/**
 * Single sample-verse row used by QuranReadingView. Renders the
 * placeholder Arabic / transliteration / translation along with a
 * bookmark toggle. Phase 5 split.
 */

import { BookmarkSimple } from '@phosphor-icons/react';
import { COLORS } from '../_constants';

interface Props {
  verseNum: number;
  surahNumber: number;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}

export function QuranVerseRow({ verseNum, surahNumber, bookmarked, onToggleBookmark }: Props) {
  return (
    <div
      style={{
        marginBottom: '32px',
        paddingBottom: '32px',
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          minWidth: '32px',
          height: '32px',
          backgroundColor: COLORS.navy.quaternary,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: COLORS.gold.primary,
          fontWeight: '600',
        }}>
          {verseNum}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '24px',
            lineHeight: '2',
            color: COLORS.text.cream,
            textAlign: 'right',
            fontFamily: 'serif',
            marginBottom: '16px',
          }}>
            {verseNum === 1 && surahNumber === 1 && 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}
            {verseNum === 2 && 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ'}
            {verseNum === 3 && 'الرَّحْمَٰنِ الرَّحِيمِ'}
          </p>
          <p style={{
            fontSize: '14px',
            fontStyle: 'italic',
            color: COLORS.text.secondary,
            marginBottom: '12px',
          }}>
            {verseNum === 1 && 'Bismillahir-Rahmanir-Rahim'}
            {verseNum === 2 && 'Alhamdu lillahi rabbil-alamin'}
            {verseNum === 3 && 'Ar-Rahmanir-Rahim'}
          </p>
          <p style={{
            fontSize: '14px',
            color: COLORS.text.cream,
            marginBottom: '0',
          }}>
            {verseNum === 1 && 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'}
            {verseNum === 2 && '[All] praise is [due] to Allah, Lord of the worlds.'}
            {verseNum === 3 && 'The Entirely Merciful, the Especially Merciful.'}
          </p>
        </div>
        <button
          onClick={onToggleBookmark}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: bookmarked ? COLORS.gold.primary : COLORS.text.muted,
            padding: '4px',
          }}
        >
          {bookmarked ? (
            <BookmarkSimple size={20} fill="currentColor" />
          ) : (
            <BookmarkSimple size={20} />
          )}
        </button>
      </div>
    </div>
  );
}
