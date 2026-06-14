/**
 * Investment Query Detector
 * Analyzes user message text to determine if it's an investment-related query
 * and extracts stock symbols.
 *
 * Context-aware: requires STRONG investment intent before triggering charts.
 * A symbol alone (e.g. "apple" in "I love apple products") is NOT enough.
 * Must have either:
 *  - Explicit ticker syntax ($AAPL)
 *  - Symbol/company name + investment keyword in same message
 *  - Symbol + the recent conversation was already about investments
 *
 * Safeguards:
 * - All keyword matching uses \b word boundaries (prevents "dow" matching "down")
 * - ALL-CAPS messages skip Pattern 2 (prevents "OMG" → ticker)
 * - Company name map uses word boundaries (prevents "witch" → "itc")
 * - Pattern 4 (aggressive fallback) only fires for comparison with existing symbols
 */

import { ChatMessageType } from '../types/chatbot.types';

// ── Keyword lists (matched with \b word boundaries) ──

const INVESTMENT_KEYWORDS = [
  'stock', 'stocks', 'share', 'shares', 'price', 'quote',
  'market', 'markets', 'buy', 'buying', 'sell', 'selling',
  'hold', 'holding', 'holdings',
  'invest', 'investing', 'investment', 'investor',
  'trade', 'trading', 'trader',
  'analyze', 'analysis',
  'halal', 'shariah', 'sharia',
  'dividend', 'dividends', 'earnings',
  'pe ratio', 'market cap', 'p/e', 'eps',
  'revenue', 'profit',
  'nasdaq', 'nyse', 'sp500', 's&p', 'dow jones', 'dow',
  'index', 'etf', 'fund', 'funds',
  'bull', 'bullish', 'bear', 'bearish',
  'rally', 'crash', 'correction', 'valuation',
  'ipo', 'ipos', 'initial public offering', 'new listing', 'newly listed',
  'went public', 'just listed', 'public offering',
  'nifty', 'sensex', 'ticker', 'symbol',
];

const PORTFOLIO_KEYWORDS = [
  'portfolio', 'allocation', 'diversify', 'diversification', 'diversified',
  'asset mix', 'asset allocation',
  'rebalance', 'rebalancing', 'breakdown', 'distribution', 'sector',
];

/** Common company name → symbol mappings */
const COMPANY_SYMBOL_MAP: Record<string, string> = {
  // US stocks
  apple: 'AAPL',
  microsoft: 'MSFT',
  google: 'GOOGL',
  alphabet: 'GOOGL',
  amazon: 'AMZN',
  tesla: 'TSLA',
  meta: 'META',
  facebook: 'META',
  nvidia: 'NVDA',
  netflix: 'NFLX',
  disney: 'DIS',
  nike: 'NKE',
  intel: 'INTC',
  amd: 'AMD',
  ibm: 'IBM',
  oracle: 'ORCL',
  samsung: 'SSNLF',
  toyota: 'TM',
  walmart: 'WMT',
  jpmorgan: 'JPM',
  'bank of america': 'BAC',
  goldman: 'GS',
  boeing: 'BA',
  coca: 'KO',
  pepsi: 'PEP',
  johnson: 'JNJ',
  pfizer: 'PFE',
  visa: 'V',
  mastercard: 'MA',
  paypal: 'PYPL',
  uber: 'UBER',
  airbnb: 'ABNB',
  spotify: 'SPOT',
  snapchat: 'SNAP',
  twitter: 'X',
  coinbase: 'COIN',
  robinhood: 'HOOD',
  // Indian stocks (NSE)
  tcs: 'TCS',
  'tata consultancy': 'TCS',
  reliance: 'RELIANCE',
  infy: 'INFY',
  infosys: 'INFY',
  wipro: 'WIPRO',
  'hdfc bank': 'HDFCBANK',
  hdfc: 'HDFCBANK',
  icici: 'ICICIBANK',
  'icici bank': 'ICICIBANK',
  sbi: 'SBIN',
  'state bank': 'SBIN',
  bajaj: 'BAJFINANCE',
  'bajaj finance': 'BAJFINANCE',
  'tata motors': 'TATAMOTORS',
  'tata steel': 'TATASTEEL',
  maruti: 'MARUTI',
  'asian paints': 'ASIANPAINT',
  'sun pharma': 'SUNPHARMA',
  'bharti airtel': 'BHARTIARTL',
  airtel: 'BHARTIARTL',
  'kotak mahindra': 'KOTAKBANK',
  kotak: 'KOTAKBANK',
  'axis bank': 'AXISBANK',
  adani: 'ADANIENT',
  mahindra: 'M&M',
  'hcl tech': 'HCLTECH',
  'tech mahindra': 'TECHM',
  larsen: 'LT',
  'power grid': 'POWERGRID',
  titan: 'TITAN',
  itc: 'ITC',
  ultratech: 'ULTRACEMCO',
  // UK/European stocks
  bp: 'BP',
  shell: 'SHEL',
  hsbc: 'HSBC',
  unilever: 'ULVR',
  astrazeneca: 'AZN',
  // Middle East / Other
  sabic: '2010.SR',
  aramco: '2222.SR',
  'saudi aramco': '2222.SR',
  etisalat: '7020.SR',
};

/** Pre-built set of known ticker symbols from the company map (for case-insensitive lookup) */
const _knownTickers = new Set(Object.values(COMPANY_SYMBOL_MAP));

const COMPARISON_KEYWORDS = [
  'compare', 'comparison', ' vs ', 'versus', ' or ',
  'better', 'which is', 'which one', 'difference between',
];

const SCREENING_KEYWORDS = [
  'halal', 'haram', 'shariah', 'sharia', 'compliance', 'compliant',
  'screen', 'screening',
  'islamic', 'permissible', 'allowed', 'purification', 'purify',
  'aaoifi', 'tasis',
];

const VALUATION_KEYWORDS = [
  'value', 'valuation', 'dcf', 'intrinsic', 'p/e', 'pe ratio',
  'overvalued', 'undervalued', 'fair value', 'worth', 'fundamental',
  'roe', 'eps', 'earnings', 'revenue', 'profit',
];

const TIMING_KEYWORDS = [
  'buy now', 'sell now', 'entry point', 'exit point', 'technical',
  'rsi', 'ema', 'macd', 'momentum', 'overbought', 'oversold',
  'golden cross', 'death cross', 'chart', 'timing', 'when to',
];

const FULL_ANALYSIS_KEYWORDS = [
  'full analysis', 'complete analysis', 'analyze', 'analysis', 'deep dive',
  'everything about', 'should i invest', 'what do you think', 'opinion on',
];

/** Words that look like tickers but aren't */
const COMMON_WORDS = new Set([
  'I', 'A', 'IT', 'IS', 'BE', 'DO', 'AM', 'AN', 'AS', 'AT', 'BY',
  'IF', 'IN', 'NO', 'OF', 'ON', 'OR', 'SO', 'TO', 'UP', 'WE',
  'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN',
  'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'HAS', 'HIS', 'HOW', 'ITS',
  'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'WAY', 'WHO', 'DID', 'GET',
  'HIM', 'LET', 'SAY', 'SHE', 'TOO', 'USE', 'AI', 'MY', 'ME',
  'HE', 'US', 'GO', 'OK',
  'WHAT', 'WHEN', 'WHERE', 'WHY', 'WHICH', 'THAT', 'THIS', 'THEM',
  'THEN', 'THEY', 'WITH', 'FROM', 'INTO', 'HAVE', 'BEEN', 'WILL',
  'JUST', 'LIKE', 'ALSO', 'SOME', 'ONLY', 'MORE', 'MUCH', 'MOST',
  'VERY', 'WELL', 'SHOW', 'TELL', 'GIVE', 'LOOK', 'FIND', 'MAKE',
  'KNOW', 'TAKE', 'COME', 'WANT', 'GOOD', 'BEST', 'HELP', 'NEED',
  'DOES', 'DONE', 'EACH', 'BOTH', 'SAME', 'SUCH', 'OVER', 'EVEN',
  'BACK', 'MANY', 'LONG', 'LAST', 'NEXT', 'FULL', 'DEEP', 'THAN',
  'ABOUT', 'THINK', 'COULD', 'WOULD', 'THEIR', 'THESE', 'THOSE',
  'BEING', 'STILL', 'OTHER', 'AFTER', 'SINCE', 'RIGHT', 'GREAT',
  'STOCK', 'PRICE', 'HIGH', 'LOW', 'BUY', 'SELL', 'PUT', 'CALL',
  'HALAL', 'HARAM', 'ANY', 'ASK', 'RUN', 'YES', 'TOP', 'SET',
  'OWN', 'ADD', 'PAY', 'DAY', 'TRY', 'HAD', 'HOT', 'BIG', 'END',
  'RED', 'FAR', 'TAX', 'FEE', 'NET', 'RAW', 'LOT', 'FIT', 'RAN',
  'GOT', 'OMG', 'WOW', 'LOL', 'IDK', 'IMO', 'FYI', 'BTW', 'THO',
  'YET', 'AGO', 'OWE', 'DUE', 'CUT', 'MAN', 'GUY', 'BOY',
  'SIT', 'EAT', 'ATE', 'MET', 'LED', 'WON', 'DIE', 'BED', 'CAR',
  'DOG', 'CAT', 'JOB', 'WAR', 'AGE', 'ERA', 'GAP', 'MAP', 'LAW',
  'OIL', 'GAS', 'AIR', 'ICE', 'KEY', 'BAD', 'SAD', 'MAD', 'ODD',
  'ILL', 'BIT', 'MIX', 'DRY', 'WET', 'TIP', 'CUP', 'BAG', 'BOX',
  'ROW', 'ARM', 'LEG', 'LIP', 'EYE', 'EAR', 'SON', 'SIS', 'BRO',
  'MOM', 'DAD', 'LOST', 'HOME', 'WALK', 'WORK', 'LIFE', 'LOVE',
  'FEEL', 'FELT', 'HEAR', 'TOLD', 'WENT', 'LEFT', 'GAVE', 'TOOK',
  'KEPT', 'SURE', 'HOPE', 'LATE', 'SOON', 'HARD', 'EASY', 'REAL',
  'TRUE', 'FAKE', 'NICE', 'COOL', 'FINE', 'OKAY', 'DOWN', 'YEAH',
  'NOPE', 'STOP', 'WAIT', 'OPEN', 'SHUT', 'SEND', 'READ', 'TALK',
  'SAID', 'MEAN', 'KIND', 'SORT', 'TYPE', 'FORM',
  'PART', 'SIDE', 'HAND', 'HEAD', 'FACE', 'BODY', 'MIND', 'SOUL',
  'LIVE', 'DEAD', 'BORN', 'GREW', 'MADE', 'PAID', 'LAND', 'TOWN',
  'CITY', 'ROAD', 'PATH', 'DOOR', 'ROOM', 'FOOD', 'FISH', 'MEAT',
  'MILK', 'RICE', 'SALT', 'HIRE', 'FIRE', 'HATE', 'HATES', 'HATED', 'MISS',
  'PAIN', 'HURT', 'HEAL', 'SICK', 'WEAK', 'REST', 'PRAY', 'FAST',
  'DEEN', 'IMAN',
  // Emotional / conversational words people type in CAPS for emphasis
  'LOVES', 'LOVED', 'LIKES', 'LIKED', 'WANTS', 'NEEDS',
  'CRAZY', 'ANGRY', 'HAPPY', 'AWFUL', 'WORST', 'SCARY', 'SORRY',
  'NEVER', 'ALWAYS', 'EVERY', 'MAYBE', 'SUPER', 'EXTRA', 'TOTAL',
  'LEGIT', 'TRULY', 'DYING', 'SWEAR', 'TOXIC',
  'KILLS', 'SUCKS', 'CRIES', 'YELLS', 'SENDS', 'VIBES', 'BASED',
  'FACTS', 'WRONG', 'LYING', 'TRIED', 'KEEPS', 'CARES', 'CALLS',
  'COMES', 'GOES', 'TAKES', 'MAKES', 'GIVES', 'KNOWS', 'TELLS',
  'LOOKS', 'FEELS', 'MEANS', 'WORKS', 'PLAYS', 'STAYS', 'TURNS',
  'ASKED', 'THING', 'STUFF', 'POINT', 'CAUSE',
  'DOING', 'GOING', 'OMFG', 'LMAO', 'ROFL', 'DAMN', 'DUDE',
  'BRUH', 'FOMO', 'YOLO',
]);

// ── Helpers ──

const _regexCache = new Map<string, RegExp>();

/** Word-boundary keyword match */
function matchesWord(text: string, keyword: string): boolean {
  if (keyword.includes(' ') || keyword.includes('/')) {
    return text.includes(keyword);
  }
  let re = _regexCache.get(keyword);
  if (!re) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    re = new RegExp(`\\b${escaped}\\b`, 'i');
    _regexCache.set(keyword, re);
  }
  return re.test(text);
}

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => matchesWord(text, kw));
}

/** Detect if message is predominantly uppercase (user typing in ALL CAPS) */
function isAllCapsMessage(text: string): boolean {
  const alpha = text.replace(/[^a-zA-Z]/g, '');
  if (alpha.length < 4) return false;
  const upperCount = (alpha.match(/[A-Z]/g) || []).length;
  return upperCount / alpha.length > 0.6;
}

// ── Types ──

export type InvestmentIntent = 'screening' | 'valuation' | 'timing' | 'full_analysis' | 'none';

export interface InvestmentQueryResult {
  messageType: ChatMessageType;
  symbols: string[];
  isInvestmentQuery: boolean;
  isComparison: boolean;
  investmentIntent: InvestmentIntent;
}

export interface AnalyzeOptions {
  /** True if the recent conversation has been about investments (recent stock charts shown) */
  conversationIsAboutInvestments?: boolean;
}

/** Detect investment intent from message text */
function detectIntent(lower: string): InvestmentIntent {
  if (containsAny(lower, FULL_ANALYSIS_KEYWORDS)) return 'full_analysis';
  if (containsAny(lower, TIMING_KEYWORDS)) return 'timing';
  if (containsAny(lower, VALUATION_KEYWORDS)) return 'valuation';
  if (containsAny(lower, SCREENING_KEYWORDS)) return 'screening';
  return 'none';
}

// ── Symbol extraction internals ──

interface ExtractedSymbols {
  symbols: string[];
  /** True if at least one symbol came from explicit syntax ($AAPL) or deliberate ALL-CAPS ticker */
  hasExplicitTicker: boolean;
}

function extractSymbols(text: string, lower: string): ExtractedSymbols {
  const symbols = new Set<string>();
  let hasExplicitTicker = false;

  // Pattern 1: $AAPL style — always intentional
  const dollarMatches = text.matchAll(/\$([A-Za-z]{1,6})/g);
  for (const m of dollarMatches) {
    symbols.add(m[1].toUpperCase());
    hasExplicitTicker = true;
  }

  // Pattern 2: ALL-CAPS words that look like tickers (2-6 chars)
  // Skip if entire message is ALL CAPS (user is just shouting)
  if (!isAllCapsMessage(text)) {
    const capsMatches = text.matchAll(/\b([A-Z]{2,6})\b/g);
    for (const m of capsMatches) {
      if (!COMMON_WORDS.has(m[1])) {
        symbols.add(m[1]);
        // Only mark as explicit ticker if it's a KNOWN real ticker symbol.
        // Random caps words (e.g. "HATES", "CRAZY") typed for emphasis are NOT tickers.
        if (_knownTickers.has(m[1])) {
          hasExplicitTicker = true;
        }
      }
    }
  }

  // Pattern 2b: Known ticker symbols in any case (e.g., "aapl", "Tsla", "infy")
  // Only tickers ≥3 chars to avoid false positives from short ones like V, X, BA
  const msgWords = lower.split(/[\s,;:!?.()]+/);
  for (const word of msgWords) {
    const clean = word.replace(/[^a-z&.]/g, '').toUpperCase();
    if (clean.length >= 3 && _knownTickers.has(clean) && !COMMON_WORDS.has(clean)) {
      symbols.add(clean);
    }
  }

  // Pattern 3: Company name mappings (whole-word match)
  // These are "soft" matches — user might say "apple" without meaning the stock
  for (const [name, symbol] of Object.entries(COMPANY_SYMBOL_MAP)) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`).test(lower)) {
      symbols.add(symbol);
    }
  }

  // Pattern 4: Comparison fallback — only when we already have 1+ explicit symbols
  // and need more for a comparison query
  const hasComparisonContext = containsAny(lower, COMPARISON_KEYWORDS);
  if (hasComparisonContext && hasExplicitTicker && symbols.size < 3) {
    const words = text.split(/[\s,;:!?.()]+/);
    for (const word of words) {
      const clean = word.replace(/[^a-zA-Z&]/g, '').toUpperCase();
      if (clean.length >= 2 && clean.length <= 5 && !COMMON_WORDS.has(clean)) {
        symbols.add(clean);
      }
    }
  }

  return { symbols: Array.from(symbols), hasExplicitTicker };
}

// ── Main export ──

/**
 * Analyze a user message for investment content.
 *
 * @param text - The user's message
 * @param options - Conversation context to reduce false positives
 */
export function analyzeUserQuery(text: string, options?: AnalyzeOptions): InvestmentQueryResult {
  const lower = text.toLowerCase();
  const { symbols: rawSymbols, hasExplicitTicker } = extractSymbols(text, lower);
  const symbols = rawSymbols.slice(0, 3);
  const intent = detectIntent(lower);
  const hasInvestmentKeyword = containsAny(lower, INVESTMENT_KEYWORDS);
  const conversationContext = options?.conversationIsAboutInvestments === true;

  // Determine if symbols should be treated as investment-relevant.
  // Require at least one of:
  //   1. Explicit ticker syntax ($AAPL or deliberate ALL-CAPS like TSLA)
  //   2. Company name/ticker + investment keyword in the same message
  //   3. Company name/ticker + the conversation was already about investments
  const symbolsAreRelevant = symbols.length > 0 && (
    hasExplicitTicker ||
    hasInvestmentKeyword ||
    conversationContext
  );

  // Portfolio query
  if (symbolsAreRelevant && containsAny(lower, PORTFOLIO_KEYWORDS)) {
    return { messageType: ChatMessageType.pieChart, symbols, isInvestmentQuery: true, isComparison: false, investmentIntent: intent !== 'none' ? intent : 'full_analysis' };
  }

  // Comparison: 2+ relevant symbols + comparison keyword
  const hasComparisonKeyword = containsAny(lower, COMPARISON_KEYWORDS);
  if (symbolsAreRelevant && symbols.length >= 2 && hasComparisonKeyword) {
    return { messageType: ChatMessageType.comparison, symbols, isInvestmentQuery: true, isComparison: true, investmentIntent: intent !== 'none' ? intent : 'full_analysis' };
  }

  // Single/multi stock chart
  if (symbolsAreRelevant) {
    return { messageType: ChatMessageType.stockChart, symbols, isInvestmentQuery: true, isComparison: false, investmentIntent: intent !== 'none' ? intent : 'full_analysis' };
  }

  // No symbols but investment keywords present (general investment topic, no chart)
  if (hasInvestmentKeyword) {
    return { messageType: ChatMessageType.lineChart, symbols: [], isInvestmentQuery: true, isComparison: false, investmentIntent: intent };
  }

  return { messageType: ChatMessageType.text, symbols: [], isInvestmentQuery: false, isComparison: false, investmentIntent: 'none' };
}
