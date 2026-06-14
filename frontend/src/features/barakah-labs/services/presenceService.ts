/**
 * Barakah Labs presence — "X are noticing right now"
 *
 * Each user writes a heartbeat doc at ``barakah_presence/{uid}`` with a
 * server timestamp every 60s while they're on a Barakah screen. The
 * active-count fetch counts docs whose ``lastSeen`` is newer than
 * `now - 15 minutes` using ``getCountFromServer`` (single billable read).
 *
 * Privacy: the doc holds nothing identifying — just the user's uid as
 * the doc id and a server timestamp. No display name, no activity
 * content. Rules deny everyone else reading individual docs; the count
 * query is server-side aggregation so the client only ever sees the
 * total number.
 */

import {
  collection,
  doc,
  getCountFromServer,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';

const PRESENCE_COLLECTION = 'barakah_presence';
const ACTIVE_WINDOW_MS = 15 * 60_000; // 15 minutes
const HEARTBEAT_INTERVAL_MS = 60_000; // 60 seconds

function presenceDoc(uid: string) {
  return doc(db, PRESENCE_COLLECTION, uid);
}

/** Write a heartbeat. Caller (the React hook) decides cadence. */
export async function writeHeartbeat(uid: string): Promise<void> {
  await setDoc(
    presenceDoc(uid),
    { lastSeen: serverTimestamp() },
    { merge: true },
  );
}

/**
 * Count of users active in the last `ACTIVE_WINDOW_MS`. Uses
 * `getCountFromServer` which is a single aggregate read regardless of
 * collection size — safe to call every minute even at scale.
 *
 * Always returns at least 1 (the caller themselves) so the home screen
 * never shows "0 are noticing right now."
 */
export async function fetchActiveCount(): Promise<number> {
  try {
    const cutoff = Timestamp.fromMillis(Date.now() - ACTIVE_WINDOW_MS);
    const q = query(
      collection(db, PRESENCE_COLLECTION),
      where('lastSeen', '>=', cutoff),
    );
    const snap = await getCountFromServer(q);
    return Math.max(1, snap.data().count);
  } catch {
    return 1;
  }
}

export { HEARTBEAT_INTERVAL_MS, ACTIVE_WINDOW_MS };
