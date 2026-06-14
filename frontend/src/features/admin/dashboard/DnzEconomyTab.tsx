/**
 * DNZ Economy tab — circulation totals, distribution, daily trend, top holders.
 *
 * Extracted from AdminPage.tsx.
 */

import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ChartBar, TrendUp, UsersThree, CalendarBlank, Trophy,
} from '@phosphor-icons/react';
import { useAdminStore } from '../stores/admin.store';
import { Card, StatCard, DonutChart } from './primitives';
import {
  BG, SURFACE_2, GOLD, WHITE, TEXT_3, BORDER,
} from './constants';

export function DnzEconomyTab() {
  const { dnzEconomy } = useAdminStore();
  const store = useAdminStore();
  if (!dnzEconomy) return null;

  const sourceNames: Record<string, string> = {
    daily_login: 'Daily Login',
    chat_reward: 'Chat Rewards',
    referral_reward: 'Referral Bonus',
    mining_reward: 'Mining',
  };
  const sourcesData = dnzEconomy.distribution_by_source.map(s => ({
    ...s,
    name: sourceNames[s.name] || s.name,
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="In Circulation" value={`${dnzEconomy.total_circulation} DNZ`} icon={ChartBar} />
        <StatCard label="Lifetime Earned" value={`${dnzEconomy.total_lifetime_earned} DNZ`} icon={TrendUp} accent="#10B981" />
        <StatCard label="Active Holders" value={dnzEconomy.active_holders} icon={UsersThree} accent="#3B82F6" />
        <StatCard label="Avg Balance" value={`${Math.round(dnzEconomy.avg_balance)} DNZ`} icon={CalendarBlank} accent="#8B5CF6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DonutChart data={sourcesData} title="Distribution by Source" />
        <Card>
          <h3 className="text-lg font-bold mb-4" style={{ color: WHITE }}>Daily Distribution (30 Days)</h3>
          {dnzEconomy.daily_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dnzEconomy.daily_trend} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: TEXT_3, fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} axisLine={false} />
                <YAxis tick={{ fill: TEXT_3, fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 12, color: WHITE }} />
                <Bar dataKey="amount" fill={GOLD} radius={[4, 4, 0, 0]} barSize={16} name="DNZ Distributed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm py-10 text-center" style={{ color: TEXT_3 }}>No transaction data yet</p>
          )}
        </Card>
      </div>

      {/* Top holders */}
      <Card>
        <h3 className="text-lg font-bold mb-5 flex items-center gap-3" style={{ color: WHITE }}>
          <Trophy size={22} weight="bold" style={{ color: GOLD }} />
          Top DNZ Holders
        </h3>
        {dnzEconomy.top_holders.length > 0 ? (
          <div className="space-y-2">
            {dnzEconomy.top_holders.map((h, i) => (
              <div
                key={h.user_id}
                role="button"
                tabIndex={0}
                className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
                style={i < 3 ? { background: `${GOLD}08`, border: `1px solid ${BORDER}` } : {}}
                onClick={() => store.fetchUserDetail(h.user_id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); store.fetchUserDetail(h.user_id); } }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                    style={i < 3 ? { background: `${GOLD}25`, color: GOLD } : { background: SURFACE_2, color: TEXT_3 }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm font-bold" style={{ color: WHITE }}>{h.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black" style={{ color: GOLD }}>{h.balance} DNZ</p>
                  <p className="text-xs font-medium" style={{ color: TEXT_3 }}>Earned: {h.lifetime}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm py-10 text-center" style={{ color: TEXT_3 }}>No holders yet</p>
        )}
      </Card>
    </div>
  );
}
