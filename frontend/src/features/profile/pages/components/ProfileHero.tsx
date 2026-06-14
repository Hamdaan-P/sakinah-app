/**
 * Hero identity card + stats strip for ProfileSettingsPage.
 * Verbatim — no behavior changes.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera, ChartLineUp, ChatCircleDots, Crown, Info, Lightning, Question, ShieldCheck, Wallet,
} from '@phosphor-icons/react';
import { PremiumIslamicBackground } from '@/components/shared/PremiumIslamicBackground';
import { EmailVerificationPill } from '@/components/EmailVerificationPill';
import { RayaNickname } from '../../components/RayaWish';

interface ProfileHeroProps {
  userName: string;
  userEmail: string;
  userInitial: string;
  profileImage: string | null | undefined;
  memberSince: string;
  kycTier: number;
  balance: number;
  lifetimeEarned: number;
  profileCompletion: number;
  totalMessages: number;
}

export function ProfileHero({
  userName, userEmail, userInitial, profileImage, memberSince, kycTier,
  balance, lifetimeEarned, profileCompletion, totalMessages,
}: ProfileHeroProps) {
  const navigate = useNavigate();
  const kycLabel = kycTier >= 2 ? 'Verified' : kycTier === 1 ? 'Basic' : 'Unverified';
  const kycColor = kycTier >= 2 ? '#22C55E' : kycTier === 1 ? '#F59E0B' : '#7A7363';

  return (
    <>
      <div className="relative overflow-hidden">
        <PremiumIslamicBackground variant="hero" className="pt-6 pb-24 px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/help')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Question size={20} className="text-[#D4A853]/70" />
            </button>
            <button onClick={() => navigate('/about')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Info size={20} className="text-[#D4A853]/70" />
            </button>
          </div>

          {/* Avatar + Identity */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative mb-5"
            >
              <motion.div
                className="absolute -inset-2 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #D4A853, #E8C97A, #D4A85300, #D4A853)',
                  opacity: 0.4,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#D4A853] to-[#E8C97A] p-[3px] shadow-2xl shadow-[#D4A853]/30">
                <div className="w-full h-full rounded-full bg-[#0A0E16] border-[3px] border-[#0F1724] overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0F141F] to-[#0A0E16] flex items-center justify-center">
                      <span className="text-5xl font-bold text-[#D4A853]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {userInitial}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate('/deep-kyc')}
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center border-[3px] border-[#0A0E16] shadow-lg hover:scale-110 transition-transform"
                aria-label="Edit profile"
              >
                <Camera size={14} className="text-[#0A0E16]" />
              </button>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold text-[#F5E8C7] text-center"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {userName}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-[#7A7363] text-sm mt-1"
            >
              {userEmail}
              <EmailVerificationPill />
            </motion.p>

            {/* Raya's nickname — appears under name */}
            <RayaNickname userName={userName} />

            {/* Status badges */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-2 mt-4"
            >
              <div className="px-3 py-1.5 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/30 flex items-center gap-1.5">
                <Crown size={13} weight="fill" className="text-[#D4A853]" />
                <span className="text-[#D4A853] text-[10px] font-bold uppercase tracking-wider">Premium</span>
              </div>
              <div
                className="px-3 py-1.5 rounded-full border flex items-center gap-1.5"
                style={{ borderColor: `${kycColor}40`, background: `${kycColor}10` }}
              >
                <ShieldCheck size={13} weight="fill" style={{ color: kycColor }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: kycColor }}>
                  KYC {kycLabel}
                </span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[#5C5749] text-[10px] mt-3 uppercase tracking-widest"
            >
              Member since {memberSince}
            </motion.p>
          </div>
        </PremiumIslamicBackground>
      </div>

      {/* ── Stats Strip ── */}
      <div className="px-4 -mt-12 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-[#0F1724]/90 backdrop-blur-xl border border-[#D4A853]/20 shadow-xl"
        >
          <div className="text-center py-2">
            <Wallet size={16} className="text-[#D4A853] mx-auto mb-1" />
            <p className="text-[#F5E8C7] text-sm font-bold">{balance.toLocaleString()}</p>
            <p className="text-[#5C5749] text-[9px] uppercase tracking-wide">DNZ</p>
          </div>
          <div className="text-center py-2 border-l border-[rgba(212,168,83,0.15)]">
            <Lightning size={16} className="text-emerald-400 mx-auto mb-1" />
            <p className="text-[#F5E8C7] text-sm font-bold">{lifetimeEarned.toLocaleString()}</p>
            <p className="text-[#5C5749] text-[9px] uppercase tracking-wide">Earned</p>
          </div>
          <div className="text-center py-2 border-l border-[rgba(212,168,83,0.15)]">
            <ChartLineUp size={16} className="text-[#4FB892] mx-auto mb-1" />
            <p className="text-[#F5E8C7] text-sm font-bold">{profileCompletion}%</p>
            <p className="text-[#5C5749] text-[9px] uppercase tracking-wide">Profile</p>
          </div>
          <div className="text-center py-2 border-l border-[rgba(212,168,83,0.15)]">
            <ChatCircleDots size={16} className="text-[#A78BFA] mx-auto mb-1" />
            <p className="text-[#F5E8C7] text-sm font-bold">{totalMessages}</p>
            <p className="text-[#5C5749] text-[9px] uppercase tracking-wide">Messages</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
