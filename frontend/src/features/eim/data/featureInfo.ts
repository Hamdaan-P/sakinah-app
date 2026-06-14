/**
 * Per-feature intro content — the "what is this / what it can & can't do /
 * try this" explainer shown the first time a user opens an EIM feature (and
 * re-openable anytime via the header "i" button).
 *
 * Honesty is the point: every entry names real limits — no predictions, no
 * personalised advice, no real money — so the card reinforces EIM's calm,
 * anti-speculation ethos instead of overselling. Keep copy short and concrete.
 */

export interface FeatureInfo {
  /** Stable id — also the key used in eim.store.featureIntros for "seen". */
  id: string;
  /** A recognisable emoji (no icon import needed; renders cross-platform). */
  emoji: string;
  title: string;
  tagline: string;
  /** One sentence: what this feature actually is. */
  whatItIs: string;
  /** 2–3 things it genuinely does. */
  canDo: string[];
  /** 2–3 honest limits — what it deliberately won't do. */
  cantDo: string[];
  /** One concrete "try this" starter action. */
  example: string;
}

export const FEATURE_INFO: Record<string, FeatureInfo> = {
  'time-machine': {
    id: 'time-machine',
    emoji: '⏳',
    title: 'Time Machine',
    tagline: 'Replay market history, one month at a time',
    whatItIs:
      'A time-controlled replay of real market history where you make buy/hold/sell decisions month by month — with a mentor walking alongside.',
    canDo: [
      'Step forward through real historical prices and react to events as they unfold',
      'Practise with virtual cash — building the instinct, not the bankroll',
      'Get a reflective post-mortem on your decisions afterwards',
    ],
    cantDo: [
      'Place real trades or move real money',
      'Predict the future — it only replays what already happened',
      'Show live or daily prices (monthly framing only, by design)',
    ],
    example: 'Start in 2008, live through the crash month by month, and see if you’d have held your nerve.',
  },
  'pattern-lab': {
    id: 'pattern-lab',
    emoji: '🕯️',
    title: 'Pattern Lab',
    tagline: 'Learn to read candlestick patterns from real charts',
    whatItIs:
      'A place to learn candlestick patterns on real monthly charts — spotting them in the wild and studying famous historical examples.',
    canDo: [
      'See high-confidence patterns highlighted on any stock’s monthly chart',
      'Study curated “famous example” windows where a pattern actually formed',
      'Open a teaching card to learn what usually precedes and follows each shape',
    ],
    cantDo: [
      'Tell you what a stock will do next — patterns are observations, not predictions',
      'Flag every textbook shape — it only marks ones it’s sure of (seeing none is normal)',
      'Work on daily charts — monthly only, where the noise is lower',
    ],
    example: 'Open a stock at 10Y, turn on Spot Patterns, and tap any highlighted shape to learn it.',
  },
  'strategy-comparator': {
    id: 'strategy-comparator',
    emoji: '⚖️',
    title: 'Strategy Comparator',
    tagline: 'See how different approaches would have played out',
    whatItIs:
      'A side-by-side comparison of investing strategies (lump-sum vs. drip-feeding vs. a balanced mix) over a real historical window.',
    canDo: [
      'Compare lump-sum, monthly investing (DCA) and a 60/40 mix over the same period',
      'See the end result and the ride each strategy would have given you',
      'Learn why “time in the market” usually beats trying to time it',
    ],
    cantDo: [
      'Recommend which strategy is right for you personally',
      'Guarantee past results repeat',
      'Include fees or taxes — it’s an illustration, not a forecast',
    ],
    example: 'Compare a one-time lump sum vs. a fixed monthly amount from 2015 and see the gap.',
  },
  projection: {
    id: 'projection',
    emoji: '🌱',
    title: 'Projection',
    tagline: 'Picture where steady saving could lead',
    whatItIs:
      'A forward projector that shows a range of plausible outcomes from a starting amount plus regular contributions.',
    canDo: [
      'Model a starting pot plus a monthly contribution over many years',
      'Show a range of outcomes (good / typical / poor), not one false number',
      'Make the power of compounding and consistency tangible',
    ],
    cantDo: [
      'Promise a specific return — markets are uncertain',
      'Account for your real tax and fee situation',
      'Be treated as financial advice',
    ],
    example: 'Try a modest starting amount plus a monthly top-up for 20 years and read the outcome bands.',
  },
  'scenario-lab': {
    id: 'scenario-lab',
    emoji: '🔀',
    title: 'Scenario Lab',
    tagline: 'Make a blind call, then see all the branches',
    whatItIs:
      'Historical decision dilemmas where you make a blind choice, then watch how every branch actually played out over the following year.',
    canDo: [
      'Face a real past dilemma without knowing the outcome',
      'Commit to a choice, then reveal what each option would have done',
      'Build judgment by feeling the decision before seeing the result',
    ],
    cantDo: [
      'Tell you the “right” answer in advance',
      'Reflect your personal circumstances',
      'Predict future scenarios',
    ],
    example: 'Take the 2020 crash dilemma — buy, hold or sell — then reveal all three paths.',
  },
  mentor: {
    id: 'mentor',
    emoji: '🧭',
    title: 'AI Mentor',
    tagline: 'Consult investing philosophies on your decisions',
    whatItIs:
      'An AI mentor that analyses your simulated portfolio through the lens of famous investing philosophies — and lets you ask follow-ups.',
    canDo: [
      'Get a structured analysis of your simulated holdings',
      'Explore decisions through different investing traditions (value, index, and more)',
      'Ask follow-up questions in plain language',
    ],
    cantDo: [
      'Give personalised financial advice or tell you what to buy',
      'Impersonate or speak for any real living person',
      'Access your real brokerage or real money',
    ],
    example: 'Run an analysis on a sim portfolio, then ask “what would a long-term value approach change?”',
  },
  mirror: {
    id: 'mirror',
    emoji: '🪞',
    title: 'Mizan Mirror',
    tagline: 'A muhasaba for your investing behaviour',
    whatItIs:
      'A behavioural self-audit (muhasaba) that reads your past trade history and gently reflects back the biases it sees — privately.',
    canDo: [
      'Reconstruct your trades from a broker statement you upload',
      'Surface behavioural patterns like chasing, panic-selling or overtrading',
      'Frame growth areas in a calm, self-accountability tone',
    ],
    cantDo: [
      'Rank or score you against others — there are no leaderboards',
      'Share your data — it stays private to you',
      'Tell you what to trade next',
    ],
    example: 'Upload a broker statement and see which biases showed up most.',
  },
  portfolio: {
    id: 'portfolio',
    emoji: '📂',
    title: 'Portfolio',
    tagline: 'Your virtual holdings, with the Halal lens',
    whatItIs:
      'A virtual portfolio workspace where you build positions, view monthly charts, and run a Shariah-aware analysis.',
    canDo: [
      'Add virtual positions and watch them on monthly charts',
      'Check each holding against Shariah screening signals',
      'Trigger a mentor analysis of the whole portfolio',
    ],
    cantDo: [
      'Hold or move real money',
      'Issue a fatwa — screening signals are educational',
      'Provide live intraday prices',
    ],
    example: 'Add a couple of stocks, open a monthly chart, and run the analysis.',
  },
  ulama: {
    id: 'ulama',
    emoji: '📜',
    title: 'Ulama Screening',
    tagline: 'Multiple scholarly views, side by side',
    whatItIs:
      'A browser of scholarly opinions on investing topics, showing the spectrum of views rather than a single ruling.',
    canDo: [
      'Browse topics and read multiple scholars’ positions',
      'See where opinions agree and where they differ',
      'Understand the reasoning, not just the verdict',
    ],
    cantDo: [
      'Issue a personal fatwa for your situation',
      'Replace your own scholar or advisor',
      'Claim one view is the only valid one',
    ],
    example: 'Open a topic and compare how different scholars reason about it.',
  },
  course: {
    id: 'course',
    emoji: '🎓',
    title: 'Course — Madrasa',
    tagline: 'Learn halal investing, level by level',
    whatItIs:
      'A structured course that builds from foundations to mastery, plus famous-investor playbooks read through a Halal Lens.',
    canDo: [
      'Work through five levels of lessons, each with a short quiz',
      'Read investor “playbooks” with a halal overlay',
      'Track your progress and pick up where you left off',
    ],
    cantDo: [
      'Make you a guaranteed profitable investor',
      'Replace formal financial qualifications',
      'Give personalised advice',
    ],
    example: 'Start Level 1, finish a lesson, and pass its 3-question quiz.',
  },
};
