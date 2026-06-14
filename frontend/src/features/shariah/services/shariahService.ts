/**
 * Shariah Screening Service
 * Based on AAOIFI Shariah Standards (SS 21, SS 27) & TASIS Methodology
 *
 * Implements the full 3-stage screening pipeline:
 *   Stage 1: Primary Screening (data quality)
 *   Stage 2: Business Screening (halal/haram classification)
 *   Stage 3: Financial Screening (3 ratio tests)
 * Plus: Purification calculator
 */

import type {
  ShariahComplianceData,
  ShariahData,
  CompanyFinancials,
  ShariahScreeningResult,
  PrimaryScreeningResult,
  BusinessScreeningResult,
  FinancialScreeningResult,
  PurificationResult,
  ScreeningStandard,
} from '../types/shariahData';
import {
  parseShariahComplianceData,
  getDataForSymbol,
  getComplianceReason,
  SCREENING_THRESHOLDS,
  HARAM_INDUSTRY_CATEGORIES,
} from '../types/shariahData';

// ==================== Singleton State ====================

let _complianceData: ShariahComplianceData | null = null;
let _isLoading = false;
let _error: string | null = null;
let _activeStandard: ScreeningStandard = 'AAOIFI';

// ==================== Standard Selection ====================

export function getActiveStandard(): ScreeningStandard {
  return _activeStandard;
}

export function setActiveStandard(standard: ScreeningStandard): void {
  _activeStandard = standard;
}

export function getStandardInfo(standard?: ScreeningStandard) {
  const s = standard ?? _activeStandard;
  return SCREENING_THRESHOLDS[s];
}

// ==================== Data Loading ====================

export async function initializeShariahData(jsonUrl = '/data/shariah_compliance_data.json'): Promise<void> {
  if (_complianceData) return;

  _isLoading = true;
  _error = null;

  try {
    const res = await fetch(jsonUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    _complianceData = parseShariahComplianceData(json);
  } catch (e) {
    _error = `Error loading Shariah compliance data: ${e}`;
  } finally {
    _isLoading = false;
  }
}

export async function reloadShariahData(jsonUrl?: string): Promise<void> {
  _complianceData = null;
  await initializeShariahData(jsonUrl);
}

// ==================== Queries (Legacy + New) ====================

export function hasShariahData(): boolean {
  return _complianceData != null;
}

export function isShariahLoading(): boolean {
  return _isLoading;
}

export function getShariahError(): string | null {
  return _error;
}

export function getStockData(symbol: string): ShariahData | undefined {
  if (!_complianceData) return undefined;
  return getDataForSymbol(_complianceData, symbol);
}

export function isCompliant(symbol: string): boolean {
  if (!_complianceData) return false;
  return getDataForSymbol(_complianceData, symbol)?.isCompliant ?? false;
}

export function getComplianceDetails(symbol: string): {
  isCompliant: boolean;
  reason: string;
  lastUpdated: string | null;
  calculations: Record<string, number>;
  checks: Record<string, boolean>;
  screeningResult?: ShariahScreeningResult;
} {
  const data = getStockData(symbol);
  if (!data) {
    return {
      isCompliant: false,
      reason: 'No compliance data available',
      lastUpdated: null,
      calculations: {},
      checks: {},
    };
  }

  return {
    isCompliant: data.isCompliant,
    reason: getComplianceReason(data),
    lastUpdated: data.lastUpdated,
    calculations: data.calculations,
    checks: data.checks,
    screeningResult: data.screeningResult,
  };
}

export function getCompliantStocks(): string[] {
  if (!_complianceData) return [];
  return Object.entries(_complianceData.stocks)
    .filter(([, d]) => d.isCompliant)
    .map(([sym]) => sym);
}

export function getNonCompliantStocks(): string[] {
  if (!_complianceData) return [];
  return Object.entries(_complianceData.stocks)
    .filter(([, d]) => !d.isCompliant)
    .map(([sym]) => sym);
}

export function getTotalStocksCount(): number {
  return _complianceData ? Object.keys(_complianceData.stocks).length : 0;
}

export function getCompliantStocksCount(): number {
  return getCompliantStocks().length;
}

export function getCompliancePercentage(): number {
  const total = getTotalStocksCount();
  if (total === 0) return 0;
  return (getCompliantStocksCount() / total) * 100;
}

export function getLastUpdated(): string | null {
  return _complianceData?.lastUpdated ?? null;
}

// ==================== 3-STAGE SCREENING ENGINE ====================

/**
 * Screen a company through the full AAOIFI/TASIS 3-stage pipeline.
 *
 * Stage 1: Primary Screening — Check data quality
 * Stage 2: Business Screening — Check if industry is halal
 * Stage 3: Financial Screening — Check 3 financial ratios
 *
 * A company must pass ALL stages to be deemed Shariah compliant.
 */
export function screenCompany(
  financials: CompanyFinancials,
  standard: ScreeningStandard = _activeStandard,
): ShariahScreeningResult {
  const currentYear = new Date().getFullYear();

  // Stage 1: Primary Screening
  const primary = performPrimaryScreening(financials, currentYear);

  // Stage 2: Business Screening (only if primary passed)
  const business = performBusinessScreening(financials, standard);

  // Stage 3: Financial Screening (only if business passed)
  const financial = performFinancialScreening(financials, standard);

  // Purification calculation
  const purification = calculatePurification(financials);

  // Determine overall compliance
  let isOverallCompliant = false;
  let complianceStage: ShariahScreeningResult['complianceStage'] = 'failed_primary';
  const allReasons: string[] = [];

  if (!primary.passed) {
    complianceStage = 'failed_primary';
    allReasons.push(...primary.failureReasons);
  } else if (!business.passed) {
    complianceStage = 'failed_business';
    allReasons.push(...business.failureReasons);
  } else if (!financial.allPassed) {
    complianceStage = 'failed_financial';
    allReasons.push(...financial.failureReasons);
  } else {
    complianceStage = 'compliant';
    isOverallCompliant = true;
  }

  // Check suspension/delisting
  if (financials.isSuspended || financials.delistedDate) {
    isOverallCompliant = false;
    complianceStage = 'failed_primary';
    allReasons.push('Company is suspended or delisted from exchange');
  }

  return {
    symbol: financials.symbol,
    companyName: financials.name,
    primaryScreening: primary,
    businessScreening: business,
    financialScreening: financial,
    isCompliant: isOverallCompliant,
    complianceStage,
    nonComplianceReasons: allReasons,
    purification,
    screenedAt: new Date().toISOString(),
    standard,
  };
}

// ==================== Stage 1: Primary Screening ====================

/**
 * TASIS Ch. 6.7.1: Primary Screening
 * Exclude companies with:
 * - No financial statements for last 3 years
 * - Total Assets = zero/nil
 * - Total Income = zero/nil
 */
function performPrimaryScreening(
  f: CompanyFinancials,
  currentYear: number,
): PrimaryScreeningResult {
  const failureReasons: string[] = [];

  const hasRecentFinancials = (currentYear - f.latestAnnualReportYear) <= 3;
  if (!hasRecentFinancials) {
    failureReasons.push(`No financial statements within last 3 years (latest: ${f.latestAnnualReportYear})`);
  }

  const hasNonZeroAssets = f.totalAssets > 0;
  if (!hasNonZeroAssets) {
    failureReasons.push('Total assets are zero or nil');
  }

  const hasNonZeroIncome = f.totalIncome > 0;
  if (!hasNonZeroIncome) {
    failureReasons.push('Total income is zero or nil');
  }

  return {
    hasRecentFinancials,
    hasNonZeroAssets,
    hasNonZeroIncome,
    passed: hasRecentFinancials && hasNonZeroAssets && hasNonZeroIncome,
    failureReasons,
  };
}

// ==================== Stage 2: Business Screening ====================

/**
 * AAOIFI SS 21 + TASIS Ch. 6.7.2: Business Screening
 * Exclude companies whose primary or secondary business is haram.
 *
 * Uses keyword matching against the 23 haram industry categories.
 * In production, this should be enhanced with a curated database mapping
 * BSE/NSE industry codes to halal/haram classification.
 */
function performBusinessScreening(
  f: CompanyFinancials,
  standard: ScreeningStandard,
): BusinessScreeningResult {
  const failureReasons: string[] = [];
  const industryLower = f.industryGroup.toLowerCase();
  const productLower = f.mainProductService.toLowerCase();
  const combined = `${industryLower} ${productLower}`;

  // Keywords mapping to haram categories
  const haramKeywords: Record<string, string[]> = {
    conventional_banking: ['banking service', 'bank', 'nbfc', 'non-banking finance'],
    conventional_insurance: ['insurance', 'general insurance', 'life insurance'],
    alcohol: ['beer', 'alcohol', 'liquor', 'brewery', 'distillery', 'wine', 'spirits'],
    tobacco: ['tobacco', 'cigarette', 'bidi', 'cigar'],
    gambling: ['gambling', 'casino', 'lottery', 'betting'],
    pornography: ['pornograph', 'adult entertainment'],
    pork: ['pork', 'pig', 'ham ', 'bacon'],
    weapons: ['weapon', 'ammunition', 'arms & ammunition', 'defence equipment', 'firearms'],
    interest_lending: ['lending', 'money lending', 'credit company', 'loan company'],
    auto_financing: ['auto financ', 'vehicle financ', 'car loan'],
    housing_financing: ['housing financ', 'home loan', 'mortgage lending'],
    infra_financing: ['infrastructure financ'],
    securities_broking: ['securities broking', 'stock broking', 'share broking'],
    asset_financing: ['asset financ', 'lease financ'],
    fee_financial: ['fee based financial', 'financial advisory'],
    fund_financial: ['fund based financial', 'mutual fund'],
    hotels_restaurants: ['hotel', 'restaurant', 'hospitality'],
    media_broadcasting: ['broadcasting', 'tv channel', 'radio'],
    media_content: ['media content', 'content production'],
    animation: ['animation content'],
    film_production: ['film production', 'film distribution', 'motion picture', 'cinema'],
    recreational: ['recreational service', 'amusement', 'theme park'],
    poultry_meat: ['poultry', 'meat product', 'slaughter'],
  };

  // Determine which categories to check based on standard
  const categoriesToCheck = standard === 'TASIS'
    ? HARAM_INDUSTRY_CATEGORIES
    : HARAM_INDUSTRY_CATEGORIES.filter(c => c.source.includes('AAOIFI'));

  let primaryCompliant = true;
  let matchedCategory: string | undefined;

  for (const category of categoriesToCheck) {
    const keywords = haramKeywords[category.id] ?? [];
    for (const kw of keywords) {
      if (combined.includes(kw)) {
        primaryCompliant = false;
        matchedCategory = category.label;
        failureReasons.push(`Primary business "${f.industryGroup}" matches haram category: ${category.label}`);
        break;
      }
    }
    if (!primaryCompliant) break;
  }

  // Secondary business check (simplified — in production, use a curated database)
  const secondaryCompliant = true; // Would need monthly tracking per TASIS

  return {
    industryGroup: f.industryGroup,
    mainProductService: f.mainProductService,
    primaryBusinessCompliant: primaryCompliant,
    secondaryBusinessCompliant: secondaryCompliant,
    haramCategoryMatched: matchedCategory,
    passed: primaryCompliant && secondaryCompliant,
    failureReasons,
  };
}

// ==================== Stage 3: Financial Screening ====================

/**
 * AAOIFI SS 21 + TASIS Ch. 6.7.3: Financial Ratio Screening
 *
 * Three ratios — ALL must pass:
 *
 * 1. Debt to Total Assets:
 *    Formula: (Total Debt / Total Assets) × 100
 *    AAOIFI limit: < 30%  |  TASIS limit: ≤ 25%
 *
 * 2. Interest Income Ratio:
 *    AAOIFI: (Interest Income / Total Income) × 100, limit < 5%
 *    TASIS:  ((Interest Income + 8% × Interest-based Investments) / Total Income) × 100, limit ≤ 3%
 *
 * 3. Cash + Receivables to Total Assets:
 *    Formula: ((Cash + Receivables) / Total Assets) × 100
 *    AAOIFI limit: < 70%  |  TASIS limit: ≤ 90%
 *
 * Note: Failing ANY ONE ratio = non-compliant (per TASIS footnote 20)
 */
function performFinancialScreening(
  f: CompanyFinancials,
  standard: ScreeningStandard,
): FinancialScreeningResult {
  const thresholds = SCREENING_THRESHOLDS[standard];
  const failureReasons: string[] = [];

  // Guard against division by zero
  const totalAssets = f.totalAssets > 0 ? f.totalAssets : 1;
  const totalIncome = f.totalIncome > 0 ? f.totalIncome : 1;

  // Ratio 1: Debt to Total Assets
  const debtToTotalAssets = (f.totalDebt / totalAssets) * 100;
  const debtPassed = debtToTotalAssets <= thresholds.debtToTotalAssetsLimit;
  if (!debtPassed) {
    failureReasons.push(
      `Debt/Total Assets = ${debtToTotalAssets.toFixed(1)}% (limit: ${thresholds.debtToTotalAssetsLimit}% per ${standard})`
    );
  }

  // Ratio 2: Interest Income Ratio
  let totalInterestIncome: number;
  if (standard === 'TASIS') {
    // TASIS formula: Interest Income + 8% of Interest-based Investments
    totalInterestIncome = f.interestIncome +
      (thresholds.interestInvestmentAssumedReturn / 100) * f.interestBasedInvestments;
  } else {
    // AAOIFI: Direct interest income only
    totalInterestIncome = f.interestIncome;
  }
  const interestIncomeRatio = (totalInterestIncome / totalIncome) * 100;
  const interestPassed = interestIncomeRatio <= thresholds.interestIncomeLimit;
  if (!interestPassed) {
    failureReasons.push(
      `Interest income ratio = ${interestIncomeRatio.toFixed(1)}% (limit: ${thresholds.interestIncomeLimit}% per ${standard})`
    );
  }

  // Ratio 3: Cash + Receivables to Total Assets
  const cashReceivablesToAssets = ((f.cashAndBankBalance + f.accountsReceivables) / totalAssets) * 100;
  const receivablesPassed = cashReceivablesToAssets <= thresholds.cashReceivablesToAssetsLimit;
  if (!receivablesPassed) {
    failureReasons.push(
      `Cash+Receivables/Assets = ${cashReceivablesToAssets.toFixed(1)}% (limit: ${thresholds.cashReceivablesToAssetsLimit}% per ${standard})`
    );
  }

  return {
    standard,
    debtToTotalAssets,
    interestIncomeRatio,
    cashReceivablesToAssets,
    thresholds: {
      debtLimit: thresholds.debtToTotalAssetsLimit,
      interestLimit: thresholds.interestIncomeLimit,
      receivablesLimit: thresholds.cashReceivablesToAssetsLimit,
    },
    debtPassed,
    interestPassed,
    receivablesPassed,
    allPassed: debtPassed && interestPassed && receivablesPassed,
    failureReasons,
  };
}

// ==================== Purification Calculator ====================

/**
 * Calculate the impure income that must be purged (donated to charity).
 *
 * TASIS Method (Ch. 6.9):
 *   Interest income per share per day = (Total Interest Income × 10^6) / Shares Outstanding / 365
 *   Investor's purification = rate × shares_owned × days_held
 *
 * AAOIFI/S&P Method:
 *   Impure income ratio = Non-permissible revenue / Total revenue
 *   Purification per dividend = Dividend × impure income ratio
 */
export function calculatePurification(f: CompanyFinancials): PurificationResult {
  const sharesOutstanding = f.sharesOutstanding > 0 ? f.sharesOutstanding : 1;
  const totalIncome = f.totalIncome > 0 ? f.totalIncome : 1;

  // TASIS method
  const interestIncomePerSharePerDay =
    (f.interestIncome * 1_000_000) / sharesOutstanding / 365;

  // AAOIFI/S&P method
  const impureIncomeRatio = f.interestIncome / totalIncome;
  const dividendPerShare = f.closingPrice * ((f.dividendYield ?? 0) / 100);
  const purificationPerDividend = dividendPerShare * impureIncomeRatio;

  return {
    interestIncomePerSharePerDay,
    formula: `(${f.interestIncome.toLocaleString()} × 10⁶) ÷ ${sharesOutstanding.toLocaleString()} shares ÷ 365 days = ₹${interestIncomePerSharePerDay.toFixed(4)}/share/day`,
    impureIncomeRatio,
    purificationPerDividend,
  };
}

/**
 * Calculate how much an investor must donate to charity.
 *
 * @param interestIncomePerSharePerDay - From purification result
 * @param sharesOwned - Number of shares the investor holds
 * @param daysHeld - Number of days held
 * @returns Amount to donate in the same currency as the purification rate
 */
export function calculateInvestorPurification(
  interestIncomePerSharePerDay: number,
  sharesOwned: number,
  daysHeld: number,
): number {
  return interestIncomePerSharePerDay * sharesOwned * daysHeld;
}

// ==================== Haram Industry Helpers ====================

export function getHaramIndustries(standard: ScreeningStandard = _activeStandard) {
  if (standard === 'TASIS') return HARAM_INDUSTRY_CATEGORIES;
  return HARAM_INDUSTRY_CATEGORIES.filter(c => c.source.includes('AAOIFI'));
}

export function isIndustryHaram(
  industryGroup: string,
  mainProductService: string,
  standard: ScreeningStandard = _activeStandard,
): { isHaram: boolean; matchedCategory?: string } {
  const result = performBusinessScreening(
    {
      symbol: '', name: '', industryGroup, mainProductService,
      latestAnnualReportYear: new Date().getFullYear(),
      totalAssets: 1, totalIncome: 1, totalDebt: 0,
      interestIncome: 0, interestBasedInvestments: 0,
      cashAndBankBalance: 0, accountsReceivables: 0,
      totalExpenses: 0, totalLiabilities: 0,
      sharesOutstanding: 1, marketCap: 0, closingPrice: 0,
      eps: 0, equityFaceValue: 0,
    },
    standard,
  );
  return {
    isHaram: !result.passed,
    matchedCategory: result.haramCategoryMatched,
  };
}

// ==================== Zakat on Stocks Helper ====================

/**
 * Per AAOIFI SS 35: Zakat on shares depends on investor's intent:
 *
 * Trading stocks (held for short-term sale):
 *   Zakat = Market value × 2.5%
 *
 * Holding stocks (held for dividends/long-term):
 *   Zakat = (Company's zakatable assets / total shares) × shares owned × 2.5%
 *   Simplified: If company data unavailable, use market value × 2.5%
 */
export function calculateStockZakat(
  marketValue: number,
  intent: 'trading' | 'holding',
  companyZakatableAssetsPerShare?: number,
  sharesOwned?: number,
): number {
  const ZAKAT_RATE = 0.025;

  if (intent === 'trading') {
    return marketValue * ZAKAT_RATE;
  }

  // Holding: use company's zakatable assets if available
  if (companyZakatableAssetsPerShare != null && sharesOwned != null) {
    return companyZakatableAssetsPerShare * sharesOwned * ZAKAT_RATE;
  }

  // Fallback: use market value
  return marketValue * ZAKAT_RATE;
}
