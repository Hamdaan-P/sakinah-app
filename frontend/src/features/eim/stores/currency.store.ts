/**
 * Re-export shim — the store now lives in `@/lib/currency` so non-EIM
 * features (Zakat, etc.) can use the same display-currency selection.
 * Existing EIM imports continue to work unchanged.
 */

export {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
  type Currency,
} from '@/lib/currency/store';
