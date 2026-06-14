/**
 * surahSummaryService
 *
 * Wraps the backend `/quran/surah/{id}/summary` endpoint. The backend serves
 * curated entries when available and falls back to a tafsir-RAG retrieval
 * otherwise — both paths return the same `SurahSummary` shape, with the
 * `source_tier` field distinguishing them so the frontend can present them
 * differently (curated = high confidence, rag = qualified).
 */

import { authGet } from '@/lib/api';
import type { SurahSummary } from '../types/quran.types';
import { classifyApiError } from './_apiErrors';
import { getFallbackSummary } from './surahSummaryFallback';

const _cache = new Map<number, Promise<SurahSummary>>();

export function fetchSurahSummary(surahId: number): Promise<SurahSummary> {
  const cached = _cache.get(surahId);
  if (cached) return cached;

  const path = `/quran/surah/${surahId}/summary`;
  const p = authGet<SurahSummary>(path).catch((e) => {
    // Backend failure → try the bundled curated summary. If we have one for
    // this surah, return it; otherwise propagate the error so the panel
    // hides cleanly (see SurahSummaryPanel).
    void classifyApiError(e, path);
    const fallback = getFallbackSummary(surahId);
    if (fallback) return fallback;
    _cache.delete(surahId);
    throw new Error(`No curated summary available for surah ${surahId}.`);
  });
  _cache.set(surahId, p);
  return p;
}

export function clearSurahSummaryCache(): void {
  _cache.clear();
}
