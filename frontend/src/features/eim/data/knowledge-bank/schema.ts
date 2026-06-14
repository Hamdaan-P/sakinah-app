/**
 * Knowledge Bank — TypeScript schemas for in-repo editorial content.
 *
 * Per master-plan §6.Q + D18: the knowledge bank is in-repo, versioned with
 * code, edited via PR (no CMS at launch). Content lives in sibling files
 * (playbooks.ts, candlesticks.ts, ...). This file is the single source of
 * truth for the shape every entry must conform to.
 *
 * Schema-validation CI step is deferred — TypeScript itself enforces the
 * shape at build time, which is sufficient until we have non-engineer
 * editors.
 */

// ── Playbook (§6.N) ────────────────────────────────────────────────────────
//
// A "Playbook" is a famous investor's personal applied process — distinct
// from a Lesson, which teaches concepts generally. Lives at /eim/playbook/:id
// behind the Lessons|Playbook tab on the Library page.

export type HalalLensVerdict = 'applies_as_is' | 'needs_modification' | 'forbidden';

export interface HalalLensItem {
  /** Verdict on this aspect of the framework against Shariah constraints. */
  verdict: HalalLensVerdict;
  /** Short label, e.g. "Long-term ownership", "Bank/insurance holdings". */
  title: string;
  /** 1-3 sentence explanation of why this verdict was reached. */
  body: string;
}

export interface PlaybookPrinciple {
  /** Short name of the principle, e.g. "Circle of Competence". */
  name: string;
  /** 2-4 sentence explanation of the principle in this investor's words/style. */
  body: string;
}

export interface PlaybookCaseStudy {
  /** Subject of the case, e.g. "Globally-recognised beverage brand, late 1980s", "Auto-insurance acquisition". */
  subject: string;
  /** Story narrative — what they did, why, what happened, what to learn. */
  narrative: string;
  /** Optional Halal-investor framing — what a Muslim investor takes from this. */
  halal_lens?: string;
}

export interface Playbook {
  /** URL-safe identifier, e.g. "buffett", "graham". */
  id: string;
  /** Display name — the real investor whose publicly documented strategy this
   *  playbook teaches, e.g. "Warren Buffett". Playbooks are editorial content
   *  about public investment history, not AI impersonations (the AI mentor
   *  personas in eim_persona_prompts.py stay framework-vague — different
   *  surface, different risk). */
  name: string;
  /** Optional nickname / framework epithet displayed as a subtitle under the
   *  name, e.g. "The Sage of Omaha", "The Father of Value". */
  epithet?: string;
  /** Years active label, e.g. "1956–present". */
  years_active: string;
  /** Short framework label, e.g. "Economic-moat investing". */
  framework: string;
  /** 1-paragraph elevator pitch for the lens. */
  bio: string;
  /** One quotable line that captures the investor's worldview. */
  signature_quote: string;
  /** Attribution for the quote. */
  signature_quote_source: string;
  /** Estimated read time in minutes. */
  minutes: number;
  /** Tier gate — `free` for launch; `plus` reserved for future. */
  tier: 'free' | 'plus';
  /** 5-7 core principles in the investor's own framework. */
  principles: PlaybookPrinciple[];
  /** 2-3 real-world case studies illustrating the principles. */
  case_studies: PlaybookCaseStudy[];
  /** Halal Lens overlay — three buckets, one or more items per bucket. */
  halal_lens: HalalLensItem[];
  /** Practical exercise the user can run in the EIM simulator. */
  practical_exercise: {
    title: string;
    body: string;
  };
  /** Sources cited (book titles, public talks, etc.). */
  references: string[];
}

// ── Candlestick (§6.G) ─────────────────────────────────────────────────────
//
// A pattern entry in the candlestick library. Inline SVG keeps the catalog
// free of binary assets and ensures patterns render the same on every device.

export type CandlestickCategory = 'single' | 'two_candle' | 'three_candle';
export type CandlestickSignal = 'bullish_reversal' | 'bearish_reversal' | 'continuation' | 'indecision';

export interface CandlestickPattern {
  /** URL-safe identifier, e.g. "doji", "morning_star". */
  id: string;
  /** Display name, e.g. "Doji". */
  name: string;
  /** Sometimes-used alternative names, comma-separated. */
  aka?: string;
  /** Pattern category — how many candles compose it. */
  category: CandlestickCategory;
  /** Signal classification. */
  signal: CandlestickSignal;
  /** Plain-language meaning (1-2 sentences). */
  meaning: string;
  /** How to recognise it (1-2 sentences). */
  recognition: string;
  /** A real-world historical example. */
  example: string;
  /** Inline SVG markup of the canonical, isolated pattern shape.
   *  viewBox "0 0 200 100", uses CSS vars for theming. */
  svg: string;
  /** OPTIONAL: SVG of the pattern shown IN market context — surrounding
   *  trend candles before + reaction candles after — so the learner sees
   *  what the example feels like on a real chart, not just the isolated
   *  shape. viewBox "0 0 360 120". */
  example_chart?: string;
  /** OPTIONAL: What to look for in the next period(s) to validate this
   *  pattern. "Confirmation matters more than the pattern itself" is the
   *  master-plan §6.G principle this field encodes. */
  confirmation?: string;
  /** OPTIONAL: Common ways this pattern fails — situations where the
   *  shape appears but the expected move doesn't follow. Honest about
   *  pattern reliability rather than hyping. */
  failure_modes?: string;
  /** OPTIONAL: IDs of other patterns the learner should cross-check
   *  (mirror patterns, weaker/stronger versions, etc). */
  related?: string[];
  /** OPTIONAL: What typically PRECEDES this pattern — the trend/setup that
   *  gives it meaning ("what usually comes before", per the Pattern-Spotting
   *  insight card). Reversal patterns are only valid after the opposite trend,
   *  so this also doubles as the detector's precondition. */
  context_before?: string;
  /** OPTIONAL: The historically-observed tendency AFTER this pattern, framed
   *  as a *tendency, never a prediction* (always rendered with a disclaimer).
   *  Distinct from `confirmation` (what validates it) and `failure_modes`
   *  (when it fizzles). */
  typical_after?: string;
  /** OPTIONAL: A real historical MONTHLY window where this pattern occurred —
   *  feeds the Pattern Lab "show me a real one" mode (Phase C). Months are
   *  ISO YYYY-MM. Populated/verified later. */
  example_ref?: { ticker: string; start_month: string; end_month: string };
  /** Pedagogical note tying the pattern to long-term context (per master plan §6.G). */
  note: string;
}
