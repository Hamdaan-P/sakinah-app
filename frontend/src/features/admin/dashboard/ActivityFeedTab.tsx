/**
 * Activity Feed tab — recent platform-wide events (signups, chats, KYC, DNZ).
 *
 * Extracted from AdminPage.tsx.
 */

import { useAdminStore } from '../stores/admin.store';
import { Card } from './primitives';
import { timeAgoShort } from './helpers';
import {
  SURFACE, WHITE, TEXT_2, TEXT_3, BORDER,
} from './constants';

export function ActivityFeedTab() {
  const { activityFeed } = useAdminStore();
  const store = useAdminStore();

  const eventIcons: Record<string, { color: string; label: string }> = {
    chat: { color: '#3B82F6', label: 'Chat' },
    dnz_earned: { color: '#D4A853', label: 'DNZ' },
    kyc_completed: { color: '#10B981', label: 'KYC' },
    signup: { color: '#8B5CF6', label: 'New' },
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold" style={{ color: WHITE }}>Recent Activity</h3>
      {activityFeed.length > 0 ? (
        <div className="rounded-2xl border !p-0 divide-y" style={{ background: SURFACE, borderColor: BORDER }}>
          {activityFeed.map((ev) => {
            const meta = eventIcons[ev.event_type] || { color: TEXT_3, label: '?' };
            return (
              <div
                key={ev.id}
                role="button"
                tabIndex={0}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => store.fetchUserDetail(ev.user_id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); store.fetchUserDetail(ev.user_id); } }}
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black uppercase shrink-0"
                  style={{ background: `${meta.color}15`, color: meta.color }}
                >
                  {meta.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: WHITE }}>{ev.user_name}</p>
                  <p className="text-xs font-medium truncate" style={{ color: TEXT_2 }}>{ev.description}</p>
                  {ev.detail && <p className="text-xs truncate" style={{ color: TEXT_3 }}>{ev.detail}</p>}
                </div>
                <span className="text-xs font-medium shrink-0" style={{ color: TEXT_3 }}>{timeAgoShort(ev.timestamp)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <p className="text-base py-10 text-center font-medium" style={{ color: TEXT_3 }}>No activity yet</p>
        </Card>
      )}
    </div>
  );
}
