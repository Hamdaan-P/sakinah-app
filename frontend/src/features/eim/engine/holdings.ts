/**
 * Aggregate open FIFO lots into per-ticker HoldingSummary.
 *
 * Mirror of `eim_sim_primitives.holdings_summary()` on the backend.
 * Pure, no I/O — used by the DecisionModal and any other UI that
 * needs "current holdings per ticker" from a portfolio snapshot.
 */

import type { HoldingSummary, Portfolio } from '../types/eim.types';

const FILL_EPSILON = 1e-6;

export function computeHoldings(portfolio: Portfolio): HoldingSummary[] {
  const byTicker = new Map<string, { totalQty: number; weightedCost: number; lotCount: number }>();
  for (const p of portfolio.positions) {
    if (p.qty <= FILL_EPSILON) continue;
    const slot = byTicker.get(p.ticker) ?? { totalQty: 0, weightedCost: 0, lotCount: 0 };
    slot.totalQty += p.qty;
    slot.weightedCost += p.qty * p.buy_price;
    slot.lotCount += 1;
    byTicker.set(p.ticker, slot);
  }
  const out: HoldingSummary[] = [];
  for (const [ticker, slot] of byTicker.entries()) {
    if (slot.totalQty <= FILL_EPSILON) continue;
    out.push({
      ticker,
      total_qty: slot.totalQty,
      avg_cost: slot.weightedCost / slot.totalQty,
      lot_count: slot.lotCount,
    });
  }
  return out.sort((a, b) => a.ticker.localeCompare(b.ticker));
}
