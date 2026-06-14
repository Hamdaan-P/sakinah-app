/**
 * Halal Trading — domain types (EIM v2, T1 read-only terminal).
 *
 * This is the SEPARATE "Halal Trading" product section (Model A / A1). v1 is
 * read-first: browse Shariah-screened stocks, see compliance, chart, watchlist.
 * No orders, no broker, no KYC yet (those are T2/T3, ★-gated).
 *
 * Data is currently MOCK (see ../data/mockStocks). The service layer is the
 * single seam to swap in a real provider (indianapi.in — see
 * EIM_V2_PLAN/09_DATA_PROVIDER_F8.md) without touching UI.
 */

/** The three Shariah-screening standards surfaced in the terminal, loosest→strictest. */
export type ComplianceStandard = 'DJIM' | 'AAOIFI' | 'TASIS';

export const COMPLIANCE_STANDARDS: ComplianceStandard[] = ['DJIM', 'AAOIFI', 'TASIS'];

/** Human labels + the (illustrative) debt-ratio threshold each standard applies. */
export const STANDARD_META: Record<
  ComplianceStandard,
  { label: string; thresholdPct: number; note: string }
> = {
  DJIM: { label: 'DJIM', thresholdPct: 33, note: 'Dow Jones Islamic — 33%' },
  AAOIFI: { label: 'AAOIFI', thresholdPct: 30, note: 'AAOIFI — 30%' },
  TASIS: { label: 'TASIS', thresholdPct: 25, note: 'TASIS (India) — 25%, strictest' },
};

/** Financial ratios used by the screen (all as percentages). */
export interface ComplianceRatios {
  /** interest-bearing debt / market cap */
  debtToMarketCapPct: number;
  /** (cash + interest-bearing securities) / market cap */
  cashAndInterestSecPct: number;
  /** non-compliant (haram) income / total revenue */
  nonCompliantIncomePct: number;
}

/** Result of screening one stock against one standard. */
export interface ComplianceResult {
  standard: ComplianceStandard;
  passes: boolean;
}

export interface Stock {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  /** last traded price — illustrative/delayed, not live */
  ltp: number;
  /** day change, percent */
  changePct: number;
  currency: 'INR';
  /** market cap in ₹ crore */
  marketCapCr: number;
  ratios: ComplianceRatios;
  /** computed per-standard screen result */
  compliance: ComplianceResult[];
  /** ISO date the screen was last run */
  lastScreened: string;
}

/** One monthly OHLC bar for the detail chart. `time` is an ISO `YYYY-MM-DD`. */
export interface OhlcBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

/** Convenience: does a stock pass a given standard? */
export function passesStandard(stock: Stock, standard: ComplianceStandard): boolean {
  return stock.compliance.find((c) => c.standard === standard)?.passes ?? false;
}

/** The standards a stock passes, loosest→strictest. */
export function passedStandards(stock: Stock): ComplianceStandard[] {
  return COMPLIANCE_STANDARDS.filter((s) => passesStandard(stock, s));
}
