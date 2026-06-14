/**
 * AI Costs tab — per-user LLM cost breakdown with daily expansion.
 *
 * Extracted from AdminPage.tsx.
 */

import { useState, useEffect, Fragment } from 'react';
import { CurrencyDollar } from '@phosphor-icons/react';
import { useAdminStore } from '../stores/admin.store';
import type { AiCostUser } from '../types/admin.types';
import { Card } from './primitives';
import {
  BG, SURFACE_2, GOLD, WHITE, TEXT_1, TEXT_2, TEXT_3, BORDER,
} from './constants';

export function AiCostsTab() {
  const store = useAdminStore();
  const { aiCosts } = store;
  const [days, setDays] = useState(7);
  const [sortField, setSortField] = useState<'cost_usd' | 'calls' | 'total_tokens'>('cost_usd');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    store.fetchAiCosts(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store is a stable zustand instance; only re-fetch when day window changes
  }, [days]);

  const sortedUsers = aiCosts?.users?.slice().sort((a, b) => b[sortField] - a[sortField]) ?? [];
  const totals = aiCosts?.totals;

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black" style={{ color: WHITE }}>
          <CurrencyDollar size={24} weight="bold" className="inline mr-2" style={{ color: GOLD }} />
          AI / LLM Costs
        </h2>
        <div className="flex gap-2">
          {[1, 7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={days === d
                ? { background: GOLD, color: BG }
                : { background: SURFACE_2, color: TEXT_2, border: `1px solid ${BORDER}` }
              }
            >
              {d === 1 ? 'Today' : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      {/* Grand totals */}
      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Cost (USD)', value: `$${totals.total_cost_usd.toFixed(4)}`, accent: '#10B981' },
            { label: 'Total Cost (INR)', value: `₹${totals.total_cost_inr.toFixed(2)}`, accent: GOLD },
            { label: 'Total LLM Calls', value: totals.total_calls.toLocaleString(), accent: '#3B82F6' },
            { label: 'Total Tokens', value: totals.total_tokens.toLocaleString(), accent: '#8B5CF6' },
          ].map((stat) => (
            <Card key={stat.label}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: TEXT_3 }}>{stat.label}</p>
              <p className="text-2xl font-black" style={{ color: stat.accent }}>{stat.value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Sort buttons */}
      <div className="flex gap-2">
        <span className="text-xs font-bold uppercase self-center mr-2" style={{ color: TEXT_3 }}>Sort by:</span>
        {([['cost_usd', 'Cost'], ['calls', 'Calls'], ['total_tokens', 'Tokens']] as const).map(([field, label]) => (
          <button
            key={field}
            onClick={() => setSortField(field)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={sortField === field
              ? { background: `${GOLD}30`, color: GOLD, border: `1px solid ${GOLD}50` }
              : { background: SURFACE_2, color: TEXT_2 }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Per-user table */}
      <Card>
        {sortedUsers.length === 0 ? (
          <p className="text-sm py-12 text-center font-medium" style={{ color: TEXT_3 }}>
            No AI usage data yet. Data will appear after users chat with Raya.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: BORDER }}>
                  <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wide" style={{ color: TEXT_3 }}>User</th>
                  <th className="text-right py-3 px-3 text-xs font-bold uppercase tracking-wide" style={{ color: TEXT_3 }}>Calls</th>
                  <th className="text-right py-3 px-3 text-xs font-bold uppercase tracking-wide" style={{ color: TEXT_3 }}>Tokens</th>
                  <th className="text-right py-3 px-3 text-xs font-bold uppercase tracking-wide" style={{ color: TEXT_3 }}>USD</th>
                  <th className="text-right py-3 px-3 text-xs font-bold uppercase tracking-wide" style={{ color: TEXT_3 }}>INR</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((u: AiCostUser) => (
                  <Fragment key={u.user_id}>
                    <tr
                      className="border-b cursor-pointer hover:bg-white/[0.04] transition-colors"
                      style={{ borderColor: BORDER }}
                      onClick={() => setExpandedUser(expandedUser === u.user_id ? null : u.user_id)}
                    >
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-bold" style={{ color: WHITE }}>{u.user_name}</p>
                          <p className="text-xs" style={{ color: TEXT_3 }}>{u.user_email}</p>
                        </div>
                      </td>
                      <td className="text-right py-3 px-3 font-semibold" style={{ color: TEXT_1 }}>{u.calls}</td>
                      <td className="text-right py-3 px-3 font-semibold" style={{ color: TEXT_1 }}>{u.total_tokens.toLocaleString()}</td>
                      <td className="text-right py-3 px-3 font-bold" style={{ color: '#10B981' }}>${u.cost_usd.toFixed(4)}</td>
                      <td className="text-right py-3 px-3 font-bold" style={{ color: GOLD }}>₹{u.cost_inr.toFixed(2)}</td>
                    </tr>
                    {/* Daily breakdown (expanded) */}
                    {expandedUser === u.user_id && u.daily && u.daily.length > 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 pb-3">
                          <div className="rounded-xl p-3 mt-1" style={{ background: BG }}>
                            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: GOLD }}>Daily Breakdown</p>
                            <div className="space-y-1">
                              {u.daily.map((d) => (
                                <div key={d.date} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5">
                                  <span className="text-xs font-semibold" style={{ color: TEXT_2 }}>{d.date}</span>
                                  <div className="flex gap-6 text-xs">
                                    <span style={{ color: TEXT_1 }}>{d.calls} calls</span>
                                    <span style={{ color: TEXT_1 }}>{(d.input_tokens + d.output_tokens).toLocaleString()} tok</span>
                                    <span className="font-bold" style={{ color: '#10B981' }}>${d.cost_usd.toFixed(4)}</span>
                                    <span className="font-bold" style={{ color: GOLD }}>₹{d.cost_inr.toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
