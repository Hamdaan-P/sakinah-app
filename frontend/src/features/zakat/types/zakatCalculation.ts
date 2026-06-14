/**
 * Zakat Calculation Model
 * Based on AAOIFI Shariah Standard No. 35 (Zakah)
 * Handles all zakat computation logic including nisab thresholds
 *
 * Key AAOIFI SS 35 rules applied:
 * - Gold nisab: 85 grams (not 87.48g)
 * - Silver nisab: 595 grams (not 612.36g)
 * - Zakat rate: 2.5% of net zakatable wealth above nisab
 * - Hawl: One complete lunar year of possession
 * - Stock zakat: Trading stocks = market value; Holding stocks = company's zakatable assets
 * - Jewelry: Hanafi = zakatable; Shafi'i/Hanbali = exempt if personal use
 */

// ==================== Constants ====================

/**
 * Gold nisab: 85 grams per AAOIFI SS 35
 * (Some older references use 87.48g based on different tola conversions,
 *  but AAOIFI standard is explicitly 85g / 20 dinar)
 */
export const GOLD_NISAB_GRAMS = 85;

/**
 * Silver nisab: 595 grams per AAOIFI SS 35
 * (Some older references use 612.36g, but AAOIFI standard is 595g / 200 dirham)
 */
export const SILVER_NISAB_GRAMS = 595;

/** Zakat rate: 2.5% (1/40) of net zakatable wealth */
export const ZAKAT_RATE = 0.025;

// ==================== Input Interface ====================

/** Madhab position on jewelry zakat */
export type JewelryMadhab = 'hanafi' | 'shafii';

/** Stock zakat intent per AAOIFI SS 35 */
export type StockIntent = 'trading' | 'holding';

export interface ZakatInput {
  // Metal prices
  goldPricePerGram: number;
  silverPricePerGram: number;

  // Gold assets
  goldOwned: number; // grams
  goldLent: number;  // grams
  goldJewelryPersonal: number; // grams — personal-use jewelry

  // Silver assets
  silverOwned: number; // grams
  silverLent: number;  // grams
  silverJewelryPersonal: number; // grams — personal-use jewelry

  // Jewelry madhab choice (affects whether personal jewelry is zakatable)
  jewelryMadhab: JewelryMadhab;

  // Cash assets
  cashInHand: number;
  cashInBank: number;
  cashInSavings: number;
  cashInFixedDeposit: number;
  cashInCurrentAccount: number;
  cashLentToOthers: number;
  cashInForeignCurrency: number;
  cashInDigitalWallets: number;
  cashInInvestments: number;
  cashInMutualFunds: number;
  cashInStocks: number;
  cashInBonds: number;
  cashInRealEstate: number;
  cashInBusinessInventory: number;

  // Stock zakat (AAOIFI SS 35)
  stockMarketValue: number;
  stockIntent: StockIntent;
  stockZakatableAssetsPerShare: number; // For holding intent
  stockSharesOwned: number;

  // Business assets
  businessCash: number;
  businessReceivables: number;
  businessInventory: number;
  businessRawMaterials: number;
  businessFinishedGoods: number;
  businessInvestments: number;
  businessOther: number;

  // Liabilities — AAOIFI SS 35: Only deduct debts DUE within the current zakat year
  // For long-term debts (mortgage, loans), enter ANNUAL installment, not total balance
  personalLoansAnnualDue: number;   // Annual installments due this year
  creditCardDebt: number;           // Full current balance (short-term, fully deductible)
  mortgageAnnualDue: number;        // Annual mortgage payments due this year (NOT total balance)
  businessLoansAnnualDue: number;   // Annual business loan payments due this year
  otherDebtsAnnualDue: number;      // Other debts due this year
  unpaidTaxes: number;              // Taxes currently owed

  // Hawl — One complete lunar year of possession (AAOIFI SS 35 requirement)
  hawlConfirmed: boolean;

  // Previous unpaid zakat
  previousUnpaidZakat: number;
}

// ==================== Result Interface ====================

export interface ZakatResult {
  totalGoldValue: number;
  totalSilverValue: number;
  totalCash: number;
  totalStockZakat: number; // Stock zakat computed separately per AAOIFI SS 35
  totalBusinessAssets: number;
  totalLiabilities: number;
  totalAssets: number;
  netZakatableAmount: number;
  goldNisabValue: number;
  silverNisabValue: number;
  nisabThreshold: number;
  isZakatDue: boolean;
  zakatAmount: number;
  totalZakatDue: number;
  jewelryIncluded: boolean; // Whether personal jewelry was included (Hanafi = yes)
  stockZakatMethod: string; // Description of which stock zakat method was used
  meetsNisab: boolean;      // Whether net assets >= nisab (separate from hawl check)
}

// ==================== Calculation ====================

export function emptyZakatInput(): ZakatInput {
  return {
    goldPricePerGram: 0, silverPricePerGram: 0,
    goldOwned: 0, goldLent: 0, goldJewelryPersonal: 0,
    silverOwned: 0, silverLent: 0, silverJewelryPersonal: 0,
    jewelryMadhab: 'hanafi',
    cashInHand: 0, cashInBank: 0, cashInSavings: 0, cashInFixedDeposit: 0,
    cashInCurrentAccount: 0, cashLentToOthers: 0, cashInForeignCurrency: 0,
    cashInDigitalWallets: 0, cashInInvestments: 0, cashInMutualFunds: 0,
    cashInStocks: 0, cashInBonds: 0, cashInRealEstate: 0, cashInBusinessInventory: 0,
    stockMarketValue: 0, stockIntent: 'trading', stockZakatableAssetsPerShare: 0, stockSharesOwned: 0,
    businessCash: 0, businessReceivables: 0, businessInventory: 0,
    businessRawMaterials: 0, businessFinishedGoods: 0, businessInvestments: 0, businessOther: 0,
    personalLoansAnnualDue: 0, creditCardDebt: 0, mortgageAnnualDue: 0,
    businessLoansAnnualDue: 0, otherDebtsAnnualDue: 0, unpaidTaxes: 0,
    hawlConfirmed: false,
    previousUnpaidZakat: 0,
  };
}

export function calculateZakat(input: ZakatInput): ZakatResult {
  // Jewelry: Hanafi madhab = personal jewelry IS zakatable; Shafi'i = exempt
  const jewelryIncluded = input.jewelryMadhab === 'hanafi';
  const goldJewelryGrams = jewelryIncluded ? input.goldJewelryPersonal : 0;
  const silverJewelryGrams = jewelryIncluded ? input.silverJewelryPersonal : 0;

  const totalGoldValue = (input.goldOwned + input.goldLent + goldJewelryGrams) * input.goldPricePerGram;
  const totalSilverValue = (input.silverOwned + input.silverLent + silverJewelryGrams) * input.silverPricePerGram;

  const totalCash =
    input.cashInHand + input.cashInBank + input.cashInSavings +
    input.cashInFixedDeposit + input.cashInCurrentAccount +
    input.cashLentToOthers + input.cashInForeignCurrency +
    input.cashInDigitalWallets + input.cashInInvestments +
    input.cashInMutualFunds + input.cashInStocks +
    input.cashInBonds + input.cashInRealEstate +
    input.cashInBusinessInventory;

  // Stock zakat per AAOIFI SS 35
  let totalStockZakat = 0;
  let stockZakatMethod = '';
  if (input.stockMarketValue > 0) {
    if (input.stockIntent === 'trading') {
      // Trading stocks: zakat on full market value
      totalStockZakat = input.stockMarketValue;
      stockZakatMethod = 'Trading: Market value × 2.5%';
    } else {
      // Holding stocks: zakat on company\'s zakatable assets per share
      if (input.stockZakatableAssetsPerShare > 0 && input.stockSharesOwned > 0) {
        totalStockZakat = input.stockZakatableAssetsPerShare * input.stockSharesOwned;
        stockZakatMethod = 'Holding: Zakatable assets per share × shares owned × 2.5%';
      } else {
        // Fallback to market value if company data unavailable
        totalStockZakat = input.stockMarketValue;
        stockZakatMethod = 'Holding (fallback): Market value × 2.5% (company data unavailable)';
      }
    }
  }

  const totalBusinessAssets =
    input.businessCash + input.businessReceivables + input.businessInventory +
    input.businessRawMaterials + input.businessFinishedGoods +
    input.businessInvestments + input.businessOther;

  // AAOIFI SS 35: Only deduct debts due within the current zakat year
  const totalLiabilities =
    input.personalLoansAnnualDue + input.creditCardDebt + input.mortgageAnnualDue +
    input.businessLoansAnnualDue + input.otherDebtsAnnualDue + input.unpaidTaxes;

  const totalAssets = totalGoldValue + totalSilverValue + totalCash + totalStockZakat + totalBusinessAssets;
  const netZakatableAmount = Math.max(0, totalAssets - totalLiabilities);

  const goldNisabValue = GOLD_NISAB_GRAMS * input.goldPricePerGram;
  const silverNisabValue = SILVER_NISAB_GRAMS * input.silverPricePerGram;

  // Use silver nisab (lower threshold — more beneficial to the poor per AAOIFI SS 35)
  const nisabThreshold = input.silverPricePerGram > 0 ? silverNisabValue : goldNisabValue;

  // AAOIFI SS 35: Zakat requires both nisab AND hawl (one lunar year of possession)
  const isZakatDue = nisabThreshold > 0 && netZakatableAmount >= nisabThreshold && input.hawlConfirmed;
  const zakatAmount = isZakatDue ? netZakatableAmount * ZAKAT_RATE : 0;
  const totalZakatDue = zakatAmount + input.previousUnpaidZakat;

  return {
    totalGoldValue, totalSilverValue, totalCash, totalStockZakat, totalBusinessAssets,
    totalLiabilities, totalAssets, netZakatableAmount,
    goldNisabValue, silverNisabValue, nisabThreshold,
    isZakatDue, zakatAmount, totalZakatDue,
    jewelryIncluded, stockZakatMethod,
    meetsNisab: nisabThreshold > 0 && netZakatableAmount >= nisabThreshold,
  };
}
