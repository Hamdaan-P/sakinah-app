/**
 * Quran Streak Details Page
 * Mirrors Flutter's quran_streak_details_page.dart
 * Shows streak stats, calendar heatmap, and daily progress
 */

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fire, CaretLeft, CaretRight, BookOpen, Check, Flag, Trophy } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import {
  getStreakStatistics,
  getHistoryForMonth,
  getMilestoneMessage,
} from '../services/quranStreakService';
import type { QuranStreakStats } from '../types/quran.types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAILY_TARGET = 10;

export function QuranStreakPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<QuranStreakStats | null>(null);
  const [monthHistory, setMonthHistory] = useState<Record<string, number>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadData is defined below and reads currentMonth via closure; only re-run when the month changes
  }, [currentMonth]);

  const loadData = () => {
    setLoading(true);
    const s = getStreakStatistics();
    const h = getHistoryForMonth(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    setStats(s);
    setMonthHistory(h);
    setLoading(false);
  };

  const changeMonth = (delta: number) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const isCurrentMonth =
    currentMonth.getFullYear() === new Date().getFullYear() &&
    currentMonth.getMonth() === new Date().getMonth();

  // Flame color based on streak level
  const flameColor = useMemo(() => {
    if (!stats) return 'text-gray-400';
    if (stats.currentStreak >= 100) return 'text-cyan-400';
    if (stats.currentStreak >= 30) return 'text-orange-500';
    if (stats.currentStreak >= 1) return 'text-[#D4A853]';
    return 'text-gray-400';
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only currentStreak affects the color; full stats object would invalidate the memo on every other field change
  }, [stats?.currentStreak]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] flex items-center justify-center">
        <div className="animate-pulse text-[#D4A853]">Loading streak...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F]">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/10">
            <CaretLeft size={20} className="text-[#D4A853]" />
          </button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Fire size={20} className={flameColor} />
            Reading Streak
          </h1>
        </div>
      </div>

      <div className="px-4 pb-8 space-y-5">
        {/* Streak Hero */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Fire size={64} className={cn('mx-auto mb-3', flameColor)} />
          </motion.div>
          <p className="text-5xl font-black text-white mb-1">{stats?.currentStreak ?? 0}</p>
          <p className="text-white/50 text-sm">Day Streak</p>
          {stats && stats.longestStreak > 0 && (
            <p className="text-[#D4A853]/60 text-xs mt-1 flex items-center justify-center gap-1">
              <Trophy size={12} />
              Personal best: {stats.longestStreak} days
            </p>
          )}
        </motion.div>

        {/* Today's Progress */}
        {stats && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">Today's Progress</span>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                stats.todayCount >= DAILY_TARGET
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-[#D4A853]/20 text-[#D4A853]'
              )}>
                {stats.todayCount >= DAILY_TARGET ? 'Complete!' : `${stats.remainingToday} more`}
              </span>
            </div>
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.todayProgress * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  stats.todayProgress >= 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-[#D4A853] to-amber-400'
                )}
              />
            </div>
            <p className="text-xs text-white/40 mt-1.5">{stats.todayCount} / {DAILY_TARGET} ayahs</p>
          </div>
        )}

        {/* Calendar */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-white/10">
              <CaretLeft size={16} className="text-white/60" />
            </button>
            <span className="text-sm font-medium text-white">
              {currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => changeMonth(1)}
              disabled={isCurrentMonth}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-20"
            >
              <CaretRight size={16} className="text-white/60" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] text-white/30 font-medium">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <CalendarGrid
            year={currentMonth.getFullYear()}
            month={currentMonth.getMonth()}
            history={monthHistory}
          />

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5 text-[10px] text-white/40">
              <div className="w-3 h-3 rounded bg-white/5" /> No reading
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/40">
              <div className="w-3 h-3 rounded bg-[#D4A853]/30" /> Partial
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/40">
              <div className="w-3 h-3 rounded bg-emerald-500/30" /> Complete
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="This Week" value={`${stats.thisWeekAyahs}`} sub="ayahs" />
            <StatCard label="This Month" value={`${stats.thisMonthAyahs}`} sub="ayahs" />
            <StatCard label="Total Days" value={`${stats.totalDaysRead}`} sub="days read" />
            <StatCard label="Daily Avg" value={`${stats.averageDailyAyahs}`} sub="ayahs/day" />
          </div>
        )}

        {/* Motivational */}
        {stats && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
            <p className="text-sm text-white/70 mb-1">{getMilestoneMessage(stats.currentStreak)}</p>
            <p className="text-xs text-[#D4A853]/60 flex items-center justify-center gap-1">
              <Flag size={12} />
              {stats.nextMilestoneMessage}
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate('/quran/read')}
          className="w-full min-h-[54px] px-[22px] py-[14px] rounded-lg bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-black font-bold flex items-center justify-center gap-2"
        >
          <BookOpen size={20} />
          Continue Reading
        </button>
      </div>
    </div>
  );
}

function CalendarGrid({
  year,
  month,
  history,
}: {
  year: number;
  month: number;
  history: Record<string, number>;
}) {
  const today = new Date();
  const isToday = (day: number) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday=0, Sunday=6
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < offset; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  return (
    <div className="grid grid-cols-7 gap-1">
      {cells.map((cell, i) => {
        if (cell.day === null) return <div key={`empty-${i}`} />;

        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
        const count = history[dateKey] ?? 0;
        const complete = count >= DAILY_TARGET;
        const partial = count > 0 && !complete;
        const todayCell = isToday(cell.day);

        return (
          <div
            key={dateKey}
            className={cn(
              'aspect-square rounded flex flex-col items-center justify-center text-[11px] relative',
              complete ? 'bg-emerald-500/25' : partial ? 'bg-[#D4A853]/25' : 'bg-white/5',
              todayCell && 'ring-2 ring-amber-400',
              todayCell ? 'font-bold text-white' : 'text-white/60'
            )}
          >
            {cell.day}
            {complete && <Check size={10} className="text-emerald-400 absolute bottom-0.5" />}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] text-white/40">{sub}</p>
      <p className="text-xs text-white/60 mt-0.5">{label}</p>
    </div>
  );
}

export default QuranStreakPage;
