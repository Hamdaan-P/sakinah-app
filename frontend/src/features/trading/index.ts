/**
 * Halal Trading (EIM v2) — public exports for the read-only terminal (T1).
 * The separate "Halal Trading" product section (Model A / A1).
 */

export { TradingHomePage } from './pages/TradingHomePage';
export { StockDetailPage } from './pages/StockDetailPage';
export { WatchlistPage } from './pages/WatchlistPage';
export { useWatchlistStore } from './stores/watchlist.store';
export type { Stock, ComplianceStandard } from './types/trading.types';
