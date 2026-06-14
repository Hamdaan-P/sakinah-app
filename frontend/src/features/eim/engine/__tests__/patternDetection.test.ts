/**
 * Pattern-detection unit tests (EIM Pattern Spotting, Phase A).
 *
 * Synthetic monthly-bar fixtures constructed to exhibit each pattern by design,
 * plus the disambiguation + negative cases that matter pedagogically:
 *   - the SAME candle shape flips hammer↔hanging-man purely by the prior trend;
 *   - a flat/no-trend series must NOT emit trend-dependent reversals.
 *
 * Lead-in bars are deliberately "gentle" (small bodies) so they establish a
 * trend without themselves tripping the strong-body soldier/crow detectors.
 */

import { describe, expect, it } from 'vitest';
import { detectPatterns, dedupeOverlaps } from '../patternDetection';
import type { MonthlyOhlcBar } from '../../types/eim.types';

// [open, high, low, close]
type Row = [number, number, number, number];

function build(rows: Row[]): MonthlyOhlcBar[] {
  return rows.map(([open, high, low, close], i) => ({
    time: `2010-${String((i % 12) + 1).padStart(2, '0')}-01`,
    open,
    high,
    low,
    close,
  }));
}

const ids = (rows: Row[]) => detectPatterns(build(rows)).map((p) => p.patternId);

// Gentle trend lead-ins (small bodies, no special shape) ending at close 100.
const gentleBear = (c: number): Row => [c + 0.6, c + 1.1, c - 0.5, c];
const gentleBull = (c: number): Row => [c - 0.6, c + 0.5, c - 1.1, c];
const DOWN_LEAD: Row[] = [108, 106, 104, 102, 100].map(gentleBear);
const UP_LEAD: Row[] = [92, 94, 96, 98, 100].map(gentleBull);

// A canonical hammer/hanging-man SHAPE: small body up top, long lower wick.
const LOWER_WICK_SHAPE: Row = [100.5, 101.8, 94, 101.5];
// A shooting-star/inverted-hammer SHAPE: small body down low, long upper wick.
const UPPER_WICK_SHAPE: Row = [100, 106, 98.5, 99];

describe('detectPatterns — guards', () => {
  it('returns [] for a series shorter than lookback + 2', () => {
    expect(detectPatterns(build([gentleBear(100), gentleBear(99)]))).toEqual([]);
  });

  it('ignores degenerate flat bars (high === low) without throwing', () => {
    const flat: Row = [100, 100, 100, 100];
    expect(() => detectPatterns(build([...DOWN_LEAD, flat]))).not.toThrow();
  });
});

describe('detectPatterns — single candle (shape + context)', () => {
  it('long lower wick after a DOWNtrend → hammer (not hanging man)', () => {
    const got = ids([...DOWN_LEAD, LOWER_WICK_SHAPE]);
    expect(got).toContain('hammer');
    expect(got).not.toContain('hanging_man');
  });

  it('the SAME shape after an UPtrend → hanging man (not hammer)', () => {
    const got = ids([...UP_LEAD, LOWER_WICK_SHAPE]);
    expect(got).toContain('hanging_man');
    expect(got).not.toContain('hammer');
  });

  it('long upper wick after an UPtrend → shooting star', () => {
    expect(ids([...UP_LEAD, UPPER_WICK_SHAPE])).toContain('shooting_star');
  });

  it('long upper wick after a DOWNtrend → inverted hammer', () => {
    expect(ids([...DOWN_LEAD, UPPER_WICK_SHAPE])).toContain('inverted_hammer');
  });

  it('doji at a trend extreme is detected as strong', () => {
    const doji: Row = [100, 103, 97, 100.05];
    const det = detectPatterns(build([...DOWN_LEAD, doji])).find((p) => p.patternId === 'doji');
    expect(det).toBeDefined();
    expect(det!.signal).toBe('indecision');
    expect(det!.confidence).toBe('strong');
  });
});

describe('detectPatterns — two candle', () => {
  it('bullish engulfing after a downtrend', () => {
    const smallBear: Row = [101, 101.5, 97.5, 98];
    const bigBull: Row = [97, 103.5, 96.5, 103];
    expect(ids([...DOWN_LEAD, smallBear, bigBull])).toContain('bullish_engulfing');
  });

  it('bearish engulfing after an uptrend', () => {
    const smallBull: Row = [100, 103.5, 99.5, 103];
    const bigBear: Row = [104, 104.5, 97.5, 98];
    expect(ids([...UP_LEAD, smallBull, bigBear])).toContain('bearish_engulfing');
  });

  it('bullish harami after a downtrend (small body inside the prior big red)', () => {
    const bigBear: Row = [108, 108.5, 97.5, 98];
    const smallInside: Row = [102, 104.5, 101.5, 104];
    expect(ids([...DOWN_LEAD, bigBear, smallInside])).toContain('bullish_harami');
  });

  it('bearish harami after an uptrend', () => {
    const bigBull: Row = [92, 102.5, 91.5, 102];
    const smallInside: Row = [98, 98.5, 95.5, 96];
    expect(ids([...UP_LEAD, bigBull, smallInside])).toContain('bearish_harami');
  });
});

describe('detectPatterns — three candle', () => {
  it('morning star after a downtrend (moderate confidence)', () => {
    const bigBear: Row = [106, 106.5, 97.5, 98];
    const star: Row = [96, 97, 93, 96.5];
    const bigBull: Row = [97, 103.5, 96.5, 103];
    const det = detectPatterns(build([...DOWN_LEAD, bigBear, star, bigBull])).find(
      (p) => p.patternId === 'morning_star',
    );
    expect(det).toBeDefined();
    expect(det!.confidence).toBe('moderate');
  });

  it('evening star after an uptrend', () => {
    const bigBull: Row = [98, 108.5, 97.5, 108];
    const star: Row = [110, 111, 109, 110.5];
    const bigBear: Row = [109, 109.5, 100.5, 101];
    expect(ids([...UP_LEAD, bigBull, star, bigBear])).toContain('evening_star');
  });

  it('three white soldiers', () => {
    const s1: Row = [101, 107.5, 100.5, 107];
    const s2: Row = [104, 112.5, 103.5, 112];
    const s3: Row = [109, 118.5, 108.5, 118];
    const det = detectPatterns(build([...DOWN_LEAD, s1, s2, s3])).find(
      (p) => p.patternId === 'three_white_soldiers',
    );
    expect(det).toBeDefined();
    expect(det!.confidence).toBe('strong');
  });

  it('three black crows', () => {
    const c1: Row = [99, 99.5, 92.5, 93];
    const c2: Row = [96, 96.5, 87.5, 88];
    const c3: Row = [91, 91.5, 82.5, 83];
    expect(ids([...UP_LEAD, c1, c2, c3])).toContain('three_black_crows');
  });
});

describe('detectPatterns — negative / honesty', () => {
  it('a flat series does NOT emit trend-dependent reversals', () => {
    const flatBull = (c: number): Row => [c - 0.15, c + 0.25, c - 0.55, c + 0.15];
    const FLAT_LEAD: Row[] = [100, 100, 100, 100, 100].map(flatBull);
    const got = ids([...FLAT_LEAD, LOWER_WICK_SHAPE]);
    expect(got).not.toContain('hammer');
    expect(got).not.toContain('hanging_man');
  });
});

describe('dedupeOverlaps', () => {
  it('keeps the higher-candle-count pattern when ranges overlap', () => {
    const overlapping = [
      { patternId: 'hammer', startIndex: 7, endIndex: 7, signal: 'bullish_reversal', confidence: 'strong' },
      { patternId: 'morning_star', startIndex: 5, endIndex: 7, signal: 'bullish_reversal', confidence: 'moderate' },
    ] as const;
    const kept = dedupeOverlaps([...overlapping]);
    expect(kept).toHaveLength(1);
    expect(kept[0].patternId).toBe('morning_star');
  });
});
