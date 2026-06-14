import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Eye, HandHeart } from '@phosphor-icons/react';
import type { RankedListing } from '../types/souk.types';
import { LISTING_TYPE_LOOKUP } from '../_data';
import { ListingMedia } from './ListingMedia';
import { TrustBadge } from './TrustBadge';
import { SaveButton } from './SaveButton';

interface Props {
  listing: RankedListing;
  index?: number;
  variant?: 'grid' | 'list';
}

export function FeedCard({ listing, index = 0, variant = 'grid' }: Props) {
  const meta = LISTING_TYPE_LOOKUP[listing.type];
  const priceLabel = formatPrice(listing);

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.03, 0.3) }}
      >
        <Link
          to={`/souk/listing/${listing.id}`}
          className="flex gap-3 p-3 rounded-xl bg-[#2C3C55] border border-[rgba(215,181,106,0.18)] hover:border-[#D7B56A]/40 transition-colors"
        >
          <div className="w-20 h-20 shrink-0">
            <ListingMedia media={listing.media} fallbackType={listing.type} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="text-[10px] uppercase tracking-wide font-semibold"
                style={{ color: meta.accent }}
              >
                {meta.shortLabel}
              </span>
              <span className="text-[#A7B1C0] text-[10px]">·</span>
              <span className="text-[#A7B1C0] text-[10px]">{listing.category}</span>
            </div>
            <h3 className="text-[#EBDCB8] font-semibold text-sm truncate">{listing.title}</h3>
            <p className="text-[#A7B1C0] text-xs line-clamp-1 mb-1">{listing.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[#D7B56A] font-bold text-sm">{priceLabel}</span>
              <TrustBadge score={listing.trustScore} />
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className="relative"
    >
      <Link
        to={`/souk/listing/${listing.id}`}
        className="block rounded-xl bg-[#2C3C55] border border-[rgba(215,181,106,0.18)] hover:border-[#D7B56A]/40 transition-colors overflow-hidden"
      >
        <div className="relative">
          <ListingMedia media={listing.media} fallbackType={listing.type} />
          <div className="absolute top-2 left-2">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/50 backdrop-blur-sm"
              style={{ color: meta.accent }}
            >
              {meta.shortLabel}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <SaveButton listingId={listing.id} />
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-[#EBDCB8] font-semibold text-sm truncate mb-0.5">
            {listing.title}
          </h3>
          <p className="text-[#A7B1C0] text-[11px] line-clamp-2 mb-2 min-h-[28px]">
            {listing.description}
          </p>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[#D7B56A] font-bold text-sm">{priceLabel}</span>
            <TrustBadge score={listing.trustScore} />
          </div>
          <div className="flex items-center gap-3 text-[#A7B1C0] text-[10px]">
            {listing.location?.city && (
              <span className="flex items-center gap-0.5">
                <MapPin size={10} />
                {listing.location.city}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Eye size={10} />
              {compactNumber(listing.engagement.views)}
            </span>
            <span className="flex items-center gap-0.5">
              <HandHeart size={10} />
              {listing.engagement.interests}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function formatPrice(l: RankedListing): string {
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

function compactNumber(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}
