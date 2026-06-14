/**
 * PageView — page-by-page **authentic Mushaf** renderer for QuranReadingPage's
 * "page" mode. Renders real Madinah pages via MushafLinePage (the same engine
 * as /quran/mushaf): line-grouped, fully justified, page-filling, in the
 * reader's chosen script style (QCF V1/V2 glyph fonts, Uthmani Hafs, IndoPak).
 *
 * Below the page it lists the full translation (and transliteration, when
 * enabled) for every ayah on the page, each with an expandable tafsir — so the
 * page view keeps the meaning + commentary, not just the Arabic.
 *
 * The surah's page span is derived from its verses' `page_number`; full pages
 * are fetched on demand and cached by the shared page cache.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookmarkSimple,
  CaretDown,
  CaretLeft,
  CaretRight,
  ChatCircle,
  HandTap,
  PencilSimpleLine,
  Play,
  Stop,
  X,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { QuranLine, Surah, MushafLine } from '../../types/quran.types';
import { fetchPage, fetchTafsir } from '../../services/quranApiService';
import { MushafLinePage } from '../../components/MushafLinePage';
import { useMushafTheme } from '../../hooks/useMushafTheme';
import { preloadFontsAround } from '../../services/mushafFontLoader';
import type { MushafStyleId } from '../../config/mushafStyles';

const HINT_KEY = 'quran_pageview_doubletap_hint_dismissed';

interface PageData {
  lines: QuranLine[];
  pageLines: MushafLine[];
}

interface PageViewProps {
  /** Verses of the current surah (used to derive its page span + surah id). */
  lines: QuranLine[];
  surahs: Surah[];
  scriptStyle: MushafStyleId;
  arabicFontSize: number;
  arabicLineHeight: number;
  showTranslation: boolean;
  showTransliteration: boolean;
  translationId: number;
  tafsirId: number;
  playingKey: string | null;
  bookmarkedKeys: Set<string>;
  onPlaySurahFrom: (line: QuranLine) => void;
  onStop: () => void;
  onBookmark: (line: QuranLine) => void;
  onAskRaya?: (line: QuranLine) => void;
  onAnnotate?: (line: QuranLine) => void;
  onVerseVisible: (line: QuranLine) => void;
  /** Fires with whether the current page is the surah's last page — lets the
   *  host show the End-of-Surah card only when the reader actually reaches it. */
  onReachedEnd?: (atEnd: boolean) => void;
}

export function PageView({
  lines,
  surahs,
  scriptStyle,
  arabicFontSize,
  arabicLineHeight,
  showTranslation,
  showTransliteration,
  translationId,
  tafsirId,
  playingKey,
  bookmarkedKeys,
  onPlaySurahFrom,
  onStop,
  onBookmark,
  onAskRaya,
  onAnnotate,
  onVerseVisible,
  onReachedEnd,
}: PageViewProps) {
  // Per-ayah action sheet (Bookmark / Ask Raya / Annotate) — opened by
  // double-tapping any ayah on the page (single tap = play).
  const [actionLine, setActionLine] = useState<QuranLine | null>(null);
  const { tokens } = useMushafTheme();
  const surahsById = useMemo(() => new Map(surahs.map((s) => [s.id, s])), [surahs]);
  const surahId = lines[0] ? parseInt(lines[0].verseKey.split(':')[0], 10) : 1;

  // "Double-tap for actions" hint — shown once until dismissed.
  const [showHint, setShowHint] = useState(() => {
    try {
      return localStorage.getItem(HINT_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const dismissHint = () => {
    setShowHint(false);
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  // The surah's page span, derived from its verses' page numbers.
  const [startPage, endPage] = useMemo(() => {
    let mn = Infinity;
    let mx = -Infinity;
    for (const l of lines) {
      if (l.pageNumber) {
        mn = Math.min(mn, l.pageNumber);
        mx = Math.max(mx, l.pageNumber);
      }
    }
    return [Number.isFinite(mn) ? mn : 1, Number.isFinite(mx) ? mx : 1];
  }, [lines]);

  const [pageNum, setPageNum] = useState(startPage);
  useEffect(() => setPageNum(startPage), [startPage]);

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loadingPage, setLoadingPage] = useState(false);

  // Re-fetch when the page OR the chosen translation changes, so the
  // translation list below the page matches the reader's setting.
  useEffect(() => {
    let alive = true;
    setLoadingPage(true);
    fetchPage(pageNum, translationId)
      .then((res) => {
        if (!alive) return;
        setPageData({ lines: res.lines, pageLines: res.pageLines });
        setLoadingPage(false);
      })
      .catch(() => {
        if (!alive) return;
        setPageData(null);
        setLoadingPage(false);
      });
    return () => {
      alive = false;
    };
  }, [pageNum, translationId]);

  useEffect(() => {
    preloadFontsAround(scriptStyle, pageNum);
  }, [scriptStyle, pageNum]);

  // Credit this surah's verses on the page toward the reading streak.
  useEffect(() => {
    if (!pageData) return;
    for (const l of pageData.lines) {
      if (l.verseKey.startsWith(`${surahId}:`)) onVerseVisible(l);
    }
  }, [pageData, surahId, onVerseVisible]);

  // Tafsir — fetched on demand per verse, cached locally for this page view.
  const [tafsirCache, setTafsirCache] = useState<Record<string, string>>({});
  const [tafsirLoading, setTafsirLoading] = useState<Set<string>>(new Set());
  const [expandedTafsir, setExpandedTafsir] = useState<string | null>(null);
  // Drop cached tafsir when the source changes.
  useEffect(() => {
    setTafsirCache({});
    setExpandedTafsir(null);
  }, [tafsirId]);

  const toggleTafsir = async (verseKey: string) => {
    if (expandedTafsir === verseKey) {
      setExpandedTafsir(null);
      return;
    }
    setExpandedTafsir(verseKey);
    if (tafsirCache[verseKey]) return;
    setTafsirLoading((prev) => new Set(prev).add(verseKey));
    const text = await fetchTafsir(verseKey, tafsirId);
    if (text) setTafsirCache((prev) => ({ ...prev, [verseKey]: text }));
    setTafsirLoading((prev) => {
      const next = new Set(prev);
      next.delete(verseKey);
      return next;
    });
  };

  const isPlaying = playingKey !== null;
  const canPrev = pageNum > startPage;
  const canNext = pageNum < endPage;

  // Tell the host whether we're on the surah's last page, so the
  // End-of-Surah card only shows when the reader actually reaches the end.
  useEffect(() => {
    onReachedEnd?.(pageNum >= endPage);
  }, [pageNum, endPage, onReachedEnd]);

  return (
    <div className="flex flex-col items-center">
      {/* Double-tap hint banner */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full max-w-3xl mb-3 flex items-center gap-2 rounded-xl border border-[#D4A853]/25 bg-[#D4A853]/10 px-3 py-2"
          >
            <HandTap size={18} weight="fill" className="text-[#D4A853] shrink-0" />
            <span className="text-xs text-[#EBDCB8] flex-1">
              <b className="text-[#D4A853]">Double-tap any ayah</b> to bookmark, read its tafsir, or ask Raya. Single-tap plays it.
            </span>
            <button
              onClick={dismissHint}
              className="p-1 rounded-full text-white/40 hover:bg-white/10 shrink-0"
              aria-label="Dismiss hint"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar — play surah + page position */}
      <div className="flex items-center justify-between w-full max-w-3xl mb-3">
        <span className="text-xs text-white/30">
          Page {pageNum} {endPage > startPage && `· ${pageNum - startPage + 1}/${endPage - startPage + 1}`}
        </span>
        <button
          onClick={() => {
            if (isPlaying) onStop();
            else if (pageData?.lines[0]) onPlaySurahFrom(pageData.lines[0]);
          }}
          className={cn(
            'flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all',
            isPlaying
              ? 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25'
              : 'bg-[#4FB892]/15 text-[#4FB892] border border-[#4FB892]/25 hover:bg-[#4FB892]/25',
          )}
        >
          {isPlaying ? <><Stop size={14} weight="fill" /> Stop</> : <><Play size={14} weight="fill" /> Play</>}
        </button>
      </div>

      {/* Authentic Mushaf page */}
      <div className="w-full max-w-3xl">
        {loadingPage || !pageData ? (
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{ background: tokens.paper, color: tokens.inkMuted, minHeight: '60vh' }}
          >
            <span className="animate-pulse text-sm">Loading page {pageNum}…</span>
          </div>
        ) : (
          <MushafLinePage
            pageNumber={pageNum}
            pageLines={pageData.pageLines}
            lines={pageData.lines}
            surahsById={surahsById}
            scriptStyle={scriptStyle}
            playingKey={playingKey}
            onAyahTap={(line) => (playingKey === line.verseKey ? onStop() : onPlaySurahFrom(line))}
            onAyahMenuOpen={(line) => setActionLine(line)}
            fontSize={arabicFontSize}
            lineHeight={arabicLineHeight}
            tokens={tokens}
            frameStyle="ornate"
          />
        )}
      </div>

      {/* Full translation + tafsir for every ayah on the page */}
      {pageData && (showTranslation || showTransliteration) && (
        <div className="w-full max-w-3xl mt-5 rounded-2xl bg-[#0F141F]/60 border border-white/8 p-4 sm:p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4A853]/70 mb-3">
            Translation &amp; Tafsir
          </h3>
          <div className="space-y-3">
            {pageData.lines.map((line) => {
              const isVersePlaying = playingKey === line.verseKey;
              const expanded = expandedTafsir === line.verseKey;
              const loadingT = tafsirLoading.has(line.verseKey);
              return (
                <div
                  key={`${line.verseKey}-tr`}
                  className={cn(
                    'rounded-lg px-3 py-2 transition-colors',
                    isVersePlaying ? 'bg-[#4FB892]/8' : 'bg-white/[0.02]',
                  )}
                >
                  <div className="flex gap-2.5">
                    <span
                      className={cn(
                        'text-[11px] font-bold mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
                        isVersePlaying ? 'bg-[#4FB892]/20 text-[#4FB892]' : 'bg-[#D4A853]/15 text-[#D4A853]',
                      )}
                    >
                      {line.verseNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      {showTransliteration && line.transliteration && (
                        <p className="text-sm text-[#4FB892]/70 italic mb-0.5">{line.transliteration}</p>
                      )}
                      {showTranslation && line.translation && (
                        <p
                          className={cn('text-sm leading-relaxed', isVersePlaying ? 'text-white/80' : 'text-white/60')}
                          style={{ fontFamily: "'Noto Sans Tamil', 'Noto Sans', sans-serif" }}
                        >
                          {line.translation}
                        </p>
                      )}
                      {/* Per-verse actions: tafsir + bookmark + ask raya */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <button
                          onClick={() => toggleTafsir(line.verseKey)}
                          className={cn(
                            'flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors',
                            expanded ? 'bg-[#D4A853]/20 text-[#D4A853]' : 'bg-white/[0.06] text-[#EBDCB8] hover:bg-white/10',
                          )}
                        >
                          View Tafsir
                          <CaretDown size={11} className={cn('transition-transform', expanded && 'rotate-180')} />
                        </button>
                        {onAskRaya && (
                          <button
                            onClick={() => onAskRaya(line)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#D4A853]/15 text-[#D4A853] hover:bg-[#D4A853]/25 transition-colors"
                          >
                            <ChatCircle size={11} weight="fill" />
                            Ask Raya
                          </button>
                        )}
                        <button
                          onClick={() => onBookmark(line)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.06] text-[#EBDCB8] hover:bg-white/10 transition-colors"
                        >
                          <BookmarkSimple
                            size={11}
                            weight={bookmarkedKeys.has(line.verseKey) ? 'fill' : 'regular'}
                            className={bookmarkedKeys.has(line.verseKey) ? 'text-[#D4A853]' : ''}
                          />
                          {bookmarkedKeys.has(line.verseKey) ? 'Saved' : 'Bookmark'}
                        </button>
                        {onAnnotate && (
                          <button
                            onClick={() => onAnnotate(line)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.06] text-[#EBDCB8] hover:bg-white/10 transition-colors"
                          >
                            <PencilSimpleLine size={11} />
                            Annotate
                          </button>
                        )}
                      </div>
                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-2 pt-2 border-t border-white/5"
                          >
                            {loadingT ? (
                              <p className="text-white/30 text-xs animate-pulse">Loading tafsir…</p>
                            ) : tafsirCache[line.verseKey] ? (
                              <p className="text-xs text-white/55 leading-relaxed">{tafsirCache[line.verseKey]}</p>
                            ) : (
                              <p className="text-xs text-white/30">Tafsir not available for this ayah.</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-ayah actions — double-tap an ayah to open. */}
      <AnimatePresence>
        {actionLine && (
          <>
            <motion.button
              type="button"
              aria-label="Close ayah actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActionLine(null)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 flex flex-col gap-2 px-3 py-3 rounded-2xl bg-[#0A0E16]/95 border border-[#D4A853]/30 shadow-2xl backdrop-blur-md max-w-sm w-[calc(100%-2rem)]"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-medium text-[#D4A853] tracking-wide">Ayah {actionLine.verseKey}</span>
                <button type="button" onClick={() => setActionLine(null)} className="p-1 rounded-full text-white/40 hover:bg-white/10" aria-label="Close">
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => { onBookmark(actionLine); setActionLine(null); }}
                  className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg bg-white/[0.06] text-[#EBDCB8] hover:bg-white/10 transition-colors"
                >
                  <BookmarkSimple size={18} weight={bookmarkedKeys.has(actionLine.verseKey) ? 'fill' : 'regular'} className={bookmarkedKeys.has(actionLine.verseKey) ? 'text-[#D4A853]' : ''} />
                  <span className="text-[11px] font-medium">{bookmarkedKeys.has(actionLine.verseKey) ? 'Saved' : 'Bookmark'}</span>
                </button>
                <button
                  onClick={() => { const vk = actionLine.verseKey; setActionLine(null); toggleTafsir(vk); }}
                  className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg bg-white/[0.06] text-[#EBDCB8] hover:bg-white/10 transition-colors"
                >
                  <CaretDown size={18} />
                  <span className="text-[11px] font-medium">Tafsir</span>
                </button>
                <button
                  onClick={() => { onAnnotate?.(actionLine); setActionLine(null); }}
                  disabled={!onAnnotate}
                  className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg bg-white/[0.06] text-[#EBDCB8] hover:bg-white/10 transition-colors disabled:opacity-40"
                >
                  <PencilSimpleLine size={18} />
                  <span className="text-[11px] font-medium">Annotate</span>
                </button>
                <button
                  onClick={() => { onAskRaya?.(actionLine); setActionLine(null); }}
                  disabled={!onAskRaya}
                  className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg bg-[#D4A853]/15 text-[#D4A853] hover:bg-[#D4A853]/25 transition-colors disabled:opacity-40"
                >
                  <ChatCircle size={18} weight="fill" />
                  <span className="text-[11px] font-medium">Ask Raya</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page navigation (within this surah's span) */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={() => setPageNum((n) => Math.max(startPage, n - 1))}
          disabled={!canPrev}
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/5 text-white/60 disabled:opacity-30 transition-colors hover:bg-white/10"
        >
          <CaretRight size={16} /> Previous
        </button>
        <span className="text-white/40 text-sm">{pageNum - startPage + 1} / {endPage - startPage + 1}</span>
        <button
          onClick={() => setPageNum((n) => Math.min(endPage, n + 1))}
          disabled={!canNext}
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#D4A853]/20 text-[#D4A853] disabled:opacity-30 transition-colors hover:bg-[#D4A853]/30"
        >
          Next <CaretLeft size={16} />
        </button>
      </div>
    </div>
  );
}
