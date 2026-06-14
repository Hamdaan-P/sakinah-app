/**
 * LinkedIn OAuth Callback Page
 * Receives the auth code from LinkedIn, exchanges it for profile data,
 * persists the LinkedIn connection on the user doc, then redirects to
 * the page the user came from (Quick KYC by default, or wherever
 * `linkedin_redirect_to` points).
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SpinnerGap, CheckCircle, XCircle } from '@phosphor-icons/react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { useAuthStore } from '@/core/stores/auth.store';
import { syncPublicProfile } from '@/features/public-profile/services/publicProfileService';
import logoGold from '@/assets/zaryah-logo-gold.png';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://zaryahplus-production.up.railway.app';
export const LINKEDIN_PROFILE_KEY = 'zaryah_linkedin_profile';
export const LINKEDIN_REDIRECT_KEY = 'zaryah_linkedin_redirect_to';

type Status = 'loading' | 'success' | 'error';

interface LinkedInProfile {
  id?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  locale?: string;
}

export default function LinkedInCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Connecting to LinkedIn...');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    const redirectTo = sessionStorage.getItem(LINKEDIN_REDIRECT_KEY) || '/quick-kyc';

    if (error || !code || !state) {
      setStatus('error');
      setMessage('LinkedIn authorization was cancelled or failed.');
      sessionStorage.removeItem(LINKEDIN_REDIRECT_KEY);
      setTimeout(() => navigate(redirectTo), 2500);
      return;
    }

    const fetchProfile = async () => {
      try {
        setMessage('Fetching your LinkedIn profile...');
        const resp = await fetch(`${BACKEND_URL}/auth/linkedin/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        });

        if (!resp.ok) throw new Error('Profile fetch failed');

        const profile: LinkedInProfile = await resp.json();
        sessionStorage.setItem(LINKEDIN_PROFILE_KEY, JSON.stringify(profile));

        // Persist the LinkedIn connection on the user doc so it survives
        // beyond this session (the prefill via sessionStorage is just for
        // populating the form on the next page).
        if (user?.id && profile.id) {
          setMessage('Linking your LinkedIn account...');
          const docRef = doc(db, 'users', user.id);
          const existing = await getDoc(docRef);
          const current = existing.exists() ? existing.data() : {};

          const update: Record<string, unknown> = {
            linkedin_id: profile.id,
            linkedin_email: profile.email || '',
            linkedin_email_verified: !!profile.email_verified,
            linkedin_picture: profile.picture || '',
            linkedin_connected_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          };

          // Use the LinkedIn picture as the avatar if the user doesn't
          // already have one set (don't clobber a custom upload).
          if (profile.picture && !current.photo_url && !current.profile_image_url) {
            update.photo_url = profile.picture;
          }

          // Pre-fill name in Firestore if it's still blank.
          if (profile.name && !current.full_name) {
            update.full_name = profile.name;
            update.name = profile.name;
          }

          await setDoc(docRef, update, { merge: true });

          // Mirror to public_profiles so the avatar/name show up to others.
          try {
            const merged = { ...current, ...update };
            await syncPublicProfile(user.id, merged as Record<string, unknown>);
          } catch (mirrorErr) {
            // Non-blocking — public mirror is best-effort.
            console.warn('LinkedInCallback: public profile mirror failed:', mirrorErr);
          }
        }

        setStatus('success');
        setMessage(`Welcome, ${profile.given_name || profile.name || 'there'}!`);
        sessionStorage.removeItem(LINKEDIN_REDIRECT_KEY);
        setTimeout(() => navigate(redirectTo), 1200);
      } catch {
        setStatus('error');
        setMessage('Could not connect LinkedIn. Please try again.');
        sessionStorage.removeItem(LINKEDIN_REDIRECT_KEY);
        setTimeout(() => navigate(redirectTo), 2500);
      }
    };

    fetchProfile();
  }, [searchParams, navigate, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0A0E16] flex items-center justify-center p-6">
      <div className="text-center max-w-sm w-full">
        <img src={logoGold} alt="Zaryah Plus" className="w-16 h-16 mx-auto mb-6 object-contain" />

        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          {status === 'loading' && (
            <SpinnerGap size={48} className="text-[#D4A853] animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle size={48} weight="duotone" className="text-emerald-400" />
          )}
          {status === 'error' && (
            <XCircle size={48} weight="duotone" className="text-red-400" />
          )}
        </div>

        <p className="text-[#F5E8C7] font-medium">{message}</p>
        <p className="text-[#5C5749] text-xs mt-2">Redirecting you back...</p>
      </div>
    </div>
  );
}
