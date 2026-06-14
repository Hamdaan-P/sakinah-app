/**
 * Shared constants & helpers for WalletPage tabs.
 */

import { Coins, Gift, Diamond, Lightning, ChatCircleDots } from '@phosphor-icons/react';

export const TABS = ['Overview', 'Transactions', 'Rewards'] as const;
export type TabType = typeof TABS[number];

export const ACTIVITY_LABELS: Record<string, { label: string; icon: typeof Coins }> = {
  daily_login: { label: 'Daily Login', icon: Lightning },
  chat_reward: { label: 'Chat Engagement', icon: ChatCircleDots },
  referral_reward: { label: 'Referral Reward', icon: Gift },
  mining_reward: { label: 'Mining Reward', icon: Diamond },
};

/** Generate a referral code from user ID (no Firestore query needed) */
export function generateReferralCode(userId: string): string {
  const seed = userId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const prefix = (seed.slice(0, 4) || 'ZARY').padEnd(4, 'X');
  // Use a hash-like derivation from the full userId for deterministic uniqueness
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  const suffix = Math.abs(hash).toString(36).toUpperCase().padEnd(6, 'Z').slice(0, 6);
  return `${prefix}${suffix}`;
}

export const formatDNZ = (n: number) => n.toLocaleString();

export function formatDate(value?: string | null) {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString();
}
