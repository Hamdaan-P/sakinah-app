/**
 * tafsirService — Deep Dive Tafsir tab data fetcher.
 *
 * Curated-only payloads from /quran/ayah/{verse_key}/tafsirs. The backend
 * returns an empty list for verses without authored content; the panel
 * renders an explicit empty state in that case.
 */

import { authGet } from '@/lib/api';
import { classifyApiError } from './_apiErrors';

export interface TafsirEntry {
  source: string;
  author: string;
  title: string;
  text: string;
}

interface TafsirResponse {
  verse_key: string;
  count: number;
  items: TafsirEntry[];
}

const _cache = new Map<string, Promise<TafsirEntry[]>>();

export function fetchTafsirs(verseKey: string): Promise<TafsirEntry[]> {
  const cached = _cache.get(verseKey);
  if (cached) return cached;

  const path = `/quran/ayah/${encodeURIComponent(verseKey)}/tafsirs`;
  const p = authGet<TafsirResponse>(path)
    .then((r) => r.items ?? [])
    .catch((e) => {
      _cache.delete(verseKey);
      throw classifyApiError(e, path);
    });
  _cache.set(verseKey, p);
  return p;
}
