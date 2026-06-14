import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Eye,
  HandHeart,
  Flag,
  Books,
  ChatCircleDots,
  Coins,
  CheckCircle,
  Clock,
} from '@phosphor-icons/react';
import { fetchListing, recordSoukSignal } from '../services/soukService';
import { subscribeToListing } from '../services/soukRealtimeService';
import { ListingMedia } from '../components/ListingMedia';
import { SaveButton } from '../components/SaveButton';
import { TrustBadge } from '../components/TrustBadge';
import { SellerInlineCard } from '../components/SellerInlineCard';
import { InterestButton } from '../components/InterestButton';
import { ReportSheet } from '../components/ReportSheet';
import { ScholarEscalateSheet } from '../components/ScholarEscalateSheet';
import { RatingsSection } from '../components/RatingsSection';
import { PayWithDinarzSheet } from '../components/PayWithDinarzSheet';
import { LISTING_TYPE_LOOKUP } from '../_data';
import { useAuthStore, selectUser } from '@/core/stores/auth.store';
import type { Listing } from '../types/souk.types';

interface RouteState {
  justCreated?: boolean;
  moderation?: { status: 'active' | 'pending_review'; reasons: string[] };
  reward?: { awarded: boolean; amount: number };
}

export function SoukListingDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? {}) as RouteState;
  const me = useAuthStore(selectUser);

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchListing(id)
      .then((l) => {
        if (!cancelled) {
          setListing(l);
          if (l) void recordSoukSignal(l.type, 'view');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    const unsub = subscribeToListing(id, (l) => {
      if (l) setListing(l);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#A7B1C0] text-sm">Loading listing…</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-[#EBDCB8] font-semibold">Listing not found</p>
          <p className="text-[#A7B1C0] text-sm mt-1 mb-4">It may have been removed or is no longer active.</p>
          <Link
            to="/souk"
            className="inline-block px-4 py-2 rounded-xl bg-[#D7B56A] text-[#1E293A] font-semibold text-sm"
          >
            Back to Souk
          </Link>
        </div>
      </div>
    );
  }

  const meta = LISTING_TYPE_LOOKUP[listing.type];
  const isMine = me?.id === listing.sellerId;
  const acceptsDinarz = listing.price.acceptsDinarz === true;

  function openChat() {
    if (!me?.id) {
      navigate('/login');
      return;
    }
    const [a, b] = [me.id, listing!.sellerId].sort();
    navigate(`/messages/${a}_${b}`, {
      state: {
        prefill: `Hi — I'm interested in your listing "${listing!.title}".`,
        contextListingId: listing!.id,
      },
    });
  }

  return (
    <div className="min-h-screen pb-12 max-w-5xl mx-auto">
      <div className="px-4 pt-5 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-[#2C3C55] border border-[rgba(215,181,106,0.2)]"
        >
          <ArrowLeft size={18} className="text-[#EBDCB8]" />
        </button>
        <div className="flex items-center gap-2">
          <SaveButton listingId={listing.id} variant="pill" />
          {!isMine && (
            <>
              <button
                onClick={() => setEscalateOpen(true)}
                className="p-2 rounded-full bg-[#2C3C55] border border-[rgba(215,181,106,0.2)] text-[#A7B1C0] hover:text-[#D7B56A]"
                aria-label="Ask scholar team"
                title="Ask the scholar team about this listing"
              >
                <Books size={16} />
              </button>
              <button
                onClick={() => setReportOpen(true)}
                className="p-2 rounded-full bg-[#2C3C55] border border-[rgba(215,181,106,0.2)] text-[#A7B1C0] hover:text-rose-400"
                aria-label="Report listing"
              >
                <Flag size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-4">
        <ListingMedia media={listing.media} fallbackType={listing.type} hero />
      </div>

      {/* Just-created banner */}
      {routeState.justCreated && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2"
        >
          {routeState.moderation?.status === 'pending_review' ? (
            <Clock size={18} className="text-amber-300 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" weight="fill" />
          )}
          <div className="flex-1">
            <p className="text-[#EBDCB8] text-sm font-semibold">
              {routeState.moderation?.status === 'pending_review'
                ? 'Listing submitted — under review'
                : 'Listing is live!'}
            </p>
            <p className="text-[#A7B1C0] text-xs mt-0.5">
              {routeState.moderation?.status === 'pending_review'
                ? 'Our moderation team will review it shortly. You can edit it from My Listings.'
                : 'Buyers can now discover it in the feed.'}
            </p>
            {routeState.reward?.awarded && (
              <p className="text-[#D7B56A] text-xs mt-1 flex items-center gap-1">
                <Coins size={12} weight="fill" />
                Earned {routeState.reward.amount} DNZ for sharing with the community
              </p>
            )}
          </div>
        </motion.div>
      )}

      <div className="px-4 pt-5 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: meta.accent }}
            >
              {meta.label}
            </span>
            <span className="text-[#A7B1C0] text-[11px]">·</span>
            <span className="text-[#A7B1C0] text-[11px]">{listing.category}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#EBDCB8] leading-tight">{listing.title}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <span className="text-[#D7B56A] text-xl font-bold">{formatPrice(listing)}</span>
            {acceptsDinarz && (
              <span className="inline-flex items-center gap-1 text-[#D7B56A] text-xs font-semibold">
                <Coins size={13} weight="fill" /> Accepts Dinarz
              </span>
            )}
            <TrustBadge score={listing.trustScore} size="md" />
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#A7B1C0] text-xs">
          {listing.location?.city && (
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {[listing.location.city, listing.location.country].filter(Boolean).join(', ')}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye size={13} />
            {listing.engagement.views} views
          </span>
          <span className="flex items-center gap-1">
            <HandHeart size={13} />
            {listing.engagement.interests} interested
          </span>
        </div>

        <p className="text-[#D5DDEA] text-sm whitespace-pre-wrap leading-relaxed">
          {listing.description}
        </p>

        {listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {listing.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-[#D7B56A]/10 border border-[#D7B56A]/25 text-[#D7B56A] text-[10px]"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="pt-2">
          <SellerInlineCard listing={listing} />
        </div>

        {!isMine ? (
          <div className="space-y-2 pt-1">
            {acceptsDinarz && listing.price.amount && listing.price.amount > 0 && (
              <button
                onClick={() => setPayOpen(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D7B56A] to-[#E7CF8C] text-[#1E293A] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
              >
                <Coins size={18} weight="fill" />
                Pay {listing.price.amount.toLocaleString()} DNZ
              </button>
            )}
            <InterestButton
              listingId={listing.id}
              initialCount={listing.engagement.interests}
            />
            <button
              onClick={openChat}
              className="w-full py-3 rounded-xl bg-[#2C3C55] border border-[rgba(215,181,106,0.25)] text-[#EBDCB8] font-semibold text-sm flex items-center justify-center gap-2 hover:border-[#D7B56A]/40 transition-colors"
            >
              <ChatCircleDots size={18} />
              Message seller
            </button>
          </div>
        ) : (
          <div className="pt-1 grid grid-cols-2 gap-2">
            <Link
              to={`/souk/create?edit=${listing.id}`}
              className="py-3 rounded-xl bg-[#2C3C55] border border-[rgba(215,181,106,0.25)] text-[#EBDCB8] font-semibold text-sm text-center"
            >
              Edit listing
            </Link>
            <Link
              to="/souk/my-listings"
              className="py-3 rounded-xl bg-gradient-to-r from-[#D7B56A] to-[#E7CF8C] text-[#1E293A] font-bold text-sm text-center"
            >
              My listings
            </Link>
          </div>
        )}
      </div>

      <div className="px-4 pt-6">
        <RatingsSection
          listingId={listing.id}
          sellerId={listing.sellerId}
          initialCount={listing.engagement.ratingCount ?? 0}
          initialAverage={
            listing.engagement.ratingCount && listing.engagement.ratingSum
              ? listing.engagement.ratingSum / listing.engagement.ratingCount
              : null
          }
        />
      </div>

      <ReportSheet
        open={reportOpen}
        listingId={listing.id}
        onClose={() => setReportOpen(false)}
      />
      <ScholarEscalateSheet
        open={escalateOpen}
        listingId={listing.id}
        listingTitle={listing.title}
        onClose={() => setEscalateOpen(false)}
      />
      <PayWithDinarzSheet
        open={payOpen}
        listing={listing}
        onClose={() => setPayOpen(false)}
        onSuccess={() => {
          if (listing) void recordSoukSignal(listing.type, 'purchase');
        }}
      />
    </div>
  );
}

function formatPrice(l: Listing): string {
  if (l.type === 'donation') return l.price.amount ? `From ${currency(l.price.amount, l.price.currency)}` : 'Free';
  if (l.price.amount == null) return l.price.flexible ? 'Flexible' : '—';
  const base = currency(l.price.amount, l.price.currency);
  return l.price.flexible ? `${base}+` : base;
}

function currency(amount: number, code: string): string {
  if (code === 'DNZ') return `${amount.toLocaleString()} DNZ`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}
