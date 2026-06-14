/**
 * Quran Home Page
 * Hub page linking to Reading, Recitation, and Streak features
 * Mirrors Flutter's bottom nav Quran tab (dialog with options)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DisclaimerBanner } from '@/components/shared';
import { BookOpen, Headphones, Fire, TrendUp, BookmarkSimple, ArrowRight, BookmarksSimple, Brain, BookBookmark, MagnifyingGlass, GameController, Microphone, FolderSimple, GraduationCap, PencilSimple } from '@phosphor-icons/react';
import { getStreakInfo, getScoreInfo } from '../services/quranStreakService';
import { fetchSurahs } from '../services/quranApiService';
import { getBookmarks, type QuranBookmark } from '../services/quranBookmarkService';
import { getCounts as getWorkspaceCounts } from '../services/workspaceService';
import { trackFeature } from '@/lib/analytics';
import { DailyAyahCard } from '../components/DailyAyahCard';

function ProgressRing({ progress, label, sublabel }: { progress: number; label: string; sublabel?: string }) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }} aria-label={`Today's progress ${Math.round(clamped * 100)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#D4A853"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-[#D4A853] leading-none">{label}</span>
        {sublabel && <span className="text-[9px] text-white/40 leading-none mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}

export function QuranHomePage() {
  useEffect(() => { trackFeature('quran'); }, []);
  const navigate = useNavigate();
  const streak = getStreakInfo();
  const score = getScoreInfo();

  // Load bookmark info (legacy "Continue Reading")
  const [bookmark, setBookmark] = useState<{ surahId: number; surahName: string; verseKey: string } | null>(null);
  // Multi-bookmark list
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>([]);
  const [workspaceTotal, setWorkspaceTotal] = useState(0);

  useEffect(() => {
    const wsCounts = getWorkspaceCounts();
    setWorkspaceTotal(wsCounts.notes + wsCounts.documents + wsCounts.reflections + wsCounts.reminders);
    // Load legacy Continue Reading bookmark
    const bmSurah = localStorage.getItem('quran_bookmark_surah');
    const bmVerse = localStorage.getItem('quran_bookmark_verse');
    if (bmSurah && bmVerse) {
      const surahId = parseInt(bmSurah);
      fetchSurahs().then((surahs) => {
        const s = surahs.find((x) => x.id === surahId);
        if (s) setBookmark({ surahId, surahName: `${s.id}. ${s.nameSimple} (${s.nameArabic})`, verseKey: bmVerse });
      }).catch(() => {});
    }
    // Load all bookmarks
    setBookmarks(getBookmarks());
  }, []);

  const SECTIONS = [
    {
      icon: BookOpen,
      title: 'Read Quran',
      desc: 'Verse-by-verse with translation, tafsir & audio',
      path: '/quran/read',
      gradient: 'from-[#D4A853]/20 to-[#E8C97A]/10',
      borderColor: 'border-[#D4A853]/20',
      iconColor: 'text-[#D4A853]',
    },
    {
      icon: Headphones,
      title: 'Listen to Recitation',
      desc: 'Full surah audio with 100+ reciters',
      path: '/quran/recitation',
      gradient: 'from-[#0F141F]/20 to-[#0F141F]/10',
      borderColor: 'border-[#D4A853]/20',
      iconColor: 'text-[#D4A853]',
    },
    {
      icon: Brain,
      title: 'Hifz (Memorize)',
      desc: 'Adaptive memorization · tests · progress & weak-ayah detection',
      path: '/quran/hifz',
      gradient: 'from-[#D4A853]/25 to-[#E8C97A]/10',
      borderColor: 'border-[#D4A853]/30',
      iconColor: 'text-[#D4A853]',
    },
    {
      icon: BookBookmark,
      title: 'Mushaf (15-line)',
      desc: 'Classic page view with tajweed colors, Juz markers, adjustable size',
      path: '/quran/mushaf',
      gradient: 'from-emerald-500/15 to-[#0F141F]/10',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Microphone,
      title: 'Tajweed Practice',
      desc: 'Recite, get word-by-word feedback on accuracy',
      path: '/quran/tajweed-practice',
      gradient: 'from-rose-500/15 to-[#0F141F]/10',
      borderColor: 'border-rose-500/20',
      iconColor: 'text-rose-300',
    },
    {
      icon: GameController,
      title: 'Guess the Ayah',
      desc: 'Quick game — pick the surah from 4 choices',
      path: '/quran/guess-ayah',
      gradient: 'from-amber-500/15 to-[#0F141F]/10',
      borderColor: 'border-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      icon: MagnifyingGlass,
      title: 'Concept Search',
      desc: 'Find ayahs by theme — patience, mercy, parents… · AI-assisted',
      path: '/quran/search',
      gradient: 'from-[#B891E8]/15 to-[#0F141F]/10',
      borderColor: 'border-[#B891E8]/20',
      iconColor: 'text-[#B891E8]',
    },
    {
      icon: FolderSimple,
      title: 'Topic Research',
      desc: 'Search Quran · hadith · tafsir together · save findings to collections',
      path: '/quran/research',
      gradient: 'from-[#D4A853]/20 to-[#0F141F]/10',
      borderColor: 'border-[#D4A853]/30',
      iconColor: 'text-[#D4A853]',
    },
    {
      icon: GraduationCap,
      title: 'Study Tracks',
      desc: 'Scholar-led learning journeys · tawhid · sabr · daily rhythm',
      path: '/quran/tracks',
      gradient: 'from-[#8FBC8F]/15 to-[#0F141F]/10',
      borderColor: 'border-[#8FBC8F]/25',
      iconColor: 'text-[#8FBC8F]',
    },
    {
      icon: PencilSimple,
      title: 'My Workspace',
      desc:
        workspaceTotal > 0
          ? `${workspaceTotal} note${workspaceTotal === 1 ? '' : 's'}, docs & reflections`
          : 'Notes · Documents · Reminders · Reflections',
      path: '/quran/workspace',
      gradient: 'from-[#B891E8]/20 to-[#0F141F]/10',
      borderColor: 'border-[#B891E8]/25',
      iconColor: 'text-[#B891E8]',
    },
    {
      icon: BookmarksSimple,
      title: 'My Bookmarks',
      desc: bookmarks.length > 0 ? `${bookmarks.length} saved ${bookmarks.length === 1 ? 'verse' : 'verses'}` : 'Save verses for quick access',
      path: '/quran/bookmarks',
      gradient: 'from-[#4FB892]/20 to-[#0F141F]/10',
      borderColor: 'border-[#4FB892]/20',
      iconColor: 'text-[#4FB892]',
    },
    {
      icon: Fire,
      title: 'Reading Streak',
      desc: `${streak.streakCount} day streak · ${streak.dailyReadCount}/${streak.dailyTarget} today`,
      path: '/quran/streak',
      gradient: 'from-orange-500/20 to-orange-600/10',
      borderColor: 'border-orange-500/20',
      iconColor: 'text-orange-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F]">
      <div className="px-4 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Quran</h1>
        <p className="text-white/50 text-sm">Read, listen, and build your daily habit</p>
      </div>

      {/* Score banner with circular progress ring */}
      <div className="mx-4 mb-5 rounded-xl bg-gradient-to-r from-[#D4A853]/10 to-[#0F141F]/10 border border-[#D4A853]/15 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <TrendUp size={20} className="text-[#D4A853] flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {score.totalAyahs.toLocaleString()} Ayahs Read
              </p>
              <p className="text-[11px] text-white/40 truncate">{score.nextMilestone}</p>
            </div>
          </div>
          <ProgressRing
            progress={score.progressToMilestone}
            label={`${score.todayAyahs}`}
            sublabel="today"
          />
        </div>
      </div>

      {/* Daily Ayah — curated rotating verse with reflection journal */}
      <DailyAyahCard />

      {/* Continue Reading — bookmark card */}
      {bookmark && (
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/quran/read')}
          className="mx-4 mb-5 w-[calc(100%-2rem)] flex items-center gap-3.5 p-4 rounded-xl bg-gradient-to-r from-[#4FB892]/10 to-[#0F141F]/10 border border-[#4FB892]/20 text-left hover:border-[#4FB892]/35 transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-[#4FB892]/10 flex items-center justify-center shrink-0">
            <BookmarkSimple size={22} weight="fill" className="text-[#4FB892]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#4FB892] mb-0.5">Continue Reading</p>
            <p className="text-sm font-semibold text-white truncate">{bookmark.surahName}</p>
            <p className="text-[11px] text-white/40 mt-0.5">Verse {bookmark.verseKey}</p>
          </div>
          <ArrowRight size={18} className="text-[#4FB892]/60 shrink-0" />
        </motion.button>
      )}

      {/* Navigation cards */}
      <div className="px-4 space-y-3">
        {SECTIONS.map((section, i) => (
          <motion.button
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(section.path)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${section.gradient} border ${section.borderColor} text-left hover:scale-[1.01] transition-transform`}
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <section.icon size={24} className={section.iconColor} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{section.title}</p>
              <p className="text-xs text-white/50 mt-0.5">{section.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="px-4 pb-4 mt-4">
        <DisclaimerBanner contentId="RELIGIOUS" variant="subtle" />
      </div>
    </div>
  );
}

export default QuranHomePage;
