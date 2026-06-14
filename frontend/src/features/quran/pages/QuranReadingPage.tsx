/**
 * Quran Reading Page
 * Mirrors Flutter's quran_reading_page.dart
 * Verse-by-verse reader with translations, transliteration, roots, tafsir, audio
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  fetchSurahs,
  fetchLinesWithWords,
  fetchTafsir,
  fetchTafsirList,
  type TafsirOption,
} from '../services/quranApiService';
import { registerVerseRead, getStreakInfo } from '../services/quranStreakService';
import { toggleBookmark, getBookmarkedKeys, migrateLegacyBookmark } from '../services/quranBookmarkService';
import type { Surah, QuranLine, QuranWord, ReadingMode } from '../types/quran.types';
import { READING_PRESETS } from '../types/quran.types';
import { MushafReadStyleChooser } from '../components/MushafReadStyleChooser';
import { ayahTextForStyle, ayahFontForStyle, type MushafStyleId } from '../config/mushafStyles';
import {
  getStyleForSurah,
  setStyleForSurah,
  setDefaultMushafStyle,
  hasChosenMushafStyle,
  onMushafStyleChange,
} from '../services/mushafStyleService';
import { useMushafTheme } from '../hooks/useMushafTheme';
import { WordPopover } from '../components/WordPopover';
import { RootOccurrencesSheet } from '../components/RootOccurrencesSheet';
import { QuickNoteSheet, AnnotationListSheet } from '../components/AnnotationSheet';
import { AyahMinimap } from '../components/AyahMinimap';
import { SurahHero } from '../components/SurahHero';
import { CircleFollowReader } from '../components/CircleFollowReader';
import { setCurrentReading } from '../services/hifzCirclesService';
import { auth } from '@/config/firebase.config';
import { getRecords, onHifzChange } from '../services/hifzEngine';
import { onHighlightsChange } from '../services/highlightManager';
import { onAnnotationsChange } from '../services/annotationManager';
import { SettingsPanel } from './components/SettingsPanel';
import { AyahSelectionToolbar } from './components/AyahSelectionToolbar';
import { QuranReadingHeader } from './components/QuranReadingHeader';
import { useAudioPlayer } from './components/_useAudioPlayer';
import { QuranReaderContent } from './components/QuranReaderContent';
import { RayaQuranPanel } from '../components/RayaQuranPanel';
import { SurahSummaryPanel } from '../components/SurahSummaryPanel';
import { DeepDiveSheet } from '../components/deep-dive/DeepDiveSheet';
import { EosCard } from '../components/EosCard';
import type { RayaQuranAyahContext } from '../types/quran.types';

// Legacy bookmark keys (for "Continue Reading" position)
const BM_SURAH = 'quran_bookmark_surah';
const BM_VERSE = 'quran_bookmark_verse';

export function QuranReadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Content
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [lines, setLines] = useState<QuranLine[]>([]);
  const [wordsByKey, setWordsByKey] = useState<Record<string, QuranWord[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Selection + annotation state
  const [selectedWord, setSelectedWord] = useState<{ word: QuranWord; x: number; y: number } | null>(null);
  const [selectedAyah, setSelectedAyah] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notingVerse, setNotingVerse] = useState<string | null>(null);
  const [annotationsOpen, setAnnotationsOpen] = useState(false);
  const [annotationTick, setAnnotationTick] = useState(0);
  const [highlightTick, setHighlightTick] = useState(0);
  useEffect(() => onAnnotationsChange(() => setAnnotationTick((v) => v + 1)), []);
  useEffect(() => onHighlightsChange(() => setHighlightTick((v) => v + 1)), []);
  const [hifzRecords, setHifzRecords] = useState(getRecords());
  useEffect(() => onHifzChange(() => setHifzRecords(getRecords())), []);

  // Display settings
  const [translationId, setTranslationId] = useState(20);
  const [tafsirId, setTafsirId] = useState<number>(() => {
    const saved = parseInt(localStorage.getItem('quran_tafsir_preference') || '');
    return Number.isFinite(saved) && saved > 0 ? saved : 169;
  });
  const [tafsirOptions, setTafsirOptions] = useState<TafsirOption[]>([]);
  useEffect(() => { fetchTafsirList().then(setTafsirOptions).catch(() => {}); }, []);
  const [reciterId, setReciterId] = useState(7);
  const [mode, setMode] = useState<ReadingMode>('ayah');
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [showRoots, setShowRoots] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // Typography — persisted so it survives reloads
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    const n = parseInt(localStorage.getItem('quran_font_size') ?? '24', 10);
    return Number.isFinite(n) && n >= 12 && n <= 60 ? n : 24;
  });
  const [arabicLineHeight, setArabicLineHeight] = useState<number>(() => {
    const n = parseFloat(localStorage.getItem('quran_line_height') ?? '2.2');
    return Number.isFinite(n) && n >= 1.2 && n <= 4 ? n : 2.2;
  });
  const [tajweedEnabled, setTajweedEnabled] = useState<boolean>(() => localStorage.getItem('quran_tajweed') === '1');
  useEffect(() => { localStorage.setItem('quran_font_size', String(arabicFontSize)); }, [arabicFontSize]);
  useEffect(() => { localStorage.setItem('quran_line_height', String(arabicLineHeight)); }, [arabicLineHeight]);
  useEffect(() => { localStorage.setItem('quran_tajweed', tajweedEnabled ? '1' : '0'); }, [tajweedEnabled]);

  // --- Mushaf script style (QCF V1/V2, Uthmani Hafs, IndoPak) ---
  // Shared with /quran/mushaf via mushafStyleService: a global default plus
  // per-surah overrides. First-run gate asks the reader to choose once.
  const { tokens: mushafTokens } = useMushafTheme();
  const [styleTick, setStyleTick] = useState(0);
  useEffect(() => onMushafStyleChange(() => setStyleTick((t) => t + 1)), []);
  const [showStyleGate, setShowStyleGate] = useState(() => !hasChosenMushafStyle());

  // Hifz Circle live-reading sync — driven by URL ?circle=X with &host=1 or &follow=1.
  const circleId = searchParams.get('circle');
  const isHostBroadcasting = circleId && searchParams.get('host') === '1';
  const isFollowing = circleId && searchParams.get('follow') === '1';
  const [followTargetKey, setFollowTargetKey] = useState<string | null>(null);
  const lastBroadcastRef = useRef<{ key: string; at: number }>({ key: '', at: 0 });

  /** Throttled host broadcast — fires at most once per 800ms. */
  const hostBroadcast = isHostBroadcasting && selectedSurah
    ? (verseKey: string) => {
        const now = Date.now();
        if (verseKey === lastBroadcastRef.current.key) return;
        if (now - lastBroadcastRef.current.at < 800) return;
        lastBroadcastRef.current = { key: verseKey, at: now };
        setCurrentReading(circleId!, selectedSurah.id, verseKey).catch(() => {});
      }
    : undefined;

  // Audio

  // Tafsir cache
  const [tafsirCache, setTafsirCache] = useState<Record<string, string>>({});
  const [tafsirLoading, setTafsirLoading] = useState<Set<string>>(new Set());
  const [expandedTafsir, setExpandedTafsir] = useState<string | null>(null);

  // Bookmarks (multi-bookmark support)
  const [bookmarkedKeys, setBookmarkedKeys] = useState<Set<string>>(new Set());
  // Legacy single bookmark for "Resume" button
  const [lastBookmarkKey, setLastBookmarkKey] = useState<string | null>(null);

  // Streak
  const [streakCount, setStreakCount] = useState(0);
  const sessionRead = useRef(new Set<string>());

  // Focus mode
  const [focusIndex, setFocusIndex] = useState(0);

  // Page mode → whether the reader is on the surah's last page (drives whether
  // the End-of-Surah card is shown). Reset when the surah changes.
  const [pageAtEnd, setPageAtEnd] = useState(false);
  useEffect(() => { setPageAtEnd(false); }, [selectedSurah?.id]);

  // Init
  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSurahs();
        setSurahs(s);
        const streakInfo = getStreakInfo();
        setStreakCount(streakInfo.streakCount);
        // Load bookmarks
        setBookmarkedKeys(getBookmarkedKeys());
        const bmSurah = localStorage.getItem(BM_SURAH);
        const bmVerse = localStorage.getItem(BM_VERSE);
        if (bmVerse) setLastBookmarkKey(bmVerse);
        // Migrate any legacy single bookmark
        if (bmSurah) {
          const legacySurah = s.find((x) => x.id === parseInt(bmSurah));
          if (legacySurah) migrateLegacyBookmark(`${legacySurah.id}. ${legacySurah.nameSimple}`);
          setBookmarkedKeys(getBookmarkedKeys());
        }
        // URL params take priority (from bookmark click), then legacy bookmark, then Al-Fatiha
        const urlSurah = searchParams.get('surah');
        const urlVerse = searchParams.get('verse');
        const startSurahId = urlSurah ? parseInt(urlSurah) : bmSurah ? parseInt(bmSurah) : 1;
        const startSurah = s.find((x) => x.id === startSurahId) || s[0];
        if (startSurah) {
          setSelectedSurah(startSurah);
          const { lines: l, wordsByKey: w } = await fetchLinesWithWords(startSurah.id, translationId);
          setLines(l);
          setWordsByKey(w);
          // Scroll to specific verse if provided
          if (urlVerse) {
            setTimeout(() => {
              document.getElementById(`verse-${urlVerse}`)?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('[QuranReadingPage] init failed:', err);
        setError(true);
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time init on mount; downstream params are read inside the effect
  }, []);

  const loadSurah = useCallback(async (surah: Surah) => {
    setSelectedSurah(surah);
    setLoading(true);
    setFocusIndex(0);
    try {
      const { lines: l, wordsByKey: w } = await fetchLinesWithWords(surah.id, translationId);
      setLines(l);
      setWordsByKey(w);
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [translationId]);

  const reloadWithTranslation = useCallback(async (tid: number) => {
    setTranslationId(tid);
    if (!selectedSurah) return;
    setLoading(true);
    try {
      const { lines: l, wordsByKey: w } = await fetchLinesWithWords(selectedSurah.id, tid);
      setLines(l);
      setWordsByKey(w);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [selectedSurah]);

  // Audio — supports single-verse and continuous surah playback
  const { playingKey, playAyah, stopAudio, playSurahFrom } = useAudioPlayer(reciterId, lines);

  // Bookmark toggle
  const handleBookmark = (line: QuranLine) => {
    if (!selectedSurah) return;
    const surahLabel = `${selectedSurah.id}. ${selectedSurah.nameSimple}`;
    const added = toggleBookmark(line.verseKey, selectedSurah.id, surahLabel, line.verseNumber);
    setBookmarkedKeys(getBookmarkedKeys());
    if (added) {
      // Update legacy position for "Continue Reading"
      localStorage.setItem(BM_SURAH, String(selectedSurah.id));
      localStorage.setItem(BM_VERSE, line.verseKey);
      setLastBookmarkKey(line.verseKey);
    }
  };

  // Tafsir
  const toggleTafsir = async (line: QuranLine) => {
    if (expandedTafsir === line.verseKey) {
      setExpandedTafsir(null);
      return;
    }
    setExpandedTafsir(line.verseKey);
    if (tafsirCache[line.verseKey]) return;

    setTafsirLoading((prev) => new Set(prev).add(line.verseKey));
    const text = await fetchTafsir(line.verseKey, tafsirId);
    if (text) {
      setTafsirCache((prev) => ({ ...prev, [line.verseKey]: text }));
    }
    setTafsirLoading((prev) => {
      const next = new Set(prev);
      next.delete(line.verseKey);
      return next;
    });
  };

  // In-page Raya panel state — replaces the previous /ai-assistant handoff.
  const [rayaOpen, setRayaOpen] = useState(false);
  const [rayaContext, setRayaContext] = useState<RayaQuranAyahContext | null>(null);
  const [rayaInitialQuestion, setRayaInitialQuestion] = useState<string | undefined>(undefined);

  // Deep Dive Sheet — opens from the AyahSelectionToolbar "Deep Dive" action.
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [deepDiveVerseKey, setDeepDiveVerseKey] = useState<string | null>(null);

  // Root occurrences sheet — opens from WordPopover "View root" CTA.
  const [rootSheetRoot, setRootSheetRoot] = useState<string | null>(null);

  const openDeepDive = (verseKey: string) => {
    const line = lines.find((l) => l.verseKey === verseKey);
    const surahName = selectedSurah?.nameSimple ?? '';
    setDeepDiveVerseKey(verseKey);
    setRayaContext({
      verseKey,
      surahName,
      ayahTranslation: line?.translation ?? '',
    });
    setDeepDiveOpen(true);
  };

  const askRayaAboutTafsir = async (line: QuranLine) => {
    let tafsir = tafsirCache[line.verseKey];
    if (!tafsir) {
      const text = await fetchTafsir(line.verseKey, tafsirId);
      if (text) {
        setTafsirCache((prev) => ({ ...prev, [line.verseKey]: text }));
        tafsir = text;
      }
    }
    const surahName = selectedSurah?.nameSimple ?? 'Unknown';
    setRayaContext({
      verseKey: line.verseKey,
      surahName,
      ayahTranslation: line.translation,
    });
    setRayaInitialQuestion(
      tafsir
        ? `Summarize and explain Surah ${surahName} (${line.verseKey}) in simple, source-cited terms.`
        : `Explain the meaning of Surah ${surahName} (${line.verseKey}) using verified scholarly sources.`,
    );
    setRayaOpen(true);
  };

  // Register verse read for streak
  const onVerseVisible = (line: QuranLine) => {
    if (sessionRead.current.has(line.verseKey)) return;
    sessionRead.current.add(line.verseKey);
    const info = registerVerseRead(line.verseKey);
    setStreakCount(info.streakCount);
  };

  // Effective Mushaf style for the current surah, and the resulting Arabic
  // text field + font used across the ayah / focus / page renderers.
  const mushafStyle: MushafStyleId = (() => {
    void styleTick;
    return getStyleForSurah(selectedSurah?.id ?? 1);
  })();
  const arabicFontFamily = ayahFontForStyle(mushafStyle);
  const getArabic = (line: QuranLine) => ayahTextForStyle(line, mushafStyle);

  // Apply reading preset
  const applyPreset = (preset: typeof READING_PRESETS[number]) => {
    setShowTranslation(preset.showTranslation);
    setShowTransliteration(preset.showTransliteration);
    setShowRoots(preset.showRoots);
    if ('translationId' in preset && preset.translationId) {
      reloadWithTranslation(preset.translationId);
    }
  };

  if (loading && lines.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] flex items-center justify-center">
        <div className="animate-pulse text-[#D4A853]">Loading Quran...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load Quran data</p>
          <button onClick={() => window.location.reload()} className="text-[#D4A853] underline">Retry</button>
        </div>
      </div>
    );
  }

  const focusLine = lines[focusIndex];

  // The End-of-Surah card should only appear once the reader has actually
  // reached the end of the surah — not mid-surah or at the start.
  //   • ayah mode  → the card sits after the full ayah list (genuine end)
  //   • focus mode → only when focused on the last ayah
  //   • page mode  → only on the surah's last page (reported by PageView)
  const eosVisible =
    mode === 'page'
      ? pageAtEnd
      : mode === 'focus'
        ? focusIndex >= lines.length - 1
        : true;

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] transition-[padding] duration-300 ease-in-out ${
        rayaOpen ? 'lg:pr-[28rem]' : ''
      }`}
    >
      <QuranReadingHeader
        selectedSurah={selectedSurah}
        surahs={surahs}
        streakCount={streakCount}
        lastBookmarkKey={lastBookmarkKey}
        mode={mode}
        lines={lines}
        onLoadSurah={loadSurah}
        onSetMode={setMode}
        onApplyPreset={applyPreset}
        onSetFocusIndex={setFocusIndex}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onOpenAnnotations={() => setAnnotationsOpen(true)}
      />

      <SettingsPanel
        open={showSettings}
        translationId={translationId}
        reciterId={reciterId}
        tafsirId={tafsirId}
        tafsirOptions={tafsirOptions}
        mushafStyle={mushafStyle}
        showTranslation={showTranslation}
        showTransliteration={showTransliteration}
        showRoots={showRoots}
        tajweedEnabled={tajweedEnabled}
        arabicFontSize={arabicFontSize}
        arabicLineHeight={arabicLineHeight}
        onReloadTranslation={reloadWithTranslation}
        onReciterChange={setReciterId}
        onTafsirChange={(id) => {
          setTafsirId(id);
          localStorage.setItem('quran_tafsir_preference', String(id));
          setTafsirCache({});
        }}
        onMushafStyleChange={(s) => setStyleForSurah(selectedSurah?.id ?? 1, s, true)}
        onShowTranslationChange={setShowTranslation}
        onShowTransliterationChange={setShowTransliteration}
        onShowRootsChange={setShowRoots}
        onTajweedChange={setTajweedEnabled}
        onArabicFontSizeChange={setArabicFontSize}
        onArabicLineHeightChange={setArabicLineHeight}
      />

      {selectedSurah && !loading && <SurahHero surah={selectedSurah} juz={focusLine?.juzNumber} />}

      {selectedSurah && !loading && (
        <div className="px-4 pt-2 space-y-3">
          <SurahSummaryPanel surahId={selectedSurah.id} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(`/quran/surah/${selectedSurah.id}/xray`)}
              className="text-xs px-3 py-1.5 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/25 text-[#D4A853] hover:bg-[#D4A853]/20"
            >
              Surah X-Ray
            </button>
            <button
              type="button"
              onClick={() => navigate(`/quran/surah/${selectedSurah.id}/depth-faqs`)}
              className="text-xs px-3 py-1.5 rounded-full bg-primaryTeal/10 border border-primaryTeal/25 text-primaryTeal hover:bg-primaryTeal/20"
            >
              Depth FAQs
            </button>
          </div>
        </div>
      )}

      <QuranReaderContent
        onJumpToVerse={(verseKey) => {
          const [surahStr] = verseKey.split(':');
          const targetSurahId = parseInt(surahStr);
          if (!Number.isFinite(targetSurahId)) return;
          if (selectedSurah && targetSurahId === selectedSurah.id) {
            const idx = lines.findIndex((l) => l.verseKey === verseKey);
            if (idx >= 0) {
              setFocusIndex(idx);
              setSelectedAyah(verseKey);
              setTimeout(() => {
                document.getElementById(`verse-${verseKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }
            return;
          }
          const targetSurah = surahs.find((s) => s.id === targetSurahId);
          if (targetSurah) {
            void loadSurah(targetSurah).then(() => {
              setSelectedAyah(verseKey);
              setTimeout(() => {
                document.getElementById(`verse-${verseKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 300);
            });
            navigate(`/quran/read?surah=${targetSurahId}&verse=${verseKey}`, { replace: true });
          }
        }}
        loading={loading}
        mode={mode}
        lines={lines}
        wordsByKey={wordsByKey}
        getArabic={getArabic}
        showTranslation={showTranslation}
        showTransliteration={showTransliteration}
        showRoots={showRoots}
        tajweedEnabled={tajweedEnabled}
        arabicFontSize={arabicFontSize}
        arabicLineHeight={arabicLineHeight}
        arabicFontFamily={arabicFontFamily}
        scriptStyle={mushafStyle}
        surahs={surahs}
        translationId={translationId}
        tafsirId={tafsirId}
        playingKey={playingKey}
        bookmarkedKeys={bookmarkedKeys}
        selectedAyah={selectedAyah}
        tafsirCache={tafsirCache}
        tafsirLoading={tafsirLoading}
        expandedTafsir={expandedTafsir}
        highlightTick={highlightTick}
        annotationTick={annotationTick}
        isHostBroadcasting={!!isHostBroadcasting}
        isFollowing={!!isFollowing}
        followTargetKey={followTargetKey}
        hostBroadcast={hostBroadcast || undefined}
        focusIndex={focusIndex}
        focusLine={focusLine}
        onSetFocusIndex={setFocusIndex}
        onPlayAyah={playAyah}
        onPlaySurahFrom={playSurahFrom}
        onStopAudio={stopAudio}
        onBookmark={handleBookmark}
        onToggleTafsir={toggleTafsir}
        onAskRaya={askRayaAboutTafsir}
        onAnnotate={(line) => setNotingVerse(line.verseKey)}
        onVerseVisible={onVerseVisible}
        onSetSelectedWord={setSelectedWord}
        onSetSelectedAyah={setSelectedAyah}
        onPageReachedEnd={setPageAtEnd}
      />

      {selectedSurah && !loading && lines.length > 0 && eosVisible && (
        <EosCard
          surah={selectedSurah}
          nextSurah={surahs.find((s) => s.id === selectedSurah.id + 1) ?? null}
        />
      )}

      {/* Word-tap popover */}
      <AnimatePresence>
        {selectedWord && (
          <WordPopover
            word={selectedWord.word}
            x={selectedWord.x}
            y={selectedWord.y}
            onClose={() => setSelectedWord(null)}
            onAskRaya={(w) => {
              const line = lines.find((l) => l.verseKey === w.verseKey);
              setRayaContext({
                verseKey: w.verseKey,
                surahName: selectedSurah?.nameSimple,
                ayahTranslation: line?.translation,
              });
              setRayaInitialQuestion(
                `Explain the Arabic word "${w.arabic}"${w.root ? ` (root: ${w.root})` : ''} as used in ${w.verseKey} — give meaning, grammar, and nuance using verified scholarly sources.`,
              );
              setRayaOpen(true);
              setSelectedWord(null);
            }}
            onViewRoot={(root) => {
              setRootSheetRoot(root);
              setSelectedWord(null);
            }}
          />
        )}
      </AnimatePresence>

      <RootOccurrencesSheet
        root={rootSheetRoot}
        open={rootSheetRoot !== null}
        onClose={() => setRootSheetRoot(null)}
        onJumpToVerse={(verseKey) => {
          setRootSheetRoot(null);
          // Reuse the same jump logic that QuranReaderContent fires.
          const [surahStr] = verseKey.split(':');
          const targetSurahId = parseInt(surahStr);
          if (selectedSurah && targetSurahId === selectedSurah.id) {
            const idx = lines.findIndex((l) => l.verseKey === verseKey);
            if (idx >= 0) {
              setFocusIndex(idx);
              setSelectedAyah(verseKey);
              setTimeout(() => {
                document.getElementById(`verse-${verseKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }
            return;
          }
          const targetSurah = surahs.find((s) => s.id === targetSurahId);
          if (targetSurah) {
            void loadSurah(targetSurah).then(() => {
              setSelectedAyah(verseKey);
              setTimeout(() => {
                document.getElementById(`verse-${verseKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 300);
            });
            navigate(`/quran/read?surah=${targetSurahId}&verse=${verseKey}`, { replace: true });
          }
        }}
      />

      <AyahSelectionToolbar
        selectedAyah={selectedAyah}
        paletteOpen={paletteOpen}
        lines={lines}
        playingKey={playingKey}
        bookmarkedKeys={bookmarkedKeys}
        onSetSelectedAyah={setSelectedAyah}
        onSetPaletteOpen={setPaletteOpen}
        onSetNotingVerse={setNotingVerse}
        onPlayAyah={playAyah}
        onStopAudio={stopAudio}
        onBookmark={handleBookmark}
        onDeepDive={openDeepDive}
      />

      <DeepDiveSheet
        open={deepDiveOpen}
        onClose={() => setDeepDiveOpen(false)}
        verseKey={deepDiveVerseKey}
        context={rayaContext}
      />

      {/* Quick note composer */}
      <QuickNoteSheet
        open={notingVerse !== null}
        verseKey={notingVerse ?? ''}
        surahId={selectedSurah?.id ?? 0}
        pageNumber={lines.find((l) => l.verseKey === notingVerse)?.pageNumber}
        onClose={() => setNotingVerse(null)}
      />

      {/* Annotations drawer (opened from the header annotations button) */}
      <AnnotationListSheet
        open={annotationsOpen}
        onClose={() => setAnnotationsOpen(false)}
        onJumpToVerse={(vk) => {
          setAnnotationsOpen(false);
          document.getElementById(`verse-${vk}`)?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Ayah minimap (desktop only) */}
      <AyahMinimap
        lines={lines}
        records={hifzRecords}
        bookmarkedKeys={bookmarkedKeys}
        activeKey={playingKey ?? selectedAyah}
        onJump={(vk) => {
          document.getElementById(`verse-${vk}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      />

      <RayaQuranPanel
        open={rayaOpen}
        onClose={() => setRayaOpen(false)}
        context={rayaContext}
        initialQuestion={rayaInitialQuestion}
      />

      {/* First-run Mushaf style chooser — asks the reader to pick a script once.
          Reusable per-surah from Settings → Mushaf Script Style. */}
      <MushafReadStyleChooser
        open={showStyleGate}
        mode="gate"
        currentStyle={mushafStyle}
        tokens={mushafTokens}
        onPick={(id) => {
          setDefaultMushafStyle(id);
          setShowStyleGate(false);
        }}
      />

      {/* Hifz Circle synced reading — visible only when ?circle=X&follow=1 */}
      {isFollowing && circleId && auth.currentUser && (
        <CircleFollowReader
          circleId={circleId}
          myUid={auth.currentUser.uid}
          onTarget={(surahId, verseKey) => {
            if (selectedSurah && surahId !== selectedSurah.id) {
              const s = surahs.find((x) => x.id === surahId);
              if (s) loadSurah(s);
            }
            setFollowTargetKey(verseKey);
          }}
          onStop={() => {
            const next = new URLSearchParams(searchParams);
            next.delete('follow');
            navigate(`/quran/read?${next.toString()}`, { replace: true });
            setFollowTargetKey(null);
          }}
        />
      )}
    </div>
  );
}

export default QuranReadingPage;
