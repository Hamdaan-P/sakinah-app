/**
 * Connection graph service.
 * All reads/writes go through Firestore security rules, so the client can
 * never forge a connection on another user's behalf.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/config/firebase.config';
import { pairKey, type ConnectionDoc, type ConnectionView } from '../types/connection.types';

const COL = 'connections';

function toMillis(v: unknown): number {
  if (!v) return 0;
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === 'number') return v;
  if (v instanceof Date) return v.getTime();
  return 0;
}

function normalize(raw: Record<string, unknown>): ConnectionDoc {
  return {
    userA: raw.userA as string,
    userB: raw.userB as string,
    requestedBy: raw.requestedBy as string,
    status: raw.status as ConnectionDoc['status'],
    createdAt: toMillis(raw.createdAt),
    respondedAt: raw.respondedAt ? toMillis(raw.respondedAt) : null,
  };
}

/** Translate a raw doc into a viewer-centric state. */
export function toView(me: string, other: string, raw: ConnectionDoc | null): ConnectionView {
  if (me === other) return { kind: 'self' };
  if (!raw) return { kind: 'none' };
  if (raw.status === 'removed' || raw.status === 'declined') {
    // Previously connected/requested but now cleared — show as 'none' so they can re-request.
    return raw.status === 'declined' && raw.requestedBy === me
      ? { kind: 'declined', otherUid: other }
      : { kind: 'none' };
  }
  if (raw.status === 'accepted') {
    return { kind: 'connected', otherUid: other, since: raw.respondedAt ?? raw.createdAt };
  }
  // pending
  if (raw.requestedBy === me) {
    return { kind: 'request-sent', otherUid: other, createdAt: raw.createdAt };
  }
  return { kind: 'request-received', otherUid: other, createdAt: raw.createdAt };
}

export async function getConnection(me: string, other: string): Promise<ConnectionDoc | null> {
  if (me === other) return null;
  const snap = await getDoc(doc(db, COL, pairKey(me, other)));
  return snap.exists() ? normalize(snap.data() as Record<string, unknown>) : null;
}

export function subscribeToConnection(
  me: string,
  other: string,
  cb: (doc: ConnectionDoc | null) => void,
): Unsubscribe {
  if (me === other) {
    cb(null);
    return () => {};
  }
  return onSnapshot(doc(db, COL, pairKey(me, other)), (snap) => {
    cb(snap.exists() ? normalize(snap.data() as Record<string, unknown>) : null);
  });
}

/** Create a pending connection request. Safe to call multiple times if doc doesn't exist. */
export async function sendRequest(me: string, target: string): Promise<void> {
  if (me === target) throw new Error("You can't send a request to yourself.");
  const key = pairKey(me, target);
  const ref = doc(db, COL, key);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    const data = normalize(existing.data() as Record<string, unknown>);
    if (data.status === 'pending' || data.status === 'accepted') {
      throw new Error('A request already exists between you two.');
    }
    // If it was previously declined/removed, we can overwrite with a new pending
    // request only if the rules allow it. Current rules only allow CREATE, not
    // re-open from declined/removed. So: throw a gentle error and let the UI
    // guide the user.
    throw new Error("You can't send another request right now.");
  }
  const [userA, userB] = me < target ? [me, target] : [target, me];
  await setDoc(ref, {
    userA,
    userB,
    requestedBy: me,
    status: 'pending',
    createdAt: serverTimestamp(),
    respondedAt: null,
  });
}

export async function acceptRequest(me: string, other: string): Promise<void> {
  await updateDoc(doc(db, COL, pairKey(me, other)), {
    status: 'accepted',
    respondedAt: serverTimestamp(),
  });
}

export async function declineRequest(me: string, other: string): Promise<void> {
  await updateDoc(doc(db, COL, pairKey(me, other)), {
    status: 'declined',
    respondedAt: serverTimestamp(),
  });
}

/** Removes an accepted connection, or cancels your own pending request. */
export async function removeConnection(me: string, other: string): Promise<void> {
  await updateDoc(doc(db, COL, pairKey(me, other)), {
    status: 'removed',
    respondedAt: serverTimestamp(),
  });
}

/**
 * List all accepted connections for a user. Firestore lacks true OR, so we
 * run two queries in parallel (userA == me OR userB == me) and merge.
 */
export async function listConnections(me: string): Promise<ConnectionDoc[]> {
  return listByStatus(me, 'accepted');
}

export async function listRequestsReceived(me: string): Promise<ConnectionDoc[]> {
  const all = await listByStatus(me, 'pending');
  return all.filter((c) => c.requestedBy !== me);
}

export async function listRequestsSent(me: string): Promise<ConnectionDoc[]> {
  const all = await listByStatus(me, 'pending');
  return all.filter((c) => c.requestedBy === me);
}

async function listByStatus(me: string, status: ConnectionDoc['status']): Promise<ConnectionDoc[]> {
  const qA = query(collection(db, COL), where('userA', '==', me), where('status', '==', status));
  const qB = query(collection(db, COL), where('userB', '==', me), where('status', '==', status));
  const [a, b] = await Promise.all([getDocs(qA), getDocs(qB)]);
  const out: ConnectionDoc[] = [];
  a.forEach((d) => out.push(normalize(d.data() as Record<string, unknown>)));
  b.forEach((d) => out.push(normalize(d.data() as Record<string, unknown>)));
  return out;
}

/**
 * All edges touching `me`, regardless of status. Used by Discover to build the
 * "don't suggest these" set (accepted, pending, declined, removed all count).
 */
export async function listByStatusAny(me: string): Promise<ConnectionDoc[]> {
  const qA = query(collection(db, COL), where('userA', '==', me));
  const qB = query(collection(db, COL), where('userB', '==', me));
  const [a, b] = await Promise.all([getDocs(qA), getDocs(qB)]);
  const out: ConnectionDoc[] = [];
  a.forEach((d) => out.push(normalize(d.data() as Record<string, unknown>)));
  b.forEach((d) => out.push(normalize(d.data() as Record<string, unknown>)));
  return out;
}

/** Convenience: given a connection doc and `me`, return the OTHER user's uid. */
export function otherUid(me: string, c: ConnectionDoc): string {
  return c.userA === me ? c.userB : c.userA;
}

/**
 * Ask the backend for uids both `me` and `otherUid` are connected to.
 * Backed by a Cloud Function using admin SDK (rules don't allow reading
 * someone else's connection list, so we need the server).
 */
export async function getMutualConnections(
  otherUserUid: string,
): Promise<{ mutuals: string[]; count: number }> {
  const fn = httpsCallable<{ otherUid: string }, { mutuals: string[]; count: number }>(
    functions,
    'getMutualConnections',
  );
  const res = await fn({ otherUid: otherUserUid });
  return res.data;
}
