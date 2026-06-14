/**
 * Quran Streak & Score Service
 * Mirrors Flutter's quran_streak_service.dart + quran_score_service.dart
 * Uses localStorage instead of SharedPreferences
 */

import type { QuranStreakInfo, QuranStreakStats, QuranScoreInfo } from '../types/quran.types';

const DAILY_TARGET = 10;

// Storage keys
const KEYS = {
  streakCount: 'quran_streak_count',
  streakDate: 'quran_streak_date',
  dailyDate: 'quran_daily_date',
  dailyCount: 'quran_daily_read_count',
  dailyReadKeys: 'quran_daily_read_keys',
  history: 'quran_streak_history',
  longestStreak: 'quran_longest_streak',
  streakStartDate: 'quran_streak_start_date',
  lifetimeScore: 'quran_lifetime_score',
  todayDate: 'quran_score_today_date',
  todayCount: 'quran_score_today_count',
  weekStart: 'quran_score_week_start',
  weekCount: 'quran_score_week_count',
  monthStart: 'quran_score_month_start',
  monthCount: 'quran_score_month_count',
} as const;

function getDateKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getInt(key: string): number {
  return parseInt(localStorage.getItem(key) ?? '0', 10) || 0;
}

function getStr(key: string): string {
  return localStorage.getItem(key) ?? '';
}

function getJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// --- Streak ---

export function getStreakInfo(): QuranStreakInfo {
  const today = getDateKey();
  const dailyDate = getStr(KEYS.dailyDate);

  // Reset daily count if new day
  if (dailyDate !== today) {
    localStorage.setItem(KEYS.dailyDate, today);
    localStorage.setItem(KEYS.dailyCount, '0');
    localStorage.setItem(KEYS.dailyReadKeys, JSON.stringify([]));
  }

  const streakCount = getInt(KEYS.streakCount);
  const dailyReadCount = getInt(KEYS.dailyCount);
  const longestStreak = Math.max(streakCount, getInt(KEYS.longestStreak));

  return {
    streakCount,
    longestStreak,
    dailyReadCount,
    dailyTarget: DAILY_TARGET,
    streakEarnedToday: dailyReadCount >= DAILY_TARGET,
    dateKey: today,
  };
}

/** Register a verse read (called from reading page). Returns updated streak info. */
export function registerVerseRead(verseKey: string): QuranStreakInfo {
  const today = getDateKey();

  // Ensure daily reset
  if (getStr(KEYS.dailyDate) !== today) {
    localStorage.setItem(KEYS.dailyDate, today);
    localStorage.setItem(KEYS.dailyCount, '0');
    localStorage.setItem(KEYS.dailyReadKeys, JSON.stringify([]));
  }

  // Deduplicate: only count each verse once per day
  const readKeys = getJson<string[]>(KEYS.dailyReadKeys, []);
  if (readKeys.includes(verseKey)) {
    return getStreakInfo();
  }

  readKeys.push(verseKey);
  localStorage.setItem(KEYS.dailyReadKeys, JSON.stringify(readKeys));

  const newCount = readKeys.length;
  localStorage.setItem(KEYS.dailyCount, String(newCount));

  // Update history
  const history = getJson<Record<string, number>>(KEYS.history, {});
  history[today] = newCount;
  localStorage.setItem(KEYS.history, JSON.stringify(history));

  // Increment lifetime score
  incrementScore(1);

  // Update streak if daily target reached
  if (newCount >= DAILY_TARGET) {
    const lastStreakDate = getStr(KEYS.streakDate);
    const yesterday = getDateKey(new Date(Date.now() - 86_400_000));

    let streak = getInt(KEYS.streakCount);

    if (lastStreakDate === today) {
      // Already updated today
    } else if (lastStreakDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
      localStorage.setItem(KEYS.streakStartDate, today);
    }

    localStorage.setItem(KEYS.streakCount, String(streak));
    localStorage.setItem(KEYS.streakDate, today);

    // Update longest streak
    const longest = getInt(KEYS.longestStreak);
    if (streak > longest) {
      localStorage.setItem(KEYS.longestStreak, String(streak));
    }
  }

  return getStreakInfo();
}

export function getHistoryForMonth(year: number, month: number): Record<string, number> {
  const history = getJson<Record<string, number>>(KEYS.history, {});
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const result: Record<string, number> = {};
  for (const [key, val] of Object.entries(history)) {
    if (key.startsWith(prefix)) result[key] = val;
  }
  return result;
}

export function getStreakStatistics(): QuranStreakStats {
  const info = getStreakInfo();
  const history = getJson<Record<string, number>>(KEYS.history, {});
  const longest = getInt(KEYS.longestStreak);
  const now = new Date();

  // Total days with target reached
  const totalDaysRead = Object.values(history).filter((c) => c >= DAILY_TARGET).length;

  // This week (Mon-Sun)
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  let thisWeekAyahs = 0;
  for (let i = 0; i <= dayOfWeek; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    thisWeekAyahs += history[getDateKey(d)] ?? 0;
  }

  // This month
  let thisMonthAyahs = 0;
  for (let d = 1; d <= now.getDate(); d++) {
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    thisMonthAyahs += history[key] ?? 0;
  }

  const avgDaily = now.getDate() > 0 ? thisMonthAyahs / now.getDate() : 0;
  const progress = Math.min(1, info.dailyReadCount / DAILY_TARGET);
  const remaining = Math.max(0, DAILY_TARGET - info.dailyReadCount);

  const nextMilestone = getNextMilestone(info.streakCount);
  const nextMsg = nextMilestone
    ? `${nextMilestone - info.streakCount} days to ${nextMilestone}-day milestone`
    : 'Keep going!';

  return {
    currentStreak: info.streakCount,
    longestStreak: Math.max(longest, info.streakCount),
    totalDaysRead,
    thisWeekAyahs,
    thisMonthAyahs,
    averageDailyAyahs: Math.round(avgDaily * 10) / 10,
    todayProgress: progress,
    todayCount: info.dailyReadCount,
    remainingToday: remaining,
    nextMilestoneMessage: nextMsg,
  };
}

function getNextMilestone(current: number): number | null {
  const milestones = [7, 30, 50, 100, 365];
  for (const m of milestones) {
    if (current < m) return m;
  }
  return null;
}

export function getMilestoneMessage(streak: number): string {
  if (streak === 0) return 'Start your journey today!';
  if (streak < 7) return 'Great start! Keep it up!';
  if (streak < 30) return 'One week down! Building a habit!';
  if (streak < 50) return 'One month streak! Keep going!';
  if (streak < 100) return '50-day streak! Unstoppable!';
  if (streak < 365) return 'Century Club! Amazing dedication!';
  return 'One year streak! Mashallah!';
}

// --- Score ---

function incrementScore(count: number): void {
  const today = getDateKey();

  // Lifetime
  const lifetime = getInt(KEYS.lifetimeScore) + count;
  localStorage.setItem(KEYS.lifetimeScore, String(lifetime));

  // Today
  if (getStr(KEYS.todayDate) !== today) {
    localStorage.setItem(KEYS.todayDate, today);
    localStorage.setItem(KEYS.todayCount, '0');
  }
  localStorage.setItem(KEYS.todayCount, String(getInt(KEYS.todayCount) + count));

  // Week (reset on Monday)
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  const weekStart = getDateKey(monday);

  if (getStr(KEYS.weekStart) !== weekStart) {
    localStorage.setItem(KEYS.weekStart, weekStart);
    localStorage.setItem(KEYS.weekCount, '0');
  }
  localStorage.setItem(KEYS.weekCount, String(getInt(KEYS.weekCount) + count));

  // Month (reset on 1st)
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  if (getStr(KEYS.monthStart) !== monthStart) {
    localStorage.setItem(KEYS.monthStart, monthStart);
    localStorage.setItem(KEYS.monthCount, '0');
  }
  localStorage.setItem(KEYS.monthCount, String(getInt(KEYS.monthCount) + count));
}

export function getScoreInfo(): QuranScoreInfo {
  const today = getDateKey();
  if (getStr(KEYS.todayDate) !== today) {
    localStorage.setItem(KEYS.todayDate, today);
    localStorage.setItem(KEYS.todayCount, '0');
  }

  const total = getInt(KEYS.lifetimeScore);
  const milestones = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  const nextVal = milestones.find((m) => m > total) ?? total + 1000;
  const remaining = nextVal - total;
  const progress = Math.min(1, total / nextVal);

  return {
    totalAyahs: total,
    todayAyahs: getInt(KEYS.todayCount),
    thisWeekAyahs: getInt(KEYS.weekCount),
    thisMonthAyahs: getInt(KEYS.monthCount),
    nextMilestone: `${remaining} ayahs to reach ${nextVal.toLocaleString()}`,
    progressToMilestone: progress,
  };
}
