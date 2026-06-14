/**
 * Real-time engagement listener for a single listing detail page.
 * Mirrors the Quran workspace sync pattern (onSnapshot + cleanup callback).
 */

import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import type { Listing } from '../types/souk.types';

export function subscribeToListing(
  id: string,
  onChange: (listing: Listing | null) => void,
): () => void {
  const ref = doc(db, 'souk_listings', id);
  const unsub = onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onChange(null);
        return;
      }
      onChange(snap.data() as Listing);
    },
    () => {
      // Permission / network failures: leave UI on last-known state.
    },
  );
  return unsub;
}
