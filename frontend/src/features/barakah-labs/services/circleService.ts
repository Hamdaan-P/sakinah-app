/**
 * Circles — private groups inside Barakah Labs.
 *
 * Schema (Firestore):
 *
 *   circles/{circleId}
 *     - name: string
 *     - createdBy: uid
 *     - createdAt: Timestamp
 *     - memberCount: int                     (denormalized)
 *     - lastActivityAt: Timestamp
 *     - sharedSeed?: { context, prompt, weekId, offeredBy }
 *
 *   circles/{circleId}/members/{uid}
 *     - role: 'owner' | 'member'
 *     - joinedAt: Timestamp
 *     - displayName: string                  (snapshot for fast feed render)
 *
 *   circles/{circleId}/posts/{postId}
 *     - authorUid, authorName, text, createdAt, replyCount
 *
 *   circles/{circleId}/posts/{postId}/replies/{replyId}
 *     - authorUid, authorName, text, createdAt
 *
 *   users/{uid}/circle_memberships/{circleId}
 *     - circleId, joinedAt, circleName, role            (fast my-circles list)
 *
 * Access — Firestore rules enforce member-only read/write on circle
 * contents (see firestore.rules). The membership doc under /users acts
 * as the authoritative member-check.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';

// ── Types ─────────────────────────────────────────────────────────────────

export type CircleRole = 'owner' | 'member';

export type Circle = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
  memberCount: number;
  lastActivityAt: number;
  sharedSeed?: {
    context: string;
    prompt: string;
    weekId: string;
    offeredBy: string;
  };
};

export type CircleMembership = {
  circleId: string;
  circleName: string;
  joinedAt: number;
  role: CircleRole;
};

export type CircleMember = {
  uid: string;
  displayName: string;
  role: CircleRole;
  joinedAt: number;
};

export type CirclePost = {
  id: string;
  authorUid: string;
  authorName: string;
  text: string;
  createdAt: number;
  replyCount: number;
};

export type CircleReply = {
  id: string;
  authorUid: string;
  authorName: string;
  text: string;
  createdAt: number;
};

// ── Refs ──────────────────────────────────────────────────────────────────

function circleDoc(circleId: string) {
  return doc(db, 'circles', circleId);
}
function membersCol(circleId: string) {
  return collection(db, 'circles', circleId, 'members');
}
function memberDoc(circleId: string, uid: string) {
  return doc(db, 'circles', circleId, 'members', uid);
}
function postsCol(circleId: string) {
  return collection(db, 'circles', circleId, 'posts');
}
function postDoc(circleId: string, postId: string) {
  return doc(db, 'circles', circleId, 'posts', postId);
}
function repliesCol(circleId: string, postId: string) {
  return collection(db, 'circles', circleId, 'posts', postId, 'replies');
}
function membershipDoc(uid: string, circleId: string) {
  return doc(db, 'users', uid, 'circle_memberships', circleId);
}
function membershipsCol(uid: string) {
  return collection(db, 'users', uid, 'circle_memberships');
}

// ── Helpers ───────────────────────────────────────────────────────────────

function toMillis(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === 'number') return v;
  return 0;
}

function circleFromDoc(id: string, raw: Record<string, unknown>): Circle {
  return {
    id,
    name: (raw.name as string) ?? '(untitled circle)',
    createdBy: (raw.createdBy as string) ?? '',
    createdAt: toMillis(raw.createdAt),
    memberCount: (raw.memberCount as number) ?? 0,
    lastActivityAt: toMillis(raw.lastActivityAt),
    sharedSeed: (raw.sharedSeed as Circle['sharedSeed']) ?? undefined,
  };
}

function memberFromDoc(uid: string, raw: Record<string, unknown>): CircleMember {
  return {
    uid,
    displayName: (raw.displayName as string) ?? '',
    role: (raw.role as CircleRole) ?? 'member',
    joinedAt: toMillis(raw.joinedAt),
  };
}

function postFromDoc(id: string, raw: Record<string, unknown>): CirclePost {
  return {
    id,
    authorUid: (raw.authorUid as string) ?? '',
    authorName: (raw.authorName as string) ?? '',
    text: (raw.text as string) ?? '',
    createdAt: toMillis(raw.createdAt),
    replyCount: (raw.replyCount as number) ?? 0,
  };
}

function replyFromDoc(id: string, raw: Record<string, unknown>): CircleReply {
  return {
    id,
    authorUid: (raw.authorUid as string) ?? '',
    authorName: (raw.authorName as string) ?? '',
    text: (raw.text as string) ?? '',
    createdAt: toMillis(raw.createdAt),
  };
}

function membershipFromDoc(circleId: string, raw: Record<string, unknown>): CircleMembership {
  return {
    circleId,
    circleName: (raw.circleName as string) ?? '(untitled)',
    role: (raw.role as CircleRole) ?? 'member',
    joinedAt: toMillis(raw.joinedAt),
  };
}

// ── Circle creation + membership ─────────────────────────────────────────

/**
 * Create a new circle. Owner auto-joins as the first member.
 * Optional initialMembers — uids to add at creation (still requires the
 * Firestore-rule allow, so for now we add only the owner; broader invites
 * happen client-side via joinCircle and a share link / direct add).
 */
export async function createCircle(
  ownerUid: string,
  ownerDisplayName: string,
  name: string,
): Promise<string> {
  // Top-level circle doc.
  const circleRef = doc(collection(db, 'circles'));
  const batch = writeBatch(db);
  batch.set(circleRef, {
    name: name.trim().slice(0, 80),
    createdBy: ownerUid,
    createdAt: serverTimestamp(),
    memberCount: 1,
    lastActivityAt: serverTimestamp(),
  });

  // Owner member doc.
  batch.set(memberDoc(circleRef.id, ownerUid), {
    role: 'owner',
    joinedAt: serverTimestamp(),
    displayName: ownerDisplayName,
  });

  // Membership mirror under /users for fast my-circles lookup.
  batch.set(membershipDoc(ownerUid, circleRef.id), {
    circleId: circleRef.id,
    circleName: name.trim().slice(0, 80),
    role: 'owner',
    joinedAt: serverTimestamp(),
  });

  await batch.commit();
  return circleRef.id;
}

/**
 * Join an existing circle. Caller becomes a 'member'. Used by invitees
 * who navigated to a circle they've been added to, or by a share-link
 * flow (future).
 */
export async function joinCircle(
  uid: string,
  displayName: string,
  circleId: string,
): Promise<void> {
  const circleSnap = await getDoc(circleDoc(circleId));
  if (!circleSnap.exists()) throw new Error('Circle not found');
  const circleName = (circleSnap.data().name as string) ?? '(untitled)';

  const batch = writeBatch(db);
  batch.set(memberDoc(circleId, uid), {
    role: 'member',
    joinedAt: serverTimestamp(),
    displayName,
  });
  batch.set(membershipDoc(uid, circleId), {
    circleId,
    circleName,
    role: 'member',
    joinedAt: serverTimestamp(),
  });
  batch.update(circleDoc(circleId), {
    memberCount: increment(1),
    lastActivityAt: serverTimestamp(),
  });
  await batch.commit();
}

/**
 * Owner-side bulk invite: the owner writes member docs + their mirror
 * docs in a single batched commit. Rules check that the caller holds an
 * owner membership for the circle, so this is safe.
 *
 * Invitee snapshot displayName is whatever the owner-side picker
 * provided (typically from connections + public-profile lookup).
 */
export async function addMembersByOwner(
  circleId: string,
  invitees: Array<{ uid: string; displayName: string }>,
): Promise<{ added: number; skipped: number }> {
  if (!invitees.length) return { added: 0, skipped: 0 };

  // Read circle name once for the mirror docs.
  const circleSnap = await getDoc(circleDoc(circleId));
  if (!circleSnap.exists()) throw new Error('Circle not found');
  const circleName = (circleSnap.data().name as string) ?? '(untitled)';

  // Skip anyone who already has a member doc — avoid double-incrementing
  // memberCount and don't overwrite the role of an existing owner.
  let added = 0;
  let skipped = 0;
  const batch = writeBatch(db);

  for (const inv of invitees) {
    const memSnap = await getDoc(memberDoc(circleId, inv.uid));
    if (memSnap.exists()) {
      skipped += 1;
      continue;
    }
    batch.set(memberDoc(circleId, inv.uid), {
      role: 'member',
      joinedAt: serverTimestamp(),
      displayName: inv.displayName,
    });
    batch.set(membershipDoc(inv.uid, circleId), {
      circleId,
      circleName,
      role: 'member',
      joinedAt: serverTimestamp(),
    });
    added += 1;
  }

  if (added > 0) {
    batch.update(circleDoc(circleId), {
      memberCount: increment(added),
      lastActivityAt: serverTimestamp(),
    });
    await batch.commit();
  }

  return { added, skipped };
}

export async function leaveCircle(uid: string, circleId: string): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(memberDoc(circleId, uid));
  batch.delete(membershipDoc(uid, circleId));
  batch.update(circleDoc(circleId), {
    memberCount: increment(-1),
    lastActivityAt: serverTimestamp(),
  });
  await batch.commit();
}

// ── Reads ────────────────────────────────────────────────────────────────

export async function getCircle(circleId: string): Promise<Circle | null> {
  const snap = await getDoc(circleDoc(circleId));
  if (!snap.exists()) return null;
  return circleFromDoc(snap.id, snap.data() as Record<string, unknown>);
}

export function subscribeToCircle(
  circleId: string,
  cb: (c: Circle | null) => void,
): Unsubscribe {
  return onSnapshot(circleDoc(circleId), (snap) => {
    cb(snap.exists() ? circleFromDoc(snap.id, snap.data() as Record<string, unknown>) : null);
  });
}

export async function listMyCircles(uid: string): Promise<CircleMembership[]> {
  const snap = await getDocs(
    query(membershipsCol(uid), orderBy('joinedAt', 'desc')),
  );
  const out: CircleMembership[] = [];
  snap.forEach((s) => out.push(membershipFromDoc(s.id, s.data() as Record<string, unknown>)));
  return out;
}

export function subscribeToMyCircles(
  uid: string,
  cb: (rows: CircleMembership[]) => void,
): Unsubscribe {
  return onSnapshot(
    query(membershipsCol(uid), orderBy('joinedAt', 'desc')),
    (snap) => {
      const out: CircleMembership[] = [];
      snap.forEach((s) => out.push(membershipFromDoc(s.id, s.data() as Record<string, unknown>)));
      cb(out);
    },
  );
}

export function subscribeToMembers(
  circleId: string,
  cb: (rows: CircleMember[]) => void,
): Unsubscribe {
  return onSnapshot(
    query(membersCol(circleId), orderBy('joinedAt', 'asc')),
    (snap) => {
      const out: CircleMember[] = [];
      snap.forEach((s) => out.push(memberFromDoc(s.id, s.data() as Record<string, unknown>)));
      cb(out);
    },
  );
}

// ── Posts ────────────────────────────────────────────────────────────────

export function subscribeToPosts(
  circleId: string,
  cb: (rows: CirclePost[]) => void,
  limit = 30,
): Unsubscribe {
  return onSnapshot(
    query(postsCol(circleId), orderBy('createdAt', 'desc'), fsLimit(limit)),
    (snap) => {
      const out: CirclePost[] = [];
      snap.forEach((s) => out.push(postFromDoc(s.id, s.data() as Record<string, unknown>)));
      cb(out);
    },
  );
}

export async function createPost(
  circleId: string,
  authorUid: string,
  authorName: string,
  text: string,
): Promise<string> {
  const trimmed = text.trim().slice(0, 4000);
  if (!trimmed) throw new Error('Post is empty');
  const ref = await addDoc(postsCol(circleId), {
    authorUid,
    authorName,
    text: trimmed,
    createdAt: serverTimestamp(),
    replyCount: 0,
  });
  // Bump the circle's activity timestamp so it sorts to the top.
  await updateDoc(circleDoc(circleId), {
    lastActivityAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Delete one of your own posts. Firestore rules enforce that
 * `authorUid == request.auth.uid`. Replies (subcollection) are not
 * cascade-deleted by Firestore; they become orphans that no one can read
 * (parent post gone). Acceptable for now — the UI never shows them.
 */
export async function deletePost(circleId: string, postId: string): Promise<void> {
  await deleteDoc(postDoc(circleId, postId));
}

// ── Replies ──────────────────────────────────────────────────────────────

export function subscribeToReplies(
  circleId: string,
  postId: string,
  cb: (rows: CircleReply[]) => void,
): Unsubscribe {
  return onSnapshot(
    query(repliesCol(circleId, postId), orderBy('createdAt', 'asc')),
    (snap) => {
      const out: CircleReply[] = [];
      snap.forEach((s) => out.push(replyFromDoc(s.id, s.data() as Record<string, unknown>)));
      cb(out);
    },
  );
}

export async function createReply(
  circleId: string,
  postId: string,
  authorUid: string,
  authorName: string,
  text: string,
): Promise<string> {
  const trimmed = text.trim().slice(0, 2000);
  if (!trimmed) throw new Error('Reply is empty');
  const ref = await addDoc(repliesCol(circleId, postId), {
    authorUid,
    authorName,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
  await updateDoc(postDoc(circleId, postId), {
    replyCount: increment(1),
  });
  await updateDoc(circleDoc(circleId), {
    lastActivityAt: serverTimestamp(),
  });
  return ref.id;
}
