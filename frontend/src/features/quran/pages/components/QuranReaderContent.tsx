/**
 * Conditional reader content for QuranReadingPage: loading / Snap-ayah (circle) /
 * Focus / Page / Ayah-mode list. Verbatim — no behavior changes.
 */

import type { QuranLine, QuranWord, ReadingMode, Surah } from '../../types/quran.types';
import type { MushafStyleId } from '../../config/mushafStyles';
import { SnapAyahReader } from '../../components/SnapAyahReader';
import { FocusView } from './FocusView';
import { PageView } from './PageView';
import { ReaderErrorBoundary } from './ReaderErrorBoundary';
import { AyahModeList } from './AyahModeList';
import { AyahExtrasPanel } from '../../components/AyahExtrasPanel';

interface Props {
  onJumpToVerse?: (verseKey: string) => void;
  loading: boolean;
  mode: ReadingMode;
  lines: QuranLine[];
  wordsByKey: Record<string, QuranWord[]>;
  getArabic: (line: QuranLine) => string;
  showTranslation: boolean;
  showTransliteration: boolean;
  showRoots: boolean;
  tajweedEnabled: boolean;
  arabicFontSize: number;
  arabicLineHeight: number;
  /** Style-aware Arabic font stack for verse rendering. */
  arabicFontFamily?: string;
  /** Active Mushaf script style (drives page mode + verse fonts). */
  scriptStyle: MushafStyleId;
  /** All surahs — page mode needs names + ayah counts for the layout. */
  surahs: Surah[];
  /** Active translation + tafsir ids — page mode renders both below the page. */
  translationId: number;
  tafsirId: number;
  playingKey: string | null;
  bookmarkedKeys: Set<string>;
  selectedAyah: string | null;
  tafsirCache: Record<string, string>;
  tafsirLoading: Set<string>;
  expandedTafsir: string | null;
  highlightTick: number;
  annotationTick: number;
  isHostBroadcasting: boolean;
  isFollowing: boolean;
  followTargetKey: string | null;
  hostBroadcast: ((key: string) => void) | undefined;
  focusIndex: number;
  focusLine: QuranLine | undefined;
  onSetFocusIndex: (n: number) => void;
  onPlayAyah: (line: QuranLine) => void;
  onPlaySurahFrom: (line: QuranLine) => void;
  onStopAudio: () => void;
  onBookmark: (line: QuranLine) => void;
  onToggleTafsir: (line: QuranLine) => void;
  onAskRaya: (line: QuranLine) => void;
  onAnnotate?: (line: QuranLine) => void;
  onVerseVisible: (line: QuranLine) => void;
  onSetSelectedWord: (v: { word: QuranWord; x: number; y: number } | null) => void;
  onSetSelectedAyah: (k: string | null | ((prev: string | null) => string | null)) => void;
  /** Page mode → whether the current page is the surah's last page. */
  onPageReachedEnd?: (atEnd: boolean) => void;
}

export function QuranReaderContent(props: Props) {
  const {
    onJumpToVerse,
    loading, mode, lines, wordsByKey, getArabic, showTranslation, showTransliteration,
    showRoots, tajweedEnabled, arabicFontSize, arabicLineHeight, arabicFontFamily, scriptStyle, surahs, translationId, tafsirId, playingKey, bookmarkedKeys,
    selectedAyah, tafsirCache, tafsirLoading, expandedTafsir, highlightTick, annotationTick,
    isHostBroadcasting, isFollowing, followTargetKey, hostBroadcast, focusIndex, focusLine,
    onSetFocusIndex, onPlayAyah, onPlaySurahFrom, onStopAudio, onBookmark, onToggleTafsir, onAskRaya,
    onAnnotate,
    onVerseVisible, onSetSelectedWord, onSetSelectedAyah, onPageReachedEnd,
  } = props;

  if (loading) {
    return (
      <div className="px-4 py-4">
        <div className="flex justify-center py-20">
          <div className="animate-pulse text-[#D4A853]/60">Loading verses...</div>
        </div>
      </div>
    );
  }

  if (isHostBroadcasting || isFollowing) {
    return (
      <div className="px-4 py-4">
        <ReaderErrorBoundary mode="circle">
          <SnapAyahReader
            lines={lines}
            wordsByKey={wordsByKey}
            getArabic={getArabic}
            getTajweedHtml={(l) => l.arabicTajweed}
            showTranslation={showTranslation}
            showTransliteration={showTransliteration}
            arabicFontSize={arabicFontSize}
            arabicLineHeight={arabicLineHeight}
            tajweedEnabled={tajweedEnabled}
            playingKey={playingKey}
            bookmarkedKeys={bookmarkedKeys}
            selectedAyah={selectedAyah}
            onPlay={(line) => onPlayAyah(line)}
            onStop={onStopAudio}
            onBookmark={(line) => onBookmark(line)}
            onSelectAyah={(key) => {
              onSetSelectedWord(null);
              onSetSelectedAyah(key);
            }}
            onVerseVisible={(line) => onVerseVisible(line)}
            targetVerseKey={followTargetKey}
            onCurrentChange={hostBroadcast || undefined}
          />
        </ReaderErrorBoundary>
      </div>
    );
  }

  if (mode === 'focus' && focusLine) {
    return (
      <div className="px-4 py-4 space-y-6">
        <FocusView
          line={focusLine}
          index={focusIndex}
          total={lines.length}
          getArabic={getArabic}
          arabicFontFamily={arabicFontFamily}
          showTranslation={showTranslation}
          showTransliteration={showTransliteration}
          showRoots={showRoots}
          playingKey={playingKey}
          bookmarkedKeys={bookmarkedKeys}
          tafsirCache={tafsirCache}
          tafsirLoading={tafsirLoading}
          expandedTafsir={expandedTafsir}
          onPrev={() => onSetFocusIndex(Math.max(0, focusIndex - 1))}
          onNext={() => {
            const next = Math.min(lines.length - 1, focusIndex + 1);
            onSetFocusIndex(next);
            onVerseVisible(lines[next]);
          }}
          onPlay={() => (playingKey === focusLine.verseKey ? onStopAudio() : onPlayAyah(focusLine))}
          onBookmark={() => onBookmark(focusLine)}
          onTafsir={() => onToggleTafsir(focusLine)}
          onAskRaya={() => onAskRaya(focusLine)}
          onAnnotate={onAnnotate ? () => onAnnotate(focusLine) : undefined}
          onVerseVisible={onVerseVisible}
        />
        <div className="max-w-lg mx-auto w-full">
          <AyahExtrasPanel verseKey={focusLine.verseKey} onJumpToVerse={onJumpToVerse} />
        </div>
      </div>
    );
  }

  if (mode === 'page') {
    return (
      <div className="px-4 py-4">
        <ReaderErrorBoundary mode="page">
          <PageView
            lines={lines}
            surahs={surahs}
            scriptStyle={scriptStyle}
            arabicFontSize={arabicFontSize}
            arabicLineHeight={arabicLineHeight}
            showTranslation={showTranslation}
            showTransliteration={showTransliteration}
            translationId={translationId}
            tafsirId={tafsirId}
            playingKey={playingKey}
            bookmarkedKeys={bookmarkedKeys}
            onPlaySurahFrom={onPlaySurahFrom}
            onStop={onStopAudio}
            onBookmark={onBookmark}
            onAskRaya={onAskRaya}
            onAnnotate={onAnnotate}
            onVerseVisible={onVerseVisible}
            onReachedEnd={onPageReachedEnd}
          />
        </ReaderErrorBoundary>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-6">
      <AyahModeList
        lines={lines}
        wordsByKey={wordsByKey}
        highlightTick={highlightTick}
        annotationTick={annotationTick}
        getArabic={getArabic}
        showTranslation={showTranslation}
        showTransliteration={showTransliteration}
        showRoots={showRoots}
        tajweedEnabled={tajweedEnabled}
        arabicFontSize={arabicFontSize}
        arabicLineHeight={arabicLineHeight}
        arabicFontFamily={arabicFontFamily}
        playingKey={playingKey}
        bookmarkedKeys={bookmarkedKeys}
        selectedAyah={selectedAyah}
        tafsirCache={tafsirCache}
        tafsirLoading={tafsirLoading}
        expandedTafsir={expandedTafsir}
        onPlay={onPlayAyah}
        onStopAudio={onStopAudio}
        onBookmark={onBookmark}
        onTafsir={onToggleTafsir}
        onAskRaya={onAskRaya}
        onAnnotate={onAnnotate}
        onVerseVisible={onVerseVisible}
        onWordTap={(word, x, y) => {
          onSetSelectedAyah(null);
          onSetSelectedWord({ word, x, y });
        }}
        onAyahTap={(verseKey) => {
          onSetSelectedWord(null);
          onSetSelectedAyah((prev: string | null) => (prev === verseKey ? null : verseKey));
        }}
      />
      {selectedAyah && (
        <div className="max-w-2xl">
          <AyahExtrasPanel verseKey={selectedAyah} onJumpToVerse={onJumpToVerse} />
        </div>
      )}
    </div>
  );
}
