/**
 * Islamic Finance Calculators
 * Based on AAOIFI Shariah Standards:
 *   SS 8:  Murabahah (Cost-Plus Financing)
 *   SS 9:  Ijarah (Leasing)
 *   SS 12: Sharikah (Musharakah) & Modern Corporations
 *   SS 13: Mudarabah
 *   SS 17: Investment Sukuk
 */

// ==================== Murabahah (SS 8) ====================

/**
 * AAOIFI SS 8: Murabahah — Cost-Plus Financing
 *
 * The bank purchases an asset at cost and resells to the client at
 * cost + disclosed profit margin. Payment can be lump-sum or installments.
 *
 * Formula:
 *   Total Price = Cost Price × (1 + Profit Margin%)
 *   Monthly Payment = Total Price / Number of Months
 */
export interface MurabahahInput {
  costPrice: number;       // Purchase cost of the asset
  profitMarginPct: number; // Bank's profit margin (e.g., 5 = 5%)
  tenureMonths: number;    // Repayment period in months
}

export interface MurabahahResult {
  costPrice: number;
  profitAmount: number;
  totalPrice: number;         // Cost + profit
  monthlyPayment: number;
  totalPayments: number;      // = totalPrice (for verification)
  effectiveAnnualRate: number; // For comparison with conventional rates
}

export function calculateMurabahah(input: MurabahahInput): MurabahahResult {
  const profitAmount = input.costPrice * (input.profitMarginPct / 100);
  const totalPrice = input.costPrice + profitAmount;
  const months = input.tenureMonths > 0 ? input.tenureMonths : 1;
  const monthlyPayment = totalPrice / months;

  // Effective annual rate = (Profit / Cost) / (Tenure in years) — simple approximation
  const tenureYears = months / 12;
  const effectiveAnnualRate = tenureYears > 0
    ? ((profitAmount / input.costPrice) / tenureYears) * 100
    : 0;

  return {
    costPrice: input.costPrice,
    profitAmount,
    totalPrice,
    monthlyPayment,
    totalPayments: totalPrice,
    effectiveAnnualRate,
  };
}

// ==================== Ijarah (SS 9) ====================

/**
 * AAOIFI SS 9: Ijarah — Islamic Lease
 *
 * The bank purchases the asset, leases it to the client for a fixed term.
 * Ownership may transfer at end of term (Ijarah Muntahia Bittamleek).
 *
 * Formula:
 *   Monthly Rent = (Asset Cost - Residual Value + Total Profit) / Tenure Months
 *   Total Cost = Monthly Rent × Tenure Months + Down Payment
 */
export interface IjarahInput {
  assetCost: number;         // Cost of the asset
  downPayment: number;       // Initial payment (Hamish Jiddiyyah)
  residualValue: number;     // Asset value at end of lease (0 for full ownership transfer)
  profitRatePct: number;     // Annual profit rate (e.g., 4 = 4%)
  tenureMonths: number;      // Lease period in months
}

export interface IjarahResult {
  financedAmount: number;    // Asset cost - down payment
  totalProfit: number;
  monthlyRent: number;
  totalCost: number;         // Total paid over lease period
  ownershipTransferCost: number; // Residual or token amount
}

export function calculateIjarah(input: IjarahInput): IjarahResult {
  const financedAmount = input.assetCost - input.downPayment;
  const tenureYears = input.tenureMonths / 12;
  const totalProfit = financedAmount * (input.profitRatePct / 100) * tenureYears;
  const months = input.tenureMonths > 0 ? input.tenureMonths : 1;
  const monthlyRent = (financedAmount - input.residualValue + totalProfit) / months;
  const totalCost = input.downPayment + (monthlyRent * months) + input.residualValue;

  return {
    financedAmount,
    totalProfit,
    monthlyRent,
    totalCost,
    ownershipTransferCost: input.residualValue,
  };
}

// ==================== Musharakah (SS 12) ====================

/**
 * AAOIFI SS 12: Musharakah — Partnership Financing
 *
 * Both parties contribute capital. Profits shared per agreed ratio,
 * losses shared in proportion to capital contribution.
 *
 * Diminishing Musharakah: Bank's share gradually bought out by client.
 *
 * Formula:
 *   Client's Profit = Total Profit × Client's Profit Share%
 *   Bank's Profit = Total Profit × Bank's Profit Share%
 *   Loss Allocation = Total Loss × (Party's Capital / Total Capital)
 */
export interface MusharakahInput {
  totalProjectCost: number;
  clientContribution: number;
  expectedAnnualProfitPct: number; // Expected annual return (e.g., 15 = 15%)
  clientProfitSharePct: number;    // Client's share of profit (e.g., 60 = 60%)
  tenureYears: number;
  isDiminishing: boolean;          // If true, client buys out bank's share over time
}

export interface MusharakahResult {
  bankContribution: number;
  clientSharePct: number;
  bankSharePct: number;
  expectedAnnualProfit: number;
  clientAnnualProfit: number;
  bankAnnualProfit: number;
  // Diminishing-specific
  annualBuyoutAmount: number;      // Client pays this each year to buy bank's share
  totalBuyoutCost: number;
}

export function calculateMusharakah(input: MusharakahInput): MusharakahResult {
  const bankContribution = input.totalProjectCost - input.clientContribution;
  const clientSharePct = (input.clientContribution / input.totalProjectCost) * 100;
  const bankSharePct = 100 - clientSharePct;

  const expectedAnnualProfit = input.totalProjectCost * (input.expectedAnnualProfitPct / 100);
  const clientAnnualProfit = expectedAnnualProfit * (input.clientProfitSharePct / 100);
  const bankAnnualProfit = expectedAnnualProfit * ((100 - input.clientProfitSharePct) / 100);

  // Diminishing: client buys equal portions of bank's share each year
  const tenure = input.tenureYears > 0 ? input.tenureYears : 1;
  const annualBuyoutAmount = input.isDiminishing ? bankContribution / tenure : 0;
  const totalBuyoutCost = annualBuyoutAmount * tenure;

  return {
    bankContribution,
    clientSharePct,
    bankSharePct,
    expectedAnnualProfit,
    clientAnnualProfit,
    bankAnnualProfit,
    annualBuyoutAmount,
    totalBuyoutCost,
  };
}

// ==================== Mudarabah (SS 13) ====================

/**
 * AAOIFI SS 13: Mudarabah — Profit-Sharing Investment
 *
 * Rabb-ul-Maal (capital provider) provides funds,
 * Mudarib (entrepreneur) provides labor/expertise.
 *
 * Profit shared per agreed ratio. Losses borne entirely by capital provider
 * (unless Mudarib was negligent).
 *
 * Formula:
 *   Capital Provider's Profit = Total Profit × Provider Share%
 *   Mudarib's Profit = Total Profit × Mudarib Share%
 */
export interface MudarabahInput {
  investmentAmount: number;
  expectedAnnualReturnPct: number; // Expected return (e.g., 12 = 12%)
  mudaribProfitSharePct: number;   // Mudarib's share (e.g., 40 = 40%)
  tenureMonths: number;
}

export interface MudarabahResult {
  investmentAmount: number;
  expectedTotalProfit: number;
  capitalProviderProfit: number;
  mudaribProfit: number;
  capitalProviderMonthlyReturn: number;
  effectiveReturnForProvider: number; // Annual % return for investor
}

export function calculateMudarabah(input: MudarabahInput): MudarabahResult {
  const tenureYears = input.tenureMonths / 12;
  const expectedTotalProfit = input.investmentAmount * (input.expectedAnnualReturnPct / 100) * tenureYears;
  const capitalProviderSharePct = 100 - input.mudaribProfitSharePct;
  const capitalProviderProfit = expectedTotalProfit * (capitalProviderSharePct / 100);
  const mudaribProfit = expectedTotalProfit * (input.mudaribProfitSharePct / 100);
  const months = input.tenureMonths > 0 ? input.tenureMonths : 1;
  const capitalProviderMonthlyReturn = capitalProviderProfit / months;
  const effectiveReturnForProvider = tenureYears > 0
    ? (capitalProviderProfit / input.investmentAmount / tenureYears) * 100
    : 0;

  return {
    investmentAmount: input.investmentAmount,
    expectedTotalProfit,
    capitalProviderProfit,
    mudaribProfit,
    capitalProviderMonthlyReturn,
    effectiveReturnForProvider,
  };
}
