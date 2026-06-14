/**
 * morphologyService — Arabic morphology lookups for the WordPopover and the
 * Root Occurrences sheet.
 */

import { authGet } from '@/lib/api';
import { classifyApiError } from './_apiErrors';

export interface WordMorphology {
  index: number;
  arabic: string;
  transliteration: string;
  root: string | null;
  lemma: string;
  pos: string;
  gloss: string;
}

export interface RootOccurrence {
  verse_key: string;
  word_index: number;
  surah_name: string;
  snippet: string;
  form: string;
}

interface MorphologyResponse {
  verse_key: string;
  word_index: number;
  found: boolean;
  word: WordMorphology | null;
}

interface RootResponse {
  root: string;
  count: number;
  items: RootOccurrence[];
}

const _wordCache = new Map<string, Promise<WordMorphology | null>>();
const _rootCache = new Map<string, Promise<RootOccurrence[]>>();

export function fetchWordMorphology(verseKey: string, wordIndex: number): Promise<WordMorphology | null> {
  const cacheKey = `${verseKey}:${wordIndex}`;
  const cached = _wordCache.get(cacheKey);
  if (cached) return cached;

  const path = `/quran/word/${encodeURIComponent(verseKey)}/${wordIndex}/morphology`;
  const p = authGet<MorphologyResponse>(path)
    .then((r) => (r.found ? r.word : null))
    .catch((e: Error) => {
      _wordCache.delete(cacheKey);
      if (/API error 404/.test(e.message)) return null;
      throw classifyApiError(e, path);
    });
  _wordCache.set(cacheKey, p);
  return p;
}

export function fetchRootOccurrences(root: string, limit = 50): Promise<RootOccurrence[]> {
  const cacheKey = `${root}:${limit}`;
  const cached = _rootCache.get(cacheKey);
  if (cached) return cached;

  const path = `/quran/root/${encodeURIComponent(root)}/occurrences?limit=${limit}`;
  const p = authGet<RootResponse>(path)
    .then((r) => r.items ?? [])
    .catch((e: Error) => {
      _rootCache.delete(cacheKey);
      throw classifyApiError(e, path);
    });
  _rootCache.set(cacheKey, p);
  return p;
}
