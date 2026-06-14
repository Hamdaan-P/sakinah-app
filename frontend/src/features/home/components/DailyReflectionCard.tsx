/**
 * Daily Reflection — tabbed card with two daily-rotating modes:
 *   • Ayah  — one verse from a curated list (reuses dailyAyahService)
 *   • Duʿā  — one supplication from a curated list
 *
 * Both rotate deterministically per calendar day so every device shows the
 * same content on the same date. The tab choice is remembered in localStorage
 * so the user lands on whichever side they last read.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, BookOpen, HandsPraying, ArrowRight, CheckCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import {
  getTodaysAyah,
  markSeen,
  type DailyAyahPick,
} from '@/features/quran/services/dailyAyahService';
import { fetchVerse } from '@/features/quran/services/quranApiService';
import type { QuranLine } from '@/features/quran/types/quran.types';
import { getTodaysDua } from './_dailyDuas';

type Tab = 'ayah' | 'dua';
const TAB_STORAGE = 'daily_reflection_tab';

export function DailyReflectionCard() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>(() => {
    try {
      const stored = localStorage.getItem(TAB_STORAGE);
      return stored === 'dua' ? 'dua' : 'ayah';
    } catch {
      return 'ayah';
    }
  });

  const pick = useMemo<DailyAyahPick>(() => getTodaysAyah(), []);
  const dua = useMemo(() => getTodaysDua().dua, []);

  const [verse, setVerse] = useState<QuranLine | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchVerse(pick.surahId, pick.ayahNumber)
      .then((v) => { if (!cancelled) setVerse(v); })
      .catch(() => { /* offline / fail silently */ })
      .finally(() => { if (!cancelled) setVerseLoading(false); });
    markSeen();
    return () => { cancelled = true; };
  }, [pick.surahId, pick.ayahNumber]);

  const switchTab = (next: Tab) => {
    setTab(next);
    try { localStorage.setItem(TAB_STORAGE, next); } catch { /* ignore */ }
  };

  const arabic = verse?.arabic || verse?.arabicIndopak || '';
  const translation = (verse?.translation || '').replace(/<[^>]+>/g, '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 rounded-2xl overflow-hidden border border-[#D4A853]/20 bg-gradient-to-br from-[#0F141F]/70 via-[#0A0E16] to-[#0A0E16]"
    >
      {/* Tab header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <Sun size={14} weight="fill" className="text-[#D4A853]" />
          <span className="text-[10px] uppercase tracking-[0.14em] text-[#D4A853]/85 font-semibold">
            Daily Reflection
          </span>
        </div>
        <div className="flex items-center gap-1 p-0.5 rounded-full bg-white/5 border border-white/5">
          <TabPill active={tab === 'ayah'} onClick={() => switchTab('ayah')} icon={<BookOpen size={11} weight="fill" />} label="Ayah" />
          <TabPill active={tab === 'dua'} onClick={() => switchTab('dua')} icon={<HandsPraying size={11} weight="fill" />} label="Duʿā" />
        </div>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        {tab === 'ayah' ? (
          <motion.button
            key="ayah"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate(`/quran/read?surah=${pick.surahId}&verse=${encodeURIComponent(`${pick.surahId}:${pick.ayahNumber}`)}`)}
            className="w-full text-left px-4 pt-3 pb-4 hover:bg-white/[0.02] transition-colors"
          >
            {verseLoading ? (
              <div className="space-y-2">
                <div className="h-6 rounded-md bg-white/5 animate-pulse" />
                <div className="h-3 rounded-md bg-white/5 animate-pulse w-3/4" />
              </div>
            ) : (
              <>
                {arabic && (
                  <p
                    className="font-arabic text-right text-[#F5E8C7] leading-[2.1] text-[20px] mb-2.5"
                    dir="rtl"
                  >
                    {arabic}
                  </p>
                )}
                {translation && (
                  <p className="text-[13px] text-[#7A7363] leading-relaxed mb-2 italic">
                    “{translation}”
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-[#5C5749]">
                    Sūrah {pick.surahId} · ayah {pick.ayahNumber}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#D4A853]/80 font-medium">
                    {pick.alreadyReflected ? (
                      <>
                        <CheckCircle size={11} weight="fill" className="text-emerald-400/90" />
                        Reflected
                      </>
                    ) : (
                      <>Reflect <ArrowRight size={11} /></>
                    )}
                  </span>
                </div>
              </>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="dua"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-4 pt-3 pb-4"
          >
            <p
              className="font-arabic text-right text-[#F5E8C7] leading-[2.1] text-[20px] mb-2.5"
              dir="rtl"
            >
              {dua.arabic}
            </p>
            <p className="text-[11px] text-[#5C5749] italic mb-1.5 leading-relaxed">
              {dua.transliteration}
            </p>
            <p className="text-[13px] text-[#7A7363] leading-relaxed mb-2">
              “{dua.translation}”
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-[#5C5749]">{dua.source}</span>
              <span className="text-[10px] text-[#D4A853]/70">— rotates daily</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TabPill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all',
        active
          ? 'bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16]'
          : 'text-[#7A7363] hover:text-[#F5E8C7]'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export default DailyReflectionCard;
