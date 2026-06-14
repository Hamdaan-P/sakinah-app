/**
 * Onboarding persistence — first Shukr + completion timestamp.
 *
 * Writes to:
 *   users/{uid}/onboarding/aebcd
 *     { firstShukr, firstShukrAt, completedAt, updatedAt }
 *
 * Kept under a dedicated `onboarding` subcollection rather than merged into
 * the top-level user doc so the existing user-profile shape (kyc, public
 * profile fields, etc.) stays untouched. The localStorage store is the
 * source of truth for the immediate UI; these writes are best-effort.
 */

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, isFirebaseStubbed } from '@/config/firebase.config';

function onboardingRef(uid: string) {
  return doc(db, 'users', uid, 'onboarding', 'aebcd');
}

export async function saveFirstShukr(uid: string, text: string): Promise<void> {
  if (isFirebaseStubbed) return;
  await setDoc(
    onboardingRef(uid),
    {
      firstShukr: text,
      firstShukrAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function markOnboardingComplete(uid: string): Promise<void> {
  if (isFirebaseStubbed) return;
  await setDoc(
    onboardingRef(uid),
    {
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
