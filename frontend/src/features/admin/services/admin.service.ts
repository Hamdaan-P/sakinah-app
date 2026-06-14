/**
 * Admin API Service
 * Calls backend /admin/* endpoints with Firebase auth.
 */

import { authGet, authPost } from '@/lib/api';
import type {
  AdminStats,
  UsersListResponse,
  UserDetail,
  GrowthPoint,
  ReferralStats,
  KycFunnel,
  DnzEconomy,
  ActivityEvent,
  FeatureUsage,
  FeatureFeedItem,
  RecentQuery,
  ChatHistoryResponse,
  AiCostsResponse,
} from '../types/admin.types';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    return authGet<AdminStats>('/admin/stats');
  },

  async getUsers(params: {
    page?: number;
    page_size?: number;
    search?: string;
    kyc_tier?: number;
    country?: string;
    sort_by?: string;
    sort_dir?: string;
  }): Promise<UsersListResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.page_size) q.set('page_size', String(params.page_size));
    if (params.search) q.set('search', params.search);
    if (params.kyc_tier !== undefined) q.set('kyc_tier', String(params.kyc_tier));
    if (params.country) q.set('country', params.country);
    if (params.sort_by) q.set('sort_by', params.sort_by);
    if (params.sort_dir) q.set('sort_dir', params.sort_dir);
    return authGet<UsersListResponse>(`/admin/users?${q.toString()}`);
  },

  async getUserDetail(userId: string): Promise<UserDetail> {
    return authGet<UserDetail>(`/admin/users/${userId}`);
  },

  async getGrowth(days = 30): Promise<GrowthPoint[]> {
    return authGet<GrowthPoint[]>(`/admin/growth?days=${days}`);
  },

  async getReferralStats(): Promise<ReferralStats> {
    return authGet<ReferralStats>('/admin/referral-stats');
  },

  async getKycFunnel(): Promise<KycFunnel> {
    return authGet<KycFunnel>('/admin/kyc-funnel');
  },

  async getDnzEconomy(): Promise<DnzEconomy> {
    return authGet<DnzEconomy>('/admin/dnz-economy');
  },

  async getActivityFeed(limit = 30): Promise<ActivityEvent[]> {
    return authGet<ActivityEvent[]>(`/admin/activity-feed?limit=${limit}`);
  },

  async getFeatureUsage(days = 7): Promise<FeatureUsage> {
    return authGet<FeatureUsage>(`/admin/feature-usage?days=${days}`);
  },

  async getFeatureFeed(limit = 50): Promise<FeatureFeedItem[]> {
    const res = await authGet<{ feed: FeatureFeedItem[] }>(`/admin/feature-feed?limit=${limit}`);
    return res.feed;
  },

  async getRecentQueries(limit = 50): Promise<RecentQuery[]> {
    const res = await authGet<{ queries: RecentQuery[] }>(`/admin/recent-queries?limit=${limit}`);
    return res.queries;
  },

  async getChatHistory(userId: string): Promise<ChatHistoryResponse> {
    return authGet<ChatHistoryResponse>(`/admin/users/${userId}/chat-history`);
  },

  async getAiCosts(days = 7): Promise<AiCostsResponse> {
    return authGet<AiCostsResponse>(`/admin/ai-costs?days=${days}`);
  },

  async recoverEmail(userId: string, newEmail: string, reason: string): Promise<{ ok: boolean; user_id: string; old_email: string; new_email: string }> {
    return authPost(`/admin/users/${userId}/recover-email`, { new_email: newEmail, reason });
  },
};
