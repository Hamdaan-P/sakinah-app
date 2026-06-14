import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, User, ShieldCheck, Storefront } from '@phosphor-icons/react';
import { fetchSeller } from '../services/soukService';
import { FeedCard } from '../components/FeedCard';
import type { Listing, RankedListing, SellerProfile } from '../types/souk.types';

export function SoukSellerProfilePage() {
  const { uid = '' } = useParams<{ uid: string }>();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSeller(uid)
      .then((res) => {
        if (cancelled) return;
        setProfile(res.profile);
        setListings(res.listings);
      })
      .catch(() => {
        if (!cancelled) setErr("Couldn't load seller profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return (
    <div className="min-h-screen pb-12 max-w-6xl mx-auto">
      <div className="px-4 pt-5 pb-3 flex items-center gap-3">
        <Link
          to="/souk"
          className="p-2 rounded-lg bg-[#2C3C55] border border-[rgba(215,181,106,0.2)]"
        >
          <ArrowLeft size={18} className="text-[#EBDCB8]" />
        </Link>
        <h1 className="text-xl font-bold text-[#EBDCB8]">Seller profile</h1>
      </div>

      {loading ? (
        <p className="text-[#A7B1C0] text-sm py-10 text-center">Loading…</p>
      ) : err || !profile ? (
        <div className="px-6 py-12 text-center">
          <p className="text-[#EBDCB8] font-semibold">Profile unavailable</p>
          <p className="text-[#A7B1C0] text-sm mt-1">{err ?? 'This seller is not active.'}</p>
        </div>
      ) : (
        <>
          <div className="px-4 mb-5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#D7B56A]/15 via-[#2C3C55] to-[#324862] border border-[#D7B56A]/25">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D7B56A]/40 to-[#324862] flex items-center justify-center overflow-hidden shrink-0">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={28} className="text-[#D7B56A]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-[#EBDCB8] font-bold text-lg truncate">{profile.displayName}</h2>
                    {profile.reputationScore >= 75 && (
                      <ShieldCheck size={16} className="text-emerald-400 shrink-0" weight="fill" />
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-[#D5DDEA] text-xs mt-1 line-clamp-2">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[#A7B1C0] text-[11px]">
                    <span className="flex items-center gap-1">
                      <Storefront size={11} />
                      {profile.listingCount} listings
                    </span>
                    <span>·</span>
                    <span>Reputation {profile.reputationScore}/100</span>
                  </div>
                  {profile.verifiedBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.verifiedBadges.map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]"
                        >
                          ✓ {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-4">
            <h3 className="text-[#EBDCB8] font-bold text-base mb-3">Active listings</h3>
            {listings.length === 0 ? (
              <p className="text-[#A7B1C0] text-sm py-6 text-center">No active listings.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {listings.map((l, i) => (
                  <FeedCard key={l.id} listing={l as RankedListing} index={i} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
