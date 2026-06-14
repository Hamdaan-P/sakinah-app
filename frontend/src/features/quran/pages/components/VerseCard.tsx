/**
 * VerseCard — single verse renderer used by QuranReadingPage.
 * Verbatim from QuranReadingPage — no behavior changes.
 */

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookmarkSimple,
  BookmarkSimple as BookmarkCheck,
  CaretDown,
  ChatCircle,
  Pause,
  PencilSimpleLine,
  Play,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { QuranLine, QuranWord } from '../../types/quran.types';
import { TajweedText } from '../../components/TajweedText';
import { getHighlightsForVerse } from '../../services/highlightManager';
import { getAnnotationsForVerse } from '../../services/annotationManager';

export function VerseCard({
  line,
  words,
  getArabic,
  showTranslation,
  showTransliteration,
  showRoots,
  tajweedEnabled,
  arabicFontSize,
  arabicLineHeight,
  arabicFontFamily,
  isPlaying,
  isBookmarked,
  isSelected,
  tafsirText,
  tafsirIsLoading,
  tafsirExpanded,
  onPlay,
  onBookmark,
  onTafsir,
  onAskRaya,
  onAnnotate,
  onVisible,
  onWordTap,
  onAyahTap,
}: {
  line: QuranLine;
  words?: QuranWord[];
  getArabic: (l: QuranLine) => string;
  showTranslation: boolean;
  showTransliteration: boolean;
  showRoots: boolean;
  tajweedEnabled?: boolean;
  arabicFontSize?: number;
  arabicLineHeight?: number;
  arabicFontFamily?: string;
  isPlaying: boolean;
  isBookmarked: boolean;
  isSelected?: boolean;
  tafsirText?: string;
  tafsirIsLoading: boolean;
  tafsirExpanded: boolean;
  onPlay: () => void;
  onBookmark: () => void;
  onTafsir: () => void;
  onAskRaya: () => void;
  onAnnotate?: () => void;
  onVisible: () => void;
  onWordTap?: (w: QuranWord, x: number, y: number) => void;
  onAyahTap?: () => void;
}) {
  const highlights = getHighlightsForVerse(line.verseKey);
  const ayahHighlight = highlights.find((h) => h.scope === 'ayah');
  const wordHighlights = new Map(
    highlights.filter((h) => h.scope === 'word' && h.wordPosition != null).map((h) => [h.wordPosition!, h]),
  );
  const annotations = getAnnotationsForVerse(line.verseKey);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onVisible();
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- observer should only be created once; onVisible is read via closure, intentionally not re-subscribing on every render
  }, []);

  return (
    <div
      ref={ref}
      id={`verse-${line.verseKey}`}
      style={ayahHighlight ? { boxShadow: `inset 4px 0 0 ${ayahHighlight.color}` } : undefined}
      className={cn(
        'rounded-xl border p-4 transition-colors relative',
        isSelected
          ? 'bg-[#D4A853]/10 border-[#D4A853]/50'
          : isBookmarked
            ? 'bg-[#D4A853]/5 border-[#D4A853]/30'
            : 'bg-white/3 border-white/8 hover:border-white/15'
      )}
    >
      {/* Verse number badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-8 h-8 rounded-full bg-[#D4A853]/15 text-[#D4A853] text-xs font-bold flex items-center justify-center">
            {line.verseNumber}
          </span>
          <button onClick={onAskRaya} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[#D4A853]/15 text-[#D4A853] hover:bg-[#D4A853]/25 transition-colors">
            <ChatCircle size={14} weight="fill" />
            Ask Raya
          </button>
          {onAnnotate && (
            <button
              onClick={onAnnotate}
              title="Add a note to this ayah"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-white/[0.06] text-[#EBDCB8] hover:bg-white/10 transition-colors"
            >
              <PencilSimpleLine size={14} />
              Annotate
              {annotations.length > 0 && (
                <span className="ml-0.5 px-1 rounded-full bg-[#D4A853]/25 text-[10px] text-[#D4A853]">
                  {annotations.length}
                </span>
              )}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onPlay} className="p-1.5 rounded-lg hover:bg-white/10">
            {isPlaying ? <Pause size={16} className="text-[#D4A853]" /> : <Play size={16} className="text-white/50" />}
          </button>
          <button onClick={onBookmark} className="p-1.5 rounded-lg hover:bg-white/10">
            {isBookmarked ? <BookmarkCheck size={16} weight="fill" className="text-[#D4A853]" /> : <BookmarkSimple size={16} className="text-white/50" />}
          </button>
          <button onClick={onTafsir} className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors', tafsirExpanded ? 'bg-[#D4A853]/15 text-[#D4A853]' : 'hover:bg-white/10 text-white/50')}>
            View Tafsir
            <CaretDown size={12} className={cn('transition-transform', tafsirExpanded && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Arabic — tajweed-colored / per-word tappable / plain, in that fallback order */}
      {tajweedEnabled && line.arabicTajweed ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Tap ayah"
          className="text-right font-arabic text-white mb-3 cursor-pointer"
          dir="rtl"
          onClick={onAyahTap}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAyahTap?.(); } }}
        >
          <TajweedText
            html={line.arabicTajweed}
            fallback={getArabic(line)}
            fontSize={arabicFontSize}
            lineHeight={arabicLineHeight}
          />
        </div>
      ) : words && words.length > 0 ? (
        <p
          className="text-right font-arabic text-white mb-3"
          dir="rtl"
          onDoubleClick={onAyahTap}
          style={{ fontSize: arabicFontSize, lineHeight: arabicLineHeight, fontFamily: arabicFontFamily }}
        >
          {words.map((w) => {
            const wh = wordHighlights.get(w.position);
            return (
              <span
                key={`${line.verseKey}-${w.position}`}
                role="button"
                tabIndex={0}
                className="cursor-pointer rounded-sm px-0.5 transition-colors hover:text-[#D4A853]"
                style={wh ? { backgroundColor: `${wh.color}30`, color: wh.color } : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  onWordTap?.(w, rect.left + rect.width / 2, rect.top);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    onWordTap?.(w, rect.left + rect.width / 2, rect.top);
                  }
                }}
              >
                {w.arabic}{' '}
              </span>
            );
          })}
        </p>
      ) : (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- ayah tap on <p> opens annotations; full keyboard nav is handled at the verse container level
        <p
          className="text-right font-arabic text-white mb-3 cursor-pointer"
          dir="rtl"
          style={{ fontSize: arabicFontSize, lineHeight: arabicLineHeight, fontFamily: arabicFontFamily }}
          onClick={onAyahTap}
        >
          {getArabic(line)}
        </p>
      )}

      {/* Annotation pills */}
      {annotations.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {annotations.slice(0, 3).map((a) => (
            <span
              key={a.id}
              title={a.comment}
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full border max-w-[180px] truncate',
                a.status === 'resolved'
                  ? 'border-white/10 text-white/40 line-through'
                  : 'border-[#B891E8]/30 text-[#B891E8] bg-[#B891E8]/5'
              )}
            >
              ✎ {a.comment}
            </span>
          ))}
          {annotations.length > 3 && (
            <span className="text-[10px] text-white/40">+{annotations.length - 3} more</span>
          )}
        </div>
      )}

      {/* Transliteration */}
      {showTransliteration && line.transliteration && (
        <p className="text-sm text-[#E8C97A]/70 italic mb-2">{line.transliteration}</p>
      )}

      {/* Translation */}
      {showTranslation && line.translation && (
        <p className="text-sm text-white/70 mb-2" style={{ fontFamily: "'Noto Sans Tamil', 'Noto Sans', sans-serif" }}>{line.translation}</p>
      )}

      {/* Root words */}
      {showRoots && line.rootWords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {line.rootWords.map((r) => (
            <span key={r} className="text-[10px] px-1.5 py-0.5 bg-[#D4A853]/10 text-[#D4A853] rounded">
              {r}
            </span>
          ))}
        </div>
      )}

      {/* Tafsir */}
      <AnimatePresence>
        {tafsirExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3 pt-3 border-t border-white/5"
          >
            {tafsirIsLoading ? (
              <p className="text-white/30 text-xs animate-pulse">Loading tafsir...</p>
            ) : tafsirText ? (
              <p className="text-xs text-white/50 leading-relaxed">{tafsirText}</p>
            ) : (
              <p className="text-xs text-white/30">Tafsir not available</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

