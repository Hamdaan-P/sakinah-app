/**
 * crossReferenceService
 *
 * Talks to the backend `/quran/ayah/{verse_key}/cross-references` endpoint.
 * Returns Quran verses semantically related to the input ayah, used to render
 * the CrossReferencesRow under each verse.
 */

import { authGet } from '@/lib/api';
import type { CrossReference } from '../types/quran.types';
import { classifyApiError } from './_apiErrors';

interface CrossRefResponse {
  verse_key: string;
  count: number;
  items: CrossReference[];
}

const _cache = new Map<string, Promise<CrossReference[]>>();

export function fetchCrossReferences(
  verseKey: string,
  limit = 5,
): Promise<CrossReference[]> {
  const cacheKey = `${verseKey}:${limit}`;
  const cached = _cache.get(cacheKey);
  if (cached) return cached;

  const path = `/quran/ayah/${encodeURIComponent(verseKey)}/cross-references?limit=${limit}`;
  const p = authGet<CrossRefResponse>(path)
    .then((r) => r.items ?? [])
    .catch((e) => {
      _cache.delete(cacheKey);
      throw classifyApiError(e, path);
    });

  _cache.set(cacheKey, p);
  return p;
}

export function clearCrossReferenceCache(): void {
  _cache.clear();
}
