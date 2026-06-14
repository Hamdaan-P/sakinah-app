/**
 * Shared currency utilities. Import from here for any feature that renders
 * money: `import { CurrencyPicker, useCurrencyFormat, useCurrencyStore } from '@/lib/currency'`.
 */

export {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
  CURRENCY_META,
  type Currency,
} from './store';
export { CurrencyPicker } from './CurrencyPicker';
export { useCurrencyFormat, currencySymbol } from './useCurrencyFormat';
export { fxApi, type FxRatesResponse } from './api';
