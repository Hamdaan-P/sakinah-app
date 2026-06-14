/**
 * InviteGate — Invite-only access wall.
 * Users need a valid invite link (?invite=CODE) to access signup/login.
 * The invite code is persisted in localStorage so they don't lose it.
 */

import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Envelope, InstagramLogo } from '@phosphor-icons/react';
import logoGold from '@/assets/zaryah-logo-gold.png';

const INVITE_KEY = 'zaryah_invite_code';

/** Check if user has a valid invite (from URL or localStorage) */
// eslint-disable-next-line react-refresh/only-export-components -- small utility colocated with its sole consumer; not worth a separate module
export function hasInviteAccess(): boolean {
  try {
    return !!localStorage.getItem(INVITE_KEY);
  } catch {
    return false;
  }
}

/** Get the stored invite code */
// eslint-disable-next-line react-refresh/only-export-components -- small utility colocated with its sole consumer; not worth a separate module
export function getInviteCode(): string | null {
  try {
    return localStorage.getItem(INVITE_KEY);
  } catch {
    return null;
  }
}

interface InviteGateProps {
  children: React.ReactNode;
}

export function InviteGate({ children }: InviteGateProps) {
  const [searchParams] = useSearchParams();

  // Still capture invite/referral codes for tracking, but don't block access
  const urlCode = searchParams.get('invite') || searchParams.get('ref') || searchParams.get('referral');
  if (urlCode) {
    const cleaned = urlCode.trim().toUpperCase();
    if (cleaned) {
      try { localStorage.setItem(INVITE_KEY, cleaned); } catch { /* best-effort */ }
    }
  }

  // Open access — invite gate paused
  return <>{children}</>;
}

/** Beautiful invite-only landing page */
export function InviteWall() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d32] to-[#0a1628] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4A853]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full text-center"
      >
        {/* Logo */}
        <motion.img
          src={logoGold}
          alt="Zaryah Plus"
          className="w-24 h-24 mx-auto mb-6 object-contain drop-shadow-[0_10px_30px_rgba(212,168,83,0.3)]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        {/* Lock icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 0.3 }}
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/25 flex items-center justify-center"
        >
          <Lock size={28} weight="duotone" className="text-[#D4A853]" />
        </motion.div>

        {/* Heading */}
        <h1
          className="text-3xl sm:text-4xl font-bold text-[#F5E8C7] mb-3"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Invite Only
        </h1>

        <p className="text-[#7A7363] text-sm sm:text-base leading-relaxed mb-8">
          Zaryah Plus is currently in <span className="text-[#D4A853] font-semibold">private beta</span>.
          You need an invite link from an existing member to access the platform.
        </p>

        {/* What is Zaryah Plus */}
        <div className="bg-[#0A0E16]/60 border border-[#D4A853]/15 rounded-2xl p-5 mb-6 text-left">
          <h3 className="text-sm font-semibold text-[#D4A853] mb-3">What is Zaryah Plus?</h3>
          <ul className="space-y-2.5 text-xs text-[#7A7363]">
            <li className="flex items-start gap-2">
              <span className="text-[#D4A853] mt-0.5">&#9670;</span>
              <span>The World's First Islamic Super Agent — AI companion trained on Quran, Hadith & recognized scholars</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4A853] mt-0.5">&#9670;</span>
              <span>30+ integrated services — finance, prayer, Quran, community, matrimony & more</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4A853] mt-0.5">&#9670;</span>
              <span>Built for the Ummah — Shariah-compliant, privacy-first, ad-free</span>
            </li>
          </ul>
        </div>

        {/* How to get an invite */}
        <div className="bg-[#0F141F]/40 border border-white/5 rounded-2xl p-5 mb-8 text-left">
          <h3 className="text-sm font-semibold text-[#F5E8C7] mb-2">How to get an invite?</h3>
          <p className="text-xs text-[#7A7363] leading-relaxed">
            Ask someone who already has access to share their invite link with you.
            Every member gets a unique code they can share with friends and family.
          </p>
        </div>

        {/* Contact */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:support@zaryahplus.com"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium bg-[#D4A853]/10 border border-[#D4A853]/25 text-[#E8C97A] hover:bg-[#D4A853]/20 transition-colors"
          >
            <Envelope size={16} />
            Request Access
          </a>
          <a
            href="https://instagram.com/zaryahplus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-[#7A7363] hover:text-[#F5E8C7] hover:bg-white/10 transition-colors"
          >
            <InstagramLogo size={16} />
            Follow us
          </a>
        </div>

        <p className="mt-8 text-[10px] text-[#5C5749]">
          Already have an invite link? Make sure the URL includes your invite code.
        </p>
      </motion.div>
    </div>
  );
}
