/**
 * LocalStorage cache + formatters for the live Screener data.
 */

import type { ShariahScreenResult as BackendScreenResult } from '@/features/chatbot/types/chatbot.types';

export const CACHE_KEY = 'screener_live_data';
export const CACHE_TS_KEY = 'screener_live_ts';
export const CACHE_STD_KEY = 'screener_live_std';
export const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes — matches backend TTL
export const CACHE_FRESH_TTL = 60 * 1000;   // <1min old: skip the refetch entirely

export function getCacheAgeMs(standard: string): number | null {
  try {
    const ts = localStorage.getItem(CACHE_TS_KEY);
    const std = localStorage.getItem(CACHE_STD_KEY);
    if (!ts || std !== standard) return null;
    return Date.now() - Number(ts);
  } catch { return null; }
}

export interface LiveStockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: string;
  marketCapLabel: string;
  backendScreen?: BackendScreenResult;
}

export function loadCachedScreenerData(standard: string): Record<string, LiveStockData> | null {
  try {
    const ts = localStorage.getItem(CACHE_TS_KEY);
    const std = localStorage.getItem(CACHE_STD_KEY);
    if (!ts || !std || std !== standard) return null;
    if (Date.now() - Number(ts) > CACHE_MAX_AGE) return null;
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveCachedScreenerData(data: Record<string, LiveStockData>, standard: string) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
    localStorage.setItem(CACHE_STD_KEY, standard);
  } catch { /* storage full — ignore */ }
}

export function formatVolume(vol: number): string {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
  return String(vol);
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
  return `$${cap.toLocaleString()}`;
}

export const LOADING_MESSAGES = [
  'Fetching live quotes…',
  'Running Shariah screening…',
];

export type FilterType = 'all' | 'compliant' | 'non-compliant';
