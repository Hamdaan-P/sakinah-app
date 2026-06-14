/**
 * DailyAyahCard — home-screen card showing today's curated ayah.
 * Tapping opens the full Daily Ayah page with translation, tafsir and
 * a "Reflect on this" prompt.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, ArrowRight, CheckCircle, Fire } from '@phosphor-icons/react';
import { getTodaysAyah, getReflectionStreak, markSeen, type DailyAyahPick } from '../services/dailyAyahService';
import { fetchVerse } from '../services/quranApiService';
import type { QuranLine } from '../types/quran.types';

export function DailyAyahCard() {
  const navigate = useNavigate();
  const [pick] = useState<DailyAyahPick>(() => getTodaysAyah());
  const [verse, setVerse] = useState<QuranLine | null>(null);
  const [loading, setLoading] = useState(true);
  const streak = getReflectionStreak();

  useEffect(() => {
    let cancelled = false;
    fetchVerse(pick.surahId, pick.ayahNumber)
      .then((v) => { if (!cancelled) setVerse(v); })
      .catch(() => { /* network failure — show fallback */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    markSeen();
    return () => { cancelled = true; };
  }, [pick.surahId, pick.ayahNumber]);

  const arabic = verse?.arabic || verse?.arabicIndopak || '';
  const translation = verse?.translation || '';

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/quran/daily-ayah')}
      className="mx-4 mb-5 w-[calc(100%-2rem)] block text-left rounded-2xl bg-gradient-to-br from-[#D4A853]/15 via-[#0F141F]/40 to-[#0A0E16] border border-[#D4A853]/25 overflow-hidden hover:border-[#D4A853]/45 transition-all"
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <Sun size={16} weight="fill" className="text-[#D4A853]" />
          <span className="text-[11px] uppercase tracking-wider text-[#D4A853]/90 font-semibold">Daily Guidance</span>
        </div>
        <div className="flex items-center gap-2">
          {streak.streak > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-orange-300/90">
              <Fire size={12} weight="fill" />{streak.streak}
            </span>
          )}
          {pick.alreadyReflected && (
            <CheckCircle size={14} weight="fill" className="text-emerald-400/90" />
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        {loading ? (
          <div className="h-16 rounded-md bg-white/5 animate-pulse" />
        ) : (
          <>
            {arabic && (
              <p
                className="font-arabic text-right text-[#F5E8C7] leading-[1.9] text-lg sm:text-xl line-clamp-2 mb-2"
                dir="rtl"
              >
                {arabic}
              </p>
            )}
            {translation && (
              <p className="text-xs text-white/60 line-clamp-2 mb-1">
                "{translation.replace(/<[^>]+>/g, '')}"
              </p>
            )}
            <p className="text-[10px] text-white/40 mt-1">Surah {pick.surahId}:{pick.ayahNumber}</p>
          </>
        )}
      </div>

      <div className="flex items-center justify-between px-4 pb-4 pt-1 border-t border-white/5">
        <span className="text-[11px] text-[#D4A853]/80 font-medium">
          {pick.alreadyReflected ? 'Reflected today ✓' : 'Reflect · remember · live it'}
        </span>
        <ArrowRight size={14} className="text-[#D4A853]/70" />
      </div>
    </motion.button>
  );
}

export default DailyAyahCard;
