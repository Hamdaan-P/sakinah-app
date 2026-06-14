/**
 * Demo seed data for Barka Labs preview mode.
 * These blessings are POSTed to the backend on first demo visit
 * so they get real AI scoring and persist in Firestore.
 */

/** Blessings to seed for a new anonymous user (logged one at a time via logBlessing) */
export const DEMO_SEED_BLESSINGS = [
  'I am grateful that my mother stayed up with me when I was anxious last week. She didn\'t try to fix anything, she just sat there. That presence is a gift most people never receive.',
  'Grateful for clean water flowing from my tap. Somewhere right now, someone is walking miles for this.',
  'Grateful for the ability to read the Quran in its original Arabic. Millions of Muslims across history fought to preserve every letter.',
  'I am grateful for the argument I had with my friend last month. It forced me to look at my own ego and I became a better person because of it.',
  'Grateful for good weather today.',
];

/** Quick-start example pills shown below the hero for zero-friction first interaction */
export const QUICK_START_EXAMPLES = [
  'Grateful for my mother\'s patience',
  'The rain that feeds the earth',
  'Being able to read the Quran',
];

/**
 * Seeds demo blessings for a new anonymous user.
 * Uses the API directly (skips auto-decomposition) for speed.
 */
export async function seedDemoBlessings(
  userId: string,
  api: { logBlessing: (userId: string, text: string) => Promise<unknown> },
): Promise<void> {
  for (const text of DEMO_SEED_BLESSINGS) {
    try {
      // Call API directly — skip store's auto-decompose for speed
      await api.logBlessing(userId, text);
      await new Promise((r) => setTimeout(r, 300));
    } catch {
      console.warn('Demo seed: failed to log blessing, continuing');
    }
  }
}
