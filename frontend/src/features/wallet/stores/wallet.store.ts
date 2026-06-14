/**
 * Wallet Store
 * Manages DNZ balance, transactions, and daily login state.
 * Uses Zustand with persistence for offline balance caching.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from '@/core/stores/auth.store';
import {
  fetchDNZBalance,
  claimDailyLogin,
  fetchDNZHistory,
  fetchDNZDailySummary,
  subscribeDNZBalance,
  type DNZAwardResult,
  type DNZTransaction,
  type DNZDailySummaryResponse,
} from '../services/walletService';

interface WalletState {
  // Balance
  balance: number;
  lifetimeEarned: number;
  todayEarned: number;
  todayRemaining: number;
  dailyCap: number;
  loginClaimedToday: boolean;

  // Transactions
  transactions: DNZTransaction[];
  transactionsLoading: boolean;

  // Daily summary
  dailySummary: DNZDailySummaryResponse | null;

  // Loading / error
  balanceLoading: boolean;
  claimLoading: boolean;
  error: string | null;

  // Last award notification (for toast/animation)
  lastAward: DNZAwardResult | null;
}

interface WalletActions {
  refreshBalance: () => Promise<void>;
  claimLogin: () => Promise<DNZAwardResult | null>;
  fetchHistory: (limit?: number) => Promise<void>;
  fetchDailySummary: () => Promise<void>;
  clearLastAward: () => void;
  reset: () => void;
  /** Start a Firestore live listener on the user's DNZ balance. Returns unsubscribe. */
  startLiveBalance: () => () => void;
}

const initialState: WalletState = {
  balance: 0,
  lifetimeEarned: 0,
  todayEarned: 0,
  todayRemaining: 50,
  dailyCap: 50,
  loginClaimedToday: false,
  transactions: [],
  transactionsLoading: false,
  dailySummary: null,
  balanceLoading: false,
  claimLoading: false,
  error: null,
  lastAward: null,
};

export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      refreshBalance: async () => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return;

        const prevBalance = get().balance;
        set({ balanceLoading: true, error: null });
        try {
          const data = await fetchDNZBalance(user.id);
          const earned = data.total - prevBalance;

          const updates: Partial<WalletState> = {
            balance: data.total,
            lifetimeEarned: data.lifetime_earned,
            todayEarned: data.today_earned,
            todayRemaining: data.today_remaining,
            dailyCap: data.daily_cap,
            loginClaimedToday: data.login_claimed_today,
            balanceLoading: false,
          };

          // Detect new earnings and trigger reward toast
          if (earned > 0 && prevBalance > 0) {
            updates.lastAward = {
              awarded: true,
              amount: earned,
              new_balance: data.total,
              reason: 'Activity reward',
              daily_total: data.today_earned,
              daily_remaining: data.today_remaining,
            };
          }

          set(updates);
        } catch (e) {
          console.error('Failed to fetch DNZ balance:', e);
          set({ balanceLoading: false, error: String(e) });
        }
      },

      claimLogin: async () => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return null;

        if (get().loginClaimedToday) return null;

        set({ claimLoading: true });
        try {
          const result = await claimDailyLogin(user.id);
          if (result.awarded) {
            set({
              balance: result.new_balance,
              todayEarned: result.daily_total,
              todayRemaining: result.daily_remaining,
              loginClaimedToday: true,
              lastAward: result,
              claimLoading: false,
            });
          } else {
            set({
              loginClaimedToday: true,
              claimLoading: false,
            });
          }
          return result;
        } catch (e) {
          console.error('Failed to claim daily login:', e);
          set({ claimLoading: false });
          return null;
        }
      },

      fetchHistory: async (limit = 50) => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return;

        set({ transactionsLoading: true });
        try {
          const data = await fetchDNZHistory(user.id, limit);
          set({ transactions: data.transactions, transactionsLoading: false });
        } catch (e) {
          console.error('Failed to fetch DNZ history:', e);
          set({ transactionsLoading: false });
        }
      },

      fetchDailySummary: async () => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return;
        try {
          const data = await fetchDNZDailySummary(user.id);
          set({ dailySummary: data });
        } catch (e) {
          console.error('Failed to fetch daily summary:', e);
        }
      },

      clearLastAward: () => set({ lastAward: null }),

      startLiveBalance: () => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return () => {};
        const unsub = subscribeDNZBalance(user.id, (live) => {
          const prev = get().balance;
          const earned = live.total - prev;
          const updates: Partial<WalletState> = {
            balance: live.total,
            lifetimeEarned: live.lifetime_earned,
          };
          if (typeof live.today_earned === 'number') updates.todayEarned = live.today_earned;
          // Detect new earnings from server-side and trigger reward toast
          if (earned > 0 && prev > 0) {
            updates.lastAward = {
              awarded: true,
              amount: earned,
              new_balance: live.total,
              reason: 'Activity reward',
              daily_total: live.today_earned ?? get().todayEarned,
              daily_remaining: get().todayRemaining,
            };
          }
          set(updates);
        });
        return unsub;
      },

      reset: () => set(initialState),
    }),
    {
      name: 'zaryah-wallet',
      partialize: (state) => ({
        balance: state.balance,
        loginClaimedToday: state.loginClaimedToday,
        todayEarned: state.todayEarned,
      }),
    },
  ),
);
