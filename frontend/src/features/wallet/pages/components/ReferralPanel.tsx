/**
 * ReferralPanel — referral stats + copy buttons + referral history list.
 */

import { Gift, LinkSimple, Copy, Check } from '@phosphor-icons/react';
import { formatDNZ, formatDate } from './_walletConstants';
import type { DNZReferralHistoryItem } from '../../services/walletService';

interface Props {
  referralCode: string;
  referralLink: string;
  referralsCount: number;
  referralsEarnedDNZ: number;
  referralHistory: DNZReferralHistoryItem[];
  referralHistoryLoading: boolean;
  copiedCode: boolean;
  copiedLink: boolean;
  onCopyCode: () => void;
  onCopyLink: () => void;
}

export function ReferralPanel({
  referralCode,
  referralLink,
  referralsCount,
  referralsEarnedDNZ,
  referralHistory,
  referralHistoryLoading,
  copiedCode,
  copiedLink,
  onCopyCode,
  onCopyLink,
}: Props) {
  return (
    <div className="p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[#F5E8C7] font-semibold text-sm">Refer & Earn</h3>
        <span className="text-[11px] text-[#7A7363]">500 DNZ per onboarding</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-[#0A0E16] border border-[rgba(212,168,83,0.2)] p-3">
          <p className="text-[#7A7363] text-[11px]">Successful referrals</p>
          <p className="text-[#F5E8C7] font-bold text-lg">{referralsCount}</p>
        </div>
        <div className="rounded-lg bg-[#0A0E16] border border-[rgba(212,168,83,0.2)] p-3">
          <p className="text-[#7A7363] text-[11px]">Referral DNZ earned</p>
          <p className="text-[#F5E8C7] font-bold text-lg">{formatDNZ(referralsEarnedDNZ)}</p>
        </div>
      </div>
      <div className="rounded-lg bg-[#0A0E16] border border-[rgba(212,168,83,0.2)] p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#D4A853]/15 flex items-center justify-center">
          <Gift size={16} className="text-[#D4A853]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#7A7363] text-[11px]">Referral code</p>
          <p className="text-[#F5E8C7] text-sm font-semibold truncate">{referralCode || '-'}</p>
        </div>
        <button
          type="button"
          onClick={onCopyCode}
          disabled={!referralCode}
          className="px-2.5 py-1.5 rounded-md bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] text-xs font-medium disabled:opacity-40"
        >
          {copiedCode ? (
            <span className="inline-flex items-center gap-1"><Check size={12} /> Copied</span>
          ) : (
            <span className="inline-flex items-center gap-1"><Copy size={12} /> Copy</span>
          )}
        </button>
      </div>
      <div className="rounded-lg bg-[#0A0E16] border border-[rgba(212,168,83,0.2)] p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <LinkSimple size={14} className="text-[#7A7363]" />
          <p className="text-[#7A7363] text-[11px]">Referral link</p>
        </div>
        <p className="text-[#C9C0A8] text-xs break-all mb-3">{referralLink || '-'}</p>
        <button
          type="button"
          onClick={onCopyLink}
          disabled={!referralLink}
          className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
        >
          {copiedLink ? (
            <span className="inline-flex items-center gap-1"><Check size={14} weight="bold" /> Link Copied!</span>
          ) : (
            <span className="inline-flex items-center gap-1"><Copy size={14} weight="bold" /> Copy Referral Link</span>
          )}
        </button>
      </div>
      <div className="rounded-lg bg-[#0A0E16] border border-[rgba(212,168,83,0.2)] p-3">
        <p className="text-[#7A7363] text-[11px] mb-2">Referral History</p>
        {referralHistoryLoading && (
          <p className="text-[#7A7363] text-xs py-2">Loading referral history...</p>
        )}
        {!referralHistoryLoading && referralHistory.length === 0 && (
          <p className="text-[#7A7363] text-xs py-2">No referrals yet.</p>
        )}
        {!referralHistoryLoading && referralHistory.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {referralHistory.map((entry) => {
              const rewarded = entry.reward_granted;
              return (
                <div
                  key={entry.user_id}
                  className="rounded-lg border border-[rgba(212,168,83,0.18)] bg-[#10151F]/45 p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[#F5E8C7] text-xs font-semibold truncate">{entry.name}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        rewarded
                          ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
                          : 'text-amber-300 border-amber-500/30 bg-amber-500/10'
                      }`}
                    >
                      {rewarded ? 'Rewarded' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-[#7A7363] text-[11px] truncate">{entry.email || 'No email'}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[#7A7363] text-[10px]">
                      Onboarded: {formatDate(entry.onboarding_completed_at)}
                    </p>
                    <p className={`text-[11px] font-semibold ${rewarded ? 'text-emerald-400' : 'text-[#7A7363]'}`}>
                      {rewarded ? `+${formatDNZ(entry.reward_amount)} DNZ` : '0 DNZ'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
