/**
 * Single source of truth for rendering money across the app.
 *
 * Every price/value in the UI passes through `format(amount, fromCurrency)`,
 * which converts to the user's chosen display currency using FX rates
 * fetched once per hour from `/api/eim/fx/rates`. Native rendering is
 * preserved when:
 *   - The from-currency equals the display currency
 *   - FX rates haven't loaded yet (no fake numbers)
 *   - The from-currency isn't covered by our rate map
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fxApi } from './api';
import { useCurrencyStore, type Currency } from './store';

const SYMBOL: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
  GBP: '£',
  EUR: '€',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  SGD: 'S$',
  AED: 'AED ',
  SAR: 'SAR ',
  HKD: 'HK$',
  CHF: 'CHF ',
  PKR: '₨',
  BDT: '৳',
  MYR: 'RM',
};

export function currencySymbol(c: Currency): string {
  return SYMBOL[c] ?? `${c} `;
}

interface FormatOpts {
  /** Override decimal places (default: 0 for JPY, 2 elsewhere). */
  maxDecimals?: number;
  /** Render `compact` (1.2K, 3.5M) for large hero numbers. */
  compact?: boolean;
}

export function useCurrencyFormat() {
  const displayCurrency = useCurrencyStore((s) => s.displayCurrency);

  const ratesQ = useQuery({
    queryKey: ['fx', 'rates'],
    queryFn: () => fxApi.getRates(),
    staleTime: 60 * 60_000, // 1h — matches backend cache
    refetchOnWindowFocus: false,
  });

  const rates = ratesQ.data?.rates;

  const convert = useMemo(() => {
    return (amount: number, from: Currency): number => {
      if (!isFinite(amount)) return amount;
      if (from === displayCurrency) return amount;
      if (!rates) return amount;
      const fromRate = rates[from];
      const toRate = rates[displayCurrency];
      if (!fromRate || !toRate || fromRate <= 0 || toRate <= 0) return amount;
      const usd = amount / fromRate; // from → USD
      return usd * toRate; // USD → target
    };
  }, [rates, displayCurrency]);

  const format = useMemo(() => {
    return (amount: number, from: Currency = 'USD', opts: FormatOpts = {}): string => {
      const converted = convert(amount, from);
      const ccy = rates ? displayCurrency : from; // No rates? Render native.
      const sym = currencySymbol(ccy);
      const decimals = opts.maxDecimals ?? (ccy === 'JPY' ? 0 : 2);
      if (opts.compact && Math.abs(converted) >= 1000) {
        return `${sym}${compactNumber(converted)}`;
      }
      return `${sym}${converted.toLocaleString(undefined, { maximumFractionDigits: decimals })}`;
    };
  }, [convert, rates, displayCurrency]);

  return {
    format,
    convert,
    displayCurrency,
    ratesReady: !!rates,
    isLoading: ratesQ.isLoading,
  };
}

function compactNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(2);
}
