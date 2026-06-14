/**
 * Share Profile — public URL + QR code.
 * Makes the profile shareable and something to be proud of.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShareNetwork } from '@phosphor-icons/react';
import { QRCodeSVG } from 'qrcode.react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { syncPublicProfile } from '@/features/public-profile/services/publicProfileService';
import { ShareProfileModal } from './share-profile/ShareProfileModal';

interface Props {
  userId: string;
  userName: string;
}

export function ShareProfile({ userId, userName }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  // Ensure the user has a slug, then use it to build the public URL.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ppSnap = await getDoc(doc(db, 'public_profiles', userId));
        if (ppSnap.exists() && (ppSnap.data() as { slug?: string }).slug) {
          if (!cancelled) setSlug((ppSnap.data() as { slug: string }).slug);
          return;
        }
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (!userSnap.exists()) return;
        const pp = await syncPublicProfile(userId, userSnap.data() as Record<string, unknown>, {
          ensureSlug: true,
        });
        if (!cancelled) setSlug(pp.slug || null);
      } catch (err) {
        console.error('ShareProfile: failed to resolve slug', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zaryahplus.com';
  const publicUrl = slug ? `${origin}/@${slug}` : `${origin}/@${userId}`;

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* best-effort */ }
  }

  async function shareNative() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName} on ZaryahPlus`,
          text: `Check out my ZaryahPlus profile`,
          url: publicUrl,
        });
      } catch { /* best-effort */ }
    } else {
      copyUrl();
    }
  }

  return (
    <>
      {/* Inline card on profile page */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)] overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-[rgba(212,168,83,0.1)]">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#D4A853]/60">Share Your Profile</p>
        </div>
        <div className="p-4 flex items-center gap-3">
          {/* Mini QR */}
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-xl bg-white flex-shrink-0 hover:scale-105 transition-transform"
            aria-label="Show full QR code"
          >
            <QRCodeSVG
              value={publicUrl}
              size={56}
              bgColor="#ffffff"
              fgColor="#0A0E16"
              level="M"
              marginSize={0}
            />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[#F5E8C7] text-[13px] font-semibold truncate">
              zaryahplus.com/@{slug ?? '…'}
            </p>
            <p className="text-[#5C5749] text-[11px] mt-0.5">Your shareable public profile</p>
          </div>
          <button
            onClick={shareNative}
            className="p-2.5 rounded-xl flex-shrink-0 transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #D4A853, #B8943E)',
              color: '#0A0E16',
            }}
          >
            <ShareNetwork size={18} weight="bold" />
          </button>
        </div>
      </motion.div>

      <ShareProfileModal
        open={open}
        onClose={() => setOpen(false)}
        userName={userName}
        publicUrl={publicUrl}
        copied={copied}
        onCopy={copyUrl}
        onShare={shareNative}
      />
    </>
  );
}
