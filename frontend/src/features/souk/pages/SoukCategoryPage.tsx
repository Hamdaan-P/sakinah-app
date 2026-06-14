import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react';
import { fetchFeed } from '../services/soukService';
import { FeedCard } from '../components/FeedCard';
import { LISTING_TYPE_LOOKUP } from '../_data';
import type { ListingType, RankedListing } from '../types/souk.types';

export function SoukCategoryPage() {
  const { type } = useParams<{ type: string }>();
  const meta = type && type !== 'all' ? LISTING_TYPE_LOOKUP[type as ListingType] : null;
  const [items, setItems] = useState<RankedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFeed({ type: (type as ListingType | 'all' | undefined) ?? 'all' })
      .then((r) => {
        if (!cancelled) setItems(r.items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  const visible = useMemo(() => {
    let out = items;
    if (category !== 'All') out = out.filter((l) => l.category === category);
    if (query) {
      const q = query.toLowerCase();
      out = out.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q),
      );
    }
    return out;
  }, [items, category, query]);

  return (
    <div className="min-h-screen pb-10 max-w-6xl mx-auto">
      <div className="px-4 pt-5 pb-3 flex items-center gap-3">
        <Link
          to="/souk"
          className="p-2 rounded-lg bg-[#2C3C55] border border-[rgba(215,181,106,0.2)]"
        >
          <ArrowLeft size={18} className="text-[#EBDCB8]" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#EBDCB8] truncate">
            {meta?.label ?? 'All listings'}
          </h1>
          <p className="text-[#A7B1C0] text-xs">{visible.length} active</p>
        </div>
      </div>

      <div className="px-4 mb-3">
        <div className="relative">
          <MagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A7B1C0]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#2C3C55] border border-[rgba(215,181,106,0.2)] text-[#EBDCB8] text-sm placeholder-[#A7B1C0] focus:outline-none focus:border-[#D7B56A]"
          />
        </div>
      </div>

      {meta && (
        <div className="px-4 mb-3 flex gap-2 overflow-x-auto -mx-4 pl-4 pr-4 scrollbar-hide">
          {['All', ...meta.categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                category === c
                  ? 'bg-[#D7B56A] text-[#1E293A]'
                  : 'bg-[#2C3C55] text-[#D5DDEA] border border-[rgba(215,181,106,0.2)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="px-4">
        {loading ? (
          <p className="text-[#A7B1C0] text-sm py-10 text-center">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="text-[#A7B1C0] text-sm py-10 text-center">
            No listings match this filter yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {visible.map((l, i) => (
              <FeedCard key={l.id} listing={l} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
