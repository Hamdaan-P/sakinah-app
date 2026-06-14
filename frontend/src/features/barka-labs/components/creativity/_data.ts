/**
 * Static data + helpers for the Reflection Score detail screen.
 */

import { C } from '../../barka-labs.constants';
import type { Blessing } from '../../types/barka-labs.types';

export interface DimDef {
  key: 'uniqueness' | 'depth' | 'specificity' | 'perspective';
  label: string;
  color: string;
  tipStrength: string;
  tipGrowth: string;
}

export const DIMS: DimDef[] = [
  {
    key: 'uniqueness', label: 'Uniqueness', color: C.gold,
    tipStrength: 'You notice blessings others overlook. Your entries reveal uncommon awareness.',
    tipGrowth: 'Look for micro-moments — the way morning light hits your desk, a stranger who held the door. Uncommon blessings score highest.',
  },
  {
    key: 'depth', label: 'Depth', color: '#2A9D6F',
    tipStrength: 'Your reflections go beyond surface-level. You naturally ask "why does this matter?"',
    tipGrowth: 'Go beyond naming. Ask: What did this teach me? How did it change me? A blessing with a lesson scores 2× higher.',
  },
  {
    key: 'specificity', label: 'Specificity', color: '#3ABFAD',
    tipStrength: 'You name exact people, moments, and feelings. This precision makes your gratitude powerful.',
    tipGrowth: '"My mother\'s dua at Fajr" beats "family support" every time. Name the exact person, exact moment, exact feeling.',
  },
  {
    key: 'perspective', label: 'Perspective', color: '#8B7EC8',
    tipStrength: 'You see blessings in difficulty. Reframing struggles is the highest level of gratitude.',
    tipGrowth: 'Try: "I\'m grateful for the failure that led to..." Reframing struggles as blessings unlocks this dimension.',
  },
];

/** Archetype → reflection insight mapping */
export const ARCHETYPE_INSIGHTS: Record<string, { insight: string; challenge: string }> = {
  'The Mujtahid': { insight: 'Your analytical nature drives deep, structured reflections.', challenge: 'Try more emotional, vulnerable entries — let feelings lead sometimes.' },
  'The Rahma Shield': { insight: 'Your compassion shows in people-centered blessings.', challenge: 'Reflect on your own growth too, not just what you give to others.' },
  'The Architect': { insight: 'You naturally see systems and patterns in your blessings.', challenge: 'Try spontaneous gratitude — not everything needs a framework.' },
  'The Bridge Builder': { insight: 'Your reflections center on connection and relationships.', challenge: 'Reflect on solitary blessings — things only you experience.' },
  'The Visionary': { insight: 'You see possibility in everything — your entries are forward-looking.', challenge: 'Slow down and appreciate what IS, not just what could be.' },
  'The Steady Flame': { insight: 'Your patience and consistency show in your steady practice.', challenge: 'Push for more profound, uncomfortable reflections occasionally.' },
  'The Catalyst': { insight: 'Your energy and conviction come through in passionate entries.', challenge: 'Try quieter reflections — the blessings in stillness and silence.' },
  'The Sage': { insight: 'You synthesize and connect ideas across your blessings naturally.', challenge: 'Try purely emotional entries — bypass the intellect sometimes.' },
  'The Guardian': { insight: 'Your integrity shows in honest, grounded reflections.', challenge: 'Explore creative, imaginative gratitude — blessings you haven\'t received yet.' },
  'The Healer': { insight: 'Your emotional depth makes your entries rich and moving.', challenge: 'Try analytical reflections — dissect WHY a blessing exists, not just how it feels.' },
  'The Shukr Warrior': { insight: 'Gratitude is your lens — you find blessings everywhere naturally.', challenge: 'Go deeper on fewer blessings rather than broader on many.' },
  'The Ummah Builder': { insight: 'Your reflections connect personal blessings to community impact.', challenge: 'Reflect on private, intimate blessings — the ones only you know about.' },
};

/** Build 7-day trend from real blessing data */
export function buildDailyTrend(blessings: Blessing[]): { day: string; avg: number; count: number }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const result: { day: string; avg: number; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);

    const dayBlessings = blessings.filter(b => {
      const d = new Date(b.created_at);
      return d >= dayStart && d <= dayEnd;
    });

    const avg = dayBlessings.length > 0
      ? Math.round(dayBlessings.reduce((s, b) => s + b.score, 0) / dayBlessings.length * 20) // scale 1-5 to 20-100
      : 0;

    result.push({ day: days[date.getDay()], avg, count: dayBlessings.length });
  }

  return result;
}

/** Find best blessings */
export function findBestBlessings(blessings: Blessing[]): Blessing[] {
  if (blessings.length === 0) return [];
  const sorted = [...blessings].sort((a, b) => b.score - a.score);
  return sorted.slice(0, 3);
}
