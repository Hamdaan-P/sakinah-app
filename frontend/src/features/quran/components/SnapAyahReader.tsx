/**
 * SnapAyahReader
 *
 * Replaces the long stacked verse list with a one-ayah-per-viewport snap
 * scroller. Each ayah occupies ~85vh of the document, scroll-snap aligns
 * its top to the viewport. As each section enters view it fades + scales
 * in, with the ornament rotating in. A right-edge dot rail shows position
 * in the surah and lets the reader jump.
 *
 * Designed to feel meditative — less "endless scroll", more "deliberate
 * page-by-page reading" — while keeping every interaction the existing
 * VerseCard already supports (word-tap, audio, bookmarks, etc.).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye } from '@phosphor-icons/react';
import type { QuranLine, QuranWord } from '../types/quran.types';
import { AyahSection } from './snap-ayah/AyahSection';

interface Props {
  lines: QuranLine[];
  wordsByKey: Record<string, QuranWord[]>;
  /** Returns the rendered Arabic for a verse — Uthmani / Indopak / Imlaei chooser lives upstream. */
  getArabic: (line: QuranLine) => string;
  /** Optional tajweed HTML by key. */
  getTajweedHtml?: (line: QuranLine) => string | undefined;
  showTranslation: boolean;
  showTransliteration: boolean;
  arabicFontSize: number;
  arabicLineHeight: number;
  tajweedEnabled: boolean;
  playingKey: string | null;
  bookmarkedKeys: Set<string>;
  selectedAyah: string | null;
  onPlay: (line: QuranLine) => void;
  onStop: () => void;
  onBookmark: (line: QuranLine) => void;
  onSelectAyah: (verseKey: string | null) => void;
  onVerseVisible?: (line: QuranLine) => void;
  /** When set, the reader scrolls this verse to centre. */
  targetVerseKey?: string | null;
  /** Throttled callback fired with the verseKey currently centred. Used by host-broadcast mode. */
  onCurrentChange?: (verseKey: string) => void;
}

export function SnapAyahReader({
  lines,
  getArabic,
  getTajweedHtml,
  showTranslation,
  showTransliteration,
  arabicFontSize,
  arabicLineHeight,
  tajweedEnabled,
  playingKey,
  bookmarkedKeys,
  selectedAyah,
  onPlay,
  onStop,
  onBookmark,
  onSelectAyah,
  onVerseVisible,
  targetVerseKey,
  onCurrentChange,
}: Props) {
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const registerRef = (key: string, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(key, el);
    else sectionRefs.current.delete(key);
  };

  // Notify parent of the centred verse — throttled by IntersectionObserver itself.
  useEffect(() => {
    if (!activeKey || !onCurrentChange) return;
    onCurrentChange(activeKey);
  }, [activeKey, onCurrentChange]);

  // IntersectionObserver: pick the section whose centre is nearest to viewport centre.
  useEffect(() => {
    const opts: IntersectionObserverInit = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const key = (e.target as HTMLElement).dataset.verseKey;
          if (key) {
            setActiveKey(key);
            const line = lines.find((l) => l.verseKey === key);
            if (line) onVerseVisible?.(line);
          }
        }
      }
    }, opts);
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lines, onVerseVisible]);

  // Scroll to targetVerseKey when it changes (and is different from active).
  useEffect(() => {
    if (!targetVerseKey || targetVerseKey === activeKey) return;
    const el = sectionRefs.current.get(targetVerseKey);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [targetVerseKey, activeKey]);

  // Dot-rail markers (cap at 50 dots so very long surahs stay legible).
  const dotKeys = useMemo(() => {
    if (lines.length <= 50) return lines.map((l) => l.verseKey);
    const step = lines.length / 50;
    return Array.from({ length: 50 }, (_, i) => lines[Math.floor(i * step)].verseKey);
  }, [lines]);
  const activeDotIdx = useMemo(() => {
    if (!activeKey) return -1;
    return dotKeys.findIndex((k) => k === activeKey);
  }, [dotKeys, activeKey]);

  return (
    <div
      className="relative"
      style={{
        scrollSnapType: 'y mandatory',
      }}
    >
      {/* Dot rail */}
      <div className="hidden md:flex flex-col gap-1 fixed right-3 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
        {dotKeys.map((key, i) => (
          <button
            key={key}
            onClick={() => sectionRefs.current.get(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            aria-label={`Jump to ayah ${key}`}
            className="block"
          >
            <span
              className="block rounded-full transition-all"
              style={{
                width: i === activeDotIdx ? 8 : 4,
                height: i === activeDotIdx ? 8 : 4,
                background: i === activeDotIdx ? '#D4A853' : 'rgba(255,255,255,0.25)',
                boxShadow: i === activeDotIdx ? '0 0 8px rgba(212,168,83,0.65)' : 'none',
              }}
            />
          </button>
        ))}
      </div>

      {lines.map((line, i) => (
        <AyahSection
          key={line.verseKey}
          line={line}
          index={i}
          total={lines.length}
          isPlaying={playingKey === line.verseKey}
          isSelected={selectedAyah === line.verseKey}
          isBookmarked={bookmarkedKeys.has(line.verseKey)}
          getArabic={getArabic}
          getTajweedHtml={getTajweedHtml}
          showTranslation={showTranslation}
          showTransliteration={showTransliteration}
          arabicFontSize={arabicFontSize}
          arabicLineHeight={arabicLineHeight}
          tajweedEnabled={tajweedEnabled}
          onPlay={onPlay}
          onStop={onStop}
          onBookmark={onBookmark}
          onSelectAyah={onSelectAyah}
          registerRef={registerRef}
        />
      ))}

      {/* Final flourish */}
      <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        <Eye size={20} className="text-[#D4A853]/40 mb-2" />
        <p className="text-[12px] text-white/40">End of surah · {lines.length} ayahs</p>
      </div>
    </div>
  );
}
