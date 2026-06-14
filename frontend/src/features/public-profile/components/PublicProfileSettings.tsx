/**
 * PublicProfileSettings — mounted inside ProfileSettingsPage.
 * Lets the user toggle public visibility and edit their @handle (slug).
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { Globe, Lock } from '@phosphor-icons/react';
import {
  setProfileVisibility,
  syncPublicProfile,
} from '../services/publicProfileService';
import type { PublicProfile } from '../types/public-profile.types';
import { BasicInfoEditor } from './BasicInfoEditor';
import { HandleEditor } from './HandleEditor';

interface Props {
  userId: string;
}

export function PublicProfileSettings({ userId }: Props) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Ensure the user has a public_profiles doc + slug.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (!userSnap.exists()) {
          if (!cancelled) setLoading(false);
          return;
        }
        const pp = await syncPublicProfile(userId, userSnap.data() as Record<string, unknown>, {
          ensureSlug: true,
        });
        if (!cancelled) {
          setProfile(pp);
        }
      } catch (err) {
        console.error('PublicProfileSettings: failed to sync profile', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleToggleVisibility() {
    if (!profile) return;
    const next = !profile.isPublic;
    setProfile({ ...profile, isPublic: next });
    try {
      await setProfileVisibility(userId, next);
    } catch (err) {
      console.error('Failed to toggle visibility', err);
      setProfile({ ...profile, isPublic: !next }); // revert
    }
  }

  if (loading) {
    return (
      <div className="px-4">
        <div className="rounded-2xl p-5 bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)]">
          <div className="h-5 w-32 bg-[#0F141F] rounded animate-pulse mb-3" />
          <div className="h-4 w-full bg-[#0F141F] rounded animate-pulse" />
        </div>
      </div>
    );
  }
  if (!profile) return null;

  const publicUrl = `${window.location.origin}/@${profile.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)] overflow-hidden"
    >
      <div className="px-5 py-3 border-b border-[rgba(212,168,83,0.1)] flex items-center justify-between">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#D4A853]/60">Public Profile</p>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold"
          style={{
            backgroundColor: profile.isPublic ? 'rgba(42,157,111,0.15)' : 'rgba(127,138,154,0.15)',
            color: profile.isPublic ? '#2A9D6F' : '#7A7363',
          }}
        >
          {profile.isPublic ? <Globe size={10} /> : <Lock size={10} />}
          {profile.isPublic ? 'Public' : 'Private'}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Visibility toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[#F5E8C7] text-sm font-semibold">Show my profile publicly</p>
            <p className="text-[#5C5749] text-xs mt-0.5">
              When on, anyone with your link can see your name, archetype and basic info.
            </p>
          </div>
          <button
            onClick={handleToggleVisibility}
            role="switch"
            aria-checked={profile.isPublic}
            className="w-11 h-6 rounded-full px-0.5 flex items-center flex-shrink-0 transition-colors"
            style={{
              background: profile.isPublic ? 'linear-gradient(90deg, #D4A853, #E8C97A)' : 'rgba(127,138,154,0.25)',
            }}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${profile.isPublic ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {/* Handle editor */}
        <HandleEditor
          userId={userId}
          profile={profile}
          onSlugChange={(slug) => setProfile({ ...profile, slug })}
        />

        {/* Basic info fields (name, gender, bio, profession, location) */}
        <BasicInfoEditor userId={userId} />

        {/* Preview link — opens in new tab */}
        {profile.isPublic && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-[11px] text-[#D4A853] hover:text-[#E8C97A] underline underline-offset-2"
          >
            Preview my public profile →
          </a>
        )}
      </div>
    </motion.div>
  );
}
