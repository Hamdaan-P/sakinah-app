/**
 * Islamic Wallet Page
 * Full-featured wallet — balance, transactions, investments, rewards, settings
 * DNZ valuation: see frontend/src/lib/dnz.ts
 * Balance + transactions + rewards powered by DNZ engine API
 */

import { useState, useEffect, useCallback } from 'react';
import { DisclaimerBanner } from '@/components/shared';
import { trackFeature } from '@/lib/analytics';
import { WalletWalkthrough } from '../components/WalletWalkthrough';
import { RewardCelebration } from '../components/RewardCelebration';
import { Wallet } from '@phosphor-icons/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { useAuthStore } from '@/core/stores/auth.store';
import { useWalletStore } from '../stores/wallet.store';
import { DnzPriceChart } from '@/features/home/components/DnzPriceChart';
import { fetchReferralHistory, type DNZReferralHistoryItem } from '../services/walletService';
import { dnzToUsd } from '@/lib/dnz';
import { TABS, type TabType, generateReferralCode, formatDNZ } from './components/_walletConstants';
import { OverviewTab } from './components/OverviewTab';
import { TransactionsTab } from './components/TransactionsTab';
import { RewardsTab } from './components/RewardsTab';

function useWalletWalkthroughSeen(): [boolean, () => void] {
  const userId = useAuthStore((s) => s.user?.id);
  const key = `zaryah_wallet_walkthrough_${userId ?? 'anon'}`;
  const [seen, setSeen] = useState(() => {
    try { return localStorage.getItem(key) === '1'; } catch { return false; }
  });
  // Re-read when userId becomes available
  useEffect(() => {
    try { setSeen(localStorage.getItem(key) === '1'); } catch { /* best-effort */ }
  }, [key]);
  const markSeen = useCallback(() => {
    try { localStorage.setItem(key, '1'); } catch { /* best-effort */ }
    setSeen(true);
  }, [key]);
  return [seen, markSeen];
}

export function WalletPage() {
  useEffect(() => { trackFeature('wallet'); }, []);
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const user = useAuthStore((s) => s.user);
  const [walletWalkthroughSeen, markWalletWalkthroughSeen] = useWalletWalkthroughSeen();
  const [referralCode, setReferralCode] = useState('');
  const [referralsCount, setReferralsCount] = useState(0);
  const [referralsEarnedDNZ, setReferralsEarnedDNZ] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralHistory, setReferralHistory] = useState<DNZReferralHistoryItem[]>([]);
  const [referralHistoryLoading, setReferralHistoryLoading] = useState(false);

  // DNZ store
  const {
    balance,
    lifetimeEarned,
    todayEarned,
    todayRemaining,
    dailyCap,
    loginClaimedToday,
    transactions,
    transactionsLoading,
    dailySummary,
    balanceLoading,
    lastAward,
    refreshBalance,
    fetchHistory,
    fetchDailySummary,
    clearLastAward,
  } = useWalletStore();

  // Load data on mount
  useEffect(() => {
    refreshBalance();
    fetchHistory();
    fetchDailySummary();
  }, [refreshBalance, fetchHistory, fetchDailySummary]);

  useEffect(() => {
    const loadReferralData = async () => {
      if (!user?.id) return;
      try {
        const userRef = doc(db, 'users', user.id);
        const snap = await getDoc(userRef);
        if (!snap.exists()) return;
        const data = snap.data();
        let code = (data.referral_code as string) || '';

        // If no referral code exists, generate and persist one
        if (!code || code.trim().length < 4) {
          code = generateReferralCode(user.id);
          setDoc(userRef, { referral_code: code }, { merge: true }).catch(() => {});
        }

        setReferralCode(code);
        setReferralsCount((data.referrals_successful_count as number) || 0);
        setReferralsEarnedDNZ((data.referrals_total_earned_dnz as number) || 0);
      } catch (error) {
        console.error('Failed to load referral data:', error);
      }
    };

    loadReferralData();
  }, [user?.id]);

  useEffect(() => {
    const loadReferralHistory = async () => {
      if (!user?.id) return;
      setReferralHistoryLoading(true);
      try {
        const history = await fetchReferralHistory(user.id, 50);
        setReferralHistory(history.items || []);
      } catch (error) {
        console.error('Failed to load referral history:', error);
        setReferralHistory([]);
      } finally {
        setReferralHistoryLoading(false);
      }
    };

    loadReferralHistory();
  }, [user?.id]);


  const capPct = dailyCap > 0 ? Math.min(100, Math.round((todayEarned / dailyCap) * 100)) : 0;
  const referralLink = referralCode
    ? `${window.location.origin}/signup?ref=${encodeURIComponent(referralCode)}`
    : '';

  const copyText = async (value: string, kind: 'link' | 'code') => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      if (kind === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 1600);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 1600);
      }
    } catch (error) {
      console.error('Clipboard copy failed:', error);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Reward Celebration */}
      {lastAward?.awarded && (
        <RewardCelebration
          amount={lastAward.amount}
          reason={lastAward.reason || 'Activity reward'}
          newBalance={lastAward.new_balance}
          onComplete={clearLastAward}
        />
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-b-3xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/25 via-[#10151F] to-[#161D2C]" />
        <div className="relative px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center">
              <Wallet size={24} className="text-[#10151F]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5E8C7]">Islamic Wallet</h1>
              <p className="text-sm text-[#B8C4D4]">AAOIFI Shariah-Compliant Finance</p>
            </div>
          </div>
          {/* Balance */}
          <div data-tour="wallet-balance" className="p-5 rounded-xl bg-[#10151F]/60 backdrop-blur-sm border border-[#D4A853]/20">
            <p className="text-[#7A7363] text-xs mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-[#F5E8C7]">
              {balanceLoading ? '...' : formatDNZ(balance)} <span className="text-lg text-[#D4A853]">DNZ</span>
            </p>
            <p className="text-[#7A7363] text-xs mt-1">
              ≈ ${dnzToUsd(balance).toFixed(2)} USD
            </p>
          </div>
          {/* Daily Progress */}
          <div data-tour="wallet-daily" className="mt-4 p-3 rounded-xl bg-[#10151F]/60 border border-[#D4A853]/10">
            <div className="flex justify-between mb-1.5">
              <span className="text-[#7A7363] text-xs">Today's Earnings</span>
              <span className="text-[#D4A853] text-xs font-medium">{todayEarned}/{dailyCap} DNZ</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#10151F]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A] transition-all duration-500"
                style={{ width: `${capPct}%` }}
              />
            </div>
            <p className="text-[#7A7363] text-[10px] mt-1">{todayRemaining} DNZ remaining today</p>
          </div>
        </div>
      </div>

      {/* DNZ Live Price Chart */}
      <div className="px-4 mb-6">
        <DnzPriceChart />
      </div>

      {/* Tabs */}
      <div data-tour="wallet-tabs" className="px-4 mb-5">
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-4 px-4">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-[#D4A853] text-[#10151F]' : 'text-[#C9C0A8] hover:text-[#F5E8C7] hover:bg-[#10151F]'
              }`}>{tab}</button>
          ))}
        </div>
      </div>

      {activeTab === 'Overview' && (
        <OverviewTab
          todayEarned={todayEarned}
          lifetimeEarned={lifetimeEarned}
          loginClaimedToday={loginClaimedToday}
          dailySummary={dailySummary}
        />
      )}

      {activeTab === 'Transactions' && (
        <TransactionsTab transactions={transactions} transactionsLoading={transactionsLoading} />
      )}

      {activeTab === 'Rewards' && (
        <RewardsTab
          lifetimeEarned={lifetimeEarned}
          referralCode={referralCode}
          referralLink={referralLink}
          referralsCount={referralsCount}
          referralsEarnedDNZ={referralsEarnedDNZ}
          referralHistory={referralHistory}
          referralHistoryLoading={referralHistoryLoading}
          copiedCode={copiedCode}
          copiedLink={copiedLink}
          capPct={capPct}
          todayEarned={todayEarned}
          dailyCap={dailyCap}
          dailySummary={dailySummary}
          onCopyCode={() => copyText(referralCode, 'code')}
          onCopyLink={() => copyText(referralLink, 'link')}
        />
      )}

      <div className="px-4 mb-4">
        <DisclaimerBanner contentId="FINANCIAL" variant="banner" />
      </div>

      {/* Wallet walkthrough — first visit only, per user */}
      {!walletWalkthroughSeen && (
        <WalletWalkthrough onComplete={markWalletWalkthroughSeen} />
      )}
    </div>
  );
}

export default WalletPage;
