/**
 * Display-label maps + persona-archetype info + historical-figure
 * blocklist for InsightsReport.
 *
 * Phase 5 split — these are pure data, 90 lines that were inline in
 * InsightsReport.tsx. The historical-figure set has to stay in sync
 * with the backend memory_manager.py blocklist; the comment near
 * HISTORICAL_FIGURES is the contract.
 */

export const MOTIVATION_LABELS: Record<string, string> = {
  freedom: 'Freedom & Independence',
  validation: 'Recognition & Validation',
  survival: 'Security & Survival',
  dont_know: 'Still figuring it out',
};

export const CRISIS_LABELS: Record<string, string> = {
  fix_immediately: 'Takes immediate action',
  overthink_alone: 'Processes internally',
  talk_to_someone: 'Seeks counsel from others',
  ignore_hope: 'Steps back and hopes for the best',
  dua_let_go: "Turns to du'a and tawakkul",
};

export const STRESS_LABELS: Record<string, string> = {
  money_career: 'Money & Career',
  relationships: 'Relationships',
  faith_purpose: 'Faith & Purpose',
  health_mental: 'Health & Mental Wellbeing',
  loneliness: 'Loneliness',
};

export const SHARING_LABELS: Record<string, string> = {
  very_open: 'Very open — shares freely',
  selective: 'Selective — shares with trusted people',
  private: 'Private — processes alone',
  depends: 'Depends on the situation',
};

export const ADVICE_LABELS: Record<string, string> = {
  direct_honest: 'Direct and honest',
  gentle_encouraging: 'Gentle and encouraging',
  islamic_only: 'Rooted in Islamic guidance',
  practical: 'Practical and action-oriented',
};

export const CONVO_LABELS: Record<string, string> = {
  deep_talks: 'Deep, reflective conversations',
  quick_check_ins: 'Quick check-ins',
  structured: 'Structured and goal-oriented',
  casual: 'Casual and flowing',
};

export const PASCO_INFO: Record<string, { label: string; desc: string; color: string }> = {
  piety: { label: 'Piety', desc: 'Driven by spiritual depth and closeness to Allah. Finds meaning through worship, reflection, and inner peace.', color: '#2A9D6F' },
  amanah: { label: 'Amanah', desc: 'Trustworthiness and responsibility are core values. Takes commitments seriously and holds themselves to high standards.', color: '#3B82F6' },
  service: { label: 'Service', desc: 'Finds purpose in serving others. Naturally drawn to helping, mentoring, and community upliftment.', color: '#D4A853' },
  community: { label: 'Community', desc: 'Thrives through connection and belonging. Energized by relationships, collaboration, and shared experiences.', color: '#EC4899' },
  opportunity: { label: 'Opportunity', desc: 'Growth-oriented and always seeking the next step. Entrepreneurial mindset with a drive to build and achieve.', color: '#F59E0B' },
};

export const COGNITIVE_PATTERN_LABELS: Record<string, { label: string; desc: string }> = {
  should_statements: { label: "'Should' Statements", desc: 'Holds rigid expectations of self or others using "should" or "must" language' },
  catastrophizing: { label: 'Catastrophizing', desc: 'Tends to imagine worst-case scenarios and amplify potential consequences' },
  black_and_white: { label: 'All-or-Nothing Thinking', desc: 'Sees situations in absolutes — either perfect or a complete failure' },
  mind_reading: { label: 'Mind Reading', desc: 'Assumes what others are thinking or feeling without evidence' },
  personalization: { label: 'Personalization', desc: 'Takes responsibility for events outside their control' },
  overgeneralization: { label: 'Overgeneralization', desc: 'Draws broad conclusions from single events' },
  discounting_positives: { label: 'Discounting Positives', desc: 'Minimizes accomplishments and positive experiences' },
  labeling: { label: 'Negative Self-Labeling', desc: 'Assigns global negative labels to themselves based on specific situations' },
  fortune_telling: { label: 'Fortune Telling', desc: 'Predicts negative outcomes as if they are certainties' },
  emotional_reasoning: { label: 'Emotional Reasoning', desc: 'Treats feelings as facts — "I feel it, so it must be true"' },
};

/**
 * Names of Islamic historical/religious figures and app companion
 * personas that should never appear in the user's personal Relationship
 * Map. They get picked up from hadith quotes etc.
 *
 * **Contract:** Kept in sync with the backend blocklist in
 * `memory_manager.py`. When adding a name here, add it there too.
 */
export const HISTORICAL_FIGURES = new Set([
  'raya',
  'abu bakr', 'abu bakr as-siddiq',
  'umar', 'umar ibn al-khattab',
  'uthman', 'uthman ibn affan',
  'ali', 'ali ibn abi talib',
  'khadijah', 'khadijah bint khuwaylid',
  'aisha', 'aisha bint abi bakr',
  'fatimah', 'fatima', 'fatimah az-zahra',
  'imam abu hanifa', 'abu hanifa',
  'imam malik', 'malik ibn anas',
  "imam shafi'i", "imam ash-shafi'i", "ash-shafi'i", "shafi'i",
  'imam ahmad', 'imam ahmad ibn hanbal', 'ahmad ibn hanbal',
  'muhammad', 'prophet', 'prophet muhammad', 'rasulullah',
  'moses', 'musa', 'abraham', 'ibrahim', 'jesus', 'isa',
  'noah', 'nuh', 'joseph', 'yusuf', 'david', 'dawud',
  'solomon', 'sulaiman', 'jonah', 'yunus', 'adam', 'idris',
  'maryam', 'mary',
  'hafsa', 'safiyah', 'umm salamah', 'khawlah', 'asma bint abi bakr',
  'zainab', 'ruqayyah', 'umm kulthum', 'hassan', 'husayn',
  'bilal', "mus'ab", 'hamza', 'khalid', 'khalid ibn al-walid',
  'zayd', 'zayd ibn thabit', 'abdullah ibn umar', 'abdullah ibn abbas',
  'abu hurairah', 'abu hurayrah', 'saad', 'saad ibn abi waqqas',
  'allah', 'god',
]);
