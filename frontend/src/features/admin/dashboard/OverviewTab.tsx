/**
 * Overview tab — top-level stats, KYC tier counts, recent signups, and breakdowns.
 *
 * Extracted from AdminPage.tsx.
 */

import { UsersThree, UserPlus, TrendUp, CalendarBlank } from '@phosphor-icons/react';
import { useAdminStore } from '../stores/admin.store';
import { Card, StatCard, HBarChart, DonutChart } from './primitives';
import { fmtDate, pct, kycBadge } from './helpers';
import { GOLD, WHITE, TEXT_2, TEXT_3 } from './constants';

export function OverviewTab() {
  const { stats } = useAdminStore();
  const store = useAdminStore();
  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Big numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Users" value={stats.total_users} icon={UsersThree} />
        <StatCard label="New Today" value={stats.new_today} icon={UserPlus} accent="#10B981" />
        <StatCard label="Last 7 Days" value={stats.new_this_week} icon={TrendUp} accent="#3B82F6" />
        <StatCard label="Last 30 Days" value={stats.new_this_month} icon={CalendarBlank} accent="#8B5CF6" />
      </div>

      {/* KYC tiers */}
      <div className="grid grid-cols-3 gap-5">
        <Card>
          <p className="text-sm font-bold uppercase tracking-wide" style={{ color: TEXT_3 }}>No KYC</p>
          <p className="text-3xl font-black mt-2" style={{ color: '#EF4444' }}>{stats.kyc_tier0}</p>
          <p className="text-sm font-medium mt-1" style={{ color: TEXT_3 }}>{pct(stats.kyc_tier0, stats.total_users)} of users</p>
        </Card>
        <Card>
          <p className="text-sm font-bold uppercase tracking-wide" style={{ color: TEXT_3 }}>Tier 1 Basic</p>
          <p className="text-3xl font-black mt-2" style={{ color: '#F59E0B' }}>{stats.kyc_tier1}</p>
          <p className="text-sm font-medium mt-1" style={{ color: TEXT_3 }}>{pct(stats.kyc_tier1, stats.total_users)} of users</p>
        </Card>
        <Card>
          <p className="text-sm font-bold uppercase tracking-wide" style={{ color: TEXT_3 }}>Tier 2 Deep</p>
          <p className="text-3xl font-black mt-2" style={{ color: '#10B981' }}>{stats.kyc_tier2}</p>
          <p className="text-sm font-medium mt-1" style={{ color: TEXT_3 }}>{pct(stats.kyc_tier2, stats.total_users)} of users</p>
        </Card>
      </div>

      {/* Recent Signups */}
      <Card>
        <h3 className="text-lg font-bold mb-5" style={{ color: WHITE }}>Recent Signups</h3>
        {(stats.recent_signups ?? []).length > 0 ? (
          <div className="space-y-1">
            {(stats.recent_signups ?? []).map((u) => (
              <div
                key={u.id}
                role="button"
                tabIndex={0}
                className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
                onClick={() => store.fetchUserDetail(u.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); store.fetchUserDetail(u.id); } }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: `${GOLD}15`, color: GOLD }}
                  >
                    {(u.full_name || u.email || '?')[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: WHITE }}>{u.full_name || 'Unnamed'}</p>
                    <p className="text-xs font-medium truncate" style={{ color: TEXT_3 }}>{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {u.country && (
                    <span className="text-xs font-medium" style={{ color: TEXT_2 }}>{u.country}</span>
                  )}
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: `${GOLD}12`, color: GOLD }}>
                    {u.dnz_balance ?? 0} DNZ
                  </span>
                  {kycBadge(u.kyc_tier)}
                  <span className="text-xs font-medium" style={{ color: TEXT_3 }}>{fmtDate(u.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base py-10 text-center font-medium" style={{ color: TEXT_3 }}>No signups yet</p>
        )}
      </Card>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DonutChart data={stats.gender_breakdown} title="Gender" />
        <HBarChart data={stats.top_countries} title="Top Countries" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <HBarChart data={stats.top_intents} title="Primary Intents" />
        <HBarChart data={stats.top_life_stages} title="Life Stages" />
      </div>
    </div>
  );
}
