/**
 * Admin Dashboard Store (Zustand)
 */

import { create } from 'zustand';
import { adminService } from '../services/admin.service';
import type {
  AdminStats,
  UserSummary,
  UserDetail,
  GrowthPoint,
  ReferralStats,
  KycFunnel,
  DnzEconomy,
  ActivityEvent,
  FeatureUsage,
  FeatureFeedItem,
  RecentQuery,
  AdminTab,
  ChatHistoryResponse,
  AiCostsResponse,
} from '../types/admin.types';

interface AdminState {
  // UI
  activeTab: AdminTab;
  loading: boolean;
  error: string | null;

  // Data
  stats: AdminStats | null;
  users: UserSummary[];
  usersTotal: number;
  usersPage: number;
  growth: GrowthPoint[];
  referralStats: ReferralStats | null;
  kycFunnel: KycFunnel | null;
  dnzEconomy: DnzEconomy | null;
  activityFeed: ActivityEvent[];
  featureUsage: FeatureUsage | null;
  featureFeed: FeatureFeedItem[];
  recentQueries: RecentQuery[];
  selectedUser: UserDetail | null;
  showUserModal: boolean;
  chatHistory: ChatHistoryResponse | null;
  chatHistoryLoading: boolean;
  aiCosts: AiCostsResponse | null;

  // Filters
  searchQuery: string;
  kycFilter: number | undefined;
  countryFilter: string;
  sortBy: string;
  sortDir: string;
}

interface AdminActions {
  setTab: (tab: AdminTab) => void;
  setSearch: (q: string) => void;
  setKycFilter: (tier: number | undefined) => void;
  setCountryFilter: (country: string) => void;
  setSortBy: (field: string) => void;

  fetchStats: () => Promise<void>;
  fetchUsers: (page?: number) => Promise<void>;
  fetchGrowth: (days?: number) => Promise<void>;
  fetchReferralStats: () => Promise<void>;
  fetchKycFunnel: () => Promise<void>;
  fetchDnzEconomy: () => Promise<void>;
  fetchActivityFeed: () => Promise<void>;
  fetchFeatureUsage: (days?: number) => Promise<void>;
  fetchFeatureFeed: (limit?: number) => Promise<void>;
  fetchRecentQueries: (limit?: number) => Promise<void>;
  fetchAiCosts: (days?: number) => Promise<void>;
  fetchUserDetail: (userId: string) => Promise<void>;
  fetchChatHistory: (userId: string) => Promise<void>;
  closeUserModal: () => void;
  loadAll: () => Promise<void>;
  loadForTab: (tab: AdminTab, force?: boolean) => Promise<void>;
}

export const useAdminStore = create<AdminState & AdminActions>((set, get) => ({
  // Initial state
  activeTab: 'overview',
  loading: false,
  error: null,
  stats: null,
  users: [],
  usersTotal: 0,
  usersPage: 1,
  growth: [],
  referralStats: null,
  kycFunnel: null,
  dnzEconomy: null,
  activityFeed: [],
  featureUsage: null,
  featureFeed: [],
  recentQueries: [],
  selectedUser: null,
  showUserModal: false,
  chatHistory: null,
  chatHistoryLoading: false,
  aiCosts: null,
  searchQuery: '',
  kycFilter: undefined,
  countryFilter: '',
  sortBy: 'created_at',
  sortDir: 'desc',

  // Actions
  setTab: (tab) => set({ activeTab: tab }),
  setSearch: (q) => set({ searchQuery: q }),
  setKycFilter: (tier) => set({ kycFilter: tier }),
  setCountryFilter: (country) => set({ countryFilter: country }),
  setSortBy: (field) => {
    const { sortBy, sortDir } = get();
    if (sortBy === field) {
      set({ sortDir: sortDir === 'desc' ? 'asc' : 'desc' });
    } else {
      set({ sortBy: field, sortDir: 'desc' });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await adminService.getStats();
      set({ stats });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  fetchUsers: async (page = 1) => {
    const { searchQuery, kycFilter, countryFilter, sortBy, sortDir } = get();
    try {
      const res = await adminService.getUsers({
        page,
        page_size: 50,
        search: searchQuery || undefined,
        kyc_tier: kycFilter,
        country: countryFilter || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      set({ users: res.users, usersTotal: res.total, usersPage: res.page });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  fetchGrowth: async (days = 30) => {
    try {
      const growth = await adminService.getGrowth(days);
      set({ growth });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  fetchReferralStats: async () => {
    try {
      const referralStats = await adminService.getReferralStats();
      set({ referralStats });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  fetchKycFunnel: async () => {
    try {
      const kycFunnel = await adminService.getKycFunnel();
      set({ kycFunnel });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  fetchDnzEconomy: async () => {
    try {
      const dnzEconomy = await adminService.getDnzEconomy();
      set({ dnzEconomy });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  fetchActivityFeed: async () => {
    try {
      const activityFeed = await adminService.getActivityFeed(30);
      set({ activityFeed });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  fetchFeatureUsage: async (days = 7) => {
    try {
      const featureUsage = await adminService.getFeatureUsage(days);
      set({ featureUsage });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  fetchFeatureFeed: async (limit = 50) => {
    try {
      const featureFeed = await adminService.getFeatureFeed(limit);
      set({ featureFeed });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  fetchRecentQueries: async (limit = 50) => {
    try {
      const recentQueries = await adminService.getRecentQueries(limit);
      set({ recentQueries });
    } catch {
      // Silently fail — index may still be building
    }
  },

  fetchAiCosts: async (days = 7) => {
    try {
      const aiCosts = await adminService.getAiCosts(days);
      set({ aiCosts });
    } catch {
      // Silently fail
    }
  },

  fetchUserDetail: async (userId: string) => {
    try {
      const selectedUser = await adminService.getUserDetail(userId);
      set({ selectedUser, showUserModal: true });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  fetchChatHistory: async (userId: string) => {
    set({ chatHistoryLoading: true });
    try {
      const chatHistory = await adminService.getChatHistory(userId);
      set({ chatHistory });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    } finally {
      set({ chatHistoryLoading: false });
    }
  },

  closeUserModal: () => set({ selectedUser: null, showUserModal: false, chatHistory: null }),

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchStats(),
        get().fetchUsers(),
        get().fetchGrowth(),
        get().fetchReferralStats(),
        get().fetchKycFunnel(),
        get().fetchDnzEconomy(),
        get().fetchActivityFeed(),
        get().fetchFeatureUsage(),
        get().fetchFeatureFeed(),
      ]);
      get().fetchRecentQueries();
    } finally {
      set({ loading: false });
    }
  },

  // Fetch only what the active tab needs. Tabs track their own "already-loaded"
  // status via the presence of data in the store, so switching back doesn't re-fetch.
  // Pass force=true to bypass the check (used by the Refresh button).
  loadForTab: async (tab, force = false) => {
    const s = get();
    const fetchers: Array<() => Promise<void>> = [];

    switch (tab) {
      case 'overview':
        if (force || !s.stats) fetchers.push(s.fetchStats);
        if (force || s.growth.length === 0) fetchers.push(() => s.fetchGrowth());
        break;
      case 'users':
        if (force || s.users.length === 0) fetchers.push(() => s.fetchUsers(s.usersPage || 1));
        break;
      case 'kyc':
        if (force || !s.kycFunnel) fetchers.push(s.fetchKycFunnel);
        break;
      case 'referrals':
        if (force || !s.referralStats) fetchers.push(s.fetchReferralStats);
        break;
      case 'dnz':
        if (force || !s.dnzEconomy) fetchers.push(s.fetchDnzEconomy);
        break;
      case 'activity':
        if (force || s.activityFeed.length === 0) fetchers.push(s.fetchActivityFeed);
        if (force || s.recentQueries.length === 0) fetchers.push(() => s.fetchRecentQueries());
        break;
      case 'features':
        if (force || !s.featureUsage) fetchers.push(() => s.fetchFeatureUsage());
        if (force || s.featureFeed.length === 0) fetchers.push(() => s.fetchFeatureFeed());
        break;
      case 'ai-costs':
        if (force || !s.aiCosts) fetchers.push(() => s.fetchAiCosts());
        break;
    }

    if (fetchers.length === 0) return;
    set({ loading: true, error: null });
    try {
      await Promise.all(fetchers.map((fn) => fn()));
    } finally {
      set({ loading: false });
    }
  },
}));
