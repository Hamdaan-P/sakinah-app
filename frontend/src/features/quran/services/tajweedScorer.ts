/**
 * tajweedScorer — compares a Web-Speech transcription against the reference
 * verse text and produces a per-word match map.
 *
 * Honest disclaimer: this is **word accuracy**, not real Tajweed evaluation.
 * Real Tajweed scoring (qalqalah, ghunnah duration, makhraj of ع vs ء, etc.)
 * needs models trained specifically on Quran recitation (Tarteel.ai et al).
 * This service catches missed/skipped/mispronounced words at a phonetic level.
 *
 * Algorithm:
 *   1. Strip diacritics + ornaments from both reference and transcription.
 *   2. Split into word arrays.
 *   3. Compute Levenshtein-style alignment (insertion/deletion/substitution
 *      with low cost for very-similar words — handles partial mispronunciation).
 *   4. Mark each reference word as 'correct' | 'mispronounced' | 'missing'.
 */

import { normalizeArabic } from './hifzEngine';

export type WordStatus = 'correct' | 'mispronounced' | 'missing';

export interface ScoredWord {
  ref: string;
  status: WordStatus;
  heard?: string;
}

export interface TajweedScore {
  words: ScoredWord[];
  accuracy: number;       // 0-1
  correctCount: number;
  totalCount: number;
  rawTranscript: string;
}

function tokenize(text: string): string[] {
  return normalizeArabic(text)
    .replace(/[^؀-ۿݐ-ݿ\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * Levenshtein distance, normalized 0-1 by max(a.length, b.length).
 * 0 = identical, 1 = totally different.
 */
function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const m = a.length, n = b.length;
  if (m === 0 || n === 0) return 0;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  const maxLen = Math.max(m, n);
  return 1 - (dp[m][n] / maxLen);
}

/**
 * Greedy alignment — for each reference word, find the best matching
 * transcription word within a window. Web Speech API's Arabic recognition is
 * trained on Modern Standard Arabic, not Quranic recitation, so we accept
 * generous matches. Thresholds calibrated against real recitations:
 *   - ≥0.65 similarity = correct (was 0.85; mushaf orthography vs Web Speech
 *     output diverges enough that strict matching produced false negatives)
 *   - 0.35–0.65 = mispronounced
 *   - <0.35 = missing / different word
 *   - 8-word window (was 5) so ayahs with longer words don't drift out of range
 */
export function scoreRecitation(reference: string, transcript: string): TajweedScore {
  const refWords = tokenize(reference);
  const heardWords = tokenize(transcript);

  const used = new Set<number>();
  const words: ScoredWord[] = [];
  let cursor = 0;
  let correct = 0;

  for (let i = 0; i < refWords.length; i++) {
    const ref = refWords[i];
    let bestIdx = -1;
    let bestSim = 0;
    const windowEnd = Math.min(heardWords.length, cursor + 8);
    for (let j = cursor; j < windowEnd; j++) {
      if (used.has(j)) continue;
      const sim = wordSimilarity(ref, heardWords[j]);
      if (sim > bestSim) {
        bestSim = sim;
        bestIdx = j;
      }
    }

    if (bestIdx === -1 || bestSim < 0.35) {
      words.push({ ref, status: 'missing' });
    } else if (bestSim >= 0.65) {
      used.add(bestIdx);
      cursor = bestIdx + 1;
      correct++;
      words.push({ ref, status: 'correct', heard: heardWords[bestIdx] });
    } else {
      used.add(bestIdx);
      cursor = bestIdx + 1;
      words.push({ ref, status: 'mispronounced', heard: heardWords[bestIdx] });
    }
  }

  const totalCount = words.length;
  const accuracy = totalCount > 0 ? correct / totalCount : 0;
  return {
    words,
    accuracy,
    correctCount: correct,
    totalCount,
    rawTranscript: transcript,
  };
}
