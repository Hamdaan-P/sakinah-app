import { describe, it, expect } from 'vitest';
import { dnzToUsd, DNZ_PRICE_INR, USD_INR_RATE, DNZ_USD_RATE } from '@/lib/dnz';

describe('dnz valuation', () => {
  it('exports the documented INR + USD constants', () => {
    expect(DNZ_PRICE_INR).toBe(0.70);
    expect(USD_INR_RATE).toBe(94);
    expect(DNZ_USD_RATE).toBeCloseTo(0.70 / 94, 6);
  });

  it('zero balance is zero USD', () => {
    expect(dnzToUsd(0)).toBe(0);
  });

  it('100 DNZ converts at the documented rate', () => {
    expect(dnzToUsd(100)).toBeCloseTo(100 * DNZ_USD_RATE, 6);
  });

  it('USD value scales linearly with balance', () => {
    expect(dnzToUsd(2000)).toBeCloseTo(2 * dnzToUsd(1000), 6);
  });

  it('handles fractional balances', () => {
    expect(dnzToUsd(0.5)).toBeCloseTo(0.5 * DNZ_USD_RATE, 6);
  });
});
