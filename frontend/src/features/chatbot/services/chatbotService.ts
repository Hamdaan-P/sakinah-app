/**
 * Chatbot API Service
 * Client for FastAPI backend endpoints: /chat, /chat/companion, /chat/islamic, /companions
 */

import type {
  ChatRequest,
  ChatResponse,
  CompanionChatRequest,
  CompanionChatResponse,
  IslamicChatRequest,
  IslamicChatResponse,
  HistoricalDataPoint,
  StockAnalysisResult,
  ShariahScreenResult,
} from '../types/chatbot.types';

import { auth } from '@/config/firebase.config';
import { BACKEND_URL, authPost as post, authGet as get } from '@/lib/api';

/** Get Firebase ID token for streaming requests. */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch { /* continue without auth */ }
  return headers;
}

/** Send a message to the main Raya chatbot (POST /chat) */
export async function sendMessage(req: ChatRequest): Promise<ChatResponse> {
  return post<ChatResponse>('/chat', req);
}

/** SSE event from /chat/stream and /chat/companion/stream */
export interface StreamEvent {
  type: 'token' | 'done' | 'error' | 'thinking';
  content?: string;
  suggestions?: string[];
  suggested_companion?: string;
  suggested_companion_name?: string;
  navigate_links?: Array<{ label: string; route: string }>;
  ai_source?: string;
  // RAYA EVOLUTION: Emotion data from background analysis
  emotion_data?: {
    primary_emotion: string;
    secondary_emotion?: string;
    intensity: number;
    sentiment: number;
    underlying_need?: string;
    cognitive_pattern?: string;
  };
  emotional_mode?: string;
  crisis_tier?: number;
  // Phase 6: conversation summary update
  summary_update?: string;
  // Companion streaming: metadata merged from done event
  companion_id?: string;
  companion_name?: string;
  voice_id?: string;
  sources?: Array<Record<string, unknown>>;
  confidence?: number;
  // Verified Quran text — replaces streamed text with API-verified citations
  verified_text?: string;
}

/** Stream a message from Raya via SSE (POST /chat/stream) */
export async function streamMessage(
  req: ChatRequest,
  onChunk: (text: string) => void,
  onDone: (event: StreamEvent) => void,
  onThinking?: (content: string) => void,
): Promise<void> {
  // 90s timeout for the initial fetch (backend may take time for agent/RAG)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  const headers = await getAuthHeaders();

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req),
      signal: controller.signal,
    });
  } catch (fetchErr) {
    clearTimeout(timeout);
    if (fetchErr instanceof DOMException && fetchErr.name === 'AbortError') {
      throw new Error('Request timed out — the server took too long to respond.');
    }
    throw new Error(`Cannot reach the backend server at ${BACKEND_URL}. Is it running?`);
  }
  clearTimeout(timeout);

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Backend error ${res.status}: ${err}`);
  }
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE lines
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      try {
        const event: StreamEvent = JSON.parse(trimmed.slice(6));
        if (event.type === 'token' && event.content) {
          onChunk(event.content);
        } else if (event.type === 'thinking' && event.content && onThinking) {
          onThinking(event.content);
        } else if (event.type === 'done') {
          onDone(event);
        } else if (event.type === 'error') {
          throw new Error(event.content ?? 'Stream error from backend');
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue; // skip malformed JSON
        throw e;
      }
    }
  }
}

/** Stream a message from a companion persona via SSE (POST /chat/companion/stream) */
export async function streamCompanionMessage(
  req: CompanionChatRequest,
  onChunk: (text: string) => void,
  onDone: (event: StreamEvent) => void,
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  const headers = await getAuthHeaders();

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/chat/companion/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req),
      signal: controller.signal,
    });
  } catch (fetchErr) {
    clearTimeout(timeout);
    if (fetchErr instanceof DOMException && fetchErr.name === 'AbortError') {
      throw new Error('Request timed out — the server took too long to respond.');
    }
    throw new Error(`Cannot reach the backend server at ${BACKEND_URL}. Is it running?`);
  }
  clearTimeout(timeout);

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Backend error ${res.status}: ${err}`);
  }
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      try {
        const event: StreamEvent = JSON.parse(trimmed.slice(6));
        if (event.type === 'token' && event.content) {
          onChunk(event.content);
        } else if (event.type === 'done') {
          onDone(event);
        } else if (event.type === 'error') {
          throw new Error(event.content ?? 'Stream error from backend');
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
}

/** Send a message to a companion persona (POST /chat/companion) */
export async function sendCompanionMessage(req: CompanionChatRequest): Promise<CompanionChatResponse> {
  return post<CompanionChatResponse>('/chat/companion', req);
}

/** Send an Islamic knowledge query (POST /chat/islamic) */
export async function sendIslamicMessage(req: IslamicChatRequest): Promise<IslamicChatResponse> {
  return post<IslamicChatResponse>('/chat/islamic', req);
}

// Removed P2.9 (audit): `fetchCompanions()` was a wrapper around the
// /companions backend endpoint that was never invoked anywhere — the
// frontend uses the hardcoded COMPANIONS array in chatbot.types.ts which
// includes UI fields (icon, section, welcomeMessage) the backend doesn't
// return. Backend endpoint now auth-gated; bring the wrapper back if you
// ever need dynamic admin-edited companion lists.

/** Reset conversation for a user (POST /reset/{userId}) */
export async function resetConversation(userId: string): Promise<void> {
  await post(`/reset/${userId}`, {});
}

/** Health check (GET /health) */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ==================== FINANCIAL DATA ENDPOINTS ====================

export interface StockQuote {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  isHalal?: boolean;
}

/** Response shape from /api/historical/{symbol} */
interface HistoricalResponse {
  symbol: string;
  period: string;
  interval: string;
  data_points: number;
  data: HistoricalDataPoint[];
}

/** Fetch historical price data for a symbol */
export async function fetchHistoricalData(
  symbol: string,
  period: string = '1M'
): Promise<HistoricalDataPoint[]> {
  const res = await get<HistoricalResponse>(`/api/historical/${encodeURIComponent(symbol)}?period=${period}`);
  return Array.isArray(res) ? res : (res.data ?? []);
}

/** Raw quote shape from backend (dict keyed by symbol) */
interface RawQuoteData {
  last_price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  percent_change: number;
  previous_close: number;
  company_name: string;
  ticker_symbol: string;
}

/** Fetch full quotes for multiple symbols */
export async function fetchFullQuotes(symbols: string[]): Promise<StockQuote[]> {
  const raw = await post<Record<string, RawQuoteData>>('/api/quotes/full', { symbols });
  // Backend returns { "AAPL": { last_price, ... } } — convert to StockQuote[]
  if (Array.isArray(raw)) return raw as unknown as StockQuote[];
  return Object.entries(raw).map(([sym, d]) => ({
    symbol: sym,
    companyName: d.company_name ?? sym,
    price: d.last_price ?? 0,
    change: d.change ?? 0,
    changePercent: d.percent_change ?? 0,
    volume: d.volume,
    open: d.open,
    high: d.high,
    low: d.low,
    previousClose: d.previous_close,
    marketCap: undefined,
  }));
}

// ==================== STOCK ANALYSIS ENDPOINTS ====================

/** Fetch 4-layer stock analysis (POST /api/stock/analyze) */
export async function fetchStockAnalysis(
  symbol: string,
  analysisType: string = 'full_analysis',
  standard: string = 'AAOIFI',
): Promise<StockAnalysisResult> {
  return post<StockAnalysisResult>('/api/stock/analyze', {
    symbol,
    analysis_type: analysisType,
    standard,
  });
}

/** Fetch single-stock Shariah screening (GET /api/stock/screen/{symbol}) */
export async function fetchShariahScreen(
  symbol: string,
  standard: string = 'AAOIFI',
): Promise<ShariahScreenResult> {
  return get<ShariahScreenResult>(`/api/stock/screen/${encodeURIComponent(symbol)}?standard=${standard}`);
}

/** Search stocks by name/symbol (GET /api/search?q=...) */
export async function searchStocks(
  query: string,
): Promise<{ symbol: string; name: string; exchange?: string }[]> {
  const res = await get<{ status: string; data: { symbol?: string; tradingsymbol?: string; name: string; exchange?: string }[] }>(
    `/api/search?q=${encodeURIComponent(query)}`
  );
  return (res.data || []).map(item => ({
    symbol: item.symbol || item.tradingsymbol || '',
    name: item.name,
    exchange: item.exchange,
  })).filter(item => item.symbol);
}

/** Fetch batch Shariah screening (POST /api/stock/screen/batch) */
export async function fetchBatchScreen(
  symbols: string[],
  standard: string = 'AAOIFI',
): Promise<{ results: ShariahScreenResult[] }> {
  return post<{ results: ShariahScreenResult[] }>('/api/stock/screen/batch', {
    symbols,
    standard,
  });
}

/** Fetch combined screener data (quotes + screening in one call) */
export async function fetchScreenerFull(
  standard: string = 'AAOIFI',
  limit: number = 30,
  offset: number = 0,
): Promise<{
  status: string;
  count: number;
  standard: string;
  stocks: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    change_pct: number;
    volume: number;
    market_cap: number;
    screen: ShariahScreenResult;
  }>;
}> {
  return get(`/api/screener/full?standard=${standard}&limit=${limit}&offset=${offset}`);
}

// ==================== IPO ENDPOINTS ====================

export interface IPOStock {
  symbol: string;
  name: string;
  ipo_date: string;
  sector: string;
  industry: string;
  price: number;
  change: number;
  change_percent: number;
  market_cap: number;
  exchange: string;
}

/** Fetch recent IPOs (GET /api/ipo/recent) */
export async function fetchRecentIPOs(limit: number = 20): Promise<{ status: string; count: number; data: IPOStock[] }> {
  return get<{ status: string; count: number; data: IPOStock[] }>(`/api/ipo/recent?limit=${limit}`);
}

/** Search IPOs (GET /api/ipo/search) */
export async function searchIPOs(query: string, limit: number = 10): Promise<{ status: string; count: number; data: IPOStock[] }> {
  return get<{ status: string; count: number; data: IPOStock[] }>(`/api/ipo/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

// ==================== FEEDBACK & INSIGHTS ENDPOINTS ====================

/** Submit feedback on an AI message (POST /learn?...) */
export async function submitFeedback(
  userId: string,
  messageId: string,
  feedback: 'up' | 'down',
  rating: number,
): Promise<{ status: string }> {
  const params = new URLSearchParams({
    user_id: userId,
    message_id: messageId,
    feedback,
    rating: String(rating),
  });
  const headers = await getAuthHeaders();
  const res = await fetch(`${BACKEND_URL}/learn?${params}`, { method: 'POST', headers });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Feedback error ${res.status}: ${err}`);
  }
  return res.json();
}

/** Fetch user insights (GET /insights/{userId}) */
export async function getUserInsights(
  userId: string,
): Promise<{ insights: Record<string, unknown> }> {
  return get<{ insights: Record<string, unknown> }>(`/insights/${encodeURIComponent(userId)}`);
}

/** SOULBUDDY: Fetch weekly insights with 6 categories (GET /insights/weekly/{userId}) */
export async function getWeeklyInsights(
  userId: string,
): Promise<{ summary: string; insights: Array<{ type: string; title: string; description: string; data?: Record<string, unknown> }>; period_start: string; period_end: string }> {
  return get(`/insights/weekly/${encodeURIComponent(userId)}`);
}
