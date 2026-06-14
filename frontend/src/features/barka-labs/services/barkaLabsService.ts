/**
 * Barka Labs API Service
 * Client for FastAPI Barka Labs endpoints
 */

import { authPost as post, authGet as get, authDelete as del } from '@/lib/api';
import type {
  LogBlessingResponse,
  BlessingsListResponse,
  BarkaLabsStats,
  DecompositionResponse,
  PercentileData,
  BattleData,
  LeaderboardEntry,
  GlobalStats,
  BuddyEntry,
  CommunityFeedResponse,
  ToggleLikeResponse,
  CommunityComment,
} from '../types/barka-labs.types';

export async function logBlessing(
  userId: string,
  text: string,
  isPublic: boolean = false,
): Promise<LogBlessingResponse> {
  // Scoring calls an LLM — needs longer timeout than the default 10s.
  // is_public defaults to false: a noticing is private unless the user
  // explicitly opts in to share with the community.
  return post<LogBlessingResponse>('/barka-labs/log', {
    user_id: userId,
    text,
    is_public: isPublic,
  }, 30000);
}

export async function getBlessings(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<BlessingsListResponse> {
  return get<BlessingsListResponse>(
    `/barka-labs/blessings/${userId}?limit=${limit}&offset=${offset}`,
  );
}

export async function getStats(userId: string): Promise<BarkaLabsStats> {
  return get<BarkaLabsStats>(`/barka-labs/stats/${userId}`);
}

export async function decomposeBlessing(
  userId: string,
  blessingId: string,
): Promise<DecompositionResponse> {
  // Decomposition calls Claude/Gemini — needs longer timeout
  return post<DecompositionResponse>(
    `/barka-labs/decompose/${userId}/${blessingId}`,
    {},
    30000,
  );
}

export async function getPercentile(userId: string): Promise<PercentileData> {
  return get<PercentileData>(`/barka-labs/percentile/${userId}`);
}

// ── Battle API ──

export async function createBattle(userId: string): Promise<BattleData> {
  return post<BattleData>('/barka-labs/battle/create', { user_id: userId });
}

export async function acceptBattle(battleId: string, userId: string): Promise<BattleData> {
  return post<BattleData>(`/barka-labs/battle/${battleId}/accept`, { user_id: userId });
}

export async function submitBattleBlessing(
  battleId: string, userId: string, text: string,
): Promise<{ blessing: { id: string; text: string }; count: number }> {
  return post(`/barka-labs/battle/${battleId}/submit`, { user_id: userId, text });
}

export async function finalizeBattle(battleId: string): Promise<BattleData> {
  return post<BattleData>(`/barka-labs/battle/${battleId}/finalize`, {});
}

export async function getBattle(battleId: string): Promise<BattleData> {
  return get<BattleData>(`/barka-labs/battle/${battleId}`);
}

export async function deleteBlessing(
  userId: string,
  blessingId: string,
): Promise<{ status: string }> {
  return del<{ status: string }>(`/barka-labs/blessing/${userId}/${blessingId}`);
}

// ── Community / Leaderboard ──

export async function getLeaderboard(limit = 10): Promise<{ entries: LeaderboardEntry[]; count: number }> {
  return get(`/barka-labs/leaderboard?limit=${limit}`);
}

export async function getGlobalStats(): Promise<GlobalStats> {
  return get('/barka-labs/global-stats');
}

// ── Buddy System ──

export async function getBuddies(userId: string): Promise<{ buddies: BuddyEntry[]; count: number }> {
  return get(`/barka-labs/buddies/${userId}`);
}

// ── Share Image Generation ──

export async function generateShareImage(text: string, depth: string, score: number): Promise<{
  image: string;
  reflection_prompt?: string;
  total_blessings?: number;
}> {
  return post('/barka-labs/generate-share-image', { text, depth, score }, 30000);
}

// ── Community Feed ──

export async function getCommunityFeed(
  limit = 20,
  cursor?: string,
): Promise<CommunityFeedResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  return get<CommunityFeedResponse>(`/barka-labs/community?${params}`);
}

export async function getOthersBlessings(
  userId: string,
  limit = 20,
): Promise<CommunityFeedResponse> {
  return get<CommunityFeedResponse>(
    `/barka-labs/others-blessings/${userId}?limit=${limit}`,
  );
}

// ── Community Interactions ──

export async function toggleCommunityLike(blessingId: string): Promise<ToggleLikeResponse> {
  return post<ToggleLikeResponse>(`/barka-labs/community/${blessingId}/like`, {});
}

export async function addCommunityComment(blessingId: string, text: string, parentId?: string): Promise<CommunityComment> {
  return post<CommunityComment>(`/barka-labs/community/${blessingId}/comment`, { text, parent_id: parentId || null });
}

export async function getCommunityComments(blessingId: string, limit = 20, offset = 0): Promise<{ comments: CommunityComment[]; count: number }> {
  return get(`/barka-labs/community/${blessingId}/comments?limit=${limit}&offset=${offset}`);
}
