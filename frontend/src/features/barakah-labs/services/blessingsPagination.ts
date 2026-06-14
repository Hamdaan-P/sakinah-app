/**
 * Direct-Firestore pagination for the user's blessings collection.
 *
 * The existing backend ``GET /barka-labs/blessings/{uid}`` is fine for
 * the first 50, but doesn't expose a cursor and doesn't return a total.
 * For Trail's "See all 47 →" UX we need both — cheaper to read directly
 * from Firestore client-side with proper paging + an aggregation count.
 *
 * Collection: ``users/{uid}/niyaamat`` (Barka Labs's storage path —
 * named for the original "Niyaamat Meter" concept; see backend
 * repositories/barka_labs_repository.py).
 */

import {
  collection,
  getCountFromServer,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  startAfter,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import type { Blessing } from '@/features/barka-labs/types/barka-labs.types';

const PAGE_SIZE = 20;

function blessingsCol(uid: string) {
  return collection(db, 'users', uid, 'niyaamat');
}

function toBlessing(snap: QueryDocumentSnapshot): Blessing {
  const data = snap.data() as Record<string, unknown>;
  const created = data.created_at as { toDate?: () => Date } | string | undefined;
  let iso = '';
  if (typeof created === 'string') iso = created;
  else if (created && typeof created.toDate === 'function') iso = created.toDate().toISOString();
  return {
    id: snap.id,
    text: (data.text as string) ?? '',
    depth: (data.depth as Blessing['depth']) ?? 'common',
    score: (data.score as number) ?? 1,
    ai_reasoning: (data.ai_reasoning as string) ?? '',
    created_at: iso,
    dnz_earned: (data.dnz_earned as number) ?? 0,
    decomposition: (data.decomposition as Blessing['decomposition']) ?? null,
    actions: (data.actions as Blessing['actions']) ?? null,
    reflection: (data.reflection as Blessing['reflection']) ?? null,
  };
}

/**
 * One billable aggregation read regardless of how many docs the user has.
 * Cheap enough to call on every Trail mount.
 */
export async function fetchBlessingTotal(uid: string): Promise<number> {
  try {
    const snap = await getCountFromServer(query(blessingsCol(uid)));
    return snap.data().count;
  } catch {
    return 0;
  }
}

export type BlessingsPage = {
  blessings: Blessing[];
  cursor: DocumentSnapshot | null;
  hasMore: boolean;
};

/**
 * Fetch the first N blessings (newest first). Pass back ``cursor`` from
 * the result to ``fetchBlessingsNextPage`` for the next chunk.
 */
export async function fetchBlessingsFirstPage(uid: string, pageSize = PAGE_SIZE): Promise<BlessingsPage> {
  const q = query(
    blessingsCol(uid),
    orderBy('created_at', 'desc'),
    fsLimit(pageSize),
  );
  const snap = await getDocs(q);
  const blessings = snap.docs.map(toBlessing);
  const last = snap.docs[snap.docs.length - 1] ?? null;
  return {
    blessings,
    cursor: last,
    hasMore: snap.size === pageSize,
  };
}

export async function fetchBlessingsNextPage(
  uid: string,
  cursor: DocumentSnapshot,
  pageSize = PAGE_SIZE,
): Promise<BlessingsPage> {
  const q = query(
    blessingsCol(uid),
    orderBy('created_at', 'desc'),
    startAfter(cursor),
    fsLimit(pageSize),
  );
  const snap = await getDocs(q);
  const blessings = snap.docs.map(toBlessing);
  const last = snap.docs[snap.docs.length - 1] ?? cursor;
  return {
    blessings,
    cursor: last,
    hasMore: snap.size === pageSize,
  };
}

export { PAGE_SIZE };
