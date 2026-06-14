/**
 * MushafLinePage
 *
 * Authentic 15-line Mushaf page rendering. Words are grouped by their physical
 * `line_number` and each printed line is **fully justified** (`text-align:
 * justify` + `text-align-last: justify`) so every line reaches both margins —
 * parallel line endings, exactly like a printed mushaf / quran.com. The lines
 * are distributed across the **full page height** (`justify-content:
 * space-between`) so the page is covered top-to-bottom rather than a tight
 * block floating in the middle.
 *
 * The script font **auto-fits** the column width: a full line always fits on a
 * single physical row (no wrapping) on every viewport. On desktop the chosen
 * `fontSize` already fits so the page is untouched; on a narrow phone the font
 * shrinks uniformly until the widest line fits — so a phone renders a faithful,
 * smaller copy of the desktop page instead of breaking the 15-line grid.
 *
 * One renderer serves all four script styles (see config/mushafStyles):
 *   - glyph styles (QCF V1/V2) render per-word `code_v1`/`code_v2` glyphs in a
 *     per-page font (the ayah-end marker is itself an ornamental glyph), while
 *   - text styles (Uthmani Hafs / IndoPak) render a Unicode field in a single
 *     font, with a gold-ringed Arabic-Indic ayah number as the end marker.
 *
 * Because every script variant ships in the page data, switching style is an
 * instant re-render with no refetch.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { MushafLine, MushafWord, QuranLine, Surah } from '../types/quran.types';
import type { MushafTokens } from '../hooks/useMushafTheme';
import { MUSHAF_STYLES, SINGLE_FONTS, type MushafStyleId } from '../config/mushafStyles';
import { ensureFontForPage, preloadFontsAround, qcfPageFamily } from '../services/mushafFontLoader';

export interface MushafLinePageProps {
  pageNumber: number;
  pageLines: MushafLine[];
  /** Verse-level lines — used to resolve a tapped word back to its ayah. */
  lines: QuranLine[];
  surahsById: Map<number, Surah>;
  scriptStyle: MushafStyleId;
  playingKey: string | null;
  onAyahTap?: (line: QuranLine) => void;
  onAyahMenuOpen?: (line: QuranLine) => void;
  fontSize: number;
  lineHeight: number;
  tokens: MushafTokens;
  surahProgress?: number;
  /** 'clean' (minimal) or 'ornate' (gold-framed). */
  frameStyle?: 'clean' | 'ornate';
}

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

function toArabicNumeral(n: number): string {
  return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}

/** The glyph/text to render for a word in the chosen style (with fallbacks). */
function glyphFor(style: MushafStyleId, w: MushafWord): string {
  switch (style) {
    case 'qcf_v2':
      return w.codeV2 || w.codeV1 || w.textHafs || '';
    case 'qcf_v1':
      return w.codeV1 || w.codeV2 || w.textHafs || '';
    case 'uthmani_hafs':
      return w.textHafs || w.textIndopak || '';
    case 'indopak15':
      return w.textIndopak || w.textHafs || '';
  }
}

type Row =
  | { kind: 'line'; lineNumber: number; words: MushafWord[]; centered: boolean }
  | { kind: 'header'; surahId: number };

export function MushafLinePage({
  pageNumber,
  pageLines,
  lines,
  surahsById,
  scriptStyle,
  playingKey,
  onAyahTap,
  onAyahMenuOpen,
  fontSize,
  lineHeight,
  tokens,
  surahProgress,
  frameStyle = 'clean',
}: MushafLinePageProps) {
  const styleDef = MUSHAF_STYLES[scriptStyle];
  const isGlyph = styleDef.rendering === 'glyph';

  // Inject / warm the fonts this page needs (per-page for QCF, single otherwise).
  useEffect(() => {
    ensureFontForPage(scriptStyle, pageNumber);
    preloadFontsAround(scriptStyle, pageNumber);
  }, [scriptStyle, pageNumber]);

  const fontFamily = isGlyph
    ? `'${qcfPageFamily(scriptStyle as 'qcf_v1' | 'qcf_v2', pageNumber)}', ${styleDef.fontStack}`
    : `'${scriptStyle === 'uthmani_hafs' ? SINGLE_FONTS.uthmaniHafs.family : SINGLE_FONTS.indopak.family}', ${styleDef.fontStack}`;

  const lineByVerse = useMemo(() => {
    const m = new Map<string, QuranLine>();
    for (const l of lines) m.set(l.verseKey, l);
    return m;
  }, [lines]);

  // Build the ordered render rows: text lines + surah-header bands for the
  // empty line(s) a new surah's name/basmala occupy on the printed page.
  const rows = useMemo<Row[]>(() => {
    const present = new Map<number, MushafWord[]>();
    for (const l of pageLines) present.set(l.lineNumber, l.words);
    const maxLine = pageLines.reduce((mx, l) => Math.max(mx, l.lineNumber), 0);

    const out: Row[] = [];
    let n = 1;
    while (n <= maxLine) {
      const words = present.get(n);
      if (words && words.length) {
        const last = words[words.length - 1];
        const surah = surahsById.get(parseInt(last.verseKey.split(':')[0], 10));
        const centered = last.charType === 'end' && !!surah && last.verseNumber === surah.versesCount;
        out.push({ kind: 'line', lineNumber: n, words, centered });
        n++;
      } else {
        let m = n + 1;
        while (m <= maxLine && !(present.get(m)?.length)) m++;
        const startWord = present.get(m)?.[0];
        if (startWord && startWord.verseNumber === 1 && startWord.position === 1) {
          out.push({ kind: 'header', surahId: parseInt(startWord.verseKey.split(':')[0], 10) });
        }
        n = m;
      }
    }
    return out;
  }, [pageLines, surahsById]);

  const firstLine = lines[0];
  const headSurahId = firstLine ? parseInt(firstLine.verseKey.split(':')[0], 10) : 1;
  const headSurah = surahsById.get(headSurahId);
  const juz = firstLine?.juzNumber ?? 1;
  const hizb = firstLine?.hizbNumber;
  // Use the ink color (near-black on the light/cream page, cream on the dark
  // page) so the Arabic is high-contrast in both themes.
  const bodyColor = tokens.ink;
  const ornate = frameStyle === 'ornate';

  // --- Auto-fit so a full Mushaf line ALWAYS fits one physical row ---
  // On a wide (desktop) column the chosen `fontSize` already fits each line, so
  // the scale stays at 1 and the layout is untouched. On a narrow phone the same
  // line would overflow / wrap (breaking the 15-line grid), so we shrink the
  // script font uniformly until the widest line fits — every phone becomes a
  // faithful, smaller copy of the desktop page (parallel endings, no wrapping).
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [fitScale, setFitScale] = useState(1);
  const fitScaleRef = useRef(1);
  useEffect(() => {
    fitScaleRef.current = fitScale;
  }, [fitScale]);

  const measure = useCallback(() => {
    const container = bodyRef.current;
    if (!container) return;
    const lineEls = container.querySelectorAll<HTMLElement>('[data-ml="1"]');
    if (!lineEls.length) return;
    const cur = fitScaleRef.current;
    let maxNatural = 0;
    let avail = 0;
    lineEls.forEach((el) => {
      if (el.clientWidth) avail = el.clientWidth;
      // Measure the line's true single-row width (scrollWidth needs nowrap, and
      // we neutralise justification so it reports natural content width).
      const ws = el.style.whiteSpace;
      const ta = el.style.textAlign;
      const tal = el.style.textAlignLast;
      el.style.whiteSpace = 'nowrap';
      el.style.textAlign = 'start';
      el.style.textAlignLast = 'auto';
      maxNatural = Math.max(maxNatural, el.scrollWidth);
      el.style.whiteSpace = ws;
      el.style.textAlign = ta;
      el.style.textAlignLast = tal;
    });
    if (avail > 0 && maxNatural > 0) {
      // scrollWidth scales linearly with the applied font, so factoring in the
      // current scale makes this a stable fixed point (converges in one pass).
      const next = Math.min(1, (cur * avail) / maxNatural);
      setFitScale((prev) => (Math.abs(prev - next) > 0.004 ? next : prev));
    }
  }, []);

  useLayoutEffect(() => {
    measure();
    const container = bodyRef.current;
    let ro: ResizeObserver | undefined;
    if (container && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => measure());
      ro.observe(container);
    }
    let cancelled = false;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) fonts.ready.then(() => !cancelled && measure());
    return () => {
      cancelled = true;
      ro?.disconnect();
    };
  }, [measure, rows, fontSize, lineHeight, scriptStyle, pageNumber, fontFamily]);

  // Never drop below a readable floor; the cap at `fontSize` keeps desktop as-is.
  const appliedFontSize = Math.max(12, Math.round(fontSize * fitScale));

  const renderWord = (w: MushafWord) => {
    const isActive = playingKey === w.verseKey;
    const isEnd = w.charType === 'end';
    const verseLine = lineByVerse.get(w.verseKey);
    const handleTap = () => verseLine && onAyahTap?.(verseLine);
    const handleMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (verseLine) onAyahMenuOpen?.(verseLine);
    };

    // Text styles: render the ayah-end marker as a gold ring with the number.
    if (isEnd && !isGlyph) {
      return (
        <span
          key={`${w.verseKey}-end`}
          role="button"
          tabIndex={0}
          aria-label={`Verse ${w.verseKey} marker`}
          onClick={handleTap}
          onDoubleClick={handleMenu}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTap();
            }
          }}
          className="inline-flex items-center justify-center cursor-pointer align-middle"
          style={{
            width: '1.5em',
            height: '1.5em',
            borderRadius: '9999px',
            border: `1.2px solid ${tokens.gold}`,
            color: tokens.gold,
            fontSize: '0.5em',
            fontFamily: "'Amiri', serif",
            lineHeight: 1,
            backgroundColor: isActive ? `${tokens.gold}26` : 'transparent',
          }}
        >
          {toArabicNumeral(w.verseNumber)}
        </span>
      );
    }

    return (
      <span
        key={`${w.verseKey}-${w.position}`}
        role="button"
        tabIndex={0}
        aria-label={isEnd ? `Verse ${w.verseKey} end` : `Word ${w.verseKey}:${w.position}`}
        onClick={handleTap}
        onDoubleClick={handleMenu}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTap();
          }
        }}
        className={cn('cursor-pointer rounded-sm transition-colors', isActive && 'bg-[#5BB6C8]/15')}
      >
        {glyphFor(scriptStyle, w)}
      </span>
    );
  };

  return (
    <div
      className="relative mx-auto w-full max-w-2xl flex flex-col"
      style={{
        minHeight: '78vh',
        // Both styles paint the parchment page behind the text. (The clean
        // style previously had no background, so in light theme the dark ink
        // sat on the dark page backdrop and was invisible.)
        background: tokens.paper,
        borderRadius: ornate ? 18 : 14,
        padding: ornate ? '12px' : 0,
        boxShadow: ornate
          ? `0 30px 60px -24px rgba(0,0,0,0.55), 0 0 0 1px ${tokens.frame}55`
          : `0 20px 50px -28px rgba(0,0,0,0.5), 0 0 0 1px ${tokens.frame}33`,
      }}
    >
      <div
        className="flex flex-col flex-1"
        style={
          ornate
            ? {
                border: `2px solid ${tokens.frame}`,
                borderRadius: 12,
                padding: '14px 16px',
                boxShadow: `inset 0 0 0 3px ${tokens.frame}22`,
              }
            : { padding: '18px 16px' }
        }
      >
        {/* Header strip — surah · style · page · juz */}
        <header
          className="flex items-center justify-between mb-3 pb-2.5 border-b text-sm shrink-0"
          style={{ borderColor: `${tokens.frame}22`, color: bodyColor }}
        >
          <span className="font-semibold truncate">
            {headSurah ? `${headSurah.id}. ${headSurah.nameSimple}` : `Surah ${headSurahId}`}
          </span>
          <span className="opacity-60 text-xs flex items-center gap-1.5">
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ background: `${tokens.frame}1A`, color: bodyColor }}
            >
              {styleDef.label}
            </span>
            {pageNumber}
          </span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-md"
            style={{ background: `${tokens.frame}14`, border: `1px solid ${tokens.frame}40` }}
          >
            Juz-{juz}
            {typeof hizb === 'number' && ` · Hizb ${hizb}`}
          </span>
        </header>

        {/* Body — lines distributed across the FULL page height. */}
        <div ref={bodyRef} dir="rtl" className="flex flex-col flex-1 justify-between py-1">
          {rows.map((row, idx) => {
            if (row.kind === 'header') {
              const surah = surahsById.get(row.surahId);
              const showBasmala = row.surahId !== 1 && row.surahId !== 9;
              return (
                <div key={`h-${row.surahId}-${idx}`} className="text-center py-1">
                  <div
                    className="inline-flex items-center justify-center px-7 py-1 rounded-lg mb-1"
                    style={{
                      border: `1.5px solid ${tokens.gold}`,
                      background: `${tokens.gold}14`,
                      color: tokens.gold,
                      fontFamily: "'Amiri Quran', 'Amiri', serif",
                      fontSize: `clamp(15px, 4vw, ${Math.round(fontSize * 0.72)}px)`,
                    }}
                  >
                    {surah?.nameArabic ?? `سورة ${row.surahId}`}
                  </div>
                  {showBasmala && (
                    <div
                      style={{
                        color: bodyColor,
                        fontFamily: "'Amiri Quran', 'Amiri', serif",
                        fontSize: `clamp(16px, 4.6vw, ${Math.round(fontSize * 0.9)}px)`,
                        lineHeight: 1.7,
                      }}
                    >
                      {BISMILLAH}
                    </div>
                  )}
                </div>
              );
            }

            // A fully-justified printed line. text-align-last justifies even the
            // single (last) line of its own block so it reaches both margins.
            return (
              <div
                key={`l-${row.lineNumber}`}
                data-ml="1"
                className="w-full"
                style={{
                  textAlign: row.centered ? 'center' : 'justify',
                  textAlignLast: row.centered ? 'center' : 'justify',
                  fontFamily,
                  fontSize: appliedFontSize,
                  lineHeight,
                  color: bodyColor,
                  whiteSpace: 'normal',
                }}
              >
                {row.words.map((w, i) => (
                  <span key={`${w.verseKey}-${w.position}-${i}`}>
                    {renderWord(w)}
                    {i < row.words.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer — page · progress · ayah count */}
        <footer
          className="mt-3 pt-2.5 flex items-center justify-between text-[11px] shrink-0"
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
                style={{ width: `${Math.round(surahProgress * 100)}%`, background: tokens.gold }}
              />
            </div>
          )}
          <span>{lines.length} ayāt</span>
        </footer>
      </div>
    </div>
  );
}

export default MushafLinePage;
