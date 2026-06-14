import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, CheckCircle, XCircle, Archive } from '@phosphor-icons/react';
import { fetchMyListings } from '../services/soukService';
import { useAuthStore, selectUser } from '@/core/stores/auth.store';
import { ListingMedia } from '../components/ListingMedia';
import { LISTING_TYPE_LOOKUP } from '../_data';
import type { Listing, ListingStatus } from '../types/souk.types';

const STATUS_META: Record<ListingStatus, { label: string; tone: string; Icon: typeof Clock }> = {
  draft: { label: 'Draft', tone: 'bg-slate-500/15 text-slate-300', Icon: Archive },
  active: { label: 'Active', tone: 'bg-emerald-500/15 text-emerald-400', Icon: CheckCircle },
  pending_review: { label: 'Under review', tone: 'bg-amber-500/15 text-amber-300', Icon: Clock },
  rejected: { label: 'Rejected', tone: 'bg-rose-500/15 text-rose-400', Icon: XCircle },
  sold: { label: 'Sold', tone: 'bg-blue-500/15 text-blue-400', Icon: CheckCircle },
  archived: { label: 'Archived', tone: 'bg-slate-500/15 text-slate-300', Icon: Archive },
};

export function SoukMyListingsPage() {
  const me = useAuthStore(selectUser);
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!me?.id) return;
    let cancelled = false;
    setLoading(true);
    fetchMyListings(me.id)
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [me?.id]);

  return (
    <div className="min-h-screen pb-12 max-w-4xl mx-auto">
      <div className="px-4 pt-5 pb-3 flex items-center gap-3">
        <Link
          to="/souk"
          className="p-2 rounded-lg bg-[#2C3C55] border border-[rgba(215,181,106,0.2)]"
        >
          <ArrowLeft size={18} className="text-[#EBDCB8]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#EBDCB8]">My listings</h1>
          <p className="text-[#A7B1C0] text-xs">
            {items.length} total · {items.filter((l) => l.status === 'active').length} active
          </p>
        </div>
        <Link
          to="/souk/create"
          className="p-2.5 rounded-xl bg-gradient-to-r from-[#D7B56A] to-[#E7CF8C] text-[#1E293A]"
          aria-label="Create new listing"
        >
          <Plus size={18} weight="bold" />
        </Link>
      </div>

      <div className="px-4">
        {loading ? (
          <p className="text-[#A7B1C0] text-sm py-10 text-center">Loading your listings…</p>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#EBDCB8] font-semibold">No listings yet</p>
            <p className="text-[#A7B1C0] text-sm mt-1 mb-4">
              Your seller dashboard appears here once you publish something.
            </p>
            <Link
              to="/souk/create"
              className="inline-block px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D7B56A] to-[#E7CF8C] text-[#1E293A] font-bold text-sm"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((l) => {
              const meta = LISTING_TYPE_LOOKUP[l.type];
              const status = STATUS_META[l.status];
              const StatusIcon = status.Icon;
              return (
                <Link
                  key={l.id}
                  to={`/souk/listing/${l.id}`}
                  className="flex gap-3 p-3 rounded-xl bg-[#2C3C55] border border-[rgba(215,181,106,0.18)] hover:border-[#D7B56A]/40 transition-colors"
                >
                  <div className="w-16 h-16 shrink-0">
                    <ListingMedia media={l.media} fallbackType={l.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-[#EBDCB8] font-semibold text-sm truncate flex-1">{l.title}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${status.tone}`}
                      >
                        <StatusIcon size={10} weight="fill" />
                        {status.label}
                      </span>
                    </div>
                    <p
                      className="text-[10px] uppercase tracking-wide font-semibold"
                      style={{ color: meta.accent }}
                    >
                      {meta.shortLabel} · {l.category}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[#A7B1C0] text-[10px]">
                      <span>{l.engagement.views} views</span>
                      <span>{l.engagement.interests} interested</span>
                      <span>{l.engagement.saves} saves</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
