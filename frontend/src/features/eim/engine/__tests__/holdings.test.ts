/**
 * Holdings aggregation — pure logic test (Sprint 2.5).
 * Mirrors backend `test_eim_sim_primitives::test_holdings_summary_*`.
 */

import { describe, expect, it } from 'vitest';
import { computeHoldings } from '../holdings';
import type { Portfolio } from '../../types/eim.types';

function makePortfolio(positions: Array<{ ticker: string; qty: number; buy_price: number; buy_date: string }>): Portfolio {
  return {
    id: 'pf_test',
    user_id: 'u_test',
    name: 'Test',
    created_at: '2026-01-01T00:00:00Z',
    positions: positions.map((p, i) => ({
      id: `pos_${i}`,
      portfolio_id: 'pf_test',
      ticker: p.ticker,
      qty: p.qty,
      buy_price: p.buy_price,
      buy_date: p.buy_date,
      tier: 'free' as const,
    })),
    tier: 'free',
    cash_balance: 0,
    currency: 'USD',
    transactions: [],
  };
}

describe('computeHoldings', () => {
  it('empty portfolio returns empty array', () => {
    expect(computeHoldings(makePortfolio([]))).toEqual([]);
  });

  it('single lot returns one summary with avg_cost = buy_price', () => {
    const h = computeHoldings(makePortfolio([
      { ticker: 'AAPL', qty: 10, buy_price: 100, buy_date: '2026-01-01' },
    ]));
    expect(h).toEqual([
      { ticker: 'AAPL', total_qty: 10, avg_cost: 100, lot_count: 1 },
    ]);
  });

  it('multi-lot same ticker computes qty-weighted avg_cost', () => {
    const h = computeHoldings(makePortfolio([
      { ticker: 'AAPL', qty: 10, buy_price: 100, buy_date: '2026-01-01' },
      { ticker: 'AAPL', qty: 20, buy_price: 150, buy_date: '2026-02-01' },
    ]));
    expect(h).toHaveLength(1);
    expect(h[0].ticker).toBe('AAPL');
    expect(h[0].total_qty).toBe(30);
    expect(h[0].avg_cost).toBeCloseTo(133.333, 2); // (10*100 + 20*150) / 30
    expect(h[0].lot_count).toBe(2);
  });

  it('multi-ticker returns sorted by ticker', () => {
    const h = computeHoldings(makePortfolio([
      { ticker: 'MSFT', qty: 5, buy_price: 200, buy_date: '2026-01-01' },
      { ticker: 'AAPL', qty: 10, buy_price: 100, buy_date: '2026-01-01' },
      { ticker: 'NVDA', qty: 3, buy_price: 500, buy_date: '2026-01-01' },
    ]));
    expect(h.map((x) => x.ticker)).toEqual(['AAPL', 'MSFT', 'NVDA']);
  });

  it('skips lots with zero qty (fully consumed)', () => {
    const h = computeHoldings(makePortfolio([
      { ticker: 'AAPL', qty: 0, buy_price: 100, buy_date: '2026-01-01' },
      { ticker: 'AAPL', qty: 5, buy_price: 150, buy_date: '2026-02-01' },
    ]));
    expect(h).toHaveLength(1);
    expect(h[0].total_qty).toBe(5);
    expect(h[0].avg_cost).toBe(150);
    expect(h[0].lot_count).toBe(1); // only the non-zero lot counts
  });
});
