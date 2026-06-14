/**
 * Local fallback for curated surah summaries.
 *
 * Mirrors `backend/langchain_backend/data/surah_summaries.json`. Surahs not
 * present in the curated list fall back to a tafsir-RAG retrieval on the
 * backend; offline, they simply return null and the panel hides.
 *
 * Refresh with:
 *
 *     cp backend/langchain_backend/data/surah_summaries.json \
 *        frontend/src/features/quran/data/surahSummaries.json
 */

import type { SurahSummary } from '../types/quran.types';
import data from '../data/surahSummaries.json';

interface RawFile {
  _meta?: Record<string, unknown>;
  /** The backend serialises `summaries` as a dict keyed by surah-id (as a
   *  string). Iterate values, not the object itself. */
  summaries: Record<string, Omit<SurahSummary, 'source_tier'>>;
}

const file = data as unknown as RawFile;

const byId = new Map<number, SurahSummary>(
  Object.values(file.summaries ?? {}).map((s) => [
    s.surah_id,
    { ...s, source_tier: 'curated' as const },
  ]),
);

export function getFallbackSummary(surahId: number): SurahSummary | null {
  return byId.get(surahId) ?? null;
}
