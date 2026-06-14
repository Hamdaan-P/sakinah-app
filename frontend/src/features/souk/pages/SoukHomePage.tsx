import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, Plus, BookmarkSimple, Storefront, Sparkle, Bag } from '@phosphor-icons/react';
import { trackFeature } from '@/lib/analytics';
import { DisclaimerBanner } from '@/components/shared';
import { useSoukStore } from '../stores/souk.store';
import { fetchFeed } from '../services/soukService';
import { CategoryRail } from '../components/CategoryRail';
import { FeedCard } from '../components/FeedCard';
import { DinarzInlineBalance } from '../components/DinarzInlineBalance';
import { listSaved, subscribeSavedChanges, hydrateSavedFromServer } from '../services/soukSaveService';
import { auth } from '@/config/firebase.config';
import type { ListingType } from '../types/souk.types';

export function SoukHomePage() {
  useEffect(() => {
    trackFeature('souk');
    const uid = auth.currentUser?.uid;
    if (uid) void hydrateSavedFromServer(uid);
  }, []);

  const feed = useSoukStore((s) => s.feed);
  const setFeed = useSoukStore((s) => s.setFeed);
  const loading = useSoukStore((s) => s.feedLoading);
  const setLoading = useSoukStore((s) => s.setFeedLoading);
  const filter = useSoukStore((s) => s.feedFilter);
  const setFilter = useSoukStore((s) => s.setFeedFilter);

  const [query, setQuery] = useState('');
  const [savedCount, setSavedCount] = useState(() => listSaved().length);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchFeed(filter);
        if (!cancelled) setFeed(res.items);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filter, setFeed, setLoading]);

  useEffect(
    () => subscribeSavedChanges(() => setSavedCount(listSaved().length)),
    [],
  );

  const visible = useMemo(() => {
    if (!query) return feed;
    const q = query.toLowerCase();
    return feed.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [feed, query]);

  // Sections — recommended (top 4 highest-score), nearby (location set), trending
  const trending = visible.slice(0, 8);
  const fresh = [...visible].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-b-3xl mb-5">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D7B56A]/15 via-[#2C3C55] to-[#324862]" />
          <div className="relative px-5 pt-8 pb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D7B56A] to-amber-700 flex items-center justify-center shadow">
                  <Storefront size={22} className="text-[#1E293A]" weight="fill" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#EBDCB8]">Online Souk</h1>
                  <p className="text-xs text-[#D5DDEA]">Halal discovery marketplace</p>
                </div>
              </div>
              <DinarzInlineBalance />
            </div>

            {/* Search */}
            <div className="relative mt-2 max-w-2xl">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A7B1C0]"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search listings, services, sellers…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1E293A]/80 border border-[rgba(215,181,106,0.25)] text-[#EBDCB8] text-sm placeholder-[#A7B1C0] focus:outline-none focus:border-[#D7B56A]"
              />
            </div>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="px-4 mb-5 grid grid-cols-3 gap-2.5 sm:max-w-xl">
          <Link
            to="/souk/create"
            className="p-3 rounded-xl bg-gradient-to-br from-[#D7B56A]/20 to-amber-700/10 border border-[#D7B56A]/30 text-left hover:border-[#D7B56A]/60 transition-colors"
          >
            <Plus size={18} className="text-[#D7B56A] mb-1" />
            <h3 className="text-[#EBDCB8] font-semibold text-xs">List something</h3>
            <p className="text-[#A7B1C0] text-[10px]">Open a new listing</p>
          </Link>
          <Link
            to="/souk/my-listings"
            className="p-3 rounded-xl bg-[#2C3C55] border border-[rgba(215,181,106,0.2)] text-left hover:border-[#D7B56A]/40 transition-colors"
          >
            <Bag size={18} className="text-emerald-400 mb-1" />
            <h3 className="text-[#EBDCB8] font-semibold text-xs">My listings</h3>
            <p className="text-[#A7B1C0] text-[10px]">Your seller dashboard</p>
          </Link>
          <Link
            to="/souk/saved"
            className="p-3 rounded-xl bg-[#2C3C55] border border-[rgba(215,181,106,0.2)] text-left hover:border-[#D7B56A]/40 transition-colors"
          >
            <BookmarkSimple size={18} className="text-blue-400 mb-1" />
            <h3 className="text-[#EBDCB8] font-semibold text-xs">Saved</h3>
            <p className="text-[#A7B1C0] text-[10px]">
              {savedCount > 0 ? `${savedCount} item${savedCount === 1 ? '' : 's'}` : 'None yet'}
            </p>
          </Link>
        </div>

        {/* Category rail */}
        <div className="px-4 mb-4">
          <CategoryRail
            active={(filter.type as ListingType | 'all') ?? 'all'}
            onChange={(t) => setFilter({ ...filter, type: t })}
          />
        </div>

        {/* Sections */}
        {loading ? (
          <div className="px-4">
            <Skeleton />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="px-4 space-y-7">
            <Section
              title="Trending"
              icon={<Sparkle size={14} weight="fill" className="text-[#D7B56A]" />}
              seeAll={`/souk/category/${(filter.type ?? 'all') as string}`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {trending.map((l, i) => (
                  <FeedCard key={l.id} listing={l} index={i} />
                ))}
              </div>
            </Section>

            {fresh.length > 0 && (
              <Section title="Fresh">
                <div className="space-y-2 max-w-3xl">
                  {fresh.map((l, i) => (
                    <FeedCard key={`f-${l.id}`} listing={l} index={i} variant="list" />
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}

        <div className="px-4 pt-8">
          <DisclaimerBanner contentId="FINANCIAL" variant="subtle" />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  seeAll,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  seeAll?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[#EBDCB8] font-bold text-base flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {seeAll && (
          <Link to={seeAll} className="text-[#D7B56A] text-xs font-medium">
            See all →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-[#2C3C55] border border-[rgba(215,181,106,0.15)] overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] bg-[#1E293A]/60" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-[rgba(215,181,106,0.15)] rounded w-3/4" />
            <div className="h-2.5 bg-[rgba(215,181,106,0.1)] rounded w-full" />
            <div className="h-2.5 bg-[rgba(215,181,106,0.08)] rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <Storefront size={48} className="mx-auto text-[#D7B56A]/50 mb-3" />
      <h3 className="text-[#EBDCB8] font-semibold">The Souk is quiet right now</h3>
      <p className="text-[#A7B1C0] text-sm mt-1 mb-5">Be the first to share something beneficial with the community.</p>
      <Link
        to="/souk/create"
        className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D7B56A] to-[#E7CF8C] text-[#1E293A] font-bold text-sm"
      >
        Create your first listing
      </Link>
    </div>
  );
}
