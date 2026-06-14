/**
 * EIM Simulator — curated starter-ticker palette (shared).
 *
 * Used by Market Rewind + Strategy Comparator as the default chip palette.
 * This is NOT the universe — the universe is open (D29): the create forms
 * pair this palette with a live ticker search (eimService.lookupTicker) so
 * any listed security can be added. The palette just gives a diverse,
 * one-tap starting point instead of forcing everyone to search.
 *
 * Diversity is deliberate (the old default was 5 tech names): sectors span
 * staples, healthcare, energy, industrials, autos, semis; asset types span
 * single equities, gold/silver, broad-market and Shariah ETFs; and a couple
 * of non-US names give geographic spread.
 *
 * Shariah note: compliance varies by name and over time — the simulator's
 * Shariah screen surfaces that per ticker. SPUS/HLAL are Shariah-screened
 * ETFs; conventional names (e.g. XOM, banks via search) are included as
 * teaching contrasts, not endorsements. Newer ETFs (SPUS/HLAL, listed 2019)
 * are auto-flagged "not listed yet" for earlier start dates by the
 * availability check — no special handling needed.
 *
 * Precious metals: GC=F / SI=F are the gold/silver *spot* series (per troy
 * oz), the same symbols `eim_metals.py` uses for nisab. They represent the
 * physical metal — distinct from the GLD/SLV ETF wrappers. They ride the
 * normal yfinance OHLC pipeline (the sim engine is asset-class-blind), so no
 * backend change is needed; SPECIAL_ASSETS just gives them friendly labels +
 * an Islamic-framing note (zakatable store of value; spot/qabd in real life).
 */

export interface StarterGroup {
  label: string;
  tickers: string[];
}

export const STARTER_GROUPS: StarterGroup[] = [
  { label: 'Broad & Halal ETFs', tickers: ['SPY', 'SPUS', 'HLAL'] },
  { label: 'Tech', tickers: ['AAPL', 'MSFT', 'GOOGL', 'NVDA'] },
  { label: 'Consumer staples', tickers: ['KO', 'PG', 'COST'] },
  { label: 'Healthcare', tickers: ['JNJ', 'LLY'] },
  { label: 'Energy & industrials', tickers: ['XOM', 'CAT'] },
  { label: 'Autos & EV', tickers: ['TSLA', 'F'] },
  { label: 'Semiconductors', tickers: ['TSM', 'AMD'] },
  { label: 'Precious metals · physical spot', tickers: ['GC=F', 'SI=F'] },
  { label: 'Gold & silver ETFs', tickers: ['GLD', 'SLV'] },
  {
    label: 'Commodities · paper (futures)',
    tickers: ['CL=F', 'NG=F', 'ZC=F', 'ZW=F', 'ZS=F'],
  },
  {
    label: 'Real estate · REITs (Shariah-screened)',
    tickers: ['O', 'STAG', 'ADC', 'PLD', 'WELL', 'AVB', 'EQIX', 'EXR'],
  },
  {
    label: 'Fixed income · Sukuk',
    tickers: [
      'SK-MYS-30', 'SK-IDN-31', 'SK-SAU-30', 'SK-QAT-30', 'SK-UK-26',
      'SK-ISDB-27', 'SK-TUR-28', 'SK-ARAMCO-30',
    ],
  },
  {
    label: 'Islamic funds · Shariah-screened',
    tickers: ['AMANX', 'AMAGX', 'AMDWX', 'AMAPX', 'ADJEX', 'WISEX', 'IMANX'],
  },
  { label: 'Global', tickers: ['INFY', 'BABA'] },
];

/**
 * Friendly metadata for "special" assets whose raw yfinance symbol is opaque
 * (futures/spot tickers) or carries an Islamic-finance nuance worth surfacing.
 * Keyed by upper-cased symbol. The sim treats these as ordinary price series;
 * this registry only drives display labels + an in-picker framing note.
 */
export interface SpecialAsset {
  /** Friendly display name shown on chips instead of the raw symbol. */
  label: string;
  /** Natural unit of one "share" — gold/silver spot is priced per troy oz. */
  unit: string;
  /** Short Islamic-framing note shown when the asset is selected. */
  note: string;
}

// Curated Shariah-screened REIT catalog (W3) — mirrors backend
// `eim_reit_catalog.py`. The sim auto-credits simulated monthly/quarterly
// "rent" (DIVIDEND) as time advances; this registry drives the friendly
// label + the in-picker framing note (shown whether the REIT is added from
// the palette chip or via search).
const REIT_RENT_CAVEAT =
  ' The sim pays you simulated rent as time advances. REITs own real, income-producing property — close in spirit to ijara — but many carry conventional debt, so the per-ticker Shariah screen shows whether this name passes, and rent income may need purification.';

const REIT_META: Array<{ ticker: string; name: string; desc: string }> = [
  { ticker: 'O', name: 'Realty Income', desc: 'Net-lease landlord paying rent MONTHLY.' },
  { ticker: 'STAG', name: 'STAG Industrial', desc: 'Industrial/warehouse landlord, pays MONTHLY.' },
  { ticker: 'ADC', name: 'Agree Realty', desc: 'Net-lease retail landlord, pays MONTHLY.' },
  { ticker: 'PLD', name: 'Prologis', desc: 'Global logistics-warehouse landlord.' },
  { ticker: 'EGP', name: 'EastGroup', desc: 'Sun Belt industrial parks.' },
  { ticker: 'WELL', name: 'Welltower', desc: 'Senior-housing & healthcare property.' },
  { ticker: 'VTR', name: 'Ventas', desc: 'Healthcare real estate.' },
  { ticker: 'DOC', name: 'Healthpeak', desc: 'Lab / life-science & medical-office property.' },
  { ticker: 'AVB', name: 'AvalonBay', desc: 'Coastal-metro apartment communities.' },
  { ticker: 'MAA', name: 'Mid-America Apartment', desc: 'Sun Belt apartments.' },
  { ticker: 'EQIX', name: 'Equinix', desc: 'Data-centre / interconnection landlord.' },
  { ticker: 'DLR', name: 'Digital Realty', desc: 'Data-centre landlord.' },
  { ticker: 'EXR', name: 'Extra Space Storage', desc: 'Self-storage operator/landlord.' },
  { ticker: 'AMT', name: 'American Tower', desc: 'Cell-tower / wireless infrastructure.' },
];

// Curated sukuk starter set (W1) — mirrors backend `eim_sukuk_catalog.py`.
// Sukuk don't trade on yfinance; the sim holds them at par (hold-to-maturity)
// and auto-credits simulated COUPON cash as time advances. Terms are
// illustrative — verify against real prospectuses before any non-educational
// use. (When this grows toward ~100, move the source of truth to a backend
// catalog endpoint instead of this static mirror.)
const SUKUK_RENT_CAVEAT =
  ' Hold-to-maturity model: the sim holds it at par and pays you simulated coupons as time advances — no secondary-price trading. Profit may need purification. Terms are illustrative — verify before real use.';

interface SukukMeta {
  id: string;
  name: string;
  structure: string;
  currency: string;
  couponPct: number;
  freq: 'semiannual' | 'annual' | 'quarterly';
  maturity: string;
  rating: string;
}

const SUKUK_META: SukukMeta[] = [
  { id: 'SK-MYS-30', name: 'Malaysia 2030', structure: 'Wakala', currency: 'USD', couponPct: 3.08, freq: 'semiannual', maturity: '2030-04-22', rating: 'A-' },
  { id: 'SK-IDN-31', name: 'Indonesia 2031', structure: 'Wakala', currency: 'USD', couponPct: 2.8, freq: 'semiannual', maturity: '2031-06-09', rating: 'BBB' },
  { id: 'SK-SAU-30', name: 'Saudi Arabia 2030', structure: 'Mudaraba/Murabaha', currency: 'USD', couponPct: 3.25, freq: 'semiannual', maturity: '2030-10-20', rating: 'A' },
  { id: 'SK-QAT-30', name: 'Qatar 2030', structure: 'Ijara', currency: 'USD', couponPct: 3.5, freq: 'semiannual', maturity: '2030-06-02', rating: 'AA-' },
  { id: 'SK-DXB-29', name: 'Dubai 2029', structure: 'Ijara', currency: 'USD', couponPct: 3.75, freq: 'semiannual', maturity: '2029-09-12', rating: 'unrated' },
  { id: 'SK-UK-26', name: 'UK Sovereign 2026', structure: 'Ijara', currency: 'GBP', couponPct: 1.33, freq: 'semiannual', maturity: '2026-07-22', rating: 'AA' },
  { id: 'SK-ISDB-27', name: 'Islamic Dev Bank 2027', structure: 'Wakala', currency: 'USD', couponPct: 2.9, freq: 'semiannual', maturity: '2027-03-09', rating: 'AAA' },
  { id: 'SK-TUR-28', name: 'Türkiye 2028', structure: 'Ijara', currency: 'USD', couponPct: 6.4, freq: 'semiannual', maturity: '2028-05-24', rating: 'B' },
  { id: 'SK-HK-24', name: 'Hong Kong 2024', structure: 'Ijara', currency: 'USD', couponPct: 2.8, freq: 'semiannual', maturity: '2024-05-30', rating: 'AA+' },
  { id: 'SK-BHR-29', name: 'Bahrain 2029', structure: 'Ijara', currency: 'USD', couponPct: 5.95, freq: 'semiannual', maturity: '2029-09-16', rating: 'B+' },
  { id: 'SK-ARAMCO-30', name: 'Saudi Aramco 2030', structure: 'Mudaraba', currency: 'USD', couponPct: 3.25, freq: 'semiannual', maturity: '2031-06-03', rating: 'A' },
  { id: 'SK-DPWORLD-30', name: 'DP World 2030', structure: 'Wakala', currency: 'USD', couponPct: 3.75, freq: 'semiannual', maturity: '2030-09-23', rating: 'BBB+' },
];

function sukukSpecialAsset(s: SukukMeta): [string, SpecialAsset] {
  return [
    s.id,
    {
      label: `${s.name} sukuk`,
      unit: 'unit',
      note: `${s.name} — ${s.structure} sukuk (${s.currency}). ~${s.couponPct}% profit paid ${s.freq}, matures ${s.maturity} (${s.rating}).${SUKUK_RENT_CAVEAT}`,
    },
  ];
}

// Curated Shariah-compliant mutual funds — mirrors backend
// `eim_fund_catalog.py`. Unlike sukuk, these trade on yfinance (daily NAV) so
// they ride the normal price pipeline; this registry only drives the friendly
// label + the in-picker basket/purification note. The per-fund Shariah signal
// reflects the fund's own board certification, not a per-holding ratio screen.
const FUND_PURIFY_CAVEAT =
  ' A professionally Shariah-screened FUND — a basket of holdings, not a single company, so the per-ticker ratio screen doesn\'t apply; the compliance shown reflects the fund\'s board certification. Equity-fund dividends may need purification — check the fund\'s annual report.';

const FUND_META: Array<{ ticker: string; name: string; desc: string }> = [
  { ticker: 'AMANX', name: 'Amana Income', desc: 'Income-focused Shariah equity fund (Saturna Capital).' },
  { ticker: 'AMAGX', name: 'Amana Growth', desc: 'Growth Shariah equity fund (Saturna Capital).' },
  { ticker: 'AMDWX', name: 'Amana Developing World', desc: 'Emerging-markets Shariah equity fund.' },
  { ticker: 'AMAPX', name: 'Amana Participation', desc: 'Islamic income fund — sukuk & Shariah income instruments.' },
  { ticker: 'ADJEX', name: 'Azzad Ethical', desc: 'Shariah-screened US equity fund (Azzad).' },
  { ticker: 'WISEX', name: 'Azzad Wise Capital', desc: 'Islamic income fund — sukuk + short-term notes.' },
  { ticker: 'IMANX', name: 'Iman Fund', desc: 'Shariah-screened US large-cap equity fund.' },
];

// Commodity paper futures (W2) — distinct from the PHYSICAL gold/silver spot.
// The underlying commodities are halal; the contract structure is the issue
// (gharar, no possession, speculation). Mirrors backend
// `eim_shariah_compose.COMMODITY_FUTURES`.
const FUTURES_GHARAR_NOTE =
  ' This is a PAPER future, not the physical commodity — permissible-conditional. A conventional futures contract carries gharar (excessive uncertainty), no real possession (qabd), and is usually cash-settled for speculation rather than delivery, which most scholars disallow. The compliant route is salam (paid-in-full forward) or spot with possession. Shown as a teaching contrast, not an endorsement.';

const COMMODITY_FUTURES_META: Array<{ ticker: string; name: string }> = [
  { ticker: 'CL=F', name: 'Crude oil (WTI)' },
  { ticker: 'NG=F', name: 'Natural gas' },
  { ticker: 'ZC=F', name: 'Corn' },
  { ticker: 'ZW=F', name: 'Wheat' },
  { ticker: 'ZS=F', name: 'Soybeans' },
];

export const SPECIAL_ASSETS: Record<string, SpecialAsset> = {
  'GC=F': {
    label: 'Gold (spot)',
    unit: 'oz',
    note: 'Gold (spot) tracks the metal itself per troy ounce — the physical asset, not an ETF. Gold is a zakatable store of value; in real life it must be bought spot with immediate possession (qabd), never on deferred or leveraged terms.',
  },
  'SI=F': {
    label: 'Silver (spot)',
    unit: 'oz',
    note: 'Silver (spot) tracks the metal per troy ounce — the physical asset, not an ETF. Like gold, a zakatable store of value that requires spot, hand-to-hand settlement in a real transaction.',
  },
  ...Object.fromEntries(
    REIT_META.map((r) => [
      r.ticker,
      { label: `${r.name} (REIT)`, unit: 'share', note: `${r.desc}${REIT_RENT_CAVEAT}` },
    ]),
  ),
  ...Object.fromEntries(SUKUK_META.map(sukukSpecialAsset)),
  ...Object.fromEntries(
    FUND_META.map((f) => [
      f.ticker,
      { label: `${f.name} (fund)`, unit: 'share', note: `${f.desc}${FUND_PURIFY_CAVEAT}` },
    ]),
  ),
  ...Object.fromEntries(
    COMMODITY_FUTURES_META.map((c) => [
      c.ticker,
      { label: `${c.name} (paper)`, unit: 'contract', note: `${c.name} futures.${FUTURES_GHARAR_NOTE}` },
    ]),
  ),
};

/** Friendly label for a ticker, falling back to the raw symbol. */
export function tickerLabel(ticker: string): string {
  return SPECIAL_ASSETS[ticker.toUpperCase()]?.label ?? ticker;
}

/** Flat list of every palette ticker, de-duplicated, in group order. */
export const ALL_STARTER_TICKERS: string[] = Array.from(
  new Set(STARTER_GROUPS.flatMap((g) => g.tickers)),
);

/** Diverse default selection — one across several sectors + gold, never
 *  all-tech. Long-history names so even an early-start (1990/2000) sim has
 *  something tradable from day one. */
export const DEFAULT_TICKERS: string[] = ['AAPL', 'KO', 'JNJ', 'XOM', 'GLD'];
