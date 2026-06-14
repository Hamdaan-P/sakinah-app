/**
 * QuranMushafPage
 * Cinematic Mushaf reader showing printed-page SCANS with a 3D page-flip,
 * a light/dark (night) theme, a 4-way script picker, page-level audio,
 * and a quick-jump drawer.
 *
 * This reader renders page images (mushaf/{script}/page{NNN}.png in Firebase
 * Storage). The verse-by-verse TEXT reader lives separately at /quran/read
 * and is intentionally left untouched.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CaretLeft,
  GearSix,
  Sun,
  Moon,
  Play,
  Stop,
  ListBullets,
  SpeakerHigh,
  SpeakerSlash,
} from '@phosphor-icons/react';
import { fetchSurahs, getAyahAudioUrl } from '../services/quranApiService';
import type { QuranLine, Surah } from '../types/quran.types';
import { MushafPageFlipper } from '../components/MushafPageFlipper';
import { MushafQuickJump } from '../components/MushafQuickJump';
import { MushafStyleChooser } from '../components/MushafStyleChooser';
import { useMushafTheme } from '../hooks/useMushafTheme';
import { usePagePrefetch } from '../hooks/usePagePrefetch';
import { useMushafRecent } from '../hooks/useMushafRecent';
import {
  MUSHAF_SCRIPTS,
  DEFAULT_MUSHAF_SCRIPT,
  mushafScriptMeta,
  type MushafScript,
} from '../data/mushafScripts';

const SETTINGS_KEY = 'quran_mushaf_settings_v3';

interface MushafSettings {
  soundEnabled: boolean;
  loopMode: 'continuous' | 'single-ayah';
  /** Which printed-Mushaf scan set to show. */
  script: MushafScript;
}

function loadSettings(): MushafSettings {
  const defaults: MushafSettings = {
    soundEnabled: false,
    loopMode: 'continuous',
    script: DEFAULT_MUSHAF_SCRIPT,
  };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<MushafSettings>) };
  } catch {
    return defaults;
  }
}

export function QuranMushafPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [pageNumber, setPageNumber] = useState(() => parseInt(params.get('page') ?? '1', 10) || 1);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [settings, setSettings] = useState<MushafSettings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [showJump, setShowJump] = useState(false);
  // Style chooser shows on entry (unless deep-linked to a specific page).
  const [picking, setPicking] = useState(() => !params.get('page'));

  const scriptMeta = mushafScriptMeta(settings.script);
  const totalPages = scriptMeta.pages;

  const { theme, toggle: toggleTheme, tokens } = useMushafTheme();
  const { recents, push: pushRecent } = useMushafRecent();
  const { data: currentData } = usePagePrefetch(pageNumber);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const continuousRef = useRef(false);
  const loopModeRef = useRef<MushafSettings['loopMode']>(settings.loopMode);

  useEffect(() => {
    fetchSurahs().then(setSurahs).catch(() => setSurahs([]));
    return () => audioRef.current?.pause();
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    loopModeRef.current = settings.loopMode;
  }, [settings]);

  useEffect(() => {
    pushRecent(pageNumber);
  }, [pageNumber, pushRecent]);

  const stopAudio = () => {
    continuousRef.current = false;
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingKey(null);
  };

  const goToPage = (n: number) => {
    const clamped = Math.max(1, Math.min(totalPages, n));
    setPageNumber(clamped);
    setParams({ page: String(clamped) }, { replace: true });
    stopAudio();
  };

  // Switching to a shorter edition (e.g. IndoPak, 557pp) can leave the
  // current page out of range — clamp it back in.
  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages);
      setParams({ page: String(totalPages) }, { replace: true });
    }
  }, [totalPages, pageNumber, setParams]);

  const playFrom = (start: QuranLine, allLines: QuranLine[]) => {
    const idx = allLines.findIndex((l) => l.verseKey === start.verseKey);
    if (idx === -1) return;
    continuousRef.current = true;
    const playAt = (i: number) => {
      if (!continuousRef.current || i >= allLines.length) {
        stopAudio();
        return;
      }
      const line = allLines[i];
      audioRef.current?.pause();
      const a = new Audio(getAyahAudioUrl(line.verseKey));
      audioRef.current = a;
      setPlayingKey(line.verseKey);
      a.play().catch(stopAudio);
      a.onended = () => {
        if (!continuousRef.current) return;
        const nextIdx = loopModeRef.current === 'single-ayah' ? i : i + 1;
        playAt(nextIdx);
      };
    };
    playAt(idx);
  };

  const playPageFromStart = () => {
    if (!currentData || currentData.lines.length === 0) return;
    if (playingKey) {
      stopAudio();
    } else {
      playFrom(currentData.lines[0], currentData.lines);
    }
  };

  if (picking) {
    return (
      <MushafStyleChooser
        current={settings.script}
        tokens={tokens}
        onSelect={(script) => {
          setSettings((s) => ({ ...s, script }));
          setPicking(false);
        }}
        onBack={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: tokens.pageBg }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 backdrop-blur-md pt-safe"
        style={{
          background:
            theme === 'light'
              ? 'linear-gradient(180deg, rgba(42,31,18,0.92) 0%, rgba(42,31,18,0.78) 100%)'
              : 'linear-gradient(180deg, rgba(10,14,22,0.95) 0%, rgba(10,14,22,0.78) 100%)',
          borderBottom: `1px solid ${tokens.frame}33`,
        }}
      >
        <div className="px-3 py-2.5 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <CaretLeft size={20} style={{ color: tokens.frameAccent }} />
          </button>
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="flex-1 min-w-0 text-left rounded-lg px-1 py-0.5 hover:bg-white/10 transition-colors"
            aria-label="Change Mushaf style"
          >
            <h1 className="text-sm font-bold truncate flex items-center gap-1" style={{ color: tokens.frameAccent }}>
              {scriptMeta.label} <span className="opacity-50 text-[10px]">▾</span>
            </h1>
            <p className="text-[10px] opacity-60 truncate" style={{ color: tokens.frameAccent }}>
              Page {pageNumber} of {totalPages}
            </p>
          </button>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={pageNumber}
            onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
            className="w-14 rounded-lg px-2 py-1 text-xs text-center bg-white/10 outline-none"
            style={{ color: tokens.frameAccent, border: `1px solid ${tokens.frame}55` }}
          />
          <button
            onClick={() => setShowJump(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Jump to surah/juz/bookmark"
          >
            <ListBullets size={18} style={{ color: tokens.frameAccent }} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'light' ? (
                <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Sun size={18} style={{ color: tokens.frameAccent }} />
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Moon size={18} style={{ color: tokens.frameAccent }} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            onClick={playPageFromStart}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={playingKey ? 'Stop' : 'Play page'}
          >
            {playingKey ? (
              <Stop size={18} weight="fill" className="text-red-400" />
            ) : (
              <Play size={18} weight="fill" style={{ color: tokens.frameAccent }} />
            )}
          </button>
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Settings"
          >
            <GearSix size={18} style={{ color: tokens.frameAccent }} />
          </button>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.25)', borderTop: `1px solid ${tokens.frame}22` }}
            >
              <div className="px-4 py-3 space-y-3" style={{ color: tokens.frameAccent }}>
                {/* Script picker */}
                <div className="text-xs">
                  <span className="block mb-1.5 opacity-80">Script</span>
                  <div className="grid grid-cols-2 gap-2">
                    {MUSHAF_SCRIPTS.map((s) => {
                      const active = settings.script === s.id;
                      return (
                        <button
                          key={s.id}
                          disabled={!s.available}
                          onClick={() => setSettings((prev) => ({ ...prev, script: s.id }))}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            background: active ? tokens.gold : 'transparent',
                            color: active ? '#1A1208' : tokens.frameAccent,
                            border: `1px solid ${tokens.frame}55`,
                          }}
                        >
                          <span>{s.label}</span>
                          <span className="opacity-70" style={{ fontFamily: "'Amiri Quran', serif" }}>
                            {s.arabic}
                          </span>
                          {!s.available && <span className="text-[9px] opacity-60">soon</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    {settings.soundEnabled ? <SpeakerHigh size={14} /> : <SpeakerSlash size={14} />} Page-flip sound
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings((s) => ({ ...s, soundEnabled: e.target.checked }))}
                    className="accent-amber-500"
                  />
                </label>
                <div className="flex items-center justify-between text-xs">
                  <span>Audio playback</span>
                  <div
                    className="flex rounded-lg overflow-hidden"
                    style={{ border: `1px solid ${tokens.frame}55` }}
                  >
                    {(['continuous', 'single-ayah'] as const).map((mode) => {
                      const active = settings.loopMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => setSettings((s) => ({ ...s, loopMode: mode }))}
                          className="px-3 py-1 text-[11px] font-medium transition-colors"
                          style={{
                            background: active ? tokens.gold : 'transparent',
                            color: active ? '#1A1208' : tokens.frameAccent,
                          }}
                        >
                          {mode === 'continuous' ? 'Continuous' : 'Loop ayah'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Page flipper area */}
      <div className="px-3 sm:px-6 py-6 pb-safe">
        <MushafPageFlipper
          pageNumber={pageNumber}
          script={settings.script}
          tokens={tokens}
          soundEnabled={settings.soundEnabled}
          onPageChange={goToPage}
        />

        {/* Subtle pager hint below the page */}
        <p
          className="text-center text-[10px] mt-4 tracking-widest uppercase"
          style={{ color: `${tokens.frameAccent}88` }}
        >
          Swipe to turn the page
        </p>
      </div>

      {/* Quick-jump bottom drawer */}
      <MushafQuickJump
        open={showJump}
        onClose={() => setShowJump(false)}
        onJump={goToPage}
        surahs={surahs}
        recents={recents}
        tokens={tokens}
        maxPage={totalPages}
        aligned={scriptMeta.aligned604}
      />
    </div>
  );
}

export default QuranMushafPage;
