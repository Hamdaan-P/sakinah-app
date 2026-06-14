/**
 * Pure helper functions for InsightsReport.
 *
 * Phase 5 split. All callers passed plain values + got plain values
 * back; no React hooks or component state in here. Easy to unit-test
 * in isolation if we ever choose to.
 */

import { HISTORICAL_FIGURES } from './_insightsConstants';
import type { MoodEntry } from './_insightsTypes';

export function getTopEmotions(
  emotions: string[],
  topN = 5,
): Array<{ emotion: string; count: number; pct: number }> {
  const counts: Record<string, number> = {};
  for (const e of emotions) counts[e] = (counts[e] || 0) + 1;
  const total = emotions.length;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([emotion, count]) => ({ emotion, count, pct: Math.round((count / total) * 100) }));
}

export function getAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  return Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export function getMoodTrend(moodLog: MoodEntry[]): 'improving' | 'declining' | 'stable' | 'unknown' {
  if (moodLog.length < 6) return 'unknown';
  const half = Math.floor(moodLog.length / 2);
  const recentAvg = moodLog.slice(0, half).reduce((s, m) => s + m.sentiment, 0) / half;
  const olderAvg = moodLog.slice(half).reduce((s, m) => s + m.sentiment, 0) / (moodLog.length - half);
  const diff = recentAvg - olderAvg;
  if (diff > 0.15) return 'improving';
  if (diff < -0.15) return 'declining';
  return 'stable';
}

export function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

/** Remove null, undefined, empty, and literal-string "null"/"undefined" entries from a tag array. */
export function cleanTags(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter((v) => v.length > 0 && v.toLowerCase() !== 'null' && v.toLowerCase() !== 'undefined');
}

export function isHistoricalFigure(name: string): boolean {
  return HISTORICAL_FIGURES.has(name.toLowerCase().trim());
}
