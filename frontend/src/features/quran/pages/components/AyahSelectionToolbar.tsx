/**
 * Floating selection toolbar (Play/Bookmark/Highlight/Note/Copy/Test/Search/Delete)
 * + highlight palette popover for an ayah selected in QuranReadingPage.
 * Verbatim — no behavior changes.
 */

import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { FloatingToolbar, toolbarActions } from '../../components/FloatingToolbar';
import { HighlightPalette } from '../../components/HighlightPalette';
import type { QuranLine, HighlightCategory } from '../../types/quran.types';
import { clearHighlightsForVerse, createHighlight } from '../../services/highlightManager';

interface Props {
  selectedAyah: string | null;
  paletteOpen: boolean;
  lines: QuranLine[];
  playingKey: string | null;
  bookmarkedKeys: Set<string>;
  onSetSelectedAyah: (k: string | null) => void;
  onSetPaletteOpen: (v: boolean | ((v: boolean) => boolean)) => void;
  onSetNotingVerse: (k: string | null) => void;
  onPlayAyah: (line: QuranLine) => void;
  onStopAudio: () => void;
  onBookmark: (line: QuranLine) => void;
  onDeepDive: (verseKey: string) => void;
}

export function AyahSelectionToolbar({
  selectedAyah, paletteOpen, lines, playingKey, bookmarkedKeys,
  onSetSelectedAyah, onSetPaletteOpen, onSetNotingVerse,
  onPlayAyah, onStopAudio, onBookmark, onDeepDive,
}: Props) {
  const navigate = useNavigate();

  return (
    <>
      <AnimatePresence>
        {selectedAyah && (
          <FloatingToolbar
            label={selectedAyah}
            actions={[
              toolbarActions.deepDive(() => {
                if (selectedAyah) onDeepDive(selectedAyah);
              }),
              toolbarActions.play(() => {
                const line = lines.find((l) => l.verseKey === selectedAyah);
                if (!line) return;
                if (playingKey === line.verseKey) onStopAudio();
                else onPlayAyah(line);
              }),
              toolbarActions.bookmark(
                () => {
                  const line = lines.find((l) => l.verseKey === selectedAyah);
                  if (line) onBookmark(line);
                },
                bookmarkedKeys.has(selectedAyah),
              ),
              toolbarActions.highlight(() => onSetPaletteOpen((v) => !v)),
              toolbarActions.note(() => onSetNotingVerse(selectedAyah)),
              toolbarActions.copy(() => {
                const line = lines.find((l) => l.verseKey === selectedAyah);
                if (line) navigator.clipboard?.writeText(`${line.arabic}\n\n${line.translation}\n(${line.verseKey})`);
              }),
              toolbarActions.test(() => {
                const [sid] = selectedAyah.split(':');
                navigate(`/quran/hifz/test?surah=${sid}&start=${selectedAyah}&end=${selectedAyah}`);
              }),
              toolbarActions.search(() => {
                const line = lines.find((l) => l.verseKey === selectedAyah);
                // Pre-fill the concept-search query with the ayah's translation
                // (much more useful for "find related concepts" than the verse key).
                const q = (line?.translation ?? '').replace(/<[^>]+>/g, '').trim().slice(0, 200);
                navigate(`/quran/search${q ? `?q=${encodeURIComponent(q)}` : ''}`);
              }),
              toolbarActions.deleteAction(() => {
                clearHighlightsForVerse(selectedAyah);
                onSetSelectedAyah(null);
              }),
            ]}
            onDismiss={() => {
              onSetSelectedAyah(null);
              onSetPaletteOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {paletteOpen && selectedAyah && (
          <HighlightPalette
            onPick={(cat: HighlightCategory) => {
              createHighlight({ scope: 'ayah', verseKey: selectedAyah, category: cat });
              onSetPaletteOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
