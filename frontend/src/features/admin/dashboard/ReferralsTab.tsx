/**
 * Referrals tab — referral stats and top-referrer leaderboard.
 *
 * Extracted from AdminPage.tsx.
 */

import { UserPlus, Link as LinkIcon, TrendUp, ChartBar, Trophy } from '@phosphor-icons/react';
import { useAdminStore } from '../stores/admin.store';
import { Card, StatCard } from './primitives';
import { pct } from './helpers';
import { SURFACE_2, GOLD, WHITE, TEXT_3, BORDER } from './constants';

export function ReferralsTab() {
  const { referralStats, stats } = useAdminStore();
  if (!referralStats) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Referred" value={referralStats.total_referred_users} icon={UserPlus} accent="#10B981" />
        <StatCard label="Users with Code" value={referralStats.total_users_with_referral_code} icon={LinkIcon} />
        <StatCard label="Active Referrers" value={referralStats.unique_referrers} icon={TrendUp} accent="#3B82F6" />
        <StatCard
          label="Referral Rate"
          value={stats ? pct(referralStats.total_referred_users, stats.total_users) : '—'}
          icon={ChartBar}
          sub="of all users via referral"
          accent="#8B5CF6"
        />
      </div>

      {/* Leaderboard */}
      <Card>
        <h3 className="text-lg font-bold mb-6 flex items-center gap-3" style={{ color: WHITE }}>
          <Trophy size={22} weight="bold" style={{ color: GOLD }} />
          Top Referrers
        </h3>
        {referralStats.top_referrers.length > 0 ? (
          <div className="space-y-2">
            {referralStats.top_referrers.map((r, i) => (
              <div
                key={r.user_id}
                className="flex items-center justify-between py-3.5 px-4 rounded-xl transition-colors hover:bg-white/[0.03]"
                style={i < 3 ? { background: `${GOLD}08`, border: `1px solid ${BORDER}` } : {}}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                    style={i < 3 ? { background: `${GOLD}25`, color: GOLD } : { background: SURFACE_2, color: TEXT_3 }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: WHITE }}>{r.name}</p>
                    <p className="text-xs font-medium" style={{ color: TEXT_3 }}>Code: {r.referral_code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black" style={{ color: GOLD }}>{r.referral_count} referrals</p>
                  {r.earned_dnz > 0 && <p className="text-xs font-medium" style={{ color: TEXT_3 }}>{r.earned_dnz} DNZ earned</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base py-10 text-center font-medium" style={{ color: TEXT_3 }}>No referral data yet</p>
        )}
      </Card>
    </div>
  );
}
