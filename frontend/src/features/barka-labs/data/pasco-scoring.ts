/**
 * PASCO Scoring Engine
 * Computes sub-trait scores, dimension scores, signature strengths, growth edges, and archetype.
 */

import { PASCO_QUESTIONS, PASCO_SUB_TRAITS, PASCO_DIMENSIONS } from './pasco-questions';

export interface PascoResult {
  subTraitScores: Record<string, number>;  // 0-100 per sub-trait
  dimensionScores: Record<string, number>; // P, A, S, CO (0-100)
  signatureStrengths: { code: string; name: string; score: number }[];
  growthEdges: { code: string; name: string; score: number }[];
  archetype: { name: string; description: string };
  answers: Record<string, string>; // q1 -> 'a', q2 -> 'c', etc.
}

/** Compute the maximum possible score for each sub-trait across all questions */
function computeMaxScores(): Record<string, number> {
  const maxScores: Record<string, number> = {};
  for (const code of Object.keys(PASCO_SUB_TRAITS)) {
    maxScores[code] = 0;
  }

  for (const q of PASCO_QUESTIONS) {
    // For each question, find the max weight each trait can get (best option)
    const traitMax: Record<string, number> = {};
    for (const opt of q.options) {
      for (const t of opt.traits) {
        traitMax[t.code] = Math.max(traitMax[t.code] || 0, t.weight);
      }
    }
    for (const [code, weight] of Object.entries(traitMax)) {
      maxScores[code] = (maxScores[code] || 0) + weight;
    }
  }

  return maxScores;
}

const MAX_SCORES = computeMaxScores();

/** Score all 20 answers into a full PASCO result */
export function scorePasco(answers: Record<string, string>): PascoResult {
  // Accumulate raw scores
  const rawScores: Record<string, number> = {};
  for (const code of Object.keys(PASCO_SUB_TRAITS)) {
    rawScores[code] = 0;
  }

  for (const q of PASCO_QUESTIONS) {
    const answer = answers[q.id];
    if (!answer) continue;

    const option = q.options.find(o => o.value === answer);
    if (!option) continue;

    for (const t of option.traits) {
      rawScores[t.code] = (rawScores[t.code] || 0) + t.weight;
    }
  }

  // Normalize to 0-100
  const subTraitScores: Record<string, number> = {};
  for (const [code, raw] of Object.entries(rawScores)) {
    const max = MAX_SCORES[code] || 1;
    subTraitScores[code] = Math.round((raw / max) * 100);
  }

  // Dimension scores (average of 5 sub-traits)
  const dimensionScores: Record<string, number> = {};
  for (const dim of PASCO_DIMENSIONS) {
    const scores = dim.traits.map(t => subTraitScores[t] || 0);
    dimensionScores[dim.key] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  // Signature strengths (top 3) and growth edges (bottom 2)
  const sorted = Object.entries(subTraitScores)
    .map(([code, score]) => ({ code, name: PASCO_SUB_TRAITS[code]?.name || code, score }))
    .sort((a, b) => b.score - a.score);

  const signatureStrengths = sorted.slice(0, 3);
  const growthEdges = sorted.slice(-2).reverse();

  // Archetype determination
  const archetype = determineArchetype(subTraitScores, dimensionScores);

  return { subTraitScores, dimensionScores, signatureStrengths, growthEdges, archetype, answers };
}

/** Check if all 20 questions are answered */
export function isPascoComplete(answers: Record<string, string>): boolean {
  return PASCO_QUESTIONS.every(q => answers[q.id]);
}

/** Archetypes based on dominant traits */
const ARCHETYPES: { name: string; description: string; match: (s: Record<string, number>) => number }[] = [
  {
    name: 'The Mujtahid',
    description: 'You approach life with deep analytical rigor and a commitment to justice. You seek truth through evidence, not opinion.',
    match: (s) => (s.A1 || 0) + (s.CO4 || 0) + (s.CO3 || 0),
  },
  {
    name: 'The Rahma Shield',
    description: 'Your superpower is compassion combined with emotional depth. People feel safe around you because you lead with mercy.',
    match: (s) => (s.CO5 || 0) + (s.S3 || 0) + (s.CO1 || 0),
  },
  {
    name: 'The Architect',
    description: 'You see systems where others see chaos. Strategic, methodical, and forward-thinking — you build things that last.',
    match: (s) => (s.A3 || 0) + (s.S4 || 0) + (s.P2 || 0),
  },
  {
    name: 'The Bridge Builder',
    description: 'You connect people, ideas, and communities. Your natural communication and collaboration skills make you the glue that holds groups together.',
    match: (s) => (s.S1 || 0) + (s.S5 || 0) + (s.P4 || 0),
  },
  {
    name: 'The Visionary',
    description: 'You see possibilities before others do. Creative, open-minded, and inspiring — you imagine what could be and work to make it real.',
    match: (s) => (s.A2 || 0) + (s.P1 || 0) + (s.S2 || 0),
  },
  {
    name: 'The Steady Flame',
    description: 'Your patience and emotional stability are your greatest gifts. In a world of noise, you are the calm that others gravitate toward.',
    match: (s) => (s.CO1 || 0) + (s.P5 || 0) + (s.CO2 || 0),
  },
  {
    name: 'The Catalyst',
    description: 'You lead from the front with energy and conviction. People follow you not because you demand it, but because your passion is contagious.',
    match: (s) => (s.S2 || 0) + (s.P3 || 0) + (s.CO3 || 0),
  },
  {
    name: 'The Sage',
    description: 'You learn fast, see patterns others miss, and synthesize information with rare clarity. People come to you when they need understanding.',
    match: (s) => (s.A5 || 0) + (s.A4 || 0) + (s.A1 || 0),
  },
  {
    name: 'The Guardian',
    description: 'Integrity and stewardship define you. You protect what matters — trust, resources, relationships — with quiet, unwavering commitment.',
    match: (s) => (s.CO3 || 0) + (s.P2 || 0) + (s.CO1 || 0),
  },
  {
    name: 'The Healer',
    description: 'You carry a rare gift: the ability to sit with people in their pain and help them find light. Emotional intelligence meets deep compassion.',
    match: (s) => (s.S3 || 0) + (s.CO5 || 0) + (s.P4 || 0),
  },
  {
    name: 'The Shukr Warrior',
    description: 'Gratitude isn\'t just a practice for you — it\'s a lens. You find blessings in difficulty and turn every experience into growth.',
    match: (s) => (s.CO2 || 0) + (s.CO1 || 0) + (s.P1 || 0),
  },
  {
    name: 'The Ummah Builder',
    description: 'You think in terms of community, legacy, and collective impact. Your leadership comes through service, not status.',
    match: (s) => (s.S5 || 0) + (s.S2 || 0) + (s.CO4 || 0),
  },
];

function determineArchetype(
  subTraitScores: Record<string, number>,
  _dimensionScores: Record<string, number>,
): { name: string; description: string } {
  let best = ARCHETYPES[0];
  let bestScore = -1;

  for (const arch of ARCHETYPES) {
    const score = arch.match(subTraitScores);
    if (score > bestScore) {
      bestScore = score;
      best = arch;
    }
  }

  return { name: best.name, description: best.description };
}
