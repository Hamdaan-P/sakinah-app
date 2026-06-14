/**
 * memorizationPlanService — AI-assisted memorization pathways (PDF Section 11
 * item 4).
 *
 * Builds a daily memorization plan for a target surah/range from the user's
 * current hifz state. Rule-based v1: uses the existing SM-2 records to skip
 * already-mastered ayahs and front-load weak ones. No backend call — runs
 * entirely on data already in localStorage.
 *
 * The output shape is intentionally compatible with future Raya-generated
 * plans: a list of `MemorizationPlanDay` items, each with ayahs and notes.
 */

import { getRecords } from './hifzEngine';
import type { AyahHifzRecord } from '../types/quran.types';

export interface MemorizationPlanDay {
  day: number;
  /** Ayah keys to memorise on this day. */
  newAyahs: string[];
  /** Ayah keys to revise on this day (pulled from due / weak). */
  revisionAyahs: string[];
  /** Why these ayahs were grouped here. */
  rationale: string;
}

export interface MemorizationPlan {
  surahId: number;
  startVerse: number;
  endVerse: number;
  durationDays: number;
  ayahsPerDay: number;
  days: MemorizationPlanDay[];
  /** Ayahs already mastered that we skipped. */
  skippedMastered: string[];
  /** Note on revision schedule. */
  note: string;
}

interface PlanInput {
  surahId: number;
  startVerse: number;
  endVerse: number;
  durationDays: number;
  ayahsPerDay?: number;
}

const MASTERED_STATUSES = new Set(['memorized', 'mastered']);

function isMastered(rec: AyahHifzRecord | undefined): boolean {
  if (!rec) return false;
  return MASTERED_STATUSES.has(rec.status);
}

function isWeak(rec: AyahHifzRecord | undefined): boolean {
  if (!rec) return false;
  if (rec.totalAttempts === 0) return false;
  const accuracy = 1 - rec.mistakeCount / Math.max(1, rec.totalAttempts);
  return accuracy < 0.6 || rec.status === 'learning';
}

/**
 * Build a memorization plan for a contiguous ayah range.
 *
 * Algorithm:
 *   1. Skip ayahs whose hifz status is already memorized/mastered.
 *   2. Distribute the remaining ayahs across `durationDays` so each day
 *      gets `ceil(remaining / durationDays)` new ayahs.
 *   3. For each day after day 1, schedule revision of the previous day's
 *      ayahs + any weak ayahs from earlier in the user's hifz history that
 *      fall within the same surah.
 */
export function buildMemorizationPlan(input: PlanInput): MemorizationPlan {
  const { surahId, startVerse, endVerse, durationDays } = input;
  if (durationDays < 1) throw new Error('durationDays must be at least 1');
  if (endVerse < startVerse) throw new Error('endVerse must be >= startVerse');

  // getRecords() returns an array of AyahHifzRecord — index it by verseKey
  // for the per-ayah lookup below.
  const records = getRecords();
  const recordsByKey = new Map<string, AyahHifzRecord>();
  for (const rec of records) recordsByKey.set(rec.verseKey, rec);

  const allTargetKeys: string[] = [];
  for (let v = startVerse; v <= endVerse; v++) {
    allTargetKeys.push(`${surahId}:${v}`);
  }

  const skipped: string[] = [];
  const toLearn: string[] = [];
  for (const key of allTargetKeys) {
    if (isMastered(recordsByKey.get(key))) skipped.push(key);
    else toLearn.push(key);
  }

  const requested = input.ayahsPerDay && input.ayahsPerDay > 0
    ? input.ayahsPerDay
    : Math.ceil(toLearn.length / durationDays);
  const ayahsPerDay = Math.max(1, requested);

  // Weak ayahs in the same surah from prior history. These get sprinkled
  // into revision slots so the user re-touches them while learning new ones.
  const targetKeySet = new Set(allTargetKeys);
  const weakInSurah: string[] = [];
  for (const rec of records) {
    if (rec.surahId !== surahId) continue;
    if (targetKeySet.has(rec.verseKey)) continue;
    if (isWeak(rec)) weakInSurah.push(rec.verseKey);
  }
  weakInSurah.sort();

  const days: MemorizationPlanDay[] = [];
  let cursor = 0;
  for (let d = 0; d < durationDays && cursor < toLearn.length; d++) {
    const newAyahs = toLearn.slice(cursor, cursor + ayahsPerDay);

    // Revision = previous day's new ayahs + one weak ayah from the surah
    // each day (rotates through the weak set).
    let revisionAyahs: string[] = [];
    if (d > 0 && days[d - 1]) {
      revisionAyahs = revisionAyahs.concat(days[d - 1].newAyahs);
    }
    if (weakInSurah.length > 0) {
      revisionAyahs.push(weakInSurah[d % weakInSurah.length]);
    }

    days.push({
      day: d + 1,
      newAyahs,
      revisionAyahs: Array.from(new Set(revisionAyahs)),
      rationale:
        d === 0
          ? `Start with ${newAyahs.length} new ayah${newAyahs.length === 1 ? '' : 's'}. Recite each 5 times slowly, then 5 times from memory.`
          : `Revise day ${d}'s ayahs, then learn ${newAyahs.length} new ayah${newAyahs.length === 1 ? '' : 's'} using the listen → read → recall loop.`,
    });
    cursor += ayahsPerDay;
  }

  return {
    surahId,
    startVerse,
    endVerse,
    durationDays: days.length || durationDays,
    ayahsPerDay,
    days,
    skippedMastered: skipped,
    note:
      'Plan is generated from your local hifz records — already-mastered ayahs are skipped and weak ones from this surah are mixed into revision slots. Adjust by re-running with a different duration or ayahs-per-day.',
  };
}
