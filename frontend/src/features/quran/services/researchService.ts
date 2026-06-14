/**
 * researchService — wraps POST /quran/research/search.
 *
 * Returns bucketed results (Quran / Hadith / Tafsir-and-books) with citation
 * metadata pre-shaped for SourceCitationChip. The backend handles confidence
 * thresholds; the frontend just renders.
 *
 * Throws `BackendEndpointMissingError` on 404 so the UI can show actionable
 * guidance (the Rayah Plus Quran endpoints only live on the feature branch —
 * if the configured `VITE_BACKEND_URL` points at a backend without them
 * deployed, every request 404s).
 */

import { authPost } from '@/lib/api';
import type { ResearchBucket, ResearchResponse } from '../types/quran.types';
import { BackendEndpointMissingError, classifyApiError } from './_apiErrors';

export async function searchResearch(input: {
  query: string;
  sources?: ResearchBucket[];
  limit?: number;
}): Promise<ResearchResponse> {
  try {
    return await authPost<ResearchResponse>('/quran/research/search', {
      query: input.query,
      sources: input.sources ?? ['quran', 'hadith', 'tafsir'],
      limit: input.limit ?? 6,
    });
  } catch (e) {
    throw classifyApiError(e, '/quran/research/search');
  }
}

export { BackendEndpointMissingError };
