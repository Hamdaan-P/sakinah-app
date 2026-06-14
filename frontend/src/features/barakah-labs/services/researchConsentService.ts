/**
 * Research consent flag on the user document.
 *
 * Stored at: users/{uid}.researchConsent = boolean
 * Owner-writable per Firestore rules (the field is not in the protected
 * denylist on /users/{userId}).
 */

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';

export async function getResearchConsent(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return false;
  return !!(snap.data() as { researchConsent?: boolean }).researchConsent;
}

export async function setResearchConsent(uid: string, value: boolean): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    {
      researchConsent: value,
      researchConsentUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
