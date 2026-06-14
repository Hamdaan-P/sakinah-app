/**
 * Profile Page — Premium Islamic identity card style
 * Unique design that stands out from generic profiles
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkle } from '@phosphor-icons/react';
import { useAuthStore } from '@/core/stores/auth.store';
import { authService } from '@/features/auth/services/authService';
import { useWalletStore } from '@/features/wallet/stores/wallet.store';
import { useKycStore } from '@/features/kyc/stores/kyc.store';
import { useChatbotStore } from '@/features/chatbot/stores/chatbot.store';
import { getStreakInfo } from '@/features/quran/services/quranStreakService';
import { doc, getDoc, setDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { LINKEDIN_REDIRECT_KEY } from '@/features/auth/pages/LinkedInCallbackPage';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://zaryahplus-production.up.railway.app';
import {
  getCompleteProfile,
  getProfileCompletionPercentage,
  getCompletionStatusMessage,
  getSocialLinksCount,
} from '../services/profileService';
import { ChangePasswordDialog, ChangeEmailDialog } from '../components/ProfileComponents';
import { InsightsReport } from '../components/InsightsReport';
import { MonthInReview } from '../components/MonthInReview';
import { ClosestMoment } from '../components/ClosestMoment';
import { RayaWish } from '../components/RayaWish';
import { ShareProfile } from '../components/ShareProfile';
import { PublicProfileSettings } from '@/features/public-profile/components/PublicProfileSettings';
import type { UserProfile } from '../types/profile.types';
import { ProfileHero } from './components/ProfileHero';
import { ProfileAchievementsRow } from './components/ProfileAchievementsRow';
import { ProfileDetailsSection } from './components/ProfileDetailsSection';
import { ProfileLinkedInCard } from './components/ProfileLinkedInCard';

export function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [linkedInBusy, setLinkedInBusy] = useState(false);
  const [linkedInError, setLinkedInError] = useState('');

  const { balance, lifetimeEarned, loginClaimedToday } = useWalletStore();
  const kycTier = useKycStore((s) => s.kycTier);
  const conversations = useChatbotStore((s) => s.conversations);
  const [referralsCount, setReferralsCount] = useState(0);

  const profileCompletion = getProfileCompletionPercentage(profile);
  const completionMessage = getCompletionStatusMessage(profileCompletion);
  const socialLinksCount = getSocialLinksCount(profile);

  // Conversation stats (used for achievements)
  const totalMessages = conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0);

  // Real Quran streak from localStorage
  const quranStreak = typeof window !== 'undefined' ? getStreakInfo().streakCount : 0;
  const quranLongestStreak = typeof window !== 'undefined' ? getStreakInfo().longestStreak : 0;

  // Login streak — only shows "1" if claimed today, since we don't track real history
  const loginStreakActive = loginClaimedToday;

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadProfile reads from the auth store; only re-run when the user changes
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.id));
        if (snap.exists()) {
          const data = snap.data();
          setReferralsCount((data.referrals_successful_count as number) || 0);
        }
      } catch { /* best-effort */ }
    })();
  }, [user?.id]);

  async function loadProfile() {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await getCompleteProfile(user.id);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/login');
    } finally {
      setIsSigningOut(false);
    }
  };

  // Social-login accounts (Google/Facebook) have an email but no password
  // credential — for them this is "Set Password", not "Change Password".
  const hasPassword = authService.hasPasswordProvider();

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    if (hasPassword) {
      await authService.updatePassword(currentPassword, newPassword);
    } else {
      await authService.setPassword(newPassword);
    }
  };

  const handleSendPasswordResetLink = async () => {
    if (!userEmail) throw new Error('No email on file for this account');
    await authService.resetPassword(userEmail);
  };

  const handleChangeEmail = async (currentPassword: string, newEmail: string) => {
    await authService.updateEmail(currentPassword, newEmail);
  };

  const handleConnectLinkedIn = async () => {
    setLinkedInError('');
    setLinkedInBusy(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/auth/linkedin/url`);
      if (!resp.ok) {
        setLinkedInError('LinkedIn sign-in is unavailable right now.');
        setLinkedInBusy(false);
        return;
      }
      const data = await resp.json();
      if (typeof data?.url !== 'string' || !data.url.startsWith('https://')) {
        setLinkedInError('LinkedIn sign-in is unavailable right now.');
        setLinkedInBusy(false);
        return;
      }
      sessionStorage.setItem(LINKEDIN_REDIRECT_KEY, '/profile');
      window.location.href = data.url;
    } catch {
      setLinkedInError('Could not connect to LinkedIn. Try again.');
      setLinkedInBusy(false);
    }
  };

  const handleDisconnectLinkedIn = async () => {
    if (!user?.id) return;
    if (!window.confirm('Disconnect LinkedIn from your ZaryahPlus account?')) return;
    setLinkedInError('');
    setLinkedInBusy(true);
    try {
      await setDoc(
        doc(db, 'users', user.id),
        {
          linkedin_id: deleteField(),
          linkedin_email: deleteField(),
          linkedin_email_verified: deleteField(),
          linkedin_picture: deleteField(),
          linkedin_connected_at: deleteField(),
          updated_at: serverTimestamp(),
        },
        { merge: true },
      );
      await loadProfile();
    } catch (err) {
      console.error('Disconnect LinkedIn error:', err);
      setLinkedInError('Could not disconnect. Try again.');
    } finally {
      setLinkedInBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    if (!window.confirm('All your data will be permanently deleted. Type "DELETE" to confirm.')) return;
    try {
      await authService.deleteAccount();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await authService.exportMyData();
      // Trigger a JSON download of everything we hold about the user.
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zaryah-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export your data. Please try again.');
    }
  };

  const userName = profile?.fullName || profile?.displayName || user?.displayName || 'User';
  const userEmail = profile?.email || user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();
  const profileImage = profile?.profileImageUrl || profile?.photoUrl || user?.photoURL;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Member';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E16]">
        <div className="w-8 h-8 border-2 border-[#D4A853]/30 border-t-[#D4A853] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F]">
      <ProfileHero
        userName={userName}
        userEmail={userEmail}
        userInitial={userInitial}
        profileImage={profileImage}
        memberSince={memberSince}
        kycTier={kycTier}
        balance={balance}
        lifetimeEarned={lifetimeEarned}
        profileCompletion={profileCompletion}
        totalMessages={totalMessages}
      />

      {/* ── Raya's One Wish ── (tops everything, emotional hook) */}
      <div className="px-4 mb-4">
        <RayaWish userName={userName} />
      </div>

      {/* ── Profile Completion Banner ── */}
      {profileCompletion < 100 && (
        <div className="px-4 mb-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/deep-kyc')}
            className="w-full p-4 rounded-xl border border-[#D4A853]/25 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(212,168,83,0.02))' }}
          >
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-12 h-12 -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(212,168,83,0.15)" strokeWidth="4" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#D4A853"
                  strokeWidth="4"
                  strokeDasharray={`${(profileCompletion / 100) * 125.6} 125.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#D4A853]">
                {profileCompletion}%
              </span>
            </div>
            <div className="text-left flex-1">
              <p className="text-[#F5E8C7] text-sm font-semibold">{completionMessage}</p>
              <p className="text-[#5C5749] text-xs mt-0.5">Complete your profile to unlock all features</p>
            </div>
            <Sparkle size={18} className="text-[#D4A853] shrink-0" />
          </motion.button>
        </div>
      )}

      {/* ── Month In Review (Spotify Wrapped style) ── */}
      <div className="px-4 mb-4">
        <MonthInReview />
      </div>

      {/* ── Insights Report: Letter, Radar, Psychology, etc. ── */}
      <div className="px-4 mb-4">
        <InsightsReport />
      </div>

      {/* ── Closest to Raya Moment ── */}
      <div className="px-4 mb-4">
        <ClosestMoment />
      </div>

      <ProfileAchievementsRow
        quranStreak={quranStreak}
        quranLongestStreak={quranLongestStreak}
        loginStreakActive={loginStreakActive}
        totalMessages={totalMessages}
        profileCompletion={profileCompletion}
        lifetimeEarned={lifetimeEarned}
        referralsCount={referralsCount}
        kycTier={kycTier}
        conversations={conversations}
        loginClaimedToday={loginClaimedToday}
      />

      <ProfileDetailsSection profile={profile} />

      {/* ── Public Profile (handle + visibility) ── */}
      {user?.id && (
        <div className="px-4 mb-4">
          <PublicProfileSettings userId={user.id} />
        </div>
      )}

      {/* ── Share Profile (public URL + QR) ── */}
      {user?.id && (
        <div className="px-4 mb-4">
          <ShareProfile
            userId={user.id}
            userName={userName}
          />
        </div>
      )}

      <ProfileLinkedInCard
        profile={profile}
        socialLinksCount={socialLinksCount}
        isSigningOut={isSigningOut}
        linkedInBusy={linkedInBusy}
        linkedInError={linkedInError}
        onConnectLinkedIn={handleConnectLinkedIn}
        onDisconnectLinkedIn={handleDisconnectLinkedIn}
        onShowEmail={() => setShowEmailDialog(true)}
        onShowPassword={() => setShowPasswordDialog(true)}
        onSignOut={handleSignOut}
        onDeleteAccount={handleDeleteAccount}
        onExportData={handleExportData}
      />

      <ChangePasswordDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onSubmit={handleChangePassword}
        hasPassword={hasPassword}
        onSendResetLink={handleSendPasswordResetLink}
      />

      <ChangeEmailDialog
        isOpen={showEmailDialog}
        currentEmail={userEmail}
        onClose={() => setShowEmailDialog(false)}
        onSubmit={handleChangeEmail}
      />
    </div>
  );
}

export default ProfileSettingsPage;
