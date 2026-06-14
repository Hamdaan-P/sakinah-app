/**
 * Users tab — searchable, paginated user table with filters and sorting.
 *
 * Extracted from AdminPage.tsx.
 */

import {
  MagnifyingGlass, Eye, ArrowUp, ArrowDown, CaretLeft, CaretRight,
} from '@phosphor-icons/react';
import { useAdminStore } from '../stores/admin.store';
import { fmtDate, kycBadge } from './helpers';
import {
  SURFACE, SURFACE_2, GOLD, WHITE, TEXT_1, TEXT_2, TEXT_3, BORDER,
} from './constants';

export function UsersTab() {
  const store = useAdminStore();
  const { users, usersTotal, usersPage, searchQuery, kycFilter, loading } = store;
  const totalPages = Math.ceil(usersTotal / 50);

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: TEXT_3 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => store.setSearch(e.target.value)}
            placeholder="Search name, email, country, referral code..."
            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none border focus:border-[#D4A853]/50 transition-colors"
            style={{ background: SURFACE, color: WHITE, borderColor: BORDER }}
          />
        </div>
        <select
          value={kycFilter ?? ''}
          onChange={(e) => store.setKycFilter(e.target.value === '' ? undefined : Number(e.target.value))}
          className="px-5 py-3.5 rounded-xl text-sm font-bold outline-none border cursor-pointer"
          style={{ background: SURFACE, color: TEXT_1, borderColor: BORDER }}
        >
          <option value="">All KYC Levels</option>
          <option value="0">No KYC</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
        </select>
      </div>

      <p className="text-sm font-bold" style={{ color: TEXT_2 }}>{usersTotal} users</p>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: BORDER }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: SURFACE_2 }}>
                {[
                  { key: 'full_name', label: 'User' },
                  { key: 'email', label: 'Email' },
                  { key: 'country', label: 'Country' },
                  { key: 'messages_count', label: 'Messages' },
                  { key: 'kyc_tier', label: 'KYC' },
                  { key: 'auth_provider', label: 'Provider' },
                  { key: 'created_at', label: 'Joined' },
                  { key: '', label: '' },
                ].map(({ key, label }) => (
                  <th
                    key={key || 'actions'}
                    className={`px-5 py-4 text-left text-xs font-bold uppercase tracking-wider ${key ? 'cursor-pointer hover:opacity-80 select-none' : ''}`}
                    style={{ color: TEXT_2 }}
                    onClick={() => key && store.setSortBy(key)}
                  >
                    <span className="flex items-center gap-1.5">
                      {label}
                      {store.sortBy === key && (store.sortDir === 'desc' ? <ArrowDown size={12} weight="bold" /> : <ArrowUp size={12} weight="bold" />)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-t cursor-pointer hover:bg-white/[0.03] transition-colors"
                  style={{ borderColor: BORDER }}
                  onClick={() => store.fetchUserDetail(u.id)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {u.photo_url ? (
                        <img src={u.photo_url} alt="" className="w-9 h-9 rounded-xl object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: `${GOLD}15`, color: GOLD }}>
                          {(u.full_name || u.email || '?')[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold" style={{ color: WHITE }}>{u.full_name || 'Unnamed'}</p>
                        {u.online && (
                          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#10B981' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium" style={{ color: TEXT_1 }}>{u.email}</td>
                  <td className="px-5 py-4 text-sm font-medium" style={{ color: TEXT_2 }}>{u.country || '—'}</td>
                  <td className="px-5 py-4 text-sm font-bold tabular-nums" style={{ color: (u.messages_count ?? 0) > 0 ? GOLD : TEXT_3 }}>{u.messages_count ?? 0}</td>
                  <td className="px-5 py-4">{kycBadge(u.kyc_tier)}</td>
                  <td className="px-5 py-4 text-sm font-medium capitalize" style={{ color: TEXT_2 }}>{u.auth_provider || '—'}</td>
                  <td className="px-5 py-4 text-sm font-medium" style={{ color: TEXT_3 }}>{fmtDate(u.created_at)}</td>
                  <td className="px-5 py-4">
                    <button className="p-2 rounded-xl hover:bg-white/10 transition-colors" onClick={(e) => { e.stopPropagation(); store.fetchUserDetail(u.id); }}>
                      <Eye size={18} weight="bold" style={{ color: TEXT_2 }} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-base font-medium" style={{ color: TEXT_3 }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm font-bold" style={{ color: TEXT_3 }}>Page {usersPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={usersPage <= 1}
              onClick={() => store.fetchUsers(usersPage - 1)}
              className="p-2.5 rounded-xl border disabled:opacity-20 hover:bg-white/5 transition-colors"
              style={{ borderColor: BORDER, color: TEXT_2 }}
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <button
              disabled={usersPage >= totalPages}
              onClick={() => store.fetchUsers(usersPage + 1)}
              className="p-2.5 rounded-xl border disabled:opacity-20 hover:bg-white/5 transition-colors"
              style={{ borderColor: BORDER, color: TEXT_2 }}
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
