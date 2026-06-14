/**
 * ProgressIntelligence
 * - Daily revision plan (spaced-repetition + weak-ayah prioritization)
 * - Insights derived from sessions & mistake clusters
 */

import type { RevisionPlanItem } from '../types/quran.types';
import { getRecords, getSessions, getWeakAyahs } from './hifzEngine';

export interface Insight {
  id: string;
  title: string;
  detail: string;
  severity: 'info' | 'warn' | 'good';
}

/**
 * Build today's revision plan. Combines:
 *  1. Spaced-repetition due ayahs (highest priority)
 *  2. Weak ayahs by mistake rate
 *  3. Recent mistakes (from last session)
 */
export function getDailyRevisionPlan(limit = 15): RevisionPlanItem[] {
  const records = getRecords();
  const now = Date.now();
  const items = new Map<string, RevisionPlanItem>();

  // 1. Due from spaced rep
  for (const r of records) {
    if (r.nextReview != null && r.nextReview <= now) {
      const overdueDays = Math.max(0, (now - r.nextReview) / 86_400_000);
      items.set(r.verseKey, {
        verseKey: r.verseKey,
        surahId: r.surahId,
        reason: 'due',
        priority: Math.min(1, 0.5 + overdueDays * 0.05),
        lastMistake: r.lastReviewed ?? undefined,
      });
    }
  }

  // 2. Weak ayahs (may overlap with due — highest-priority reason wins)
  const weak = getWeakAyahs(30);
  for (const w of weak) {
    const existing = items.get(w.verseKey);
    const priority = Math.min(0.95, w.mistakeRate);
    if (!existing || priority > existing.priority) {
      items.set(w.verseKey, {
        verseKey: w.verseKey,
        surahId: w.surahId,
        reason: existing?.reason === 'due' ? 'due' : 'weak',
        priority,
        lastMistake: w.lastMistake ?? undefined,
      });
    }
  }

  // 3. Recent-session mistakes
  const recentSessions = getSessions().slice(0, 3);
  for (const s of recentSessions) {
    for (const m of s.mistakes) {
      const existing = items.get(m.verseKey);
      if (existing) continue;
      items.set(m.verseKey, {
        verseKey: m.verseKey,
        surahId: s.surahId,
        reason: 'recent-mistake',
        priority: 0.7,
        lastMistake: m.at,
      });
    }
  }

  return Array.from(items.values())
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

/**
 * Generate smart insights by looking at session patterns.
 * - Transition problems: mistakes clustered at ayah boundaries
 * - Pages with high mistake density
 * - Accuracy trend
 */
export function getInsights(): Insight[] {
  const sessions = getSessions();
  const records = getRecords();
  const insights: Insight[] = [];

  if (sessions.length === 0) {
    insights.push({
      id: 'start',
      title: 'Start your first Hifz test',
      detail: 'Take a test to get personalized insights — weak ayahs, transitions, and a daily revision plan.',
      severity: 'info',
    });
    return insights;
  }

  // Recent accuracy trend
  const recent5 = sessions.slice(0, 5);
  const older5 = sessions.slice(5, 10);
  if (recent5.length >= 3 && older5.length >= 3) {
    const recentAvg = avg(recent5.map((s) => s.accuracy));
    const olderAvg = avg(older5.map((s) => s.accuracy));
    const delta = recentAvg - olderAvg;
    if (delta >= 0.08) {
      insights.push({
        id: 'improving',
        title: 'Your accuracy is improving',
        detail: `Up ${Math.round(delta * 100)} pts over your last 5 sessions — keep the momentum.`,
        severity: 'good',
      });
    } else if (delta <= -0.08) {
      insights.push({
        id: 'declining',
        title: 'Accuracy dropped recently',
        detail: `Down ${Math.round(Math.abs(delta) * 100)} pts — consider an easier review session before testing again.`,
        severity: 'warn',
      });
    }
  }

  // Transition mistakes: mistakes that land on first word of the next ayah
  const transitionMistakes = recent5.flatMap((s) => s.mistakes).filter((m) => isLikelyTransition(m.expected)).length;
  const totalMistakes = recent5.flatMap((s) => s.mistakes).length;
  if (totalMistakes > 0 && transitionMistakes / totalMistakes >= 0.35) {
    insights.push({
      id: 'transitions',
      title: 'You struggle with ayah transitions',
      detail: `${Math.round((transitionMistakes / totalMistakes) * 100)}% of recent mistakes happen at verse boundaries — try the "Find Next Ayah" test.`,
      severity: 'warn',
    });
  }

  // Page density
  const pageDensity = new Map<number, number>();
  for (const r of records) {
    if (r.mistakeCount === 0) continue;
    // We don't store pageNumber on records directly. Skip for now — add when we enrich.
    // Placeholder: bucket by verseKey surah to hint at cluster.
  }
  void pageDensity;

  // Mastery milestones
  const mastered = records.filter((r) => r.status === 'mastered').length;
  if (mastered > 0 && mastered % 10 === 0) {
    insights.push({
      id: `master-${mastered}`,
      title: `${mastered} ayahs mastered`,
      detail: 'Mashallah — these haven\'t shown mistakes for 5 consecutive tests.',
      severity: 'good',
    });
  }

  // Overdue review
  const overdue = records.filter((r) => r.nextReview != null && r.nextReview < Date.now() - 86_400_000).length;
  if (overdue >= 5) {
    insights.push({
      id: 'overdue',
      title: `${overdue} ayahs overdue for review`,
      detail: 'Spaced repetition works best when you review on time. Open today\'s plan.',
      severity: 'warn',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'steady',
      title: 'You\'re on track',
      detail: 'No weak patterns detected. Keep up your revision schedule.',
      severity: 'good',
    });
  }

  return insights;
}

function avg(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
}

function isLikelyTransition(expected: string): boolean {
  // Heuristic: first word of an ayah tends to be short & common (conjunctions like و, ف, إنّ…)
  const first = expected.trim().split(' ')[0] ?? '';
  return first.length > 0 && first.length <= 4;
}
