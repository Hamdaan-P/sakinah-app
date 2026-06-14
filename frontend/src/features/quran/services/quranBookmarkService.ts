/**
 * Quran Bookmark Service
 * Manages multiple verse bookmarks in localStorage
 */

export interface QuranBookmark {
  verseKey: string;    // e.g. "2:255"
  surahId: number;
  surahName: string;
  verseNumber: number;
  savedAt: number;     // timestamp
}

const BOOKMARKS_KEY = 'quran_bookmarks';
// Legacy single-bookmark keys (for migration)
const BM_SURAH_LEGACY = 'quran_bookmark_surah';
const BM_VERSE_LEGACY = 'quran_bookmark_verse';

function loadBookmarks(): QuranBookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: QuranBookmark[]): void {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

/** Get all saved bookmarks, newest first */
export function getBookmarks(): QuranBookmark[] {
  return loadBookmarks().sort((a, b) => b.savedAt - a.savedAt);
}

/** Check if a verse is bookmarked */
export function isBookmarked(verseKey: string): boolean {
  return loadBookmarks().some((b) => b.verseKey === verseKey);
}

/** Get all bookmarked verse keys as a Set (for fast lookup) */
export function getBookmarkedKeys(): Set<string> {
  return new Set(loadBookmarks().map((b) => b.verseKey));
}

/** Toggle bookmark — returns true if added, false if removed */
export function toggleBookmark(
  verseKey: string,
  surahId: number,
  surahName: string,
  verseNumber: number
): boolean {
  const bookmarks = loadBookmarks();
  const idx = bookmarks.findIndex((b) => b.verseKey === verseKey);

  if (idx >= 0) {
    bookmarks.splice(idx, 1);
    saveBookmarks(bookmarks);
    return false;
  } else {
    bookmarks.push({ verseKey, surahId, surahName, verseNumber, savedAt: Date.now() });
    saveBookmarks(bookmarks);
    // Also update legacy keys for "Continue Reading"
    localStorage.setItem(BM_SURAH_LEGACY, String(surahId));
    localStorage.setItem(BM_VERSE_LEGACY, verseKey);
    return true;
  }
}

/** Remove a bookmark by verse key */
export function removeBookmark(verseKey: string): void {
  const bookmarks = loadBookmarks().filter((b) => b.verseKey !== verseKey);
  saveBookmarks(bookmarks);
}

/** Migrate legacy single bookmark into the new multi-bookmark list */
export function migrateLegacyBookmark(surahName: string): void {
  const surahId = localStorage.getItem(BM_SURAH_LEGACY);
  const verseKey = localStorage.getItem(BM_VERSE_LEGACY);
  if (!surahId || !verseKey) return;

  const bookmarks = loadBookmarks();
  if (bookmarks.some((b) => b.verseKey === verseKey)) return; // already migrated

  const verseNum = parseInt(verseKey.split(':')[1]) || 1;
  bookmarks.push({
    verseKey,
    surahId: parseInt(surahId),
    surahName,
    verseNumber: verseNum,
    savedAt: Date.now() - 1000, // slightly in the past
  });
  saveBookmarks(bookmarks);
}
