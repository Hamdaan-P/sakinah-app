/**
 * MushafPage
 * Renders a single 15-line Mushaf page inside the ornate <MushafFrame>.
 *
 * Pure presentational — page navigation, audio playback, settings, and
 * gesture handling all live in QuranMushafPage and MushafPageFlipper.
 */

import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import type { QuranLine, Surah } from '../types/quran.types';
import { parseTajweed, getRuleColor, getRuleLabel } from '../services/tajweedRenderer';
import { AyahOrnament } from './AyahOrnament';
import { SurahCartouche } from './SurahCartouche';
import { MushafFrame } from './MushafFrame';
import type { MushafTokens } from '../hooks/useMushafTheme';

interface Props {
  pageNumber: number;
  lines: QuranLine[];
  surahsById: Map<number, Surah>;
  playingKey: string | null;
  onAyahTap?: (line: QuranLine) => void;
  /** Double-tap on the verse / marker opens the per-ayah action sheet. */
  onAyahMenuOpen?: (line: QuranLine) => void;
  tajweedEnabled: boolean;
  fontSize: number;
  lineHeight: number;
  tokens: MushafTokens;
  /** 0..1 — surah progress for the right-edge shimmer */
  surahProgress?: number;
}

export function MushafPage({
  pageNumber,
  lines,
  surahsById,
  playingKey,
  onAyahTap,
  onAyahMenuOpen,
  tajweedEnabled,
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
  const surahLabel = headSurah ? `${headSurah.id}. ${headSurah.nameSimple}` : `Surah ${headSurahId}`;

  return (
    <MushafFrame
      tokens={tokens}
      surahLabel={surahLabel}
      pageNumber={pageNumber}
      juz={juz}
      hizb={hizb}
      surahProgress={surahProgress}
    >
      <div
        dir="rtl"
        className="text-right"
        style={{
          fontSize,
          lineHeight,
          color: tokens.ink,
          fontFamily: "'Amiri Quran', 'Amiri', 'KFGQPC Hafs', serif",
          textShadow: '0 0.5px 0 rgba(0,0,0,0.04)',
        }}
      >
        {lines.map((line) => {
          const surahId = parseInt(line.verseKey.split(':')[0], 10);
          const surah = surahsById.get(surahId);
          const isVerseActive = playingKey === line.verseKey;
          const startsSurah = line.verseNumber === 1;
          const showBasmala = startsSurah && surahId !== 1 && surahId !== 9;

          return (
            <Fragment key={line.verseKey}>
              {startsSurah && (
                <SurahCartouche
                  surahName={surah?.nameSimple ?? `Surah ${surahId}`}
                  surahArabic={surah?.nameArabic}
                  showBasmala={showBasmala}
                  gold={tokens.gold}
                  ink={tokens.ink}
                  paperEdge={tokens.paperEdge}
                />
              )}
              <span
                role="button"
                tabIndex={0}
                className={cn(
                  'cursor-pointer transition-all rounded-sm',
                  isVerseActive ? 'mushaf-ayah-glow' : 'hover:opacity-90',
                )}
                style={
                  isVerseActive
                    ? { backgroundColor: tokens.glow, padding: '0 4px' }
                    : undefined
                }
                onClick={() => onAyahTap?.(line)}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAyahMenuOpen?.(line);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAyahTap?.(line); } }}
              >
                {tajweedEnabled && line.arabicTajweed ? (
                  <InlineTajweedSpans html={line.arabicTajweed} fallback={line.arabic} inkColor={tokens.ink} />
                ) : (
                  line.arabic
                )}
              </span>
              <AyahOrnament
                number={toArabicNumeral(line.verseNumber)}
                color={tokens.gold}
                glow={isVerseActive}
                onClick={() => onAyahTap?.(line)}
                onDoubleClick={() => onAyahMenuOpen?.(line)}
                title={`Ayah ${line.verseNumber} — double-tap for actions`}
              />
            </Fragment>
          );
        })}
      </div>
    </MushafFrame>
  );
}

/** Inline tajweed rendering — spans flow inside the RTL paragraph. */
function InlineTajweedSpans({
  html,
  fallback,
  inkColor,
}: {
  html: string;
  fallback: string;
  inkColor: string;
}) {
  const segments = parseTajweed(html);
  if (segments.length === 0) return <>{fallback}</>;
  return (
    <>
      {segments.map((seg, i) =>
        seg.rule ? (
          <span
            key={i}
            style={{ color: getRuleColor(seg.rule) }}
            title={getRuleLabel(seg.rule)}
          >
            {seg.text}
          </span>
        ) : (
          <span key={i} style={{ color: inkColor }}>
            {seg.text}
          </span>
        ),
      )}
    </>
  );
}

function toArabicNumeral(n: number): string {
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n)
    .split('')
    .map((d) => map[parseInt(d, 10)] ?? d)
    .join('');
}
