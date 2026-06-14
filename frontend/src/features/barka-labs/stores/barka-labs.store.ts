/**
 * Barka Labs Store
 * Manages blessings list, stats, and milestone notifications.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from '@/core/stores/auth.store';
import * as api from '../services/barkaLabsService';
import { updateShukrSnapshot } from '@/features/public-profile/services/publicProfileService';
import type {
  Blessing,
  BarkaLabsStats,
  MilestoneAward,
  DecompositionResponse,
  PercentileData,
  LeaderboardEntry,
  GlobalStats,
  BuddyEntry,
} from '../types/barka-labs.types';

interface BarkaLabsState {
  blessings: Blessing[];
  stats: BarkaLabsStats;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  lastMilestones: MilestoneAward[];
  lastDnzAwarded: number;
  activeDecomposition: DecompositionResponse | null;
  decomposing: boolean;
  percentile: PercentileData | null;
  leaderboard: LeaderboardEntry[];
  globalStats: GlobalStats | null;
  buddies: BuddyEntry[];
  // Cache timestamps (5-min TTL) — internal, not for UI consumption
  _lastLeaderboardFetch: number;
  _lastBuddiesFetch: number;
  _lastGlobalStatsFetch: number;
}

interface BarkaLabsActions {
  logBlessing: (text: string) => Promise<void>;
  fetchBlessings: (limit?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  deleteBlessing: (blessingId: string) => Promise<void>;
  decomposeBlessing: (blessingId: string) => Promise<void>;
  fetchPercentile: () => Promise<void>;
  clearDecomposition: () => void;
  clearMilestones: () => void;
  fetchLeaderboard: () => Promise<void>;
  fetchGlobalStats: () => Promise<void>;
  fetchBuddies: () => Promise<void>;
  reset: () => void;
}

/**
 * Convert BarkaLabsStats into the slim ShukrSnapshot we mirror to the
 * public_profiles doc. Level tiers are based on total_blessings:
 *   0 starting (0-29), 1 practising (30-99), 2 committed (100-364),
 *   3 dedicated (365-999), 4 master (1000+).
 */
function deriveShukrSnapshot(stats: BarkaLabsStats) {
  const t = stats.total_blessings;
  const level = t >= 1000 ? 4 : t >= 365 ? 3 : t >= 100 ? 2 : t >= 30 ? 1 : 0;
  return {
    level,
    currentStreak: stats.current_streak,
    totalBlessings: stats.total_blessings,
    avgDepthScore: stats.avg_depth_score,
    lastActiveDate: stats.last_blessing_date,
  };
}

const defaultStats: BarkaLabsStats = {
  total_blessings: 0,
  total_score: 0,
  avg_depth_score: 0,
  profound_count: 0,
  thoughtful_count: 0,
  common_count: 0,
  current_streak: 0,
  longest_streak: 0,
  last_blessing_date: null,
  milestones_claimed: {},
};

const initialState: BarkaLabsState = {
  blessings: [],
  stats: defaultStats,
  loading: false,
  submitting: false,
  error: null,
  lastMilestones: [],
  lastDnzAwarded: 0,
  activeDecomposition: null,
  decomposing: false,
  percentile: null,
  leaderboard: [],
  globalStats: null,
  buddies: [],
  _lastLeaderboardFetch: 0,
  _lastBuddiesFetch: 0,
  _lastGlobalStatsFetch: 0,
};

export const useBarkaLabsStore = create<BarkaLabsState & BarkaLabsActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      logBlessing: async (text: string) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        set({ submitting: true, error: null });
        try {
          const res = await api.logBlessing(userId, text);
          set((s) => ({
            blessings: [res.blessing, ...s.blessings],
            stats: res.stats,
            lastMilestones: res.milestones_triggered,
            lastDnzAwarded: res.total_dnz_awarded,
            submitting: false,
          }));
          // Mirror to public profile so Discover ranker can match on Shukr.
          void updateShukrSnapshot(userId, deriveShukrSnapshot(res.stats));

          // Auto-decompose with fast Groq LLM
          const blessingId = res.blessing.id;
          set({ decomposing: true });
          try {
            const decomp = await api.decomposeBlessing(userId, blessingId);
            if (decomp && decomp.decomposition) {
              set({ activeDecomposition: decomp, decomposing: false });
            } else {
              set({ decomposing: false });
            }
          } catch (decompErr) {
            console.error('[Barka Labs] Decomposition failed:', decompErr);
            set({ decomposing: false });
          }
        } catch (e) {
          set({ error: (e as Error).message, submitting: false });
          throw e;
        }
      },

      fetchBlessings: async (limit = 50) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        set({ loading: true, error: null });
        try {
          const res = await api.getBlessings(userId, limit);
          set({ blessings: res.blessings, loading: false });
        } catch (e) {
          set({ error: (e as Error).message, loading: false });
        }
      },

      fetchStats: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        try {
          const stats = await api.getStats(userId);
          set({ stats });
          void updateShukrSnapshot(userId, deriveShukrSnapshot(stats));
        } catch (e) {
          set({ error: (e as Error).message });
        }
      },

      deleteBlessing: async (blessingId: string) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        try {
          await api.deleteBlessing(userId, blessingId);
          set((s) => ({
            blessings: s.blessings.filter((b) => b.id !== blessingId),
          }));
          // Refresh stats after deletion
          get().fetchStats();
        } catch (e) {
          set({ error: (e as Error).message });
        }
      },

      decomposeBlessing: async (blessingId: string) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        set({ decomposing: true, error: null });
        try {
          const res = await api.decomposeBlessing(userId, blessingId);
          set({ activeDecomposition: res, decomposing: false });
        } catch (e) {
          set({ error: (e as Error).message, decomposing: false });
        }
      },

      fetchPercentile: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        try {
          const data = await api.getPercentile(userId);
          set({ percentile: data });
        } catch (e) {
          set({ error: (e as Error).message });
        }
      },

      // Cached fetchers — skip re-fetch if data is fresh (5 min TTL)
      fetchLeaderboard: async () => {
        const now = Date.now();
        if (now - get()._lastLeaderboardFetch < 300_000 && get().leaderboard.length > 0) return;
        try {
          const res = await api.getLeaderboard(10);
          set({ leaderboard: res.entries, _lastLeaderboardFetch: now });
        } catch (e) {
          console.error('Leaderboard fetch error:', e);
        }
      },

      fetchGlobalStats: async () => {
        const now = Date.now();
        if (now - get()._lastGlobalStatsFetch < 300_000 && get().globalStats) return;
        try {
          const stats = await api.getGlobalStats();
          set({ globalStats: stats, _lastGlobalStatsFetch: now });
        } catch (e) {
          console.error('Global stats fetch error:', e);
        }
      },

      fetchBuddies: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        const now = Date.now();
        if (now - get()._lastBuddiesFetch < 300_000 && get().buddies.length > 0) return;
        try {
          const res = await api.getBuddies(userId);
          set({ buddies: res.buddies, _lastBuddiesFetch: now });
        } catch (e) {
          console.error('Buddies fetch error:', e);
        }
      },

      clearDecomposition: () => set({ activeDecomposition: null }),

      clearMilestones: () => set({ lastMilestones: [], lastDnzAwarded: 0 }),

      reset: () => set(initialState),
    }),
    {
      name: 'barka-labs-store',
      partialize: (state) => ({
        stats: state.stats,
        blessings: state.blessings.slice(0, 10), // Cache last 10
      }),
    },
  ),
);
