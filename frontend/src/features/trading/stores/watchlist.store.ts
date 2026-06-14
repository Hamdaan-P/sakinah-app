/**
 * Halal Trading — watchlist store (localStorage-persisted).
 * v1: a simple set of symbols the user has starred. No backend sync yet.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface WatchlistState {
  symbols: string[];
  isWatched: (symbol: string) => boolean;
  toggle: (symbol: string) => void;
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: [],
      isWatched: (symbol) => get().symbols.includes(symbol),
      toggle: (symbol) =>
        set((s) =>
          s.symbols.includes(symbol)
            ? { symbols: s.symbols.filter((x) => x !== symbol) }
            : { symbols: [symbol, ...s.symbols] },
        ),
      add: (symbol) =>
        set((s) => (s.symbols.includes(symbol) ? s : { symbols: [symbol, ...s.symbols] })),
      remove: (symbol) => set((s) => ({ symbols: s.symbols.filter((x) => x !== symbol) })),
    }),
    {
      name: 'zaryah.trading.watchlist',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
