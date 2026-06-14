/**
 * depthFaqsService — surah-level guided reflection FAQs.
 *
 * Returns curated FAQ items for a surah. Empty surahs return an empty list
 * and the page renders a clear "not authored yet" message.
 */

import { authGet } from '@/lib/api';
import { classifyApiError } from './_apiErrors';
import type { SourceCitation } from '../types/quran.types';

export interface DepthFaqItem {
  id: string;
  question: string;
  prompt_for_raya: string;
  reflection_seed: string;
  intro?: string;
  citation?: SourceCitation;
}

interface DepthFaqResponse {
  surah_id: number;
  count: number;
  items: DepthFaqItem[];
}

const _cache = new Map<number, Promise<DepthFaqItem[]>>();

/**
 * Lightweight availability probe for the EOS card and similar discovery
 * surfaces. Returns true iff the backend has at least one curated FAQ
 * for the given surah. Errors are swallowed — for the EOS card, treating
 * "we couldn't tell" as "unavailable" is the right call (no false hope).
 */
export async function hasDepthFaqs(surahId: number): Promise<boolean> {
  try {
    const items = await fetchDepthFaqs(surahId);
    return items.length > 0;
  } catch {
    return false;
  }
}

export function fetchDepthFaqs(surahId: number): Promise<DepthFaqItem[]> {
  const cached = _cache.get(surahId);
  if (cached) return cached;

  const path = `/quran/surah/${surahId}/depth-faqs`;
  const p = authGet<DepthFaqResponse>(path)
    .then((r) => r.items ?? [])
    .catch((e: Error) => {
      _cache.delete(surahId);
      throw classifyApiError(e, path);
    });
  _cache.set(surahId, p);
  return p;
}
