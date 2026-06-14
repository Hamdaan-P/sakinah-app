/**
 * HifzTestEngine
 * - Records test sessions
 * - Tracks per-ayah hifz status with SM-2-lite spaced repetition
 * - Detects weak ayahs from mistake patterns
 * - Generates adaptive difficulty for next tests
 */

import type {
  AyahHifzRecord,
  HifzMistake,
  HifzSession,
  HifzStatus,
  HifzTestType,
} from '../types/quran.types';

const RECORDS_KEY = 'quran_hifz_records_v1';
const SESSIONS_KEY = 'quran_hifz_sessions_v1';
const MAX_SESSIONS = 200;
const LISTENERS = new Set<() => void>();

function loadRecords(): Record<string, AyahHifzRecord> {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, AyahHifzRecord>) : {};
  } catch {
    return {};
  }
}

function saveRecords(m: Record<string, AyahHifzRecord>): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(m));
  LISTENERS.forEach((fn) => fn());
}

function loadSessions(): HifzSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as HifzSession[]) : [];
  } catch {
    return [];
  }
}

function saveSessions(list: HifzSession[]): void {
  // Cap history to avoid localStorage bloat
  const capped = list.slice(-MAX_SESSIONS);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(capped));
  LISTENERS.forEach((fn) => fn());
}

export function onHifzChange(listener: () => void): () => void {
  LISTENERS.add(listener);
  return () => LISTENERS.delete(listener);
}

// --- Records ---

export function getRecord(verseKey: string): AyahHifzRecord | undefined {
  return loadRecords()[verseKey];
}

export function getRecords(): AyahHifzRecord[] {
  return Object.values(loadRecords());
}

export function upsertRecord(record: AyahHifzRecord): void {
  const all = loadRecords();
  all[record.verseKey] = record;
  saveRecords(all);
}

export function setHifzStatus(verseKey: string, surahId: number, status: HifzStatus): void {
  const all = loadRecords();
  const current = all[verseKey];
  all[verseKey] = current
    ? { ...current, status }
    : {
        verseKey,
        surahId,
        status,
        lastReviewed: null,
        nextReview: null,
        interval: 1,
        ease: 2.3,
        streak: 0,
        mistakeCount: 0,
        totalAttempts: 0,
      };
  saveRecords(all);
}

// --- Sessions ---

export function recordSession(session: HifzSession): void {
  saveSessions([...loadSessions(), session]);
  // Update per-ayah records based on session outcome (mistakes)
  applySessionToRecords(session);
}

export function getSessions(): HifzSession[] {
  return loadSessions().slice().reverse();
}

function applySessionToRecords(session: HifzSession): void {
  const all = loadRecords();

  // Compute mistake counts per verse
  const mistakeByVerse = new Map<string, number>();
  for (const m of session.mistakes) mistakeByVerse.set(m.verseKey, (mistakeByVerse.get(m.verseKey) ?? 0) + 1);

  // Iterate every verse in the tested range (start..end)
  const verseKeys = enumerateRange(session.startVerseKey, session.endVerseKey, session.surahId);
  for (const vk of verseKeys) {
    const cur: AyahHifzRecord = all[vk] ?? {
      verseKey: vk,
      surahId: session.surahId,
      status: 'learning',
      lastReviewed: null,
      nextReview: null,
      interval: 1,
      ease: 2.3,
      streak: 0,
      mistakeCount: 0,
      totalAttempts: 0,
    };

    const mistakes = mistakeByVerse.get(vk) ?? 0;
    const correct = mistakes === 0;
    const quality = qualityFromMistakes(mistakes, session.hintsUsed > 0);

    // SM-2-lite: tune ease & interval
    const nextEase = clamp(cur.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)), 1.3, 2.8);
    let nextInterval: number;
    const nextStreak = correct ? cur.streak + 1 : 0;

    if (quality < 3) {
      nextInterval = 1; // reset
    } else if (cur.streak === 0) {
      nextInterval = 1;
    } else if (cur.streak === 1) {
      nextInterval = 3;
    } else {
      nextInterval = Math.round(cur.interval * nextEase);
    }

    const now = session.completedAt ?? session.startedAt;
    const nextStatus: HifzStatus = deriveStatus(cur, nextStreak, mistakes);

    all[vk] = {
      ...cur,
      status: nextStatus,
      lastReviewed: now,
      nextReview: now + nextInterval * 86_400_000,
      interval: nextInterval,
      ease: nextEase,
      streak: nextStreak,
      mistakeCount: cur.mistakeCount + mistakes,
      totalAttempts: cur.totalAttempts + 1,
    };
  }

  saveRecords(all);
}

function deriveStatus(cur: AyahHifzRecord, newStreak: number, mistakes: number): HifzStatus {
  if (mistakes > 0 && cur.status === 'mastered') return 'memorized';
  if (newStreak >= 5) return 'mastered';
  if (newStreak >= 2) return 'memorized';
  if (cur.status === 'new') return 'learning';
  return cur.status;
}

function qualityFromMistakes(mistakes: number, usedHint: boolean): number {
  // Map → SM-2 quality 0..5
  if (mistakes === 0 && !usedHint) return 5;
  if (mistakes === 0 && usedHint) return 4;
  if (mistakes === 1) return 3;
  if (mistakes === 2) return 2;
  if (mistakes <= 4) return 1;
  return 0;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// --- Range helpers ---

export function enumerateRange(startKey: string, endKey: string, _surahId: number): string[] {
  const [ss, sv] = startKey.split(':').map(Number);
  const [es, ev] = endKey.split(':').map(Number);
  if (ss !== es) return [startKey, endKey]; // cross-surah range not supported for enumeration here
  const result: string[] = [];
  for (let i = sv; i <= ev; i++) result.push(`${ss}:${i}`);
  return result;
}

// --- Analytics ---

export interface WeakAyah {
  verseKey: string;
  surahId: number;
  mistakeCount: number;
  mistakeRate: number;  // mistakes / attempts
  lastMistake: number | null;
}

export function getWeakAyahs(limit = 20): WeakAyah[] {
  const records = getRecords();
  return records
    .filter((r) => r.totalAttempts > 0 && r.mistakeCount > 0)
    .map((r) => ({
      verseKey: r.verseKey,
      surahId: r.surahId,
      mistakeCount: r.mistakeCount,
      mistakeRate: r.mistakeCount / Math.max(1, r.totalAttempts),
      lastMistake: r.lastReviewed,
    }))
    .sort((a, b) => b.mistakeRate - a.mistakeRate || b.mistakeCount - a.mistakeCount)
    .slice(0, limit);
}

export function getMistakesByVerse(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const r of getRecords()) if (r.mistakeCount > 0) result[r.verseKey] = r.mistakeCount;
  return result;
}

export interface HifzStats {
  totalTracked: number;
  memorized: number;
  mastered: number;
  learning: number;
  dueToday: number;
  overdue: number;
  totalAttempts: number;
  overallAccuracy: number;  // 0..1
}

export function getHifzStats(): HifzStats {
  const records = getRecords();
  const now = Date.now();
  let memorized = 0, mastered = 0, learning = 0, dueToday = 0, overdue = 0;
  let totalAttempts = 0, totalMistakes = 0;
  for (const r of records) {
    if (r.status === 'memorized') memorized++;
    if (r.status === 'mastered') mastered++;
    if (r.status === 'learning') learning++;
    if (r.nextReview != null) {
      if (r.nextReview <= now) dueToday++;
      if (r.nextReview < now - 86_400_000) overdue++;
    }
    totalAttempts += r.totalAttempts;
    totalMistakes += r.mistakeCount;
  }
  return {
    totalTracked: records.length,
    memorized,
    mastered,
    learning,
    dueToday,
    overdue,
    totalAttempts,
    overallAccuracy: totalAttempts ? 1 - totalMistakes / totalAttempts : 1,
  };
}

// --- Mistake collection (used by active test pages to record as they go) ---

export function createEmptySession(testType: HifzTestType, surahId: number, startVerseKey: string, endVerseKey: string, difficulty: HifzSession['difficulty'] = 'medium'): HifzSession {
  return {
    id: `hs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    testType,
    surahId,
    startVerseKey,
    endVerseKey,
    startedAt: Date.now(),
    completedAt: null,
    correctCount: 0,
    mistakeCount: 0,
    accuracy: 0,
    mistakes: [],
    hintsUsed: 0,
    difficulty,
  };
}

export function finalizeSession(s: HifzSession, totalItems: number): HifzSession {
  const completed: HifzSession = {
    ...s,
    completedAt: Date.now(),
    accuracy: totalItems > 0 ? s.correctCount / totalItems : 0,
  };
  recordSession(completed);
  return completed;
}

// --- Adaptive difficulty ---

/**
 * Given recent accuracy, suggest difficulty for next test session.
 * - accuracy > 0.9 → harder (remove hints, fewer choices)
 * - accuracy < 0.6 → easier (more hints, more repetition)
 */
export function suggestDifficulty(recentAccuracy: number): HifzSession['difficulty'] {
  if (recentAccuracy >= 0.9) return 'hard';
  if (recentAccuracy <= 0.6) return 'easy';
  return 'medium';
}

export function recentAccuracy(limit = 5): number {
  const recent = loadSessions().slice(-limit);
  if (recent.length === 0) return 0.75;
  return recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;
}

// --- Mistake helpers for test UIs ---

export function pushMistake(session: HifzSession, mistake: Omit<HifzMistake, 'at'>): HifzSession {
  return {
    ...session,
    mistakeCount: session.mistakeCount + 1,
    mistakes: [...session.mistakes, { ...mistake, at: Date.now() }],
  };
}

export function pushCorrect(session: HifzSession): HifzSession {
  return { ...session, correctCount: session.correctCount + 1 };
}

export function useHint(session: HifzSession): HifzSession {
  return { ...session, hintsUsed: session.hintsUsed + 1 };
}

// --- Text comparison for typing tests ---

const ARABIC_DIACRITICS = /[ً-ٰٟۖ-ۭ]/g;
const ARABIC_NORMALIZE_MAP: Array<[RegExp, string]> = [
  [/[أإآ]/g, 'ا'],
  [/ى/g, 'ي'],
  [/ة/g, 'ه'],
];

/** Normalize Arabic text for fuzzy comparison — strips diacritics and normalizes common char variants. */
export function normalizeArabic(text: string): string {
  let out = text.replace(ARABIC_DIACRITICS, '').replace(/\s+/g, ' ').trim();
  for (const [re, sub] of ARABIC_NORMALIZE_MAP) out = out.replace(re, sub);
  return out;
}

/** Fuzzy ayah compare. Returns { correct, missingWords[], extraWords[] }. */
export function compareAyahInput(expected: string, actual: string): {
  correct: boolean;
  similarity: number;
  missingWords: string[];
  extraWords: string[];
} {
  const exp = normalizeArabic(expected).split(' ').filter(Boolean);
  const act = normalizeArabic(actual).split(' ').filter(Boolean);

  const expSet = new Set(exp);
  const actSet = new Set(act);
  const missing = exp.filter((w) => !actSet.has(w));
  const extra = act.filter((w) => !expSet.has(w));

  const intersection = exp.filter((w) => actSet.has(w)).length;
  const union = new Set([...exp, ...act]).size;
  const similarity = union > 0 ? intersection / union : 0;

  return {
    correct: missing.length === 0 && extra.length <= 1 && similarity >= 0.85,
    similarity,
    missingWords: missing,
    extraWords: extra,
  };
}
