/**
 * Candlestick pattern detection over monthly OHLC bars (EIM Pattern Spotting,
 * Phase A).
 *
 * Pure, deterministic, frontend-only — no LLM, no backend, no dependency. Given
 * the monthly bars the chart already holds, it returns the candlestick patterns
 * present in the data so the UI can annotate them and link to the teaching
 * catalog (`knowledge-bank/candlesticks.ts`). Same bars in → same patterns out.
 *
 * Design notes (why monthly is handled the way it is):
 *   - Candlestick patterns are traditionally a daily/weekly tool. On MONTHLY
 *     bars, geometry-only patterns (doji, hammer, engulfing, harami, soldiers/
 *     crows) translate fine — they depend only on candle shape + the relation
 *     between consecutive bodies. We treat these as `strong`.
 *   - GAP-dependent patterns (morning/evening star classically need the middle
 *     candle to gap away) almost never gap on auto-adjusted monthly data, where
 *     each month opens ~where the last closed. We relax "gap" to "small body +
 *     position" and grade these `moderate` so the UI can be honest about it.
 *   - Reversal patterns are only meaningful after the OPPOSITE trend (a hammer
 *     after a downtrend is bullish; the SAME shape after an uptrend is a hanging
 *     man — bearish). So every reversal detector verifies the prior trend, which
 *     both improves precision AND yields the "what comes before" framing for
 *     free. When the prior trend is undefined (too little history / flat), we
 *     skip rather than guess — conservative by design.
 *
 * `patternId` values map 1:1 onto catalog ids in `knowledge-bank/candlesticks.ts`
 * so the consumer can resolve the full teaching entry.
 */

import type { MonthlyOhlcBar } from '../types/eim.types';
import type { CandlestickSignal } from '../data/knowledge-bank/schema';

export type PatternConfidence = 'strong' | 'moderate';

export interface DetectedPattern {
  /** Catalog id in knowledge-bank/candlesticks.ts. */
  patternId: string;
  /** First bar index of the pattern (inclusive). */
  startIndex: number;
  /** Last bar index — the "signal" bar the pattern completes on (inclusive). */
  endIndex: number;
  signal: CandlestickSignal;
  /** `strong` for geometry-only monthly-robust patterns; `moderate` for
   *  gap-relaxed ones (stars) where the monthly form is weaker. */
  confidence: PatternConfidence;
}

// ── Tuning constants ──────────────────────────────────────────────────────
// Conservative on purpose: we'd rather miss a borderline pattern than flag
// noise. Every threshold is documented so a reviewer (or scholar) can audit it.

/** Body ≤ 10% of the full range → a doji (open ≈ close). */
const DOJI_BODY_RATIO = 0.1;
/** A "long" wick is ≥ 2× the body length. */
const LONG_WICK_RATIO = 2;
/** The opposite (short) wick must be ≤ 0.6× the body for hammer/star shapes. */
const SHORT_WICK_RATIO = 0.6;
/** A small body (harami "baby", star middle) is ≤ 35% of its range. */
const SMALL_BODY_RATIO = 0.35;
/** A large body (engulfing/harami "mother", soldier) is ≥ 50% of its range. */
const LARGE_BODY_RATIO = 0.5;
/** Bars looked back to judge the trend leading into a pattern. */
const TREND_LOOKBACK = 3;
/** Minimum cumulative move over the lookback to call a direction (else flat). */
const MIN_TREND_PCT = 0.03;

// ── Per-bar geometry ────────────────────────────────────────────────────────

interface BarMetrics {
  open: number;
  high: number;
  low: number;
  close: number;
  /** |close - open| */
  body: number;
  /** high - low (always > 0 for a usable bar) */
  range: number;
  /** high - max(open, close) */
  upperWick: number;
  /** min(open, close) - low */
  lowerWick: number;
  /** top of the body in price terms = max(open, close) */
  bodyTop: number;
  /** bottom of the body = min(open, close) */
  bodyBottom: number;
  bull: boolean;
  bear: boolean;
}

function metricsOf(b: MonthlyOhlcBar): BarMetrics | null {
  const range = b.high - b.low;
  // Degenerate bar (flat or bad data) — unusable for shape detection.
  if (!(range > 0) || !isFinite(range)) return null;
  const bodyTop = Math.max(b.open, b.close);
  const bodyBottom = Math.min(b.open, b.close);
  return {
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    body: Math.abs(b.close - b.open),
    range,
    upperWick: b.high - bodyTop,
    lowerWick: bodyBottom - b.low,
    bodyTop,
    bodyBottom,
    bull: b.close > b.open,
    bear: b.close < b.open,
  };
}

type Trend = 'up' | 'down' | 'flat' | 'unknown';

/** Direction of the run of closes ending just before bar `start`. Uses the
 *  close `TREND_LOOKBACK` bars earlier vs. the close immediately before the
 *  pattern. Returns 'unknown' when there isn't enough history. */
function priorTrend(bars: readonly MonthlyOhlcBar[], start: number): Trend {
  const prevIdx = start - 1;
  const baseIdx = start - 1 - TREND_LOOKBACK;
  if (prevIdx < 0 || baseIdx < 0) return 'unknown';
  const base = bars[baseIdx].close;
  const prev = bars[prevIdx].close;
  if (!(base > 0)) return 'unknown';
  const change = (prev - base) / base;
  if (change >= MIN_TREND_PCT) return 'up';
  if (change <= -MIN_TREND_PCT) return 'down';
  return 'flat';
}

// ── Shape predicates ──────────────────────────────────────────────────────

const isDoji = (m: BarMetrics) => m.body <= DOJI_BODY_RATIO * m.range;

/** Small body near the TOP of the range with a long lower wick and a stubby
 *  upper wick. Shape shared by hammer (after downtrend) + hanging man (after
 *  uptrend). */
const isLowerWickShape = (m: BarMetrics) =>
  !isDoji(m) &&
  m.lowerWick >= LONG_WICK_RATIO * m.body &&
  m.upperWick <= SHORT_WICK_RATIO * m.body &&
  m.body <= SMALL_BODY_RATIO * m.range;

/** Small body near the BOTTOM of the range with a long upper wick and a stubby
 *  lower wick. Shape shared by shooting star (after uptrend) + inverted hammer
 *  (after downtrend). */
const isUpperWickShape = (m: BarMetrics) =>
  !isDoji(m) &&
  m.upperWick >= LONG_WICK_RATIO * m.body &&
  m.lowerWick <= SHORT_WICK_RATIO * m.body &&
  m.body <= SMALL_BODY_RATIO * m.range;

// ── Detection ───────────────────────────────────────────────────────────────

export interface DetectOptions {
  /** Don't run on a series shorter than this (need lookback + the pattern). */
  minBars?: number;
}

/**
 * Detect candlestick patterns in `bars` (ascending by date). Returns every
 * distinct detection, sorted by `endIndex`. Overlaps are allowed — the
 * consumer decides how to present them (e.g. prefer the highest-candle-count
 * pattern when ranges collide).
 */
export function detectPatterns(
  bars: readonly MonthlyOhlcBar[],
  opts: DetectOptions = {},
): DetectedPattern[] {
  const minBars = opts.minBars ?? TREND_LOOKBACK + 2;
  if (bars.length < minBars) return [];

  // Precompute metrics; null entries (degenerate bars) disable detectors that
  // would touch them.
  const M = bars.map(metricsOf);
  const out: DetectedPattern[] = [];

  for (let i = 0; i < bars.length; i++) {
    const m = M[i];
    if (!m) continue;

    // ── Single-candle ──────────────────────────────────────────────────
    if (isDoji(m)) {
      const t = priorTrend(bars, i);
      // A doji is only a signal at a trend extreme; mid-trend/sideways dojis
      // are noise (catalog `failure_modes`). At an extreme → strong.
      out.push({
        patternId: 'doji',
        startIndex: i,
        endIndex: i,
        signal: 'indecision',
        confidence: t === 'up' || t === 'down' ? 'strong' : 'moderate',
      });
    } else if (isLowerWickShape(m)) {
      const t = priorTrend(bars, i);
      // Shape + context = signal: same candle, opposite meaning by prior trend.
      if (t === 'down') {
        out.push({ patternId: 'hammer', startIndex: i, endIndex: i, signal: 'bullish_reversal', confidence: 'strong' });
      } else if (t === 'up') {
        out.push({ patternId: 'hanging_man', startIndex: i, endIndex: i, signal: 'bearish_reversal', confidence: 'strong' });
      }
      // flat/unknown → no reliable context, skip.
    } else if (isUpperWickShape(m)) {
      const t = priorTrend(bars, i);
      if (t === 'up') {
        out.push({ patternId: 'shooting_star', startIndex: i, endIndex: i, signal: 'bearish_reversal', confidence: 'strong' });
      } else if (t === 'down') {
        out.push({ patternId: 'inverted_hammer', startIndex: i, endIndex: i, signal: 'bullish_reversal', confidence: 'strong' });
      }
    }

    // ── Two-candle ─────────────────────────────────────────────────────
    if (i >= 1 && M[i - 1] && M[i]) {
      const a = M[i - 1]!; // prior
      const b = m; // current
      const t = priorTrend(bars, i - 1);

      // Engulfing: current body fully covers prior body, opposite colour.
      const bodyEngulfs = b.bodyTop >= a.bodyTop && b.bodyBottom <= a.bodyBottom && b.body > a.body;
      if (bodyEngulfs && a.bear && b.bull) {
        out.push({
          patternId: 'bullish_engulfing',
          startIndex: i - 1,
          endIndex: i,
          signal: 'bullish_reversal',
          // Strongest at the end of a clear downtrend (catalog note).
          confidence: t === 'down' ? 'strong' : 'moderate',
        });
      } else if (bodyEngulfs && a.bull && b.bear) {
        out.push({
          patternId: 'bearish_engulfing',
          startIndex: i - 1,
          endIndex: i,
          signal: 'bearish_reversal',
          confidence: t === 'up' ? 'strong' : 'moderate',
        });
      }

      // Harami: large prior body, small current body fully inside it.
      const insideMother =
        b.bodyTop <= a.bodyTop &&
        b.bodyBottom >= a.bodyBottom &&
        a.body >= LARGE_BODY_RATIO * a.range &&
        b.body <= SMALL_BODY_RATIO * a.body;
      if (insideMother && a.bear && t === 'down') {
        out.push({ patternId: 'bullish_harami', startIndex: i - 1, endIndex: i, signal: 'bullish_reversal', confidence: 'moderate' });
      } else if (insideMother && a.bull && t === 'up') {
        out.push({ patternId: 'bearish_harami', startIndex: i - 1, endIndex: i, signal: 'bearish_reversal', confidence: 'moderate' });
      }
    }

    // ── Three-candle ───────────────────────────────────────────────────
    if (i >= 2 && M[i - 2] && M[i - 1] && M[i]) {
      const a = M[i - 2]!;
      const b = M[i - 1]!;
      const c = m;
      const t = priorTrend(bars, i - 2);

      // Star (gap-relaxed for monthly → moderate): big body, small middle,
      // big opposite body that closes back past the first body's midpoint.
      const aMid = (a.open + a.close) / 2;
      const bSmall = b.body <= SMALL_BODY_RATIO * b.range;

      const morningStar =
        a.bear && a.body >= LARGE_BODY_RATIO * a.range &&
        bSmall && b.bodyTop <= a.bodyBottom + a.body * 0.3 && // middle sits low, near/under the red body
        c.bull && c.body >= LARGE_BODY_RATIO * c.range && c.close >= aMid &&
        (t === 'down' || t === 'flat');
      const eveningStar =
        a.bull && a.body >= LARGE_BODY_RATIO * a.range &&
        bSmall && b.bodyBottom >= a.bodyTop - a.body * 0.3 && // middle sits high, near/above the green body
        c.bear && c.body >= LARGE_BODY_RATIO * c.range && c.close <= aMid &&
        (t === 'up' || t === 'flat');

      if (morningStar) {
        out.push({ patternId: 'morning_star', startIndex: i - 2, endIndex: i, signal: 'bullish_reversal', confidence: 'moderate' });
      } else if (eveningStar) {
        out.push({ patternId: 'evening_star', startIndex: i - 2, endIndex: i, signal: 'bearish_reversal', confidence: 'moderate' });
      }

      // Three soldiers / crows: three strong same-colour bodies, each closing
      // beyond the last, each opening within the prior body (no runaway gap).
      const strong = (x: BarMetrics) => x.body >= LARGE_BODY_RATIO * x.range;
      const opensInside = (cur: BarMetrics, prev: BarMetrics) =>
        cur.open >= prev.bodyBottom && cur.open <= prev.bodyTop;

      const threeSoldiers =
        a.bull && b.bull && c.bull && strong(a) && strong(b) && strong(c) &&
        b.close > a.close && c.close > b.close &&
        opensInside(b, a) && opensInside(c, b);
      const threeCrows =
        a.bear && b.bear && c.bear && strong(a) && strong(b) && strong(c) &&
        b.close < a.close && c.close < b.close &&
        opensInside(b, a) && opensInside(c, b);

      if (threeSoldiers) {
        out.push({ patternId: 'three_white_soldiers', startIndex: i - 2, endIndex: i, signal: 'bullish_reversal', confidence: 'strong' });
      } else if (threeCrows) {
        out.push({ patternId: 'three_black_crows', startIndex: i - 2, endIndex: i, signal: 'bearish_reversal', confidence: 'strong' });
      }
    }
  }

  return out.sort((x, y) => x.endIndex - y.endIndex || x.startIndex - y.startIndex);
}

/**
 * Convenience: when overlapping detections are noisy for a compact UI, keep
 * the most informative one per overlapping cluster — preferring more candles
 * (three > two > one) and then `strong` over `moderate`.
 */
export function dedupeOverlaps(patterns: DetectedPattern[]): DetectedPattern[] {
  const span = (p: DetectedPattern) => p.endIndex - p.startIndex;
  const rank = (p: DetectedPattern) =>
    span(p) * 2 + (p.confidence === 'strong' ? 1 : 0);
  const kept: DetectedPattern[] = [];
  for (const p of [...patterns].sort((a, b) => rank(b) - rank(a))) {
    const clashes = kept.some(
      (k) => p.startIndex <= k.endIndex && k.startIndex <= p.endIndex,
    );
    if (!clashes) kept.push(p);
  }
  return kept.sort((x, y) => x.endIndex - y.endIndex);
}
