/**
 * MushafPageClean
 *
 * Minimal "clean" page variant for /quran/mushaf, modelled on the
 * reference Quran-app screenshot (IMG_6314):
 *   - Two-line header: `Surah · page · Juz` strip (no big cartouche)
 *   - Continuous cream-on-navy Uthmani Arabic, justified
 *   - Simple gold-bordered round verse markers (no 8-point stars)
 *   - No tajweed coloring (intentional — switch to 'ornate' style for
 *     the bordered + tajweed variant)
 *
 * Plays nicely with MushafPageFlipper: same props as MushafPage, so the
 * flipper toggles between the two variants via the `style` prop.
 */

import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import type { QuranLine, Surah } from '../types/quran.types';
import type { MushafTokens } from '../hooks/useMushafTheme';

interface Props {
  pageNumber: number;
  lines: QuranLine[];
  surahsById: Map<number, Surah>;
  playingKey: string | null;
  onAyahTap?: (line: QuranLine) => void;
  /**
   * Fires when the verse-number marker is double-clicked / double-tapped.
   * Used by the host page to open a per-ayah action sheet (Annotate /
   * Bookmark / Ask Raya) without losing single-tap = play.
   */
  onAyahMenuOpen?: (line: QuranLine) => void;
  /** Accepted for API parity with MushafPage; intentionally ignored — the
   *  clean variant does not render tajweed coloring. */
  tajweedEnabled: boolean;
  fontSize: number;
  lineHeight: number;
  tokens: MushafTokens;
  surahProgress?: number;
}

/** Convert Western digits to Arabic-Indic (٠١٢٣٤٥٦٧٨٩). */
function toArabicNumeral(n: number): string {
  return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}

/** Plain Bismillah glyph for surah openers (skipped on Al-Fatihah + Tawbah). */
const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

export function MushafPageClean({
  pageNumber,
  lines,
  surahsById,
  playingKey,
  onAyahTap,
  onAyahMenuOpen,
  fontSize,
  lineHeight,
  tokens,
  surahProgress,
}: Props) {
  const firstLine = lines[0];
  const headSurahId = firstLine ? parseInt(firstLine.verseKey.split(':')[0], 10) : 1;
  const headSurah = surahsById.get(headSurahId);
  const juz = firstLine?.juzNumber ?? 1;
  const hizb = firstLine?.hizbNumber;

  // Hard-pin the body color to the cream accent so the page reads the
  // same in light + dark Mushaf themes. The default `tokens.ink` is a
  // dim parchment brown in dark mode, which renders almost invisible
  // against the navy backdrop and was the root cause of the "broken"
  // screenshot.
  const bodyColor = tokens.frameAccent;

  return (
    <div className="relative mx-auto w-full max-w-3xl px-1 sm:px-2">
      {/* Header strip — surah on the left, page in the middle, juz badge
          on the right. Mirrors the reference screenshot's top row. */}
      <header
        className="flex items-center justify-between mb-6 pb-3 border-b text-sm"
        style={{ borderColor: `${tokens.frame}22`, color: bodyColor }}
      >
        <span className="font-semibold">
          {headSurah ? `${headSurah.id}. ${headSurah.nameSimple}` : `Surah ${headSurahId}`}
        </span>
        <span className="opacity-50 text-xs">{pageNumber}</span>
        <span
          className="text-[11px] px-2 py-0.5 rounded-md"
          style={{
            background: `${tokens.frame}14`,
            border: `1px solid ${tokens.frame}40`,
          }}
        >
          Juz-{juz}
          {typeof hizb === 'number' && ` · Hizb ${hizb}`}
        </span>
      </header>

      {/* Body: one continuous Arabic block. Each verse's Arabic stays as
          a single text node so the browser shapes ligatures naturally —
          breaking it into per-character spans (e.g. for tajweed) makes
          the script fall apart visually. */}
      <div
        dir="rtl"
        className="text-justify"
        style={{
          fontSize,
          lineHeight,
          color: bodyColor,
          fontFamily: "'Amiri Quran', 'Amiri', 'KFGQPC Hafs', serif",
          textAlignLast: 'center',
        }}
      >
        {lines.map((line) => {
          const surahId = parseInt(line.verseKey.split(':')[0], 10);
          const isVerseActive = playingKey === line.verseKey;
          const startsSurah = line.verseNumber === 1;
          const showBasmala = startsSurah && surahId !== 1 && surahId !== 9;

          return (
            <Fragment key={line.verseKey}>
              {showBasmala && (
                <>
                  <span style={{ display: 'block', textAlign: 'center', margin: '0.5em 0' }}>
                    {BISMILLAH}
                  </span>
                </>
              )}
              {/* The ayah text — kept as one node, no inner spans. */}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Ayah ${line.verseKey}`}
                onClick={() => onAyahTap?.(line)}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAyahMenuOpen?.(line);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onAyahTap?.(line);
                  }
                }}
                className={cn(
                  'cursor-pointer rounded-sm transition-colors',
                  isVerseActive && 'bg-[#5BB6C8]/12 px-0.5',
                )}
              >
                {line.arabic}
              </span>
              {/* Verse marker — simple gold-bordered circle with the
                  Arabic-Indic verse number, sized so it sits on the
                  baseline of the surrounding glyphs. Double-tap opens the
                  per-ayah action sheet (Annotate / Bookmark / Ask Raya). */}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Verse ${line.verseKey} marker — double-tap for actions`}
                title="Tap to play · double-tap for actions"
                onClick={() => onAyahTap?.(line)}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAyahMenuOpen?.(line);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onAyahTap?.(line);
                  }
                }}
                className="inline-flex items-center justify-center align-middle mx-1 cursor-pointer"
                style={{
                  width: '1.4em',
                  height: '1.4em',
                  borderRadius: '9999px',
                  border: `1.2px solid ${tokens.gold}`,
                  color: tokens.gold,
                  fontSize: '0.5em',
                  fontFamily: "'Amiri', 'KFGQPC Hafs', serif",
                  lineHeight: 1,
                  backgroundColor: isVerseActive ? `${tokens.gold}26` : 'transparent',
                  transition: 'background-color 200ms ease',
                }}
              >
                {toArabicNumeral(line.verseNumber)}
              </span>{' '}
            </Fragment>
          );
        })}
      </div>

      {/* Slim footer: page echo · surah progress · ayah count */}
      <footer
        className="mt-6 pt-3 flex items-center justify-between text-[11px]"
        style={{ color: `${bodyColor}88`, borderTop: `1px solid ${tokens.frame}22` }}
      >
        <span>Page {pageNumber}</span>
        {typeof surahProgress === 'number' && (
          <div
            className="flex-1 mx-3 h-px rounded-full overflow-hidden"
            style={{ background: `${tokens.frame}1A` }}
            aria-label="Surah progress"
          >
            <div
              className="h-full"
              style={{
                width: `${Math.round(surahProgress * 100)}%`,
                background: tokens.gold,
              }}
            />
          </div>
        )}
        <span>{lines.length} ayāt</span>
      </footer>
    </div>
  );
}
