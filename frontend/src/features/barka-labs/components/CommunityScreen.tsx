/**
 * Community Screen — filter chips + filtered blessings feed, with a floating
 * "+" button anchored to the viewport that opens the page-level
 * BlessingFocusModal so users can add a blessing without leaving Community.
 *
 * Layout:
 *   header → live OthersStream banner → filter chips → filtered feed →
 *   leaderboard section → invite CTA → back. The FAB lives outside this
 *   stack (position: fixed) and clears the BottomNavBar.
 *
 * Filters:
 *   - All        → public community feed, newest first
 *   - Mine       → user's own private blessings (from useBarkaLabsStore)
 *   - Most Loved → public community feed, highest `likes_count` first
 */

import { useState, useMemo, useEffect } from 'react';
// `Plus` is only used by the FAB block below (currently disabled — re-add to this import when re-enabling).
import { ArrowLeft, Globe, User, Heart, SpinnerGap, Leaf } from '@phosphor-icons/react';
import { C, cardStyle, computeReflectionScore } from '../barka-labs.constants';
import type { BarkaLabsStats, PercentileData, Blessing } from '../types/barka-labs.types';
import type { BarkaLabsScreen } from '../pages/BarkaLabsPage';
import { useAuthStore } from '@/core/stores/auth.store';
import { useBarkaLabsStore } from '../stores/barka-labs.store';
import { useCommunityStore } from '../stores/community.store';
import { OthersStream } from './community/OthersStream';
import { BlessingFeedCard } from './community/BlessingFeedCard';
import { RiseTogetherCard } from './community/RiseTogetherCard';
import { GlobalPulseCard } from './community/GlobalPulseCard';
import { YourStandingCard } from './community/YourStandingCard';
import { LeaderboardList } from './community/LeaderboardList';
import { InviteCta } from './community/InviteCta';
import { depthColor, formatDateFull, formatTime } from './journal/_helpers';

interface CommunityScreenProps {
  stats: BarkaLabsStats;
  percentile: PercentileData | null;
  go: (s: BarkaLabsScreen) => void;
  /** Opens the page-level BlessingFocusModal. Fired by the floating "+"
      button so users can add a blessing without leaving Community. */
  onOpenComposer: () => void;
}

type FilterKey = 'all' | 'mine' | 'most-loved';

/** Floating "+" composer trigger — currently disabled. Change the return
    value to `true` to bring it back (and follow the re-enable checklist
    below the FAB JSX further down). A function (not a const) so ESLint's
    `no-constant-binary-expression` rule doesn't fold through the boolean
    and complain about the `&&` gate. */
function isFabEnabled(): boolean {
  return false;
}

const FILTERS: { key: FilterKey; label: string; Icon: typeof Globe }[] = [
  { key: 'all', label: 'All', Icon: Globe },
  { key: 'mine', label: 'Mine', Icon: User },
  { key: 'most-loved', label: 'Most Loved', Icon: Heart },
];

/** Small card for "Mine" entries — no like/comment buttons since these are
    the user's own private blessings, not public community items. */
function MineEntryCard({ blessing }: { blessing: Blessing }) {
  const dc = depthColor(blessing.depth);
  const d = new Date(blessing.created_at);
  return (
    <div className="rounded-2xl p-4" style={cardStyle}>
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[11px]" style={{ color: '#A7B1C0' }}>
          {formatDateFull(d)} · {formatTime(d)}
        </span>
        <span
          className="inline-block px-2.5 py-0.5 rounded-xl text-[11px] font-semibold"
          style={{ background: dc.bg, color: dc.text }}
        >
          {blessing.score.toFixed(1)}
        </span>
      </div>
      <p className="text-sm leading-relaxed italic m-0" style={{ color: '#EBDCB8' }}>
        &ldquo;{blessing.text}&rdquo;
      </p>
      <div className="flex gap-1.5 flex-wrap mt-2.5">
        <span
          className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold capitalize"
          style={{ background: dc.bg, color: dc.text }}
        >
          {blessing.depth}
        </span>
      </div>
    </div>
  );
}

// `onOpenComposer` is kept in the interface (parent still passes it) but the
// FAB that consumed it is disabled below — underscore-prefix silences the
// unused-locals check until the FAB is re-enabled.
export function CommunityScreen({ stats, percentile, go, onOpenComposer: _onOpenComposer }: CommunityScreenProps) {
  const userName = useAuthStore((s) => s.user?.displayName?.split(' ')[0]) || 'You';
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');

  // Public feed + leaderboard
  const feed = useCommunityStore((s) => s.feed);
  const feedLoading = useCommunityStore((s) => s.loading);
  const feedLoadingMore = useCommunityStore((s) => s.loadingMore);
  const hasMore = useCommunityStore((s) => s.hasMore);
  const fetchFeed = useCommunityStore((s) => s.fetchFeed);
  const fetchMore = useCommunityStore((s) => s.fetchMore);
  const leaderboard = useBarkaLabsStore((s) => s.leaderboard);
  const globalStats = useBarkaLabsStore((s) => s.globalStats);
  const fetchLeaderboard = useBarkaLabsStore((s) => s.fetchLeaderboard);
  const fetchGlobalStats = useBarkaLabsStore((s) => s.fetchGlobalStats);

  // User's own blessings (for "Mine" filter)
  const myBlessings = useBarkaLabsStore((s) => s.blessings);

  useEffect(() => {
    fetchFeed();
    fetchLeaderboard();
    fetchGlobalStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot mount fetch; store guards duplicate calls
  }, []);

  const userPct = percentile?.percentile ?? null;
  const totalUsers = globalStats?.total_users || percentile?.total_users || 0;
  const userRank = userPct != null ? Math.max(Math.round((100 - userPct) / 100 * totalUsers), 11) : 23;

  const userCreativity = useMemo(
    () => computeReflectionScore(stats.avg_depth_score, stats.total_blessings, stats.profound_count, stats.current_streak).total,
    [stats.avg_depth_score, stats.total_blessings, stats.profound_count, stats.current_streak],
  );

  const filteredFeed = useMemo(() => {
    if (filter === 'most-loved') {
      return [...feed].sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0));
    }
    return feed; // 'all' — newest first as returned by the API
  }, [feed, filter]);

  const handleShare = async () => {
    const link = `${window.location.origin}/invite?ref=${userName.toLowerCase()}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join Barakah Labs', text: 'Track your gratitude, grow your mental health, earn DinarZ!', url: link });
        return;
      } catch { /* fallback */ }
    }
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button onClick={() => go('home')} className="w-9 h-9 rounded-full flex items-center justify-center" style={cardStyle}>
          <ArrowLeft size={18} className="text-[#EBDCB8]" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Cormorant Garamond, serif', color: C.t1 }}>
            Community
          </h2>
          <p className="text-[11px]" style={{ color: C.t3 }}>{totalUsers.toLocaleString()} members worldwide</p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
          style={{ background: 'rgba(42,157,111,0.1)', border: '1px solid rgba(42,157,111,0.2)', color: C.emL }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.emL }} />
          {totalUsers > 0 ? totalUsers.toLocaleString() : '—'} active
        </div>
      </div>

      {/* ── Live rotator (kept above filters as the social-proof banner) ── */}
      <OthersStream />

      {/* ── Filter chips ── */}
      <div
        className="flex rounded-xl p-1 gap-1"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(215,181,106,0.10)' }}
      >
        {FILTERS.map(({ key, label, Icon }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: active
                  ? `linear-gradient(135deg, ${C.gold}18, ${C.goldD}10)`
                  : 'transparent',
                border: active ? `1px solid ${C.gold}30` : '1px solid transparent',
                color: active ? C.gold : C.t3,
              }}
            >
              <Icon size={14} weight={active ? 'fill' : 'regular'} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Filtered feed ── */}
      {filter === 'mine' ? (
        myBlessings.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={cardStyle}>
            <Leaf size={36} weight="duotone" className="mx-auto mb-3" style={{ color: C.gold, opacity: 0.5 }} />
            <p className="text-base font-semibold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: C.t1 }}>
              No blessings yet
            </p>
            <p className="text-xs" style={{ color: C.t3 }}>
              Use the box above to count your first blessing.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myBlessings.map((b) => (
              <MineEntryCard key={b.id} blessing={b} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          {feedLoading && feed.length === 0 ? (
            <FeedSkeleton />
          ) : filteredFeed.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={cardStyle}>
              <Leaf size={36} weight="duotone" className="mx-auto mb-3" style={{ color: C.gold, opacity: 0.5 }} />
              <p className="text-base font-semibold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: C.t1 }}>
                The feed is quiet for now
              </p>
              <p className="text-xs" style={{ color: C.t3 }}>
                Be the first to share a blessing — type one above.
              </p>
            </div>
          ) : (
            <>
              {filteredFeed.map((b) => (
                <BlessingFeedCard key={b.id} blessing={b} />
              ))}

              {filter === 'all' && hasMore && (
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
      )}

      {/* ── Leaderboard section (kept from the previous layout so nothing's lost) ── */}
      <div className="pt-2">
        <h3
          className="text-base font-bold mb-3 px-1"
          style={{ fontFamily: 'Cormorant Garamond, serif', color: C.t1 }}
        >
          Leaderboard
        </h3>
        <div className="space-y-4">
          <RiseTogetherCard />
          <GlobalPulseCard globalStats={globalStats} />
          <YourStandingCard
            userName={userName}
            userRank={userRank}
            userCreativity={userCreativity}
            userPct={userPct}
            stats={stats}
          />
          <LeaderboardList
            leaderboard={leaderboard}
            userName={userName}
            userRank={userRank}
            userCreativity={userCreativity}
            stats={stats}
          />
        </div>
      </div>

      <InviteCta copied={copied} onShare={handleShare} />

      <button
        onClick={() => go('home')}
        className="w-full py-3.5 rounded-xl text-sm font-bold transition-colors hover:bg-[rgba(42,157,111,0.12)]"
        style={{ background: `linear-gradient(135deg, ${C.em}, ${C.emD})`, color: C.t1 }}
      >
        Back to Dashboard
      </button>

      <div className="h-5" />

      {/* ── Floating "+" composer trigger ── gated by isFabEnabled() above.
          To re-enable:
            1. Change `isFabEnabled` to return true (top of the file).
            2. Add `Plus` back to the phosphor import.
            3. Remove the `_` prefix from `_onOpenComposer` in the destructure.
            4. Restore the <Plus … /> icon below in place of the literal "+".
          What it does when on: floating gold "+" anchored bottom-right of the
          viewport that opens the page-level BlessingFocusModal so users can
          add a blessing without leaving Community. Positioned to clear the
          mobile BottomNavBar + safe-area inset; z-[50] keeps it above the
          feed but below the modal (z-100). */}
      {isFabEnabled() && (
        <button
          onClick={_onOpenComposer}
          aria-label="Count a blessing"
          className="fixed z-[50] w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 hover:scale-105"
          style={{
            right: 'max(1.25rem, env(safe-area-inset-right))',
            bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
            boxShadow: '0 12px 32px rgba(212,168,83,0.35), 0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          +
        </button>
      )}
    </div>
  );
}

/** Skeleton card array — replaces the spinner during first feed load so the
    page feels instant. */
function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(36,50,70,0.4)',
            border: '1px solid rgba(215,181,106,0.10)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full animate-pulse" style={{ background: 'rgba(215,181,106,0.10)' }} />
            <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'rgba(215,181,106,0.10)' }} />
          </div>
          <div className="h-4 w-full rounded animate-pulse mb-2" style={{ background: 'rgba(215,181,106,0.08)' }} />
          <div className="h-4 w-3/4 rounded animate-pulse mb-3" style={{ background: 'rgba(215,181,106,0.08)' }} />
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-full animate-pulse" style={{ background: 'rgba(215,181,106,0.10)' }} />
            <div className="h-5 w-10 rounded-full animate-pulse" style={{ background: 'rgba(215,181,106,0.08)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
