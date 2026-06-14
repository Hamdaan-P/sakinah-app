/**
 * conceptSearchService — adds transliteration awareness on top of Quran.com's
 * keyword search.
 *
 * The base API only matches English translations, so typing "shukr" or "zikr"
 * returns nothing useful. Here we:
 *   1. Map common transliterated Arabic concepts → their English equivalents.
 *   2. Search both the original term AND the English concept (de-duped by verseKey).
 *   3. Return results sorted by surah:ayah ascending so users can read in order.
 */

import { searchQuran } from './quranApiService';
import type { QuranSearchResult } from '../types/quran.types';

/**
 * Curated transliteration map. Keys are normalised lowercase + diacritic-stripped;
 * values are the English concept the API actually indexes against. Multi-value
 * lists let us cover both "patience" and "perseverance" for sabr, etc.
 */
const TRANSLITERATION_MAP: Record<string, string[]> = {
  shukr: ['gratitude', 'thanks'],
  zikr: ['remembrance'],
  dhikr: ['remembrance'],
  sabr: ['patience', 'perseverance'],
  tawakkul: ['trust', 'reliance'],
  tawbah: ['repentance', 'forgiveness'],
  taubah: ['repentance'],
  iman: ['faith', 'belief'],
  ihsan: ['excellence', 'perfection'],
  jihad: ['striving'],
  rizq: ['provision', 'sustenance'],
  birr: ['righteousness', 'kindness'],
  taqwa: ['piety', 'God-conscious'],
  ilm: ['knowledge'],
  amana: ['trust', 'responsibility'],
  amaanah: ['trust'],
  adl: ['justice'],
  haqq: ['truth'],
  fitna: ['trial', 'temptation'],
  fitnah: ['trial'],
  dua: ['supplication', 'prayer'],
  duaa: ['supplication'],
  jannah: ['paradise', 'garden'],
  jahannam: ['hell', 'fire'],
  akhira: ['hereafter', 'afterlife'],
  akhirah: ['hereafter'],
  qiyamah: ['resurrection', 'judgment'],
  qiyaamah: ['resurrection'],
  zulm: ['injustice', 'wrongdoing'],
  nafs: ['soul', 'self'],
  ruh: ['spirit'],
  qalb: ['heart'],
  nur: ['light'],
  noor: ['light'],
  siraat: ['path'],
  sirat: ['path'],
  rahma: ['mercy'],
  rahmah: ['mercy'],
  rabb: ['Lord'],
  islam: ['Islam', 'submission'],
  salaah: ['prayer'],
  salat: ['prayer'],
  zakat: ['charity', 'almsgiving'],
  zakah: ['charity'],
  sawm: ['fasting'],
  hajj: ['pilgrimage'],
  ummah: ['community', 'nation'],
  ayah: ['sign', 'verse'],
  rasul: ['messenger'],
  nabi: ['prophet'],
  shaytan: ['devil', 'Satan'],
  malaikah: ['angels'],
  shahid: ['martyr', 'witness'],
  yaqeen: ['certainty'],
  ikhlas: ['sincerity'],
  niyyah: ['intention'],
  niyya: ['intention'],
  ghayb: ['unseen'],
  hidaya: ['guidance'],
  hidayah: ['guidance'],
  walid: ['parents'],
  ahli: ['family'],
};

/**
 * Strip diacritics + lowercase + collapse whitespace so user input maps reliably.
 */
function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['ʿʾ`]/g, '')
    .trim();
}

export interface ConceptSearchOutput {
  /** What we ended up searching (English term). Useful for "we searched X for شكر" hint. */
  resolvedTerm: string;
  /** True if the input matched the transliteration map. */
  fromTransliteration: boolean;
  /** Original verbatim input. */
  originalQuery: string;
  results: QuranSearchResult[];
}

function parseVerseKey(vk: string): { surah: number; ayah: number } {
  const [s, a] = vk.split(':').map(Number);
  return { surah: Number.isFinite(s) ? s : 0, ayah: Number.isFinite(a) ? a : 0 };
}

/**
 * Search by concept. If the term is a known transliterated Arabic word we
 * fan out to its English mappings; otherwise we just pass through.
 *
 * Always returns results sorted by surah:ayah ascending so the user can read
 * them in mushaf order.
 */
export async function conceptSearch(rawQuery: string, limit = 12): Promise<ConceptSearchOutput> {
  const original = rawQuery.trim();
  const norm = normalise(original);

  // Pick search terms: original + any mapped English equivalents
  const mapped = TRANSLITERATION_MAP[norm];
  const terms = mapped ? [...new Set([original, ...mapped])] : [original];

  // Run searches in parallel, dedupe by verseKey, prefer first hit's translation.
  const batches = await Promise.all(
    terms.map((t) => searchQuran(t, limit).catch(() => [] as QuranSearchResult[])),
  );

  const seen = new Map<string, QuranSearchResult>();
  for (const batch of batches) {
    for (const r of batch) {
      if (!seen.has(r.verseKey)) seen.set(r.verseKey, r);
    }
  }

  // Sort by surah:ayah ascending (mushaf order)
  const sorted = [...seen.values()].sort((a, b) => {
    const A = parseVerseKey(a.verseKey);
    const B = parseVerseKey(b.verseKey);
    if (A.surah !== B.surah) return A.surah - B.surah;
    return A.ayah - B.ayah;
  });

  return {
    resolvedTerm: mapped ? mapped[0] : original,
    fromTransliteration: !!mapped,
    originalQuery: original,
    results: sorted.slice(0, limit),
  };
}

/** True if the user's query maps to a known Arabic concept term. */
export function isTransliteratedConcept(query: string): boolean {
  return TRANSLITERATION_MAP[normalise(query)] !== undefined;
}

/** Expose the map for UI hints / suggestions. */
export function getTransliterationSuggestions(): { term: string; english: string }[] {
  return Object.entries(TRANSLITERATION_MAP).map(([term, eng]) => ({ term, english: eng[0] }));
}
