/**
 * Halal Trading data service — the ONE seam between UI and the data source.
 *
 * Today: serves MOCK data + an in-house screen. To go live, replace the bodies
 * of these functions with calls to indianapi.in (fundamentals + delayed price)
 * — see EIM_V2_PLAN/09_DATA_PROVIDER_F8.md. The UI never imports mock data
 * directly, so the swap is local to this file.
 *
 * The screen here is an ILLUSTRATIVE simplification (debt & cash ratio vs the
 * standard's threshold + a fixed haram-income cap). Production screening is the
 * backend's in-house composer (`eim_shariah_compose.py`), which this will call.
 */

import { MOCK_STOCKS, type RawStock } from '../data/mockStocks';
import {
  COMPLIANCE_STANDARDS,
  STANDARD_META,
  passesStandard,
  type ComplianceRatios,
  type ComplianceResult,
  type ComplianceStandard,
  type OhlcBar,
  type Stock,
} from '../types/trading.types';

/** Haram-income cap shared across standards in this illustrative screen. */
const NON_COMPLIANT_INCOME_MAX_PCT = 5;

/** Screen one stock against one standard from its ratios. */
function screen(ratios: ComplianceRatios, standard: ComplianceStandard): boolean {
  const threshold = STANDARD_META[standard].thresholdPct;
  return (
    ratios.debtToMarketCapPct < threshold &&
    ratios.cashAndInterestSecPct < threshold &&
    ratios.nonCompliantIncomePct < NON_COMPLIANT_INCOME_MAX_PCT
  );
}

function withCompliance(raw: RawStock): Stock {
  const compliance: ComplianceResult[] = COMPLIANCE_STANDARDS.map((standard) => ({
    standard,
    passes: screen(raw.ratios, standard),
  }));
  return { ...raw, compliance };
}

/** Simulate async I/O so swapping to a real fetch later changes nothing for callers. */
function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const tradingService = {
  /** Full screened universe. */
  getStocks(): Promise<Stock[]> {
    return delay(MOCK_STOCKS.map(withCompliance));
  },

  /** One stock by symbol (case-insensitive). */
  getStock(symbol: string): Promise<Stock | undefined> {
    const raw = MOCK_STOCKS.find((s) => s.symbol.toLowerCase() === symbol.toLowerCase());
    return delay(raw ? withCompliance(raw) : undefined);
  },

  /** Stocks that pass a given standard (the Explore grouping). */
  async getStocksByStandard(standard: ComplianceStandard): Promise<Stock[]> {
    const all = await tradingService.getStocks();
    return all.filter((s) => passesStandard(s, standard));
  },

  /**
   * Monthly OHLC series for the detail chart. Deterministic per-symbol pseudo
   * walk (stable across renders) — MOCK only; real impl fetches delayed/EOD
   * history from the provider.
   */
  getMonthlySeries(symbol: string, months = 36): Promise<OhlcBar[]> {
    const raw = MOCK_STOCKS.find((s) => s.symbol.toLowerCase() === symbol.toLowerCase());
    const last = raw?.ltp ?? 1000;
    // Seed an LCG from the symbol so the same stock always charts the same.
    let seed = 0;
    for (const ch of symbol) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0xffffffff;
    };

    // Walk backwards from `last`, then reverse to chronological order.
    const closes: number[] = [];
    let price = last;
    for (let i = 0; i < months; i++) {
      closes.push(price);
      const drift = (rng() - 0.48) * 0.08; // slight upward bias
      price = Math.max(1, price / (1 + drift));
    }
    closes.reverse();

    // Anchor the most recent bar at a fixed sample month (no runtime clock).
    const anchor = { year: 2026, month: 6 };
    const bars: OhlcBar[] = closes.map((close, idx) => {
      const monthsAgo = months - 1 - idx;
      let m = anchor.month - monthsAgo;
      let y = anchor.year;
      while (m <= 0) {
        m += 12;
        y -= 1;
      }
      const open = idx === 0 ? close * (1 + (rng() - 0.5) * 0.04) : closes[idx - 1];
      const high = Math.max(open, close) * (1 + rng() * 0.05);
      const low = Math.min(open, close) * (1 - rng() * 0.05);
      const mm = String(m).padStart(2, '0');
      return {
        time: `${y}-${mm}-01`,
        open: round2(open),
        high: round2(high),
        low: round2(low),
        close: round2(close),
      };
    });
    return delay(bars);
  },
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
