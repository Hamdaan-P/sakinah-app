/**
 * Quran Recitation Page
 * Mirrors Flutter's quran_recitation_page.dart
 * Full surah audio playback with reciter selection and mini player
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CaretLeft,
  Headphones,
  Play,
  Pause,
  Square,
  SpinnerGap,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { fetchSurahs, fetchReciters, fetchChapterAudioUrl } from '../services/quranApiService';
import type { Surah, Reciter } from '../types/quran.types';
import { RECITER_PRESETS } from '../types/quran.types';

export function QuranRecitationPage() {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Playback state
  const [playingSurahId, setPlayingSurahId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Audio URL cache
  const urlCache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    (async () => {
      try {
        const [s, r] = await Promise.all([fetchSurahs(), fetchReciters()]);
        setSurahs(s);
        setReciters(r);
        // Default to Mishari Alafasy
        const defaultReciter = r.find((x) => x.name.toLowerCase().includes('alafasy')) ?? r[0];
        if (defaultReciter) setSelectedReciter(defaultReciter);
        setLoading(false);
      } catch {
        setError('Failed to load data');
        setLoading(false);
      }
    })();

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setPlayingSurahId(null);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ref mutation isn't a valid dep; this attaches listeners once when the audio element is wired up
  }, [audioRef.current]);

  const playSurah = useCallback(async (surah: Surah) => {
    if (!selectedReciter) return;

    // If same surah, toggle play/pause
    if (playingSurahId === surah.id && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      return;
    }

    setIsLoadingAudio(true);
    setPlayingSurahId(surah.id);

    try {
      const cacheKey = `${surah.id}_${selectedReciter.id}`;
      let url = urlCache.current.get(cacheKey);

      if (!url) {
        url = await fetchChapterAudioUrl(surah.id, selectedReciter.id) ?? undefined;
        if (url) urlCache.current.set(cacheKey, url);
      }

      if (!url) {
        setError('Audio not available for this reciter');
        setPlayingSurahId(null);
        setIsLoadingAudio(false);
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      await audio.play();
      setIsLoadingAudio(false);
    } catch {
      setError('Failed to play audio');
      setPlayingSurahId(null);
      setIsLoadingAudio(false);
    }
  }, [selectedReciter, playingSurahId, isPlaying]);

  const stopPlaying = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlayingSurahId(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const seekTo = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const selectPreset = (preset: typeof RECITER_PRESETS[number]) => {
    const match = reciters.find((r) =>
      r.name.toLowerCase().includes(preset.name.toLowerCase().split(' ')[0].toLowerCase())
    );
    if (match) {
      setSelectedReciter(match);
      // Stop current playback when switching reciters
      if (playingSurahId) stopPlaying();
    }
  };

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const playingSurah = surahs.find((s) => s.id === playingSurahId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] flex items-center justify-center">
        <div className="animate-pulse text-[#D4A853]">Loading reciters...</div>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-gradient-to-b from-[#0A0E16] to-[#0F141F] flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/10">
            <CaretLeft size={20} className="text-[#D4A853]" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Headphones size={20} className="text-[#D4A853]" />
              Quran Recitation
            </h1>
            <p className="text-white/40 text-xs">{surahs.length} Surahs available</p>
          </div>
          <button
            onClick={() => navigate('/quran/recitation/diary')}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/75 hover:bg-white/10"
          >
            My Diary
          </button>
        </div>

        {/* Reciter presets */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {RECITER_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPreset(p)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors',
                selectedReciter?.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0].toLowerCase())
                  ? 'bg-[#D4A853]/20 text-[#D4A853] border-[#D4A853]/30'
                  : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Full reciter dropdown */}
        {reciters.length > 0 && (
          <select
            value={selectedReciter?.id ?? ''}
            onChange={(e) => {
              const r = reciters.find((x) => x.id === parseInt(e.target.value));
              if (r) {
                setSelectedReciter(r);
                if (playingSurahId) stopPlaying();
              }
            }}
            className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          >
            {reciters.map((r) => (
              <option key={r.id} value={r.id} className="bg-[#0A0E16] text-white">
                {r.name}{r.style ? ` (${r.style})` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Surah List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24">
        {surahs.map((surah) => {
          const isCurrent = playingSurahId === surah.id;
          return (
            <button
              key={surah.id}
              onClick={() => playSurah(surah)}
              className={cn(
                'w-full flex items-center gap-3 py-3 border-b border-white/5 text-left transition-colors',
                isCurrent && 'bg-[#D4A853]/5 rounded-lg px-2 -mx-2'
              )}
            >
              {/* Number */}
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                isCurrent
                  ? 'bg-gradient-to-br from-[#D4A853] to-[#E8C97A] text-[#0A0E16]'
                  : 'bg-white/5 text-white/50'
              )}>
                {surah.id}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={cn('text-sm font-medium truncate', isCurrent ? 'text-[#D4A853]' : 'text-white')}>
                    {surah.nameSimple}
                  </p>
                  <p className="text-sm text-white/60 font-arabic mr-2" dir="rtl">{surah.nameArabic}</p>
                </div>
                <p className="text-[11px] text-white/40">{surah.revelationType} · {surah.versesCount} verses</p>
              </div>

              {/* Play indicator */}
              <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                {isCurrent && isLoadingAudio ? (
                  <SpinnerGap size={16} className="text-[#D4A853] animate-spin" />
                ) : isCurrent && isPlaying ? (
                  <Pause size={16} className="text-[#D4A853]" />
                ) : (
                  <Play size={16} className="text-white/30" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Mini Player */}
      {playingSurah && (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 bg-[#0A0E16]/95 backdrop-blur-xl border-t border-[#D4A853]/15 px-4 py-3 z-30">
          {/* Progress bar */}
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="w-full h-1 mb-2 accent-amber-500 cursor-pointer"
          />
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{playingSurah.nameSimple}</p>
              <p className="text-[11px] text-white/40">{selectedReciter?.name} · {formatTime(currentTime)} / {formatTime(duration)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isPlaying) audioRef.current?.pause();
                  else audioRef.current?.play();
                }}
                className="w-10 h-10 rounded-full bg-[#D4A853]/20 flex items-center justify-center"
              >
                {isPlaying ? <Pause size={20} className="text-[#D4A853]" /> : <Play size={20} className="text-[#D4A853]" />}
              </button>
              <button onClick={stopPlaying} className="p-2 rounded-lg hover:bg-white/10">
                <Square size={16} className="text-white/50" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuranRecitationPage;
