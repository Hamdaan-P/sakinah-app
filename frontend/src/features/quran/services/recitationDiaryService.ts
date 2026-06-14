/**
 * recitationDiaryService — log of recitation practice events.
 *
 * Each entry records "user recited <verseRange> on <date> for <durationSec>".
 * The actual audio blob is NOT persisted — browsers don't reliably keep blob
 * object URLs across sessions, and storing raw audio in localStorage hits the
 * 5MB cap fast. This is a *journal*, not an audio archive: useful for tracking
 * habit consistency, time spent, and which surahs you've practised.
 *
 * Synced to Firestore via quranSyncService (key included in SYNCED_KEYS — add
 * 'quran_recitation_diary_v1' there if not already present).
 */

const KEY = 'quran_recitation_diary_v1';
const MAX_ENTRIES = 200;

export interface RecitationEntry {
  id: string;          // verseKey + timestamp
  verseKey: string;    // anchor verse (or first in range)
  surahId: number;
  surahName?: string;
  date: string;        // YYYY-MM-DD
  durationSec: number;
  note?: string;
  createdAt: number;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getEntries(): RecitationEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function logRecitation(input: Omit<RecitationEntry, 'id' | 'date' | 'createdAt'>): RecitationEntry {
  const entry: RecitationEntry = {
    ...input,
    id: `${input.verseKey}_${Date.now()}`,
    date: todayISO(),
    createdAt: Date.now(),
  };
  const all = [entry, ...getEntries()].slice(0, MAX_ENTRIES);
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* full — give up */ }
  return entry;
}

export function deleteEntry(id: string) {
  const all = getEntries().filter((e) => e.id !== id);
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* ignore */ }
}

export function clearAll() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** Stats: total minutes, sessions, current streak (consecutive days with entries) */
export function getStats(): { totalSec: number; sessions: number; streak: number; uniqueDates: number } {
  const entries = getEntries();
  const totalSec = entries.reduce((acc, e) => acc + (e.durationSec || 0), 0);
  const sessions = entries.length;
  const dates = new Set(entries.map((e) => e.date));

  let streak = 0;
  const cursor = new Date();
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

  return { totalSec, sessions, streak, uniqueDates: dates.size };
}
