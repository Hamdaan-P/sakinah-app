/**
 * Mushaf style preferences.
 *
 * Two levels of preference:
 *   - a global default style (chosen once, on first read), and
 *   - optional per-surah overrides so a reader can use IndoPak for one surah
 *     and QCF for another, switchable at any time.
 *
 * Resolution: `getStyleForSurah(id)` = per-surah override ?? global default.
 * Because a single physical page can span two surahs, the reader resolves the
 * effective style from the *first* surah on the current page (documented
 * behaviour — see the Mushaf brain doc).
 *
 * Persisted to localStorage and broadcast via a window CustomEvent so any open
 * surface re-renders immediately on change. Mirrors the lightweight
 * event-bus pattern used by the other quran services.
 */

import {
  DEFAULT_MUSHAF_STYLE,
  isMushafStyleId,
  type MushafStyleId,
} from '../config/mushafStyles';

const DEFAULT_KEY = 'quran_mushaf_style_default_v1';
const BY_SURAH_KEY = 'quran_mushaf_style_by_surah_v1';
/** Set once the user has explicitly picked a style (gates the first-run chooser). */
const CHOSEN_KEY = 'quran_mushaf_style_chosen_v1';

export const MUSHAF_STYLE_CHANGE_EVENT = 'quran-mushaf-style-change';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function emit() {
  try {
    window.dispatchEvent(new CustomEvent(MUSHAF_STYLE_CHANGE_EVENT));
  } catch {
    /* SSR / no window — ignore */
  }
}

/** True once the user has explicitly chosen a style at least once. */
export function hasChosenMushafStyle(): boolean {
  try {
    return localStorage.getItem(CHOSEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function getDefaultMushafStyle(): MushafStyleId {
  const v = read<string | null>(DEFAULT_KEY, null);
  return isMushafStyleId(v) ? v : DEFAULT_MUSHAF_STYLE;
}

export function setDefaultMushafStyle(id: MushafStyleId): void {
  try {
    localStorage.setItem(DEFAULT_KEY, JSON.stringify(id));
    localStorage.setItem(CHOSEN_KEY, '1');
  } catch {
    /* ignore */
  }
  emit();
}

function getOverrides(): Record<number, MushafStyleId> {
  const raw = read<Record<string, string>>(BY_SURAH_KEY, {});
  const out: Record<number, MushafStyleId> = {};
  for (const [k, v] of Object.entries(raw)) {
    const n = Number(k);
    if (Number.isInteger(n) && isMushafStyleId(v)) out[n] = v;
  }
  return out;
}

/** Per-surah override only (null if none) — useful for "is this surah customised" UI. */
export function getSurahOverride(surahId: number): MushafStyleId | null {
  return getOverrides()[surahId] ?? null;
}

/** Effective style for a surah: override ?? default. */
export function getStyleForSurah(surahId: number): MushafStyleId {
  return getOverrides()[surahId] ?? getDefaultMushafStyle();
}

/**
 * Set the style for a single surah. Pass `applyAsDefault` to also make it the
 * global default (and clear that surah's override so it follows the default).
 */
export function setStyleForSurah(
  surahId: number,
  id: MushafStyleId,
  applyAsDefault = false,
): void {
  const overrides = getOverrides();
  if (applyAsDefault) {
    delete overrides[surahId];
    setDefaultMushafStyle(id); // emits
  } else {
    overrides[surahId] = id;
  }
  try {
    localStorage.setItem(BY_SURAH_KEY, JSON.stringify(overrides));
    localStorage.setItem(CHOSEN_KEY, '1');
  } catch {
    /* ignore */
  }
  emit();
}

/** Subscribe to style changes. Returns an unsubscribe fn. */
export function onMushafStyleChange(cb: () => void): () => void {
  window.addEventListener(MUSHAF_STYLE_CHANGE_EVENT, cb);
  // Cross-tab: localStorage `storage` events fire in *other* tabs.
  const onStorage = (e: StorageEvent) => {
    if (e.key === DEFAULT_KEY || e.key === BY_SURAH_KEY) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(MUSHAF_STYLE_CHANGE_EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
}
