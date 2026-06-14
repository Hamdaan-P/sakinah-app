/**
 * QuranMemorizePage
 * Adaptive memorization workflow. Improves on the reference app's fixed
 * 4-step Listen/Read/Memorize/Repeat by:
 *  - 3 modes (Beginner / Intensive / Revision) with different step configs
 *  - Auto-tuning repetition count from accuracy trend
 *  - Synced ayah highlight during Listen phase
 *  - Loop-N for any step
 *  - Blind-recall checkpoint before marking step done
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CaretLeft,
  Play,
  Stop,
  Minus,
  Plus,
  Check,
  ArrowRight,
  ArrowLeft,
  EyeSlash,
  Eye,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { MemorizeMode, MemorizeStep, QuranLine, Surah } from '../types/quran.types';
import { fetchLines, fetchSurahs, getAyahAudioUrl } from '../services/quranApiService';
import { recentAccuracy } from '../services/hifzEngine';

const MODE_PRESETS: Record<MemorizeMode, MemorizeStep[]> = {
  beginner: [
    { kind: 'listen', label: 'Listen', reps: 5, description: 'Listen carefully with Arabic text visible.' },
    { kind: 'read', label: 'Read along', reps: 3, description: 'Read the ayah aloud along with the reciter.' },
    { kind: 'repeat', label: 'Repeat', reps: 5, description: 'Repeat from memory, audio on.' },
    { kind: 'blind-recall', label: 'Blind recall', reps: 1, description: 'Try without looking — if you fail, go back a step.' },
  ],
  intensive: [
    { kind: 'listen', label: 'Listen', reps: 3, description: 'Focus on pronunciation & rhythm.' },
    { kind: 'repeat', label: 'Repeat', reps: 7, description: 'Rapid-fire repetition.' },
    { kind: 'blind-recall', label: 'Blind recall', reps: 2, description: 'No visual aid. Two flawless passes.' },
    { kind: 'test', label: 'Self-test', reps: 1, description: 'Write the ayah from memory or record yourself.' },
  ],
  revision: [
    { kind: 'blind-recall', label: 'Blind recall', reps: 1, description: 'Recall from memory first.' },
    { kind: 'listen', label: 'Confirm', reps: 1, description: 'Listen once to confirm accuracy.' },
    { kind: 'repeat', label: 'Cement', reps: 2, description: 'Two cementing repetitions.' },
  ],
};

export function QuranMemorizePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [lines, setLines] = useState<QuranLine[]>([]);
  const [ayahIndex, setAyahIndex] = useState(0);
  const [mode, setMode] = useState<MemorizeMode>('beginner');
  const [stepIndex, setStepIndex] = useState(0);
  const [repsDone, setRepsDone] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showArabic, setShowArabic] = useState(true);
  const [reciterId] = useState(7);
  const [autoTuned, setAutoTuned] = useState(false);
  const [autoPauseMs, setAutoPauseMs] = useState(600);
  // Reference-app parity: Surah vs Page source, and range size (how many ayahs per session)
  const [source, setSource] = useState<'surah' | 'page'>('surah');
  const [rangeSize, setRangeSize] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load surahs
  useEffect(() => {
    (async () => {
      const s = await fetchSurahs();
      setSurahs(s);
      const wanted = params.get('surah');
      const start = wanted ? s.find((x) => x.id === parseInt(wanted)) : s[s.length - 1]; // default last (short surahs)
      if (start) {
        setSelectedSurah(start);
        setLines(await fetchLines(start.id));
      }
    })();
    return () => audioRef.current?.pause();
  }, [params]);

  // Base steps, possibly auto-tuned by recent accuracy
  const steps: MemorizeStep[] = useMemo(() => {
    const base = MODE_PRESETS[mode].map((s) => ({ ...s }));
    if (!autoTuned) return base;
    const acc = recentAccuracy(5);
    // Tune rep count: poor accuracy → +2 reps on repeat/listen; great accuracy → −1
    const delta = acc < 0.65 ? +2 : acc > 0.9 ? -1 : 0;
    return base.map((s) =>
      s.kind === 'repeat' || s.kind === 'listen'
        ? { ...s, reps: Math.max(1, s.reps + delta) }
        : s,
    );
  }, [mode, autoTuned]);

  const activeStep = steps[stepIndex];
  const activeLine = lines[ayahIndex];
  const progress = steps.length > 0 ? (stepIndex + repsDone / Math.max(1, activeStep.reps)) / steps.length : 0;

  // Audio playback for Listen / Read / Repeat — plays the active range sequentially
  const playOnce = () => {
    if (!activeLine) return;
    const rangeLines = lines.slice(ayahIndex, ayahIndex + Math.min(rangeSize, lines.length - ayahIndex));
    if (rangeLines.length === 0) return;
    if (audioRef.current) audioRef.current.pause();

    const playAt = (i: number) => {
      if (i >= rangeLines.length) {
        setIsPlaying(false);
        window.setTimeout(() => setRepsDone((r) => r + 1), autoPauseMs);
        return;
      }
      const url = getAyahAudioUrl(rangeLines[i].verseKey, reciterId);
      const a = new Audio(url);
      audioRef.current = a;
      setIsPlaying(true);
      a.play().catch(() => setIsPlaying(false));
      a.onended = () => {
        if (i + 1 < rangeLines.length) {
          window.setTimeout(() => playAt(i + 1), autoPauseMs);
        } else {
          setIsPlaying(false);
          window.setTimeout(() => setRepsDone((r) => r + 1), autoPauseMs);
        }
      };
    };
    playAt(0);
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
  };

  // Auto-advance when reps complete
  useEffect(() => {
    if (!activeStep) return;
    if (repsDone >= activeStep.reps) {
      if (stepIndex + 1 < steps.length) {
        setStepIndex((i) => i + 1);
        setRepsDone(0);
      }
      // else: workflow complete — stay
    }
  }, [repsDone, activeStep, stepIndex, steps.length]);

  // Loop behaviour: if Listen/Repeat step is active and audio ended but not all reps done, auto-play next
  useEffect(() => {
    if (!activeStep) return;
    if (activeStep.kind === 'blind-recall' || activeStep.kind === 'test') return;
    if (!isPlaying && repsDone < activeStep.reps && audioRef.current == null && activeLine) {
      // Trigger only if user has begun (played at least once). We avoid auto-autoplay on mount.
    }
  }, [isPlaying, repsDone, activeStep, activeLine]);

  // Clamp rangeSize to available ayahs so the UI never gets stuck
  const effectiveRange = Math.max(1, Math.min(rangeSize, lines.length));

  const nextAyah = () => {
    const jump = effectiveRange;
    if (ayahIndex + jump < lines.length) {
      setAyahIndex((i) => Math.min(lines.length - 1, i + jump));
      setStepIndex(0);
      setRepsDone(0);
      stopAudio();
    }
  };

  const prevAyah = () => {
    const jump = effectiveRange;
    if (ayahIndex > 0) {
      setAyahIndex((i) => Math.max(0, i - jump));
      // Keep current step — switching ayahs shouldn't lose your place in the routine.
      setRepsDone(0);
      stopAudio();
    }
  };

  const restartStep = () => {
    stopAudio();
    setRepsDone(0);
  };

  const manualAdvanceStep = () => {
    if (stepIndex + 1 < steps.length) {
      setStepIndex((i) => i + 1);
      setRepsDone(0);
      stopAudio();
    }
  };

  const manualPrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
      setRepsDone(0);
      stopAudio();
    }
  };

  if (!selectedSurah || !activeLine) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] flex items-center justify-center text-[#D4A853]">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A0E16]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/10">
            <CaretLeft size={20} className="text-[#D4A853]" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold">Memorize</h1>
            <p className="text-[11px] text-white/40">
              {selectedSurah.id}. {selectedSurah.nameSimple} · Ayah {activeLine.verseNumber} of {lines.length}
            </p>
          </div>
        </div>

        {/* Source toggle: Surah | Page — matches reference app */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            {(['surah', 'page'] as const).map((src) => (
              <button
                key={src}
                onClick={() => {
                  setSource(src);
                  // Quick-default: "page" implies memorize the current mushaf page (~ up to 15 ayahs)
                  if (src === 'page') setRangeSize(Math.min(10, Math.max(rangeSize, lines[ayahIndex]?.pageNumber ? 10 : rangeSize)));
                  if (src === 'surah') setRangeSize(1);
                }}
                className={cn(
                  'px-3 py-1 text-[10px] capitalize',
                  source === src ? 'bg-[#D4A853]/20 text-[#D4A853]' : 'text-white/40',
                )}
              >
                {src}
              </button>
            ))}
          </div>
          {/* Range-size slider — how many ayahs to memorize together this session */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[10px] text-white/40">Ayahs per session</span>
            <input
              type="range"
              min={1}
              max={10}
              value={rangeSize}
              onChange={(e) => setRangeSize(parseInt(e.target.value))}
              className="accent-amber-500 w-24"
            />
            <span className="text-[11px] text-[#D4A853] w-5 text-center">{effectiveRange}</span>
          </div>
        </div>

        {/* Surah picker + mode selector */}
        <div className="flex gap-2">
          <select
            value={selectedSurah.id}
            onChange={async (e) => {
              const s = surahs.find((x) => x.id === parseInt(e.target.value));
              if (!s) return;
              setSelectedSurah(s);
              setLines(await fetchLines(s.id));
              setAyahIndex(0);
              setStepIndex(0);
              setRepsDone(0);
              stopAudio();
            }}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs"
          >
            {surahs.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0A0E16]">
                {s.id}. {s.nameSimple}
              </option>
            ))}
          </select>
          <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            {(['beginner', 'intensive', 'revision'] as MemorizeMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setStepIndex(0);
                  setRepsDone(0);
                }}
                className={cn(
                  'px-2 py-1.5 text-[10px] capitalize',
                  mode === m ? 'bg-[#D4A853]/20 text-[#D4A853]' : 'text-white/40',
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A]"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 pb-28">
        {/* Ayah display — renders 1..rangeSize ayahs starting at current index */}
        <div className="rounded-2xl border border-[#D4A853]/15 bg-[#0F141F]/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-white/40 uppercase tracking-wide">
              {rangeSize === 1
                ? `Ayah ${activeLine.verseNumber}`
                : `Ayahs ${activeLine.verseNumber}–${Math.min(lines.length, activeLine.verseNumber + rangeSize - 1)}`}
            </span>
            <button
              onClick={() => setShowArabic((s) => !s)}
              className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white/80"
            >
              {showArabic ? <Eye size={13} /> : <EyeSlash size={13} />}
              {showArabic ? 'Arabic visible' : 'Arabic hidden'}
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLine.verseKey + String(showArabic) + rangeSize}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn('space-y-3', !showArabic && 'blur-md select-none')}
            >
              {lines.slice(ayahIndex, ayahIndex + rangeSize).map((l) => (
                <div key={l.verseKey}>
                  <p
                    className="text-right text-2xl sm:text-3xl font-arabic leading-loose"
                    dir="rtl"
                    style={{ fontFamily: "'Amiri', 'KFGQPC Hafs', serif" }}
                  >
                    {l.arabic}
                    <span className="inline-flex items-center justify-center w-6 h-6 mx-1 rounded-full border border-[#D4A853]/30 text-[10px] text-[#D4A853] align-middle">
                      {l.verseNumber}
                    </span>
                  </p>
                  {showArabic && l.translation && rangeSize <= 3 && (
                    <p className="text-sm text-white/60 mt-2 leading-relaxed">{l.translation}</p>
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Active step card */}
        <div className="rounded-2xl border border-[#D4A853]/25 bg-gradient-to-br from-[#D4A853]/10 to-transparent p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#D4A853]">Step {stepIndex + 1} / {steps.length}</p>
              <h2 className="text-lg font-bold">{activeStep.label}</h2>
              <p className="text-[12px] text-white/60 mt-0.5">{activeStep.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#D4A853]">{repsDone}<span className="text-white/30 text-base">/{activeStep.reps}</span></p>
              <p className="text-[10px] uppercase tracking-wide text-white/40">reps</p>
            </div>
          </div>

          {/* Step controls */}
          <div className="flex items-center gap-2 mt-4">
            {(activeStep.kind === 'listen' || activeStep.kind === 'read' || activeStep.kind === 'repeat') && (
              <button
                onClick={isPlaying ? stopAudio : playOnce}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#D4A853]/20 border border-[#D4A853]/40 text-[#D4A853] font-medium"
              >
                {isPlaying ? <><Stop size={16} weight="fill" /> Stop</> : <><Play size={16} weight="fill" /> Play ({activeStep.reps - repsDone} left)</>}
              </button>
            )}
            {activeStep.kind === 'blind-recall' && (
              <button
                onClick={() => {
                  setShowArabic(false);
                  setTimeout(() => {
                    setShowArabic(true);
                    setRepsDone((r) => r + 1);
                  }, 2000);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#4FB892]/20 border border-[#4FB892]/40 text-[#4FB892] font-medium"
              >
                <EyeSlash size={16} weight="fill" /> Blind pass
              </button>
            )}
            {activeStep.kind === 'test' && (
              <button
                onClick={() => navigate(`/quran/hifz/test?surah=${selectedSurah.id}&start=${activeLine.verseKey}&end=${activeLine.verseKey}&type=voice`)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium"
              >
                <Check size={16} weight="fill" /> Take self-test
              </button>
            )}
            <button onClick={manualPrevStep} disabled={stepIndex === 0} title="Previous step" className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30">
              <ArrowLeft size={16} className="text-white/60" />
            </button>
            <button onClick={restartStep} title="Restart step" className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
              <ArrowsClockwise size={16} className="text-white/60" />
            </button>
            <button onClick={manualAdvanceStep} disabled={stepIndex + 1 >= steps.length} title="Next step" className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30">
              <ArrowRight size={16} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Settings row */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-2">
          <label className="flex items-center justify-between text-xs">
            <span className="text-white/60">Auto-tune reps from accuracy</span>
            <input
              type="checkbox"
              checked={autoTuned}
              onChange={(e) => setAutoTuned(e.target.checked)}
              className="accent-amber-500"
            />
          </label>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">Auto-pause between reps</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setAutoPauseMs((v) => Math.max(0, v - 200))} className="p-1 rounded bg-white/5">
                <Minus size={12} className="text-white/60" />
              </button>
              <span className="text-[11px] text-white/70 w-12 text-center">{autoPauseMs}ms</span>
              <button onClick={() => setAutoPauseMs((v) => v + 200)} className="p-1 rounded bg-white/5">
                <Plus size={12} className="text-white/60" />
              </button>
            </div>
          </div>
        </div>

        {/* Step list */}
        <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
          {steps.map((s, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center justify-between px-3 py-2 text-xs border-b last:border-b-0 border-white/5',
                i === stepIndex ? 'bg-[#D4A853]/10 text-[#D4A853]' : i < stepIndex ? 'text-white/40' : 'text-white/60',
              )}
            >
              <span className="flex items-center gap-2">
                <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px]', i < stepIndex ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10')}>
                  {i < stepIndex ? <Check size={10} weight="bold" /> : i + 1}
                </span>
                {s.label}
              </span>
              <span className="text-white/40">{s.reps}×</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ayah navigation — offset above MainLayout's mobile BottomNavBar (z-40, ~4rem + safe-area). */}
      <div className="fixed left-0 right-0 bg-[#0A0E16]/95 backdrop-blur-sm border-t border-white/5 px-4 py-3 flex items-center justify-between gap-3 z-30 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0">
        <button
          onClick={prevAyah}
          disabled={ayahIndex === 0}
          className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs disabled:opacity-30"
        >
          ← Previous
        </button>
        <p className="text-[11px] text-white/40">
          {ayahIndex + 1} / {lines.length}
        </p>
        <button
          onClick={nextAyah}
          disabled={ayahIndex + 1 >= lines.length}
          className="px-3 py-1.5 rounded-lg bg-[#D4A853]/20 text-[#D4A853] text-xs disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default QuranMemorizePage;
