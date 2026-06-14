/**
 * Display-currency store (shared across EIM, Zakat, and any other feature
 * that renders monetary values).
 *
 * Default currency is detected from the browser locale on first load —
 * an Indian user sees ₹ totals, a US user sees $, a UK user sees £.
 * Override via the CurrencyPicker; the choice persists across sessions
 * in localStorage under `zaryah:currency` (same key as the original
 * EIM-scoped store so an existing user's selection carries over).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const SUPPORTED_CURRENCIES = [
  'USD', 'INR', 'GBP', 'EUR', 'CAD', 'AUD',
  'JPY', 'SGD', 'AED', 'SAR', 'HKD', 'CHF',
  'PKR', 'BDT', 'MYR',
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_META: Record<Currency, { flag: string; name: string }> = {
  USD: { flag: '🇺🇸', name: 'US Dollar' },
  INR: { flag: '🇮🇳', name: 'Indian Rupee' },
  GBP: { flag: '🇬🇧', name: 'British Pound' },
  EUR: { flag: '🇪🇺', name: 'Euro' },
  CAD: { flag: '🇨🇦', name: 'Canadian Dollar' },
  AUD: { flag: '🇦🇺', name: 'Australian Dollar' },
  JPY: { flag: '🇯🇵', name: 'Japanese Yen' },
  SGD: { flag: '🇸🇬', name: 'Singapore Dollar' },
  AED: { flag: '🇦🇪', name: 'UAE Dirham' },
  SAR: { flag: '🇸🇦', name: 'Saudi Riyal' },
  HKD: { flag: '🇭🇰', name: 'Hong Kong Dollar' },
  CHF: { flag: '🇨🇭', name: 'Swiss Franc' },
  PKR: { flag: '🇵🇰', name: 'Pakistani Rupee' },
  BDT: { flag: '🇧🇩', name: 'Bangladeshi Taka' },
  MYR: { flag: '🇲🇾', name: 'Malaysian Ringgit' },
};

const REGION_TO_CURRENCY: Record<string, Currency> = {
  US: 'USD',
  IN: 'INR',
  GB: 'GBP', UK: 'GBP',
  DE: 'EUR', FR: 'EUR', NL: 'EUR', ES: 'EUR', IT: 'EUR', BE: 'EUR',
  PT: 'EUR', AT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR',
  CA: 'CAD',
  AU: 'AUD',
  JP: 'JPY',
  SG: 'SGD',
  AE: 'AED',
  SA: 'SAR',
  HK: 'HKD',
  CH: 'CHF',
  PK: 'PKR',
  BD: 'BDT',
  MY: 'MYR',
};

function detectDefaultCurrency(): Currency {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const parts = locale.split('-');
    const region = (parts[parts.length - 1] || 'US').toUpperCase();
    return REGION_TO_CURRENCY[region] ?? 'USD';
  } catch {
    return 'USD';
  }
}

interface CurrencyState {
  displayCurrency: Currency;
  userOverridden: boolean;
  setDisplayCurrency: (c: Currency) => void;
  resetToLocale: () => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      displayCurrency: detectDefaultCurrency(),
      userOverridden: false,
      setDisplayCurrency: (c) => set({ displayCurrency: c, userOverridden: true }),
      resetToLocale: () =>
        set({ displayCurrency: detectDefaultCurrency(), userOverridden: false }),
    }),
    {
      name: 'zaryah:currency',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        displayCurrency: s.displayCurrency,
        userOverridden: s.userOverridden,
      }),
    },
  ),
);
