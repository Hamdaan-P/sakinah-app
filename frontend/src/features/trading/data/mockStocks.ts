/**
 * MOCK stock universe for the read-only Halal Trading terminal (T1).
 *
 * ⚠️ ILLUSTRATIVE SAMPLE DATA — NOT live prices and NOT certified Shariah
 * rulings. Numbers are plausible but invented to exercise the UI across the
 * full compliance spectrum (passes-all → DJIM-only → fails-all). Replace this
 * whole module with a real feed (indianapi.in) behind ../services/trading.service.
 *
 * Ratios drive the screen (computed in the service), so changing a number here
 * changes which standards a stock passes — the grouping is real logic, not a
 * hardcoded label.
 */

import type { ComplianceRatios, Stock } from '../types/trading.types';

export type RawStock = Omit<Stock, 'compliance'>;

const r = (
  debtToMarketCapPct: number,
  cashAndInterestSecPct: number,
  nonCompliantIncomePct: number,
): ComplianceRatios => ({ debtToMarketCapPct, cashAndInterestSecPct, nonCompliantIncomePct });

/** Last-screened date kept as a fixed sample value (no runtime clock needed). */
const SCREENED = '2026-05-30';

export const MOCK_STOCKS: RawStock[] = [
  // ── Passes all three standards (debt & cash < 25%, haram income < 5%) ──
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'Information Technology', ltp: 3512.4, changePct: 1.2, currency: 'INR', marketCapCr: 1290000, ratios: r(2, 8, 1.0), lastScreened: SCREENED },
  { symbol: 'INFY', name: 'Infosys', exchange: 'NSE', sector: 'Information Technology', ltp: 1480.1, changePct: -0.4, currency: 'INR', marketCapCr: 615000, ratios: r(1, 12, 0.8), lastScreened: SCREENED },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', exchange: 'NSE', sector: 'FMCG', ltp: 2440.0, changePct: 0.3, currency: 'INR', marketCapCr: 573000, ratios: r(3, 6, 2.0), lastScreened: SCREENED },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', exchange: 'NSE', sector: 'Pharmaceuticals', ltp: 1620.7, changePct: 0.9, currency: 'INR', marketCapCr: 389000, ratios: r(6, 14, 2.0), lastScreened: SCREENED },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', exchange: 'NSE', sector: 'Materials', ltp: 2890.3, changePct: 0.4, currency: 'INR', marketCapCr: 277000, ratios: r(7, 16, 1.0), lastScreened: SCREENED },
  { symbol: 'TITAN', name: 'Titan Company', exchange: 'NSE', sector: 'Consumer Durables', ltp: 3380.9, changePct: -0.2, currency: 'INR', marketCapCr: 300000, ratios: r(18, 20, 3.0), lastScreened: SCREENED },
  { symbol: 'DMART', name: 'Avenue Supermarts', exchange: 'NSE', sector: 'Retail', ltp: 4100.5, changePct: 0.7, currency: 'INR', marketCapCr: 267000, ratios: r(4, 9, 1.0), lastScreened: SCREENED },

  // ── Passes DJIM (33) + AAOIFI (30) but FAILS TASIS (25, strictest) ──
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', exchange: 'NSE', sector: 'Materials', ltp: 10200.0, changePct: 0.6, currency: 'INR', marketCapCr: 295000, ratios: r(28, 12, 1.0), lastScreened: SCREENED },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', exchange: 'NSE', sector: 'Automobile', ltp: 12800.2, changePct: 0.5, currency: 'INR', marketCapCr: 402000, ratios: r(5, 26, 1.0), lastScreened: SCREENED },

  // ── Passes DJIM (33) only — fails AAOIFI (30) & TASIS (25) ──
  { symbol: 'TATAMOTORS', name: 'Tata Motors', exchange: 'NSE', sector: 'Automobile', ltp: 985.6, changePct: 1.5, currency: 'INR', marketCapCr: 327000, ratios: r(31, 10, 2.0), lastScreened: SCREENED },

  // ── Fails all standards (financials: interest-based business model) ──
  { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', sector: 'Financials', ltp: 1690.4, changePct: 0.2, currency: 'INR', marketCapCr: 1280000, ratios: r(85, 60, 100), lastScreened: SCREENED },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', exchange: 'NSE', sector: 'Financials', ltp: 7180.0, changePct: -0.6, currency: 'INR', marketCapCr: 444000, ratios: r(90, 70, 100), lastScreened: SCREENED },
];
