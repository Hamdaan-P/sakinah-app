/**
 * dailyAyahService — picks one ayah per day for the home-screen reflection.
 *
 * Personalization (handoff §4.6.3 + mockup line 1519):
 *   The ayah is "selected based on your reading pattern, recent reflections,
 *   and current state of life." This is a recommendation problem, not an AI
 *   problem — a simple weighted scoring function is enough for v1.
 *
 *   Inputs (all from localStorage, sync, fast):
 *     - Bookmarks last 30 days → boost surahs the user actively engages
 *       with; HARD-EXCLUDE the exact ayahs they bookmarked this month
 *       (no point re-surfacing what they just saved)
 *     - Workspace items last 30 days with linked ayahs → boost those surahs
 *     - Hifz records (any) → boost those surahs
 *
 *   The day-of-year base index keeps the pick stable for the same user
 *   across a calendar day (refresh/different device → same ayah). Two
 *   users with different engagement patterns get different ayahs.
 *
 * Also persists a small "reflection journal" — when the user taps
 * "Reflect on this" we record the verseKey + a personal note (optional) so
 * over time they build a personal log of daily reflections.
 */

import { getBookmarks } from './quranBookmarkService';
import {
  getItems as getAllWorkspaceItems,
  createItem as createWorkspaceItem,
  updateItem as updateWorkspaceItem,
  deleteItem as deleteWorkspaceItem,
  getItem as getWorkspaceItem,
  type AyahPreview,
} from './workspaceService';
import { getRecords as getHifzRecords } from './hifzEngine';

// 100 curated ayahs — short, profound, frequently quoted. Cycles every 100 days.
const DAILY_AYAHS: string[] = [
  '2:255',  // Ayat al-Kursi
  '2:286',  // Last verse of Baqarah
  '3:8',    // Du'a for steadfastness
  '3:26',   // Sovereignty
  '3:135',  // Repentance
  '3:159',  // Mercy of the Prophet
  '3:185',  // Every soul shall taste death
  '3:200',  // Patience and perseverance
  '4:36',   // Worship Allah, kindness to others
  '4:103',  // Prayer at appointed times
  '5:32',   // Saving one life
  '6:59',   // Knowledge of the unseen
  '6:160',  // Reward multiplied by ten
  '7:23',   // Adam's du'a
  '7:55',   // Call upon your Lord
  '7:156',  // My mercy embraces all things
  '7:199',  // Take to forgiveness
  '8:46',   // Patience
  '9:51',   // Nothing befalls us except what Allah has decreed
  '9:128',  // The Prophet's compassion
  '10:62',  // The friends of Allah have no fear
  '11:114', // Good deeds remove evil deeds
  '12:87',  // Never despair of Allah's mercy
  '13:11',  // Allah does not change a people
  '13:28',  // Hearts find rest in remembrance
  '14:7',   // Gratitude
  '15:99',  // Worship until certainty (death) comes
  '16:18',  // Counting Allah's blessings
  '16:90',  // Justice, kindness, charity
  '16:97',  // Whoever does righteousness
  '17:23',  // Parents
  '17:24',  // Lower the wing of humility to parents
  '17:80',  // Du'a for entering and leaving
  '18:10',  // Du'a of the cave
  '18:46',  // Wealth and children are adornment
  '20:25',  // Musa's du'a — open my chest
  '20:114', // My Lord, increase me in knowledge
  '21:35',  // Every soul shall taste death
  '21:87',  // Yunus's du'a from the belly of the fish
  '23:1',   // The believers have succeeded
  '24:35',  // Light upon light
  '25:63',  // Servants of the Most Merciful
  '25:74',  // Du'a for righteous spouse and children
  '26:80',  // When I am ill, He cures me
  '27:62',  // Who answers the distressed
  '28:24',  // Musa's du'a — for whatever good
  '28:77',  // Seek the home of the Hereafter
  '29:69',  // Those who strive for Us
  '30:21',  // Spouses as a sign
  '31:14',  // Be grateful to your parents
  '33:21',  // The Prophet as the best example
  '33:35',  // Men and women equally rewarded
  '33:41',  // Remember Allah often
  '33:56',  // Send blessings on the Prophet
  '33:70',  // Speak truthfully
  '35:32',  // Three categories of believers
  '36:36',  // Glory to the One who created in pairs
  '36:82',  // Be, and it is
  '39:9',   // Are those who know equal to those who don\'t
  '39:53',  // Do not despair of Allah's mercy
  '40:60',  // Call upon Me, I will answer
  '41:30',  // Those who say "Our Lord is Allah"
  '41:34',  // Repel evil with what is better
  '42:11',  // There is nothing like unto Him
  '42:43',  // Patience and forgiveness
  '43:68',  // O My servants, no fear
  '46:13',  // Those who say "Our Lord is Allah" then steadfast
  '46:15',  // Du'a for parents at age 40
  '47:7',   // If you help Allah, He will help you
  '49:10',  // The believers are brothers
  '49:11',  // Do not mock or insult
  '49:12',  // Avoid suspicion and backbiting
  '49:13',  // Most honoured is the most righteous
  '50:16',  // Closer than the jugular vein
  '51:56',  // Created jinn and mankind only to worship
  '53:39',  // Man gets only what he strives for
  '54:17',  // We have made the Quran easy
  '55:13',  // Which favour will you deny
  '55:60',  // Reward of good is good
  '57:4',   // He is with you wherever you are
  '57:20',  // The life of this world is play
  '59:18',  // Fear Allah, look to what you sent ahead
  '59:22',  // The most beautiful names
  '64:11',  // No calamity except by Allah's permission
  '65:2',   // Whoever fears Allah, He makes a way out
  '65:3',   // Provision from where they did not expect
  '67:1',   // Blessed is He in whose hand is dominion
  '67:2',   // Created death and life to test you
  '70:19',  // Man was created anxious
  '76:8',   // Feeding the poor, the orphan, the captive
  '87:14',  // Successful is the one who purifies himself
  '89:27',  // O reassured soul
  '93:5',   // Your Lord will give you and you will be pleased
  '93:11',  // Proclaim the favour of your Lord
  '94:5',   // With hardship comes ease
  '94:6',   // Indeed, with hardship comes ease
  '95:4',   // Best of stature
  '99:7',   // Atom\'s weight of good
  '103:1',  // By time
  '103:2',  // Man is in loss
  '103:3',  // Except those who believe and do good
  '109:6',  // To you your religion, to me mine
  '112:1',  // Say: He is Allah, the One
];

const STORAGE_KEY_REFLECTIONS = 'quran_daily_reflections_v1';
const STORAGE_KEY_LAST_SEEN = 'quran_daily_last_seen_date';

export interface DailyReflection {
  date: string;       // YYYY-MM-DD
  verseKey: string;   // e.g. "2:255"
  note?: string;      // optional personal reflection
  createdAt: number;
  /** Id of the mirrored item in the Quran Workspace so the two stay in sync
   *  (the daily journal and the unified Workspace show the same reflection). */
  workspaceItemId?: string;
}

export interface DailyAyahPick {
  verseKey: string;
  date: string;       // YYYY-MM-DD
  surahId: number;
  ayahNumber: number;
  alreadyReflected: boolean;
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Days since a fixed epoch (2024-01-01) — gives a stable rotating index that
 * advances by 1 each calendar day, regardless of timezone shifts.
 */
function daysSinceEpoch(): number {
  const epoch = Date.UTC(2024, 0, 1);
  const now = Date.now();
  return Math.floor((now - epoch) / 86_400_000);
}

interface PersonalizationContext {
  /** Surahs the user has engaged with (any age) — bookmarks, workspace items, hifz records. */
  engagedSurahs: Set<number>;
  /** Ayahs the user has bookmarked in the last 30 days — hard exclude from today's pick. */
  recentBookmarkedAyahs: Set<string>;
}

const RECENT_BOOKMARK_WINDOW_MS = 30 * 86_400_000;
const ENGAGEMENT_BOOST = 1.5;
const BASE_SCORE = 1.0;

function buildPersonalizationContext(): PersonalizationContext {
  const engagedSurahs = new Set<number>();
  const recentBookmarkedAyahs = new Set<string>();
  const cutoff = Date.now() - RECENT_BOOKMARK_WINDOW_MS;

  try {
    for (const bm of getBookmarks()) {
      engagedSurahs.add(bm.surahId);
      if (bm.savedAt >= cutoff) recentBookmarkedAyahs.add(bm.verseKey);
    }
  } catch { /* localStorage corrupted — ignore */ }

  try {
    for (const item of getAllWorkspaceItems('all')) {
      for (const ayahRef of item.linkedAyahs) {
        const surahPart = ayahRef.split(':')[0];
        const surahId = parseInt(surahPart, 10);
        if (Number.isFinite(surahId) && surahId > 0) engagedSurahs.add(surahId);
      }
    }
  } catch { /* ignore */ }

  try {
    for (const rec of getHifzRecords()) {
      if (Number.isFinite(rec.surahId)) engagedSurahs.add(rec.surahId);
    }
  } catch { /* ignore */ }

  return { engagedSurahs, recentBookmarkedAyahs };
}

/**
 * Score each candidate. Higher = more likely to be picked today.
 * -Infinity means hard-excluded. Ties broken later by deterministic
 * proximity to today's calendar rotation index.
 */
function scoreCandidate(verseKey: string, ctx: PersonalizationContext): number {
  if (ctx.recentBookmarkedAyahs.has(verseKey)) return -Infinity;
  const surahId = parseInt(verseKey.split(':')[0], 10);
  let score = BASE_SCORE;
  if (ctx.engagedSurahs.has(surahId)) score += ENGAGEMENT_BOOST;
  return score;
}

export function getTodaysAyah(): DailyAyahPick {
  const baseIdx = daysSinceEpoch() % DAILY_AYAHS.length;
  const ctx = buildPersonalizationContext();

  // Score every candidate; track the best. Tie-breaker: proximity to
  // baseIdx so the personalized pick still rotates day-by-day when
  // engagement signals don't change.
  let bestVerseKey: string | null = null;
  let bestScore = -Infinity;
  let bestDistance = DAILY_AYAHS.length;

  for (let offset = 0; offset < DAILY_AYAHS.length; offset++) {
    const idx = (baseIdx + offset) % DAILY_AYAHS.length;
    const candidate = DAILY_AYAHS[idx];
    const score = scoreCandidate(candidate, ctx);
    if (score === -Infinity) continue;
    if (score > bestScore || (score === bestScore && offset < bestDistance)) {
      bestScore = score;
      bestDistance = offset;
      bestVerseKey = candidate;
    }
  }

  // Fallback: if every candidate was hard-excluded (user bookmarked 100
  // ayahs in the last 30 days — possible but rare), drop the exclusion
  // and return the base rotation pick.
  const verseKey = bestVerseKey ?? DAILY_AYAHS[baseIdx];

  const [s, a] = verseKey.split(':').map(Number);
  const date = todayISO();
  const reflections = getReflections();
  const alreadyReflected = reflections.some((r) => r.date === date);
  return {
    verseKey,
    date,
    surahId: s,
    ayahNumber: a,
    alreadyReflected,
  };
}

export function getReflections(): DailyReflection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REFLECTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save (or overwrite) today's daily reflection AND mirror it into the unified
 * Quran Workspace so the user sees the same reflection in both places. There is
 * one workspace item per day (tracked by `workspaceItemId`): re-saving the same
 * day updates it rather than creating duplicates.
 *
 * `preview` (optional) carries the verse's Arabic + translation so the Workspace
 * editor can render the linked ayah without re-fetching.
 */
export function saveReflection(verseKey: string, note?: string, preview?: AyahPreview): DailyReflection {
  const today = todayISO();
  const existing = getReflections();
  const prior = existing.find((r) => r.date === today);

  const body = note?.trim() || '';
  const title = preview?.surahName
    ? `Reflection — ${preview.surahName} (${verseKey})`
    : `Reflection — ${verseKey}`;
  const ayahPreviews = preview ? { [verseKey]: preview } : undefined;

  // Mirror into the Workspace (best-effort — never block the journal save).
  let workspaceItemId = prior?.workspaceItemId;
  try {
    if (workspaceItemId && getWorkspaceItem(workspaceItemId)) {
      updateWorkspaceItem(workspaceItemId, {
        title,
        body,
        linkedAyahs: [verseKey],
        ...(ayahPreviews ? { ayahPreviews } : {}),
      });
    } else {
      const created = createWorkspaceItem({
        type: 'reflection',
        title,
        body,
        linkedAyahs: [verseKey],
        ayahPreviews,
        tags: ['daily-reflection'],
      });
      workspaceItemId = created.id;
    }
  } catch { /* workspace unavailable — keep the journal entry anyway */ }

  const reflection: DailyReflection = {
    date: today,
    verseKey,
    note: body || undefined,
    createdAt: prior?.createdAt ?? Date.now(),
    workspaceItemId,
  };
  const all = existing.filter((r) => r.date !== today); // overwrite today's
  all.unshift(reflection);
  // Cap at 365 entries — the home page only needs recent + a journal view.
  const capped = all.slice(0, 365);
  try {
    localStorage.setItem(STORAGE_KEY_REFLECTIONS, JSON.stringify(capped));
  } catch {
    // localStorage full — drop oldest half and retry
    try {
      localStorage.setItem(STORAGE_KEY_REFLECTIONS, JSON.stringify(capped.slice(0, 100)));
    } catch { /* give up silently */ }
  }
  return reflection;
}

/**
 * One-time (idempotent) backfill: ensure every journal reflection has a mirrored
 * Quran Workspace item. Reflections saved before the Workspace mirror existed
 * have no `workspaceItemId`, so they show in the daily Reflection Journal but
 * never appear in the unified Workspace. Run this on Workspace load so legacy
 * entries surface alongside new ones. Safe to call repeatedly.
 *
 * Returns the number of reflections newly mirrored.
 */
export function backfillReflectionsToWorkspace(): number {
  const reflections = getReflections();
  if (reflections.length === 0) return 0;

  let changed = false;
  let created = 0;
  const next = reflections.map((r) => {
    // Already mirrored and the workspace item still exists → nothing to do.
    if (r.workspaceItemId && getWorkspaceItem(r.workspaceItemId)) return r;
    try {
      const item = createWorkspaceItem({
        type: 'reflection',
        title: `Reflection — ${r.verseKey}`,
        body: r.note ?? '',
        linkedAyahs: [r.verseKey],
        tags: ['daily-reflection'],
      });
      changed = true;
      created += 1;
      return { ...r, workspaceItemId: item.id };
    } catch {
      return r; // workspace unavailable — leave the journal entry untouched
    }
  });

  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEY_REFLECTIONS, JSON.stringify(next));
    } catch { /* storage full — items were still created in the workspace */ }
  }
  return created;
}

export function deleteReflection(date: string) {
  const all = getReflections();
  const target = all.find((r) => r.date === date);
  if (target?.workspaceItemId) {
    try { deleteWorkspaceItem(target.workspaceItemId); } catch { /* ignore */ }
  }
  const remaining = all.filter((r) => r.date !== date);
  try { localStorage.setItem(STORAGE_KEY_REFLECTIONS, JSON.stringify(remaining)); } catch { /* ignore */ }
}

/**
 * Reflection streak — consecutive days the user reflected on the daily ayah.
 */
export function getReflectionStreak(): { streak: number; longest: number; total: number } {
  const reflections = getReflections();
  if (reflections.length === 0) return { streak: 0, longest: 0, total: 0 };

  const dates = new Set(reflections.map((r) => r.date));
  const total = reflections.length;

  // Walk back from today
  let streak = 0;
  const cursor = new Date();
  // Count today only if reflected today; otherwise check yesterday onward.
  for (;;) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    if (dates.has(iso)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak — sort ascending, walk
  const sortedDates = [...dates].sort();
  let longest = 0;
  let current = 0;
  let prev: Date | null = null;
  for (const iso of sortedDates) {
    const d = new Date(iso + 'T00:00:00');
    if (prev && (d.getTime() - prev.getTime()) === 86_400_000) {
      current++;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    prev = d;
  }

  return { streak, longest, total };
}

/**
 * Mark today's daily ayah as "seen" so the home card can show a subtle
 * indicator if it's been viewed today (separate from "reflected").
 */
export function markSeen() {
  try { localStorage.setItem(STORAGE_KEY_LAST_SEEN, todayISO()); } catch { /* ignore */ }
}

export function wasSeenToday(): boolean {
  try { return localStorage.getItem(STORAGE_KEY_LAST_SEEN) === todayISO(); } catch { return false; }
}
