import { Link } from 'react-router-dom';
import { User, ShieldCheck } from '@phosphor-icons/react';
import type { Listing } from '../types/souk.types';

interface Props {
  listing: Listing;
}

export function SellerInlineCard({ listing }: Props) {
  return (
    <Link
      to={`/souk/seller/${listing.sellerId}`}
      className="flex items-center gap-3 p-3 rounded-xl bg-[#2C3C55] border border-[rgba(215,181,106,0.18)] hover:border-[#D7B56A]/40 transition-colors"
    >
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D7B56A]/30 to-[#324862] flex items-center justify-center overflow-hidden shrink-0">
        {listing.sellerAvatar ? (
          <img src={listing.sellerAvatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <User size={22} className="text-[#D7B56A]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[#EBDCB8] font-semibold text-sm truncate">{listing.sellerName}</h3>
          {listing.trustScore >= 75 && (
            <ShieldCheck size={14} weight="fill" className="text-emerald-400 shrink-0" />
          )}
        </div>
        <p className="text-[#A7B1C0] text-[11px]">View seller profile</p>
      </div>
      <span className="text-[#D7B56A] text-xs">→</span>
    </Link>
  );
}
