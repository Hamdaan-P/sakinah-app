/**
 * Chart Data Builder
 * Fetches financial data and constructs ChartData objects for rendering
 */

import type { ChartData, StockMetric, NormalizedDataPoint, ComparisonStockData, HistoricalDataPoint, PieChartSlice } from '../types/chatbot.types';
import { ChatMessageType } from '../types/chatbot.types';
import { fetchHistoricalData, fetchFullQuotes, fetchStockAnalysis } from '../services/chatbotService';
import type { StockQuote } from '../services/chatbotService';

/** Format large numbers: 2900000000000 → "$2.9T" */
function formatLargeNumber(num: number | undefined): string {
  if (num == null) return 'N/A';
  const abs = Math.abs(num);
  if (abs >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

function buildMetrics(quote: StockQuote): StockMetric[] {
  return [
    { label: 'Market Cap', value: formatLargeNumber(quote.marketCap) },
    { label: 'Volume', value: formatLargeNumber(quote.volume) },
    { label: 'Open', value: quote.open != null ? `$${quote.open.toFixed(2)}` : 'N/A' },
    { label: 'High', value: quote.high != null ? `$${quote.high.toFixed(2)}` : 'N/A' },
    { label: 'Low', value: quote.low != null ? `$${quote.low.toFixed(2)}` : 'N/A' },
    { label: 'Prev Close', value: quote.previousClose != null ? `$${quote.previousClose.toFixed(2)}` : 'N/A' },
  ];
}

/** Build chart data for a stock symbol, fetching historical + quote data in parallel */
export async function buildStockChartData(
  symbol: string,
  period: string = '1M'
): Promise<ChartData> {
  const [series, quotes] = await Promise.all([
    fetchHistoricalData(symbol, period).catch(() => []),
    fetchFullQuotes([symbol]).catch(() => []),
  ]);

  const quote = quotes[0];

  return {
    type: ChatMessageType.stockChart,
    stock: {
      symbol,
      companyName: quote?.companyName ?? symbol,
      price: quote?.price ?? (series.length > 0 ? series[series.length - 1].close : 0),
      change: quote?.change ?? 0,
      changePercent: quote?.changePercent ?? 0,
      isHalal: quote?.isHalal,
      series,
      metrics: quote ? buildMetrics(quote) : [],
      period,
    },
  };
}

/** Build chart data with 4-layer analysis, fetching chart + analysis in parallel */
export async function buildAnalysisData(
  symbol: string,
  analysisType: string = 'full_analysis',
  period: string = '1M'
): Promise<ChartData> {
  const [chartData, analysis] = await Promise.all([
    buildStockChartData(symbol, period).catch(() => null),
    fetchStockAnalysis(symbol, analysisType).catch(() => null),
  ]);

  const base: ChartData = chartData ?? {
    type: ChatMessageType.stockChart,
    stock: {
      symbol,
      companyName: analysis?.name ?? symbol,
      price: analysis?.current_price ?? 0,
      change: analysis?.change ?? 0,
      changePercent: analysis?.change_percent ?? 0,
      series: [],
      metrics: [],
      period,
    },
  };

  if (analysis) {
    base.analysis = analysis;
  }

  return base;
}

/** Convert raw close prices to % change from period start */
function normalizeSeries(series: HistoricalDataPoint[]): NormalizedDataPoint[] {
  if (series.length === 0) return [];
  const basePrice = series[0].close;
  if (basePrice === 0) return series.map((p) => ({ date: p.date, percentChange: 0, close: p.close }));
  return series.map((p) => ({
    date: p.date,
    percentChange: ((p.close - basePrice) / basePrice) * 100,
    close: p.close,
  }));
}

/** Build comparison data for multiple symbols */
export async function buildComparisonData(
  symbols: string[],
  period: string = '1M'
): Promise<ChartData> {
  // Fetch lightweight data (historical + quotes) in parallel — these are fast
  const lightData = await Promise.all(
    symbols.map(async (symbol) => {
      const [series, quotes] = await Promise.all([
        fetchHistoricalData(symbol, period).catch(() => []),
        fetchFullQuotes([symbol]).catch(() => []),
      ]);
      return { symbol, series, quote: quotes[0] };
    })
  );

  // Fetch heavy analysis SEQUENTIALLY to avoid yfinance rate-limiting
  // (each analysis makes ~4 yfinance calls; parallel calls overwhelm it)
  const analysisMap: Record<string, Awaited<ReturnType<typeof fetchStockAnalysis>> | null> = {};
  for (const symbol of symbols) {
    analysisMap[symbol] = await fetchStockAnalysis(symbol, 'full_analysis').catch(() => null);
  }

  const results = lightData.map(({ symbol, series, quote }) => ({
    symbol,
    series,
    quote,
    analysis: analysisMap[symbol] ?? null,
  }));

  const stocks: ComparisonStockData[] = results.map(({ symbol, series, quote, analysis }) => ({
    symbol,
    companyName: quote?.companyName ?? analysis?.name ?? symbol,
    price: quote?.price ?? analysis?.current_price ?? (series.length > 0 ? series[series.length - 1].close : 0),
    change: quote?.change ?? analysis?.change ?? 0,
    changePercent: quote?.changePercent ?? analysis?.change_percent ?? 0,
    isHalal: quote?.isHalal,
    normalizedSeries: normalizeSeries(series),
    trailingPE: analysis?.fundamentals?.trailing_pe,
    roe: analysis?.fundamentals?.roe,
    overallVerdict: analysis?.overall_verdict,
    shariahCompliant: analysis?.shariah?.is_compliant,
    shariahStandard: analysis?.shariah?.standard,
  }));

  return {
    type: ChatMessageType.comparison,
    comparison: { stocks, period },
  };
}

/** Color palette for pie chart slices */
const PIE_COLORS = [
  '#D4A853', '#38BDF8', '#4ADE80', '#F472B6', '#A78BFA',
  '#FB923C', '#22D3EE', '#FACC15', '#E879F9', '#34D399',
];

/** Parse "AAPL:50, MSFT:30" style quantities from user text */
function parseQuantities(text: string): Record<string, number> {
  const quantities: Record<string, number> = {};
  const matches = text.matchAll(/([A-Za-z]{1,6})\s*:\s*(\d+(?:\.\d+)?)/g);
  for (const m of matches) {
    quantities[m[1].toUpperCase()] = parseFloat(m[2]);
  }
  return quantities;
}

/** Build pie chart data for portfolio allocation */
export async function buildPortfolioChartData(
  symbols: string[],
  userText: string
): Promise<ChartData> {
  const quantities = parseQuantities(userText);
  const quotes = await fetchFullQuotes(symbols).catch(() => []);

  const slices: PieChartSlice[] = [];
  const hasQuantities = symbols.some((s) => quantities[s] != null);

  if (hasQuantities && quotes.length > 0) {
    // Calculate actual dollar values
    let totalValue = 0;
    const holdings: Array<{ symbol: string; value: number }> = [];
    for (const q of quotes) {
      const qty = quantities[q.symbol] ?? 0;
      const value = qty * q.price;
      totalValue += value;
      holdings.push({ symbol: q.symbol, value });
    }
    for (let i = 0; i < holdings.length; i++) {
      const pct = totalValue > 0 ? (holdings[i].value / totalValue) * 100 : 0;
      slices.push({
        name: holdings[i].symbol,
        value: Math.round(pct * 10) / 10,
        color: PIE_COLORS[i % PIE_COLORS.length],
      });
    }
  } else {
    // Equal-weight allocation
    const weight = Math.round((100 / symbols.length) * 10) / 10;
    for (let i = 0; i < symbols.length; i++) {
      slices.push({
        name: symbols[i],
        value: weight,
        color: PIE_COLORS[i % PIE_COLORS.length],
      });
    }
  }

  return {
    type: ChatMessageType.pieChart,
    pieSlices: slices,
  };
}
