/**
 * Daily Ayah page — full reading view + reflection journal.
 * Today's ayah (curated rotation), translation, brief tafsir, audio,
 * "Reflect on this" composer, and the user's reflection history.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sun, Fire, CheckCircle, Trash, BookOpen, Play, Pause, ShareNetwork, Sparkle } from '@phosphor-icons/react';
import { QuranShareCard } from '../components/QuranShareCard';
import { DailyGuidancePanel } from '../components/DailyGuidancePanel';
import {
  getTodaysAyah,
  getReflections,
  saveReflection,
  deleteReflection,
  getReflectionStreak,
  markSeen,
  type DailyAyahPick,
  type DailyReflection,
} from '../services/dailyAyahService';
import { fetchVerse, fetchTafsir, getAyahAudioUrl } from '../services/quranApiService';
import type { QuranLine } from '../types/quran.types';
import { trackFeature } from '@/lib/analytics';

export function QuranDailyAyahPage() {
  useEffect(() => { trackFeature('quran_daily_ayah'); markSeen(); }, []);
  const navigate = useNavigate();

  const [pick, setPick] = useState<DailyAyahPick>(() => getTodaysAyah());
  const [verse, setVerse] = useState<QuranLine | null>(null);
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [reflections, setReflections] = useState<DailyReflection[]>(() => getReflections());
  const streak = getReflectionStreak();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchVerse(pick.surahId, pick.ayahNumber),
      fetchTafsir(pick.verseKey).catch(() => null),
    ])
      .then(([v, t]) => {
        if (cancelled) return;
        setVerse(v);
        setTafsir(t);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => {
      cancelled = true;
      audio?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick.surahId, pick.ayahNumber, pick.verseKey]);

  const handleAudio = () => {
    if (audio && playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    const url = getAyahAudioUrl(pick.verseKey);
    const a = audio ?? new Audio(url);
    if (!audio) {
      a.addEventListener('ended', () => setPlaying(false));
      setAudio(a);
    }
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const handleSave = () => {
    setSaving(true);
    // Mirror the reflection into the unified Quran Workspace, carrying the
    // verse text so the Workspace renders the linked ayah without a re-fetch.
    saveReflection(pick.verseKey, note, {
      surahName: `Surah ${pick.surahId}`,
      surahNameArabic: '',
      arabic: verse?.arabic ?? '',
      translation: (verse?.translation ?? '').replace(/<[^>]+>/g, ''),
    });
    setReflections(getReflections());
    setPick(getTodaysAyah());
    setNote('');
    setTimeout(() => setSaving(false), 200);
  };

  const handleDelete = (date: string) => {
    deleteReflection(date);
    setReflections(getReflections());
    setPick(getTodaysAyah());
  };

  const arabic = verse?.arabic || '';
  const translation = verse?.translation || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <Sun size={16} weight="fill" className="text-[#D4A853]" />
            <h1 className="text-sm font-semibold text-white">Daily Guidance</h1>
          </div>
          <button
            onClick={() => setShareOpen(true)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
            aria-label="Share"
          >
            <ShareNetwork size={16} className="text-white/70" />
          </button>
        </div>
      </div>

      {/* Streak strip */}
      <div className="px-4 pt-4">
        <div className="rounded-xl bg-gradient-to-r from-orange-500/15 to-orange-600/5 border border-orange-500/20 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Fire size={20} weight="fill" className="text-orange-400" />
            <div>
              <p className="text-sm font-semibold text-white">{streak.streak} day streak</p>
              <p className="text-[10px] text-white/50">Longest {streak.longest} · {streak.total} total reflections</p>
            </div>
          </div>
          {pick.alreadyReflected && (
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
              <CheckCircle size={14} weight="fill" /> Reflected today
            </span>
          )}
        </div>
      </div>

      {/* Verse card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-[#D4A853]/10 via-[#0F141F]/40 to-[#0A0E16] border border-[#D4A853]/25 overflow-hidden"
      >
        <div className="px-5 pt-4 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[#D4A853]/90 font-semibold">
            Surah {pick.surahId} · Ayah {pick.ayahNumber}
          </span>
          <button
            onClick={handleAudio}
            className="w-9 h-9 rounded-full bg-[#D4A853]/15 hover:bg-[#D4A853]/25 flex items-center justify-center transition-colors"
          >
            {playing
              ? <Pause size={16} weight="fill" className="text-[#D4A853]" />
              : <Play size={16} weight="fill" className="text-[#D4A853]" />}
          </button>
        </div>

        <div className="px-5 py-5">
          {loading ? (
            <>
              <div className="h-12 rounded-md bg-white/5 animate-pulse mb-3" />
              <div className="h-8 rounded-md bg-white/5 animate-pulse" />
            </>
          ) : (
            <>
              <p
                dir="rtl"
                className="font-arabic text-right text-[#F5E8C7] leading-[2] text-2xl sm:text-3xl mb-4"
              >
                {arabic}
              </p>
              {translation && (
                <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                  {translation.replace(/<[^>]+>/g, '')}
                </p>
              )}
            </>
          )}
        </div>

        {/* Tafsir */}
        {tafsir && (
          <div className="border-t border-white/5 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-[#D4A853]/80" />
              <span className="text-[11px] uppercase tracking-wide text-[#D4A853]/80 font-semibold">Tafsir Ibn Kathir</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">{tafsir.replace(/<[^>]+>/g, '')}</p>
          </div>
        )}
      </motion.div>

      {/* Ask Raya — attach the verse + tafsir as anchor context so Raya
          treats it as reference and the user can type their own question. */}
      {!loading && arabic && (
        <button
          onClick={() => {
            navigate('/ai-assistant', {
              state: {
                quranAnchor: {
                  surahId: pick.surahId,
                  ayahNumber: pick.ayahNumber,
                  verseKey: pick.verseKey,
                  arabicText: arabic,
                  translation,
                  tafsir: tafsir ?? undefined,
                  tafsirSource: 'Ibn Kathir',
                },
              },
            });
          }}
          className="mx-4 mt-4 w-[calc(100%-2rem)] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#B891E8]/15 to-[#4FB892]/10 border border-[#B891E8]/25 text-sm font-medium text-[#B891E8] hover:border-[#B891E8]/40 transition-colors"
        >
          <Sparkle size={14} weight="fill" /> Ask Raya about this ayah
        </button>
      )}

      {/* Daily Guidance — four cited pillars (reflection · sunnah reminder ·
          how to live it · take-it-deeper prompt). Retrieval-only, no LLM. */}
      <DailyGuidancePanel
        verseKey={pick.verseKey}
        surahId={pick.surahId}
        ayahNumber={pick.ayahNumber}
        arabic={arabic}
        translation={translation ? translation.replace(/<[^>]+>/g, '') : ''}
        tafsir={tafsir}
        onUseReflection={(text) => setNote(text.slice(0, 500))}
      />

      {/* Reflect composer */}
      <div className="mx-4 mt-5 rounded-2xl bg-white/3 border border-white/8 p-4">
        <p className="text-[11px] uppercase tracking-wide text-white/50 font-semibold mb-2">Reflect</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          placeholder="What spoke to you in this ayah today? (optional)"
          rows={3}
          className="w-full bg-[#0A0E16]/60 border border-white/10 rounded-lg p-3 text-sm text-white/90 placeholder:text-white/30 resize-none focus:outline-none focus:border-[#D4A853]/40"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-white/30">{note.length}/500</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#D4A853] text-[#0A0E16] text-xs font-semibold hover:bg-[#E8C97A] active:scale-95 transition-all disabled:opacity-50"
          >
            {pick.alreadyReflected ? 'Update reflection' : 'Save reflection'}
          </button>
        </div>
      </div>

      {/* Journal */}
      {reflections.length > 0 && (
        <div className="mx-4 mt-6">
          <p className="text-[11px] uppercase tracking-wide text-white/50 font-semibold mb-2 px-1">Reflection Journal</p>
          <div className="space-y-2">
            {reflections.slice(0, 30).map((r) => (
              <ReflectionRow key={r.date} r={r} onDelete={handleDelete} />
            ))}
          </div>
          {reflections.length > 30 && (
            <p className="text-[10px] text-white/30 text-center mt-3">
              Showing 30 most recent · {reflections.length - 30} more saved
            </p>
          )}
        </div>
      )}

      <QuranShareCard
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        kicker="Daily Ayah"
        reference={pick.verseKey}
        arabic={arabic}
        translation={translation ? translation.replace(/<[^>]+>/g, '') : undefined}
        filenameHint={`daily-${pick.verseKey.replace(':', '-')}`}
      />
    </div>
  );
}

function ReflectionRow({ r, onDelete }: { r: DailyReflection; onDelete: (date: string) => void }) {
  const [verse, setVerse] = useState<QuranLine | null>(null);
  const [s, a] = r.verseKey.split(':').map(Number);

  useEffect(() => {
    let cancelled = false;
    fetchVerse(s, a).then((v) => { if (!cancelled) setVerse(v); }).catch(() => {});
    return () => { cancelled = true; };
  }, [s, a]);

  return (
    <div className="rounded-xl bg-white/3 border border-white/8 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-[#D4A853]/80 font-medium">{r.verseKey}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40">{r.date}</span>
          <button
            onClick={() => onDelete(r.date)}
            className="text-white/30 hover:text-rose-400 transition-colors"
            aria-label="Delete reflection"
          >
            <Trash size={12} />
          </button>
        </div>
      </div>
      {verse?.arabic && (
        <p dir="rtl" className="font-arabic text-right text-[#F5E8C7]/85 text-sm leading-[1.85] line-clamp-2 mb-1">
          {verse.arabic}
        </p>
      )}
      {r.note && (
        <p className="text-xs text-white/70 italic mt-1.5 leading-relaxed border-l-2 border-[#D4A853]/30 pl-2">
          {r.note}
        </p>
      )}
    </div>
  );
}

export default QuranDailyAyahPage;
