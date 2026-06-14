/**
 * LinkedIn connection card + connected social-account row + account-actions
 * footer for ProfileSettingsPage. Verbatim — no behavior changes.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, DownloadSimple, Globe, InstagramLogo, Key, LinkedinLogo, SignOut, Trash, User, XLogo,
} from '@phosphor-icons/react';
import type { UserProfile } from '../../types/profile.types';

interface Props {
  profile: UserProfile | null;
  socialLinksCount: number;
  isSigningOut: boolean;
  linkedInBusy: boolean;
  linkedInError: string;
  onConnectLinkedIn: () => void;
  onDisconnectLinkedIn: () => void;
  onShowEmail: () => void;
  onShowPassword: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onExportData: () => void;
}

export function ProfileLinkedInCard({
  profile, socialLinksCount, isSigningOut, linkedInBusy, linkedInError,
  onConnectLinkedIn, onDisconnectLinkedIn, onShowEmail, onShowPassword,
  onSignOut, onDeleteAccount, onExportData,
}: Props) {
  const navigate = useNavigate();

  return (
    <>
      {/* ── LinkedIn Connection ── */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)] p-4"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#D4A853]/60 mb-3">LinkedIn</p>
          {profile?.linkedinId ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A66C2]/15 border border-[#0A66C2]/30 flex items-center justify-center shrink-0">
                <LinkedinLogo size={20} weight="fill" className="text-[#0A66C2]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F5E8C7] text-sm font-semibold flex items-center gap-1.5">
                  Connected
                  <CheckCircle size={14} weight="fill" className="text-emerald-400" />
                </p>
                <p className="text-[#5C5749] text-xs truncate">
                  {profile.linkedinEmail || 'LinkedIn account linked'}
                </p>
              </div>
              <button
                onClick={onDisconnectLinkedIn}
                disabled={linkedInBusy}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors disabled:opacity-50"
              >
                {linkedInBusy ? '...' : 'Disconnect'}
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectLinkedIn}
              disabled={linkedInBusy}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[#0A66C2]/15 border border-[#0A66C2]/30 text-[#5B9FD4] text-sm font-medium hover:bg-[#0A66C2]/25 transition-colors disabled:opacity-50"
            >
              <LinkedinLogo size={20} weight="fill" />
              {linkedInBusy ? 'Connecting...' : 'Connect LinkedIn'}
            </button>
          )}
          {linkedInError && (
            <p className="text-red-400 text-xs mt-2">{linkedInError}</p>
          )}
        </motion.div>
      </div>

      {/* ── Social Links ── */}
      {socialLinksCount > 0 && (
        <div className="px-4 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)] p-4"
          >
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#D4A853]/60 mb-3">Connected Accounts</p>
            <div className="flex gap-3">
              {profile?.instagramUrl && (
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <InstagramLogo size={20} className="text-pink-400" />
                </a>
              )}
              {profile?.twitterUrl && (
                <a
                  href={profile.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <XLogo size={20} className="text-[#1DA1F2]" />
                </a>
              )}
              {profile?.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#0A66C2]/10 border border-[#0A66C2]/30 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <LinkedinLogo size={20} className="text-[#0A66C2]" />
                </a>
              )}
              {profile?.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/30 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Globe size={20} className="text-[#D4A853]" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Account Actions ── */}
      <div className="px-4 pb-24">
        <div className="rounded-2xl bg-[#0F1724]/60 border border-[rgba(212,168,83,0.1)] overflow-hidden">
          <button
            onClick={() => navigate('/deep-kyc')}
            className="w-full py-3 px-4 flex items-center gap-3 border-b border-[rgba(212,168,83,0.08)] hover:bg-white/5 transition-colors"
          >
            <User size={18} className="text-[#D4A853]" />
            <span className="text-[#F5E8C7] text-sm">Edit Profile</span>
          </button>
          <button
            onClick={onShowEmail}
            className="w-full py-3 px-4 flex items-center gap-3 border-b border-[rgba(212,168,83,0.08)] hover:bg-white/5 transition-colors"
          >
            <Key size={18} className="text-[#D4A853]" />
            <span className="text-[#F5E8C7] text-sm">Change Email</span>
          </button>
          <button
            onClick={onShowPassword}
            className="w-full py-3 px-4 flex items-center gap-3 border-b border-[rgba(212,168,83,0.08)] hover:bg-white/5 transition-colors"
          >
            <Key size={18} className="text-[#D4A853]" />
            <span className="text-[#F5E8C7] text-sm">Change Password</span>
          </button>
          <button
            onClick={onSignOut}
            disabled={isSigningOut}
            className="w-full py-3 px-4 flex items-center gap-3 border-b border-[rgba(212,168,83,0.08)] hover:bg-white/5 transition-colors"
          >
            <SignOut size={18} className="text-[#D4A853]" />
            <span className="text-[#F5E8C7] text-sm">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
          <button
            onClick={onExportData}
            className="w-full py-3 px-4 flex items-center gap-3 border-b border-[rgba(212,168,83,0.08)] hover:bg-white/5 transition-colors"
          >
            <DownloadSimple size={18} className="text-[#D4A853]" />
            <span className="text-[#F5E8C7] text-sm">Export My Data</span>
          </button>
          <button
            onClick={onDeleteAccount}
            className="w-full py-3 px-4 flex items-center gap-3 hover:bg-red-500/10 transition-colors"
          >
            <Trash size={18} className="text-red-400" />
            <span className="text-red-400 text-sm">Delete Account</span>
          </button>
        </div>
      </div>
    </>
  );
}
