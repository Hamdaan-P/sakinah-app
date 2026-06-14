/**
 * Standalone FX rates fetcher. The backend route stays under /api/eim/fx/rates
 * (the lib avoids a cross-feature import of eim.service); the endpoint is a
 * thin yfinance-backed cache that anyone can hit, not EIM-specific.
 */

import { authGet } from '@/lib/api';

export interface FxRatesResponse {
  base: 'USD';
  /** Map of currency code → how many of that currency one USD buys.
   *  USD itself is always 1.0. Missing entries mean yfinance couldn't
   *  fetch that pair — the frontend renders native currency for them. */
  rates: Record<string, number>;
  /** Currencies the backend will *attempt* to fetch — useful even if a
   *  few are missing from `rates` in the current payload. */
  supported: string[];
  as_of: string;
}

export const fxApi = {
  getRates: () => authGet<FxRatesResponse>('/api/eim/fx/rates'),
};
