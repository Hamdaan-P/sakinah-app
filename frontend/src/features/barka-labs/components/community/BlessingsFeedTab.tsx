/**
 * BlessingsFeedTab — paginated public community blessing feed.
 */

import { useEffect } from 'react';
import { SpinnerGap, Leaf } from '@phosphor-icons/react';
import { C, cardStyle } from '../../barka-labs.constants';
import { useCommunityStore } from '../../stores/community.store';
import { BlessingFeedCard } from './BlessingFeedCard';

export function BlessingsFeedTab() {
  const feed = useCommunityStore((s) => s.feed);
  const feedLoading = useCommunityStore((s) => s.loading);
  const feedLoadingMore = useCommunityStore((s) => s.loadingMore);
  const hasMore = useCommunityStore((s) => s.hasMore);
  const fetchFeed = useCommunityStore((s) => s.fetchFeed);
  const fetchMore = useCommunityStore((s) => s.fetchMore);

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot fetch on tab mount; store guards duplicate calls
  }, []);

  return (
    <div className="space-y-4">
      {feedLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <SpinnerGap size={32} className="animate-spin mb-3" style={{ color: C.gold }} />
          <p className="text-sm" style={{ color: C.t3 }}>Loading blessings...</p>
        </div>
      ) : feed.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={cardStyle}>
          <Leaf size={36} weight="duotone" className="mx-auto mb-3" style={{ color: C.gold, opacity: 0.5 }} />
          <p className="text-base font-semibold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: C.t1 }}>
            The feed is quiet for now
          </p>
          <p className="text-xs" style={{ color: C.t3 }}>
            Be the first to share a blessing with the community.
          </p>
        </div>
      ) : (
        <>
          {feed.map((b) => (
            <BlessingFeedCard key={b.id} blessing={b} />
          ))}

          {hasMore && (
            <button
              onClick={fetchMore}
              disabled={feedLoadingMore}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                background: 'rgba(215,181,106,0.06)',
                border: '1px solid rgba(215,181,106,0.15)',
                color: C.gold,
                opacity: feedLoadingMore ? 0.6 : 1,
              }}
            >
              {feedLoadingMore ? (
                <>
                  <SpinnerGap size={16} className="animate-spin" />
                  Loading...
                </>
              ) : (
                'Load more blessings'
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
