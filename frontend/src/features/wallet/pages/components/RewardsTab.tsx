/**
 * Rewards tab — lifetime stats, how-to-earn, referral program with history.
 */

import { Trophy, Lightning, ChatCircleDots, UserPlus, Diamond } from '@phosphor-icons/react';
import { formatDNZ } from './_walletConstants';
import { ReferralPanel } from './ReferralPanel';
import type { DNZReferralHistoryItem, DNZDailySummaryResponse } from '../../services/walletService';

interface Props {
  lifetimeEarned: number;
  referralCode: string;
  referralLink: string;
  referralsCount: number;
  referralsEarnedDNZ: number;
  referralHistory: DNZReferralHistoryItem[];
  referralHistoryLoading: boolean;
  copiedCode: boolean;
  copiedLink: boolean;
  capPct: number;
  todayEarned: number;
  dailyCap: number;
  dailySummary: DNZDailySummaryResponse | null;
  onCopyCode: () => void;
  onCopyLink: () => void;
}

export function RewardsTab({
  lifetimeEarned,
  referralCode,
  referralLink,
  referralsCount,
  referralsEarnedDNZ,
  referralHistory,
  referralHistoryLoading,
  copiedCode,
  copiedLink,
  capPct,
  todayEarned,
  dailyCap,
  dailySummary,
  onCopyCode,
  onCopyLink,
}: Props) {
  return (
    <div className="px-4 space-y-5">
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#D4A853]/10 to-transparent border border-[#D4A853]/20 text-center">
        <Trophy size={32} className="text-[#D4A853] mx-auto mb-2" />
        <p className="text-[#7A7363] text-xs">Lifetime DNZ Earned</p>
        <p className="text-[#F5E8C7] font-bold text-2xl">{formatDNZ(lifetimeEarned)} DNZ</p>
      </div>
      {/* How to Earn */}
      <div>
        <h3 className="text-[#F5E8C7] font-semibold text-sm mb-3">How to Earn DNZ</h3>
        <div className="space-y-2">
          <EarnRow icon={<Lightning size={18} className="text-[#D4A853]" />} iconBg="bg-[#D4A853]/15" title="Daily Login" sub="Open the app daily" amount="+5 DNZ" />
          <EarnRow icon={<ChatCircleDots size={18} className="text-blue-400" />} iconBg="bg-blue-500/15" title="Chat with Raya" sub="Every 5 messages" amount="+1 DNZ" />
          <EarnRow icon={<UserPlus size={18} className="text-emerald-400" />} iconBg="bg-emerald-500/15" title="Referral Onboarding" sub="When a referred user completes onboarding" amount="+500 DNZ" />
          <EarnRow icon={<Diamond size={18} className="text-purple-400" />} iconBg="bg-purple-500/15" title="Browser Mining" sub="Use the ZaryahPlus extension to mine DNZ" amount="up to 2/hr" />
        </div>
      </div>
      <ReferralPanel
        referralCode={referralCode}
        referralLink={referralLink}
        referralsCount={referralsCount}
        referralsEarnedDNZ={referralsEarnedDNZ}
        referralHistory={referralHistory}
        referralHistoryLoading={referralHistoryLoading}
        copiedCode={copiedCode}
        copiedLink={copiedLink}
        onCopyCode={onCopyCode}
        onCopyLink={onCopyLink}
      />
      {/* Daily Cap */}
      <div className="p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
        <div className="flex justify-between mb-2">
          <span className="text-[#C9C0A8] text-sm">Daily Cap Progress</span>
          <span className="text-[#D4A853] text-sm font-medium">{capPct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#10151F]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A]" style={{ width: `${capPct}%` }} />
        </div>
        <p className="text-[#7A7363] text-xs mt-1.5">{todayEarned} of {dailyCap} DNZ earned today</p>
      </div>
      {/* Today's Breakdown */}
      {dailySummary && (
        <div>
          <h3 className="text-[#F5E8C7] font-semibold text-sm mb-3">Today's Activity</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-center">
              <Lightning size={20} className="text-[#D4A853] mx-auto mb-1" />
              <p className="text-[#F5E8C7] font-bold text-sm">
                {dailySummary.login_claimed ? 'Claimed' : 'Pending'}
              </p>
              <p className="text-[#7A7363] text-xs">Daily Login</p>
            </div>
            <div className="p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-center">
              <ChatCircleDots size={20} className="text-blue-400 mx-auto mb-1" />
              <p className="text-[#F5E8C7] font-bold text-sm">
                {dailySummary.chat_messages_count} msgs
              </p>
              <p className="text-[#7A7363] text-xs">{dailySummary.chat_rewards_awarded} DNZ earned</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EarnRow({ icon, iconBg, title, sub, amount }: { icon: React.ReactNode; iconBg: string; title: string; sub: string; amount: string }) {
  return (
    <div className="p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[#F5E8C7] text-sm font-medium">{title}</p>
        <p className="text-[#7A7363] text-xs">{sub}</p>
      </div>
      <span className="text-[#D4A853] font-bold text-sm">{amount}</span>
    </div>
  );
}
