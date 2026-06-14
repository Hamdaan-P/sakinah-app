/**
 * Overview tab — today/lifetime stats + daily breakdown.
 */

import { Gift } from '@phosphor-icons/react';
import { ACTIVITY_LABELS, formatDNZ } from './_walletConstants';
import type { DNZDailySummaryResponse } from '../../services/walletService';

interface Props {
  todayEarned: number;
  lifetimeEarned: number;
  loginClaimedToday: boolean;
  dailySummary: DNZDailySummaryResponse | null;
}

export function OverviewTab({ todayEarned, lifetimeEarned, loginClaimedToday, dailySummary }: Props) {
  return (
    <div className="px-4 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-emerald-300 text-xs">Today Earned</p>
          <p className="text-[#F5E8C7] font-bold text-lg">+{formatDNZ(todayEarned)} DNZ</p>
          <p className="text-emerald-400 text-xs">
            {loginClaimedToday ? 'Login claimed' : 'Login pending'}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20">
          <p className="text-[#D4A853] text-xs">Lifetime Earned</p>
          <p className="text-[#F5E8C7] font-bold text-lg">{formatDNZ(lifetimeEarned)} DNZ</p>
          <p className="text-[#7A7363] text-xs">All time total</p>
        </div>
      </div>
      {/* Today's Breakdown */}
      {dailySummary && Object.keys(dailySummary.breakdown).length > 0 && (
        <div>
          <h3 className="text-[#F5E8C7] font-semibold text-sm mb-3">Today's Breakdown</h3>
          {Object.entries(dailySummary.breakdown).map(([key, amount]) => {
            const meta = ACTIVITY_LABELS[key] || { label: key, icon: Gift };
            const Icon = meta.icon;
            return (
              <div key={key} className="flex items-center gap-3 py-2 border-b border-[rgba(212,168,83,0.2)]/20 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-[#D4A853]/15 flex items-center justify-center">
                  <Icon size={16} className="text-[#D4A853]" />
                </div>
                <p className="text-[#F5E8C7] text-sm flex-1">{meta.label}</p>
                <p className="text-emerald-400 text-sm font-semibold">+{amount} DNZ</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
