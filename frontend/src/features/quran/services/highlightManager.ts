/**
 * HighlightManager
 * Multi-color categorical highlights over words / single ayahs / ranges.
 */

import type { Highlight, HighlightCategory, HighlightScope } from '../types/quran.types';
import { HIGHLIGHT_CATEGORY_COLORS } from '../types/quran.types';

const STORAGE_KEY = 'quran_highlights_v1';
const VIS_KEY = 'quran_highlight_visibility_v1';
const LISTENERS = new Set<() => void>();

function load(): Highlight[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Highlight[]) : [];
  } catch {
    return [];
  }
}

function save(list: Highlight[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  LISTENERS.forEach((fn) => fn());
}

function genId(): string {
  return `hl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function onHighlightsChange(listener: () => void): () => void {
  LISTENERS.add(listener);
  return () => LISTENERS.delete(listener);
}

export function getHighlights(): Highlight[] {
  return load();
}

export function getHighlightsForVerse(verseKey: string): Highlight[] {
  const all = load();
  const visible = getVisibleCategories();
  return all.filter((h) => {
    if (!visible.has(h.category)) return false;
    if (h.scope === 'word' || h.scope === 'ayah') return h.verseKey === verseKey;
    // range: check if verseKey falls within [start..end]
    if (!h.endVerseKey) return h.verseKey === verseKey;
    return compareVerseKey(verseKey, h.verseKey) >= 0 && compareVerseKey(verseKey, h.endVerseKey) <= 0;
  });
}

export function getHighlightForWord(verseKey: string, wordPosition: number): Highlight | undefined {
  const visible = getVisibleCategories();
  return load().find(
    (h) => h.scope === 'word' && h.verseKey === verseKey && h.wordPosition === wordPosition && visible.has(h.category),
  );
}

export interface CreateHighlightInput {
  scope: HighlightScope;
  verseKey: string;
  endVerseKey?: string;
  wordPosition?: number;
  category: HighlightCategory;
  color?: string;
  label?: string;
}

export function createHighlight(input: CreateHighlightInput): Highlight {
  const hl: Highlight = {
    id: genId(),
    scope: input.scope,
    verseKey: input.verseKey,
    endVerseKey: input.endVerseKey,
    wordPosition: input.wordPosition,
    category: input.category,
    color: input.color ?? HIGHLIGHT_CATEGORY_COLORS[input.category],
    label: input.label,
    createdAt: Date.now(),
  };
  save([...load(), hl]);
  return hl;
}

export function deleteHighlight(id: string): void {
  save(load().filter((h) => h.id !== id));
}

/** Remove all highlights matching a verseKey (used when user taps "clear highlight" on that ayah). */
export function clearHighlightsForVerse(verseKey: string): void {
  save(load().filter((h) => h.verseKey !== verseKey && h.endVerseKey !== verseKey));
}

/** Category visibility toggles — lets users hide all "mistake" highlights while reviewing. */
export function getVisibleCategories(): Set<HighlightCategory> {
  try {
    const raw = localStorage.getItem(VIS_KEY);
    if (!raw) return new Set(['favorite', 'review', 'mistake', 'note', 'custom']);
    return new Set(JSON.parse(raw) as HighlightCategory[]);
  } catch {
    return new Set(['favorite', 'review', 'mistake', 'note', 'custom']);
  }
}

export function setCategoryVisible(cat: HighlightCategory, visible: boolean): void {
  const cur = getVisibleCategories();
  if (visible) cur.add(cat);
  else cur.delete(cat);
  localStorage.setItem(VIS_KEY, JSON.stringify(Array.from(cur)));
  LISTENERS.forEach((fn) => fn());
}

/**
 * Smart-suggest highlights based on hifz mistakes — marks verses with
 * repeated mistakes as "review" category automatically.
 */
export function suggestHighlightsFromMistakes(mistakesByVerse: Record<string, number>, threshold = 2): Highlight[] {
  const created: Highlight[] = [];
  const existing = new Set(load().filter((h) => h.category === 'mistake').map((h) => h.verseKey));
  for (const [verseKey, count] of Object.entries(mistakesByVerse)) {
    if (count >= threshold && !existing.has(verseKey)) {
      created.push(createHighlight({ scope: 'ayah', verseKey, category: 'mistake' }));
    }
  }
  return created;
}

// --- Helpers ---

function compareVerseKey(a: string, b: string): number {
  const [as, av] = a.split(':').map(Number);
  const [bs, bv] = b.split(':').map(Number);
  if (as !== bs) return as - bs;
  return av - bv;
}
