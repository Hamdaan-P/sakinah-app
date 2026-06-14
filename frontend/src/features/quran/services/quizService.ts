/**
 * quizService — end-of-surah comprehension quiz.
 *
 * Fetches a short multiple-choice quiz for a surah from the backend
 * (`GET /quran/surah/:id/quiz`). Questions are AI-generated and grounded in
 * the verified surah summary; the page renders the AiDisclaimerBanner on top.
 *
 * Best-score per surah is tracked locally (same pattern as Guess-the-Ayah).
 */

import { authGet } from '@/lib/api';
import { classifyApiError } from './_apiErrors';

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Index into `options` of the correct answer. */
  answer_index: number;
  explanation: string;
}

export interface SurahQuiz {
  surah_id: number;
  name_english: string;
  question_count: number;
  questions: QuizQuestion[];
  /** "curated" when an authored quiz exists, "none" when the surah has no quiz yet. */
  source: 'curated' | 'none';
  /** Grounding tier of the underlying summary: "curated" | "rag". */
  source_tier: string;
  model_used: string;
  disclaimer: string;
}

const _cache = new Map<number, Promise<SurahQuiz>>();

export function fetchSurahQuiz(surahId: number): Promise<SurahQuiz> {
  const cached = _cache.get(surahId);
  if (cached) return cached;

  const path = `/quran/surah/${surahId}/quiz`;
  const p = authGet<SurahQuiz>(path)
    .then((r) => r)
    .catch((e: Error) => {
      _cache.delete(surahId);
      throw classifyApiError(e, path);
    });
  _cache.set(surahId, p);
  return p;
}

// ── Best-score persistence (per surah) ─────────────────────────────────────

const BEST_KEY_PREFIX = 'quran_surah_quiz_best_';

export function getQuizBest(surahId: number): number {
  try {
    const v = parseInt(localStorage.getItem(`${BEST_KEY_PREFIX}${surahId}`) || '0', 10);
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

/** Persist `score` as the new best for this surah if it beats the prior best.
 *  Returns true when a new best was recorded. */
export function recordQuizScore(surahId: number, score: number): boolean {
  const prev = getQuizBest(surahId);
  if (score <= prev) return false;
  try {
    localStorage.setItem(`${BEST_KEY_PREFIX}${surahId}`, String(score));
  } catch {
    /* ignore storage quota / disabled storage */
  }
  return true;
}
