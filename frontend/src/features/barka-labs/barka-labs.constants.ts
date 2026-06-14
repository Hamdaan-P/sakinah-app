/**
 * Barka Labs (Shukr Meter) — Design constants matching boss's Baraka Labs design
 */

/* ── Color palette ── */
/* Adapted from boss's Baraka Labs palette to blend with app's navy theme (#1E293A) */
export const C = {
  gold: '#D4A853',
  goldL: '#E8C97A',
  goldD: '#B8893A',
  em: '#1B6B4A',
  emL: '#2A9D6F',
  emD: '#0F4A32',
  bg: '#1E293A',          // Match app bg
  card: '#2C3C55',         // Solid navy card — visible like Halaqah
  cardB: 'rgba(215,181,106,0.2)', // Visible gold border — matches Halaqah
  t1: '#EBDCB8',          // App primary cream text
  t2: '#D5DDEA',          // Brighter secondary — readable
  t3: '#A7B1C0',          // Tertiary text
  teal: '#3ABFAD',
  rose: '#E07A6B',
  purple: '#8B7EC8',
  blue: '#5B8DEF',
  dnz: '#F5C842',
} as const;

/* ── Card style helper (reusable inline styles) ── */
export const cardStyle: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.cardB}`,
  borderRadius: 18,
};

export const subCardStyle: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.cardB}`,
  borderRadius: 16,
};

/* ── Level definitions ── */
export const LEVELS = [
  {
    num: 1,
    name: 'Shukr Practitioner',
    desc: 'Build the habit of daily gratitude and prostration of thanks.',
    tasks: [
      'Log 3 gratitudes daily for 30 consecutive days',
      'Perform 1 Sajdah al-Shukr (prostration of thanks) daily',
      'Achieve Creativity Score above 40',
    ],
    reward: 'DinarZ + "Practitioner" Badge',
    dnz: 200,
  },
  {
    num: 2,
    name: 'Shukr + Charity',
    desc: 'Combine gratitude with generosity. Give back while you count blessings.',
    tasks: [
      'Continue daily gratitude streak',
      'Complete 3 acts of charity this month',
      'Achieve Creativity Score above 60 consistently',
      'Invite 2 buddies to the platform',
    ],
    reward: 'DinarZ + "Generous Soul" Badge + Raya Unlock',
    dnz: 500,
  },
  {
    num: 3,
    name: 'Tahajjud Gratitude',
    desc: 'Rise for the night prayer (Tahajjud) and combine it with gratitude journaling.',
    tasks: [
      'Log gratitude during Tahajjud for 30 days',
      'Maintain Creativity Score above 75',
      'Complete metacognition questionnaire',
      'Help 1 buddy level up',
    ],
    reward: 'DinarZ + "Night Worshipper" Badge',
    dnz: 1000,
  },
  {
    num: 4,
    name: 'Shukr Master',
    desc: 'Complete mastery: gratitude becomes second nature. Mentor others and lead communities.',
    tasks: [
      '365-day gratitude streak',
      'Creativity Score above 85 average',
      'Digital Twin at 90%+',
      'Mentor 5 buddies to Level 2+',
    ],
    reward: 'DinarZ + "Shukr Master" Badge + Community Leader Status',
    dnz: 5000,
  },
] as const;

/* ── DNZ earning rules ── */
export const DNZ_EARNINGS = [
  { action: 'Daily Shukr logged', amount: 10 },
  { action: 'Creativity 50-70', amount: 5 },
  { action: 'Creativity 71-90', amount: 15 },
  { action: 'Creativity 91-100', amount: 30 },
  { action: '7-day streak', amount: 50 },
  { action: 'Level up (30-day)', amount: 200 },
  { action: '1-min challenge', amount: 25 },
  { action: 'Buddy invite accepted', amount: 40 },
  { action: 'Deep questionnaire', amount: 75 },
  { action: 'Raya deep conversation', amount: 20 },
] as const;

/* ── Compute reflection score from depth ── */
export function computeReflectionScore(avgDepth: number, totalBlessings: number, profoundCount: number, streak: number) {
  // Scale 0-5 depth to approximate creativity sub-scores /25
  const depthPct = Math.min(avgDepth / 5, 1);
  const uniqueness = Math.round(depthPct * 18 + Math.min(totalBlessings / 50, 1) * 7);
  const depth = Math.round(depthPct * 22 + (profoundCount > 5 ? 3 : 0));
  const specificity = Math.round(depthPct * 15 + Math.min(totalBlessings / 30, 1) * 10);
  const perspective = Math.round(depthPct * 12 + Math.min(streak / 30, 1) * 8 + (profoundCount > 3 ? 5 : 0));
  return {
    total: Math.min(uniqueness + depth + specificity + perspective, 100),
    uniqueness: Math.min(uniqueness, 25),
    depth: Math.min(depth, 25),
    specificity: Math.min(specificity, 25),
    perspective: Math.min(perspective, 25),
  };
}

/* ── Compute approximate mental health dimensions ── */
export function computeMentalHealthScore(avgDepth: number, totalBlessings: number, profoundCount: number, streak: number) {
  const depthPct = Math.min(avgDepth / 5, 1);
  const consistencyPct = Math.min(streak / 30, 1);
  const volumePct = Math.min(totalBlessings / 100, 1);
  const profoundPct = totalBlessings > 0 ? Math.min(profoundCount / totalBlessings, 1) : 0;

  const mental = Math.round(depthPct * 45 + consistencyPct * 30 + volumePct * 25);
  const emotional = Math.round(depthPct * 35 + profoundPct * 40 + consistencyPct * 25);
  const spiritual = Math.round(profoundPct * 50 + depthPct * 30 + consistencyPct * 20);
  const physical = Math.round(consistencyPct * 50 + volumePct * 30 + depthPct * 20);
  const overall = Math.round((mental + emotional + spiritual + physical) / 4);

  return { overall, mental, emotional, spiritual, physical };
}
