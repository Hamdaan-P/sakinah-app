/**
 * Wallet/DNZ API Service
 * Client for FastAPI DNZ endpoints — all requests are authenticated
 */

import { authPost as post, authGet as get } from '@/lib/api';
import { db } from '@/config/firebase.config';
import { doc, onSnapshot } from 'firebase/firestore';

// ── Types ──

export interface DNZBalanceResponse {
  total: number;
  lifetime_earned: number;
  today_earned: number;
  today_remaining: number;
  daily_cap: number;
  login_claimed_today: boolean;
}

export interface DNZAwardResult {
  awarded: boolean;
  amount: number;
  new_balance: number;
  reason: string;
  daily_total: number;
  daily_remaining: number;
}

export interface DNZTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  timestamp: string | null;
  metadata: Record<string, unknown>;
}

export interface DNZHistoryResponse {
  transactions: DNZTransaction[];
  count: number;
}

export interface DNZDailySummaryResponse {
  date: string;
  earned_today: number;
  cap: number;
  remaining: number;
  login_claimed: boolean;
  chat_messages_count: number;
  chat_rewards_awarded: number;
  breakdown: Record<string, number>;
}

export interface DNZReferralHistoryItem {
  user_id: string;
  name: string;
  email: string;
  status: string;
  reward_granted: boolean;
  reward_amount: number;
  onboarding_completed_at: string | null;
  joined_at: string | null;
}

export interface DNZReferralHistoryResponse {
  items: DNZReferralHistoryItem[];
  count: number;
  total_rewarded_dnz: number;
  pending_count: number;
}

// ── API Calls ──

export async function fetchDNZBalance(userId: string): Promise<DNZBalanceResponse> {
  return get<DNZBalanceResponse>(`/dnz/balance/${encodeURIComponent(userId)}`);
}

/**
 * Subscribe to live DNZ balance updates from Firestore.
 *
 * Backend writes to users/{uid}/dnz_balance/current via Admin SDK whenever
 * a transaction settles. The web client only has read access (rules), which
 * is exactly what we need for a real-time mirror without a polling loop.
 *
 * Returns the unsubscribe function.
 */
export function subscribeDNZBalance(
  userId: string,
  onChange: (balance: { total: number; lifetime_earned: number; today_earned?: number }) => void,
): () => void {
  const ref = doc(db, 'users', userId, 'dnz_balance', 'current');
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as Record<string, unknown>;
      onChange({
        total: (data.total as number) ?? (data.balance as number) ?? 0,
        lifetime_earned: (data.lifetime_earned as number) ?? (data.lifetime as number) ?? 0,
        today_earned: data.today_earned as number | undefined,
      });
    },
    (err) => console.warn('[wallet] subscribeDNZBalance failed:', err),
  );
}

export async function claimDailyLogin(userId: string): Promise<DNZAwardResult> {
  return post<DNZAwardResult>('/dnz/claim-login', { user_id: userId });
}

export async function fetchDNZHistory(
  userId: string,
  limit = 50,
): Promise<DNZHistoryResponse> {
  return get<DNZHistoryResponse>(
    `/dnz/history/${encodeURIComponent(userId)}?limit=${limit}`,
  );
}

export async function fetchDNZDailySummary(
  userId: string,
): Promise<DNZDailySummaryResponse> {
  return get<DNZDailySummaryResponse>(
    `/dnz/daily-summary/${encodeURIComponent(userId)}`,
  );
}

export async function claimReferralOnboardingReward(
  onboardedUserId: string,
): Promise<DNZAwardResult> {
  return post<DNZAwardResult>('/dnz/referral/complete-onboarding', {
    onboarded_user_id: onboardedUserId,
  });
}

export async function claimDeepKycReward(
  userId: string,
): Promise<DNZAwardResult> {
  return post<DNZAwardResult>('/dnz/claim-kyc-reward', { user_id: userId });
}

export async function fetchReferralHistory(
  userId: string,
  limit = 50,
): Promise<DNZReferralHistoryResponse> {
  return get<DNZReferralHistoryResponse>(
    `/dnz/referral/history/${encodeURIComponent(userId)}?limit=${limit}`,
  );
}

// ── Legacy DNZ restoration (one-time investor credit) ──

export interface LegacyCreditPendingResponse {
  has_pending: boolean;
  amount: number;
  email: string | null;
  source: string | null;
}

export interface LegacyCreditClaimResponse {
  claimed: boolean;
  amount: number;
  new_balance: number;
  reason: string;
}

export async function fetchPendingLegacyCredit(): Promise<LegacyCreditPendingResponse> {
  return get<LegacyCreditPendingResponse>('/dnz/legacy-credit/pending');
}

export async function claimLegacyCredit(): Promise<LegacyCreditClaimResponse> {
  return post<LegacyCreditClaimResponse>('/dnz/legacy-credit/claim', {});
}
