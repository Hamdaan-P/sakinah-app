/**
 * relatedHadithService
 *
 * Talks to the backend `/quran/ayah/{verse_key}/related-hadith` endpoint
 * (see backend `routes/quran_extras.py`). The backend already verifies every
 * hadith against sunnah.com before returning it, so the frontend renders the
 * payload as-is — no additional validation needed.
 *
 * Also memoizes per verse_key in-process to keep the reader fluid when the
 * user scrolls back and forth across ayahs that the panel has already loaded.
 */

import { authGet } from '@/lib/api';
import type { RelatedHadith } from '../types/quran.types';
import { classifyApiError } from './_apiErrors';

interface RelatedHadithResponse {
  verse_key: string;
  count: number;
  items: RelatedHadith[];
}

const _cache = new Map<string, Promise<RelatedHadith[]>>();

export function fetchRelatedHadith(
  verseKey: string,
  limit = 5,
): Promise<RelatedHadith[]> {
  const cacheKey = `${verseKey}:${limit}`;
  const cached = _cache.get(cacheKey);
  if (cached) return cached;

  const path = `/quran/ayah/${encodeURIComponent(verseKey)}/related-hadith?limit=${limit}`;
  const p = authGet<RelatedHadithResponse>(path)
    .then((r) => r.items ?? [])
    .catch((e) => {
      // Don't cache failures — let a manual retry try again
      _cache.delete(cacheKey);
      throw classifyApiError(e, path);
    });

  _cache.set(cacheKey, p);
  return p;
}

/** Clear the in-process cache. Useful for tests + post-error retry buttons. */
export function clearRelatedHadithCache(): void {
  _cache.clear();
}
