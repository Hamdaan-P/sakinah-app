/**
 * dailyGuidanceService — the four-pillar "Daily Spiritual Guidance" for an ayah.
 *
 * Backend assembles this purely by retrieval from cited sources (tafsir,
 * verified hadith, textbook corpus) — no LLM, so every line is traceable. Each
 * pillar is best-effort and may be null; the page renders whatever came back.
 *
 * Mirrors depthFaqsService: authGet + in-memory promise cache so the same ayah
 * isn't re-fetched within a session.
 */

import { authGet } from '@/lib/api';
import { classifyApiError } from './_apiErrors';
import type { BookCitation } from '../types/quran.types';

export interface GuidanceReflection {
  text: string;
  citation: BookCitation;
}

export interface GuidanceReminder {
  english: string;
  arabic?: string;
  collection: string;
  number: string;
  grade?: string;
  narrator?: string;
}

export interface GuidanceLiving {
  text: string;
  citation: BookCitation;
}

export interface GuidancePrompt {
  kind: 'ask';
  text: string;
  is_dua_ayah: boolean;
}

export interface DailyGuidance {
  verse_key: string;
  reflection: GuidanceReflection | null;
  reminder: GuidanceReminder | null;
  living: GuidanceLiving | null;
  prompt: GuidancePrompt;
  sources_count: number;
}

interface DailyGuidanceResponse {
  verse_key: string;
  guidance: DailyGuidance | null;
}

const _cache = new Map<string, Promise<DailyGuidance | null>>();

/**
 * Fetch the daily guidance for a verse_key (e.g. "2:255"). Resolves to null on
 * any error so the caller can simply hide the block — the verse + reflection
 * journal still work without it.
 */
export function fetchDailyGuidance(verseKey: string): Promise<DailyGuidance | null> {
  const cached = _cache.get(verseKey);
  if (cached) return cached;

  const path = `/quran/ayah/${verseKey}/daily-guidance`;
  const p = authGet<DailyGuidanceResponse>(path)
    .then((r) => r.guidance ?? null)
    .catch((e: Error) => {
      _cache.delete(verseKey);
      throw classifyApiError(e, path);
    });
  _cache.set(verseKey, p);
  return p;
}
