/**
 * Shariah Compliance Data Models
 * Based on AAOIFI Shariah Standards (SS 21: Financial Paper, SS 27: Indices)
 * and TASIS Screening Methodology (Taqwaa Advisory, India)
 *
 * Implements 3-stage screening pipeline:
 *   Stage 1: Primary Screening (data quality)
 *   Stage 2: Business Screening (halal/haram activity)
 *   Stage 3: Financial Screening (debt, interest, receivables ratios)
 * Plus: Purification calculation for impure income
 */

// ==================== Screening Standards ====================

export type ScreeningStandard = 'AAOIFI' | 'TASIS';

/**
 * Thresholds per standard — based on actual published norms.
 *
 * AAOIFI (SS 21): Global Islamic finance standard
 * TASIS: Conservative Indian-market standard (stricter)
 */
export const SCREENING_THRESHOLDS: Record<ScreeningStandard, {
  debtToTotalAssetsLimit: number;
  interestIncomeLimit: number;
  cashReceivablesToAssetsLimit: number;
  interestInvestmentAssumedReturn: number;
  label: string;
  description: string;
}> = {
  AAOIFI: {
    debtToTotalAssetsLimit: 30,        // < 30% (some scholars use 33% — 1/3 hadith)
    interestIncomeLimit: 5,            // < 5% of total revenue
    cashReceivablesToAssetsLimit: 70,  // Cash+Receivables < 70% (illiquid > 30%)
    interestInvestmentAssumedReturn: 0, // Not used — direct interest income only
    label: 'AAOIFI Global',
    description: 'Accounting & Auditing Organization for Islamic Financial Institutions — globally accepted standard',
  },
  TASIS: {
    debtToTotalAssetsLimit: 25,        // ≤ 25% of total assets (stricter than 33%)
    interestIncomeLimit: 3,            // ≤ 3% of total income (interest + 8% of investments)
    cashReceivablesToAssetsLimit: 90,  // ≤ 90% of total assets
    interestInvestmentAssumedReturn: 8, // 8% assumed return on interest-based investments
    label: 'TASIS Conservative',
    description: 'Taqwaa Advisory & Shariah Investment Solutions — conservative standard for Indian market',
  },
};

// ==================== Haram Industries ====================

/**
 * Non-permissible business activities per AAOIFI SS 21 + TASIS Chapter 6.7.2.
 * Companies whose PRIMARY business falls in these categories are excluded.
 */
export const HARAM_INDUSTRY_CATEGORIES = [
  // Universally haram (AAOIFI + TASIS agree)
  { id: 'conventional_banking', label: 'Conventional Banking & Financial Services', source: 'AAOIFI + TASIS' },
  { id: 'conventional_insurance', label: 'Conventional Insurance', source: 'AAOIFI + TASIS' },
  { id: 'alcohol', label: 'Alcohol / Beer Production & Distribution', source: 'AAOIFI + TASIS' },
  { id: 'tobacco', label: 'Tobacco Products', source: 'AAOIFI + TASIS' },
  { id: 'gambling', label: 'Gambling / Casinos', source: 'AAOIFI + TASIS' },
  { id: 'pornography', label: 'Pornography / Adult Entertainment', source: 'AAOIFI + TASIS' },
  { id: 'pork', label: 'Pork & Non-Halal Meat Processing', source: 'AAOIFI + TASIS' },
  { id: 'weapons', label: 'Weapons & Ammunition Manufacturing', source: 'AAOIFI + TASIS' },
  { id: 'interest_lending', label: 'Interest-Based Lending / Financing', source: 'AAOIFI + TASIS' },
  // TASIS additional (India-specific)
  { id: 'auto_financing', label: 'Auto Financing Services', source: 'TASIS' },
  { id: 'housing_financing', label: 'Housing Financing Services', source: 'TASIS' },
  { id: 'infra_financing', label: 'Infrastructural Financing Services', source: 'TASIS' },
  { id: 'securities_broking', label: 'Securities Broking (Conventional)', source: 'TASIS' },
  { id: 'asset_financing', label: 'Other Asset Financing Services', source: 'TASIS' },
  { id: 'fee_financial', label: 'Other Fee-Based Financial Services', source: 'TASIS' },
  { id: 'fund_financial', label: 'Other Fund-Based Financial Services', source: 'TASIS' },
  { id: 'hotels_restaurants', label: 'Hotels & Restaurants (Alcohol-Serving)', source: 'TASIS' },
  { id: 'media_broadcasting', label: 'Media — Broadcasting (Non-Compliant)', source: 'TASIS' },
  { id: 'media_content', label: 'Media — Content Production (Non-Compliant)', source: 'TASIS' },
  { id: 'animation', label: 'Animation Content Provider', source: 'TASIS' },
  { id: 'film_production', label: 'Production & Distribution of Films', source: 'TASIS' },
  { id: 'recreational', label: 'Other Recreational Services (Non-Compliant)', source: 'TASIS' },
  { id: 'poultry_meat', label: 'Poultry & Meat Products (Non-Halal)', source: 'TASIS' },
] as const;

export type HaramIndustryId = typeof HARAM_INDUSTRY_CATEGORIES[number]['id'];

// ==================== Company Financials ====================

/** Raw financial data needed for screening — sourced from annual reports / data providers */
export interface CompanyFinancials {
  // Identification
  symbol: string;
  name: string;
  isinCode?: string;
  industryGroup: string;
  mainProductService: string;
  sector?: string;
  exchange?: string;  // BSE, NSE, etc.

  // Primary Screening fields
  latestAnnualReportYear: number;      // Must be within last 3 years
  totalAssets: number;                 // Must be > 0
  totalIncome: number;                 // Must be > 0 (total revenue)

  // Financial Screening fields
  totalDebt: number;                   // Secured + unsecured borrowings + preference capital
  interestIncome: number;              // Interest income from all sources
  interestBasedInvestments: number;    // Investments in interest-bearing instruments
  cashAndBankBalance: number;          // Cash + bank balances
  accountsReceivables: number;         // Current + long-term receivables
  totalExpenses: number;
  totalLiabilities: number;

  // Market & share data
  sharesOutstanding: number;           // For purification calculation
  marketCap: number;
  closingPrice: number;
  eps: number;
  equityFaceValue: number;
  dividendYield?: number;

  // Metadata
  bseGroup?: string;
  bseScripCode?: string;
  nseSymbol?: string;
  firstTradingDate?: string;
  isSuspended?: boolean;
  suspendedDate?: string;
  delistedDate?: string;
}

// ==================== Screening Results ====================

/** Stage 1: Primary Screening — data quality checks */
export interface PrimaryScreeningResult {
  hasRecentFinancials: boolean;   // Annual report within last 3 years
  hasNonZeroAssets: boolean;      // Total assets > 0
  hasNonZeroIncome: boolean;      // Total income > 0
  passed: boolean;                // All three must pass
  failureReasons: string[];
}

/** Stage 2: Business Screening — halal/haram activity classification */
export interface BusinessScreeningResult {
  industryGroup: string;
  mainProductService: string;
  primaryBusinessCompliant: boolean;    // Not in haram categories
  secondaryBusinessCompliant: boolean;  // No prohibited secondary activities
  haramCategoryMatched?: string;        // Which category it failed on
  passed: boolean;
  failureReasons: string[];
}

/** Stage 3: Financial Screening — 3 ratio checks */
export interface FinancialScreeningResult {
  standard: ScreeningStandard;

  // Computed ratio values (as percentages)
  debtToTotalAssets: number;           // (TotalDebt / TotalAssets) × 100
  interestIncomeRatio: number;         // ((IntIncome + X% × IntInvestments) / TotalIncome) × 100
  cashReceivablesToAssets: number;     // ((Cash + Receivables) / TotalAssets) × 100

  // Thresholds used
  thresholds: {
    debtLimit: number;
    interestLimit: number;
    receivablesLimit: number;
  };

  // Individual pass/fail
  debtPassed: boolean;
  interestPassed: boolean;
  receivablesPassed: boolean;

  // Combined — ALL three must pass (TASIS: failing ANY ONE = non-compliant)
  allPassed: boolean;

  failureReasons: string[];
}

/** Purification / Purging calculation */
export interface PurificationResult {
  // TASIS method
  interestIncomePerSharePerDay: number;  // (IntIncome × 10^6) / SharesOutstanding / 365
  // Investor-specific (needs user input: shares owned, days held)
  formula: string;

  // AAOIFI/S&P method (per-dividend)
  impureIncomeRatio: number;             // NonPermissibleRevenue / TotalRevenue
  purificationPerDividend: number;       // DividendPerShare × impureIncomeRatio
}

/** Complete screening result for one company */
export interface ShariahScreeningResult {
  symbol: string;
  companyName: string;

  // 3-stage results
  primaryScreening: PrimaryScreeningResult;
  businessScreening: BusinessScreeningResult;
  financialScreening: FinancialScreeningResult;

  // Overall
  isCompliant: boolean;
  complianceStage: 'failed_primary' | 'failed_business' | 'failed_financial' | 'compliant';
  nonComplianceReasons: string[];

  // Purification (only relevant if compliant — interest income must be purged)
  purification: PurificationResult;

  // Metadata
  screenedAt: string;
  standard: ScreeningStandard;
}

// ==================== Legacy Compatibility ====================

/**
 * Legacy ShariahData interface for backward compat with existing JSON data loading.
 * New code should use ShariahScreeningResult.
 */
export interface ShariahData {
  fundamentals: Record<string, unknown>;
  calculations: Record<string, number>;
  checks: Record<string, boolean>;
  isCompliant: boolean;
  lastUpdated: string;
  nonComplianceReason?: string;
  businessScreening?: Record<string, unknown>;
  // New: enriched screening result (if available)
  screeningResult?: ShariahScreeningResult;
}

export interface ShariahComplianceData {
  lastUpdated: string;
  stocks: Record<string, ShariahData>;
}

// ==================== Parsing ====================

function safeToNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'infinity') return 0;
    if (value.toLowerCase() === '-infinity') return 0;
    if (value.toLowerCase() === 'nan') return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === 'number') {
    return isFinite(value) ? value : 0;
  }
  return 0;
}

export function parseShariahData(json: Record<string, unknown>): ShariahData {
  const rawCalcs = (json.calculations as Record<string, unknown>) ?? {};
  const calculations: Record<string, number> = {};
  for (const [key, val] of Object.entries(rawCalcs)) {
    calculations[key] = safeToNumber(val);
  }

  return {
    fundamentals: (json.fundamentals as Record<string, unknown>) ?? {},
    calculations,
    checks: (json.checks as Record<string, boolean>) ?? {},
    isCompliant: (json.shariahCompliant as boolean) ?? false,
    lastUpdated: (json.lastUpdated as string) ?? '',
    nonComplianceReason: json.nonComplianceReason as string | undefined,
    businessScreening: json.businessScreening as Record<string, unknown> | undefined,
    screeningResult: json.screeningResult as ShariahScreeningResult | undefined,
  };
}

export function parseShariahComplianceData(json: Record<string, unknown>): ShariahComplianceData {
  const stocksRaw = (json.stocks as Record<string, Record<string, unknown>>) ?? {};
  const stocks: Record<string, ShariahData> = {};

  for (const [symbol, data] of Object.entries(stocksRaw)) {
    try {
      stocks[symbol] = parseShariahData(data);
    } catch {
      // Skip malformed entries
    }
  }

  return {
    lastUpdated: (json.lastUpdated as string) ?? '',
    stocks,
  };
}

// ==================== Helpers ====================

/**
 * Generate human-readable compliance reason based on AAOIFI/TASIS criteria.
 * Updated to use correct ratio names and thresholds.
 */
export function getComplianceReason(data: ShariahData): string {
  // If we have a full screening result, use it
  if (data.screeningResult) {
    const sr = data.screeningResult;
    if (sr.isCompliant) return 'Meets all Shariah compliance criteria per ' + sr.standard;
    return sr.nonComplianceReasons.join('; ');
  }

  if (data.isCompliant) return 'Meets all Shariah compliance criteria';
  if (data.nonComplianceReason) return data.nonComplianceReason;

  // Business screening failure
  if (data.businessScreening?.failed) {
    const biz = data.businessScreening.primaryBusiness ?? 'Unknown';
    return `Primary business "${biz}" is in a non-permissible industry category`;
  }

  if (!(data.checks.businessActivityCheck ?? true)) {
    return 'Business activity is not Shariah compliant (AAOIFI SS 21)';
  }

  const reasons: string[] = [];

  // Updated: use correct AAOIFI/TASIS ratio names
  if (data.checks.debtToTotalAssetsCheck === false) {
    const r = (data.calculations.debtToTotalAssets ?? 0).toFixed(1);
    reasons.push(`Debt/Total Assets = ${r}% (exceeds limit)`);
  }
  // Legacy fallback for old data format
  if (data.checks.debtToEquityCheck === false) {
    const r = ((data.calculations.debtToEquity ?? 0) * 100).toFixed(1);
    reasons.push(`Debt/Equity ratio = ${r}% (exceeds 33%)`);
  }
  if (data.checks.debtToMarketCapCheck === false) {
    const r = ((data.calculations.debtToMarketCap ?? 0) * 100).toFixed(1);
    reasons.push(`Debt/Market Cap = ${r}% (exceeds 33%)`);
  }
  if (data.checks.interestIncomeCheck === false) {
    const r = (data.calculations.interestIncomeRatio ?? 0).toFixed(1);
    reasons.push(`Interest income ratio = ${r}% (exceeds limit)`);
  }
  // Legacy fallback
  if (data.checks.interestToRevenueCheck === false) {
    const r = ((data.calculations.interestToRevenue ?? 0) * 100).toFixed(1);
    reasons.push(`Interest/Revenue = ${r}% (exceeds 5%)`);
  }
  if (data.checks.cashReceivablesCheck === false) {
    const r = (data.calculations.cashReceivablesToAssets ?? 0).toFixed(1);
    reasons.push(`Cash+Receivables/Assets = ${r}% (exceeds limit)`);
  }
  // Legacy fallback
  if (data.checks.receivablesToMarketCapCheck === false) {
    const r = ((data.calculations.receivablesToMarketCap ?? 0) * 100).toFixed(1);
    reasons.push(`Receivables/Market Cap = ${r}% (exceeds 33%)`);
  }

  return reasons.join('; ') || 'Does not meet compliance criteria';
}

/** Look up a symbol with flexible matching (case-insensitive, with/without .NS suffix) */
export function getDataForSymbol(data: ShariahComplianceData, symbol: string): ShariahData | undefined {
  let result = data.stocks[symbol];
  if (result) return result;

  if (symbol.endsWith('.NS')) {
    result = data.stocks[symbol.slice(0, -3)];
    if (result) return result;
  }

  const upper = symbol.toUpperCase();
  result = data.stocks[upper];
  if (result) return result;

  if (upper.endsWith('.NS')) {
    result = data.stocks[upper.slice(0, -3)];
    if (result) return result;
  }

  return undefined;
}

export function isSymbolCompliant(data: ShariahComplianceData, symbol: string): boolean {
  return getDataForSymbol(data, symbol)?.isCompliant ?? false;
}
