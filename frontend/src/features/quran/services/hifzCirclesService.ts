/**
 * hifzCirclesService — peer accountability groups for memorization.
 *
 * Architecture:
 *   hifz_circles/{circleId}                 — circle metadata
 *   hifz_circles/{circleId}/members/{uid}   — one doc per member
 *   hifz_circles/{circleId}/checkins/{id}   — daily check-ins (one per uid+date)
 *
 * The circleId IS the 6-char invite code (uppercase alphanum), so users join
 * by typing the code. No separate code-lookup table needed.
 */

import { auth, db } from '@/config/firebase.config';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  addDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit as fsLimit,
  serverTimestamp,
  increment,
  collectionGroup,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

export interface HifzCircle {
  id: string;             // = invite code
  name: string;
  description?: string;
  createdBy: string;
  createdAt: number;
  memberCount: number;
}

export interface HifzCircleMember {
  uid: string;
  name: string;
  joinedAt: number;
  totalAyahsRevised: number;
  lastCheckinDate?: string;     // YYYY-MM-DD
  currentStreak: number;
}

export interface HifzCheckin {
  id: string;
  uid: string;
  name: string;
  date: string;                  // YYYY-MM-DD
  ayahsRevised: number;
  note?: string;
  createdAt: number;
}

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // omits I/L/O/0/1 to avoid confusion

function generateCode(len = 6): string {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function requireUid(): string {
  const u = auth.currentUser;
  if (!u) throw new Error('Sign in required');
  return u.uid;
}

function currentDisplayName(): string {
  return auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Member';
}

/** Create a new circle. Generates a unique invite code. Caller becomes member #1. */
export async function createCircle(name: string, description?: string): Promise<HifzCircle> {
  const uid = requireUid();
  const trimmedName = name.trim().slice(0, 60);
  if (trimmedName.length < 3) throw new Error('Circle name must be at least 3 characters');

  // Try up to 5 codes to avoid collision (vanishingly rare with ~30^6 = 729M codes)
  let code = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateCode();
    const existing = await getDoc(doc(db, 'hifz_circles', candidate));
    if (!existing.exists()) { code = candidate; break; }
  }
  if (!code) throw new Error('Could not allocate invite code, try again');

  const circle: HifzCircle = {
    id: code,
    name: trimmedName,
    description: description?.trim().slice(0, 200) || undefined,
    createdBy: uid,
    createdAt: Date.now(),
    memberCount: 1,
  };

  await setDoc(doc(db, 'hifz_circles', code), {
    ...circle,
    createdAt: serverTimestamp(),
  });

  // Add creator as first member
  await setDoc(doc(db, 'hifz_circles', code, 'members', uid), {
    uid,
    name: currentDisplayName(),
    joinedAt: serverTimestamp(),
    totalAyahsRevised: 0,
    currentStreak: 0,
  });

  return circle;
}

/** Join an existing circle by invite code. */
export async function joinCircle(code: string): Promise<HifzCircle> {
  const uid = requireUid();
  const normalized = code.trim().toUpperCase();
  if (normalized.length !== 6) throw new Error('Invite code must be 6 characters');

  const circleRef = doc(db, 'hifz_circles', normalized);
  const snap = await getDoc(circleRef);
  if (!snap.exists()) throw new Error('No circle with that invite code');

  const memberRef = doc(db, 'hifz_circles', normalized, 'members', uid);
  const memberSnap = await getDoc(memberRef);
  if (memberSnap.exists()) {
    // Already a member — return the circle without bumping the count.
    return { ...(snap.data() as HifzCircle), id: normalized };
  }

  await setDoc(memberRef, {
    uid,
    name: currentDisplayName(),
    joinedAt: serverTimestamp(),
    totalAyahsRevised: 0,
    currentStreak: 0,
  });
  await setDoc(circleRef, { memberCount: increment(1) }, { merge: true });

  return { ...(snap.data() as HifzCircle), id: normalized, memberCount: (snap.data().memberCount ?? 0) + 1 };
}

/** Leave a circle (delete own member doc, decrement memberCount). */
export async function leaveCircle(circleId: string): Promise<void> {
  const uid = requireUid();
  await deleteDoc(doc(db, 'hifz_circles', circleId, 'members', uid));
  await setDoc(doc(db, 'hifz_circles', circleId), { memberCount: increment(-1) }, { merge: true });
}

/** All circles the current user is a member of. */
export async function listMyCircles(): Promise<HifzCircle[]> {
  const uid = requireUid();
  // Collection group query across all hifz_circles/{*}/members where uid == me
  const q = query(collectionGroup(db, 'members'), where('uid', '==', uid));
  const snaps = await getDocs(q);
  const circles = await Promise.all(
    snaps.docs.map(async (m) => {
      const circleRef = m.ref.parent.parent!;
      const c = await getDoc(circleRef);
      return c.exists() ? ({ ...(c.data() as HifzCircle), id: c.id }) : null;
    }),
  );
  return circles.filter((c): c is HifzCircle => c !== null);
}

/** Members of a circle (for the detail view leaderboard). */
export async function listMembers(circleId: string): Promise<HifzCircleMember[]> {
  const snaps = await getDocs(collection(db, 'hifz_circles', circleId, 'members'));
  return snaps.docs.map((d) => {
    const data = d.data();
    return {
      uid: data.uid,
      name: data.name,
      joinedAt: data.joinedAt?.toMillis?.() ?? Date.now(),
      totalAyahsRevised: data.totalAyahsRevised ?? 0,
      lastCheckinDate: data.lastCheckinDate,
      currentStreak: data.currentStreak ?? 0,
    };
  });
}

/** Recent check-ins across all members of a circle. */
export async function listRecentCheckins(circleId: string, lim = 30): Promise<HifzCheckin[]> {
  const q = query(
    collection(db, 'hifz_circles', circleId, 'checkins'),
    orderBy('createdAt', 'desc'),
    fsLimit(lim),
  );
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      uid: data.uid,
      name: data.name,
      date: data.date,
      ayahsRevised: data.ayahsRevised,
      note: data.note,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    };
  });
}

/**
 * Submit today's check-in. If user already checked in today, updates the
 * existing entry. Also bumps the member's totalAyahsRevised + streak.
 */
export async function submitCheckin(circleId: string, ayahsRevised: number, note?: string): Promise<void> {
  const uid = requireUid();
  const date = todayISO();
  const checkinId = `${uid}_${date}`;
  const checkinRef = doc(db, 'hifz_circles', circleId, 'checkins', checkinId);
  const existing = await getDoc(checkinRef);
  const prevAmount = existing.exists() ? (existing.data().ayahsRevised as number) : 0;

  await setDoc(checkinRef, {
    uid,
    name: currentDisplayName(),
    date,
    ayahsRevised: Math.max(0, Math.min(200, Math.floor(ayahsRevised))),
    note: note?.trim().slice(0, 200) || null,
    createdAt: serverTimestamp(),
  });

  // Update member rollup
  const memberRef = doc(db, 'hifz_circles', circleId, 'members', uid);
  const memberSnap = await getDoc(memberRef);
  const member = memberSnap.exists() ? memberSnap.data() : { totalAyahsRevised: 0, currentStreak: 0, lastCheckinDate: null };
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  let nextStreak: number;
  if (member.lastCheckinDate === date) {
    nextStreak = member.currentStreak; // same day update — streak unchanged
  } else if (member.lastCheckinDate === yesterday) {
    nextStreak = (member.currentStreak ?? 0) + 1;
  } else {
    nextStreak = 1;
  }

  const delta = Math.max(0, Math.floor(ayahsRevised)) - prevAmount;
  await setDoc(memberRef, {
    totalAyahsRevised: (member.totalAyahsRevised ?? 0) + delta,
    lastCheckinDate: date,
    currentStreak: nextStreak,
    name: currentDisplayName(),
  }, { merge: true });
}

/** Has the current user checked in today for this circle? */
export async function hasCheckedInToday(circleId: string): Promise<boolean> {
  const uid = requireUid();
  const checkinId = `${uid}_${todayISO()}`;
  const snap = await getDoc(doc(db, 'hifz_circles', circleId, 'checkins', checkinId));
  return snap.exists();
}

// ── Live call (Jitsi) ─────────────────────────────────────────────────────

export interface LiveCall {
  active: boolean;
  startedBy?: string;
  startedAt?: number;
}

/** Mark a live call as active for the circle. Idempotent. */
export async function startCall(circleId: string): Promise<void> {
  const uid = requireUid();
  await setDoc(
    doc(db, 'hifz_circles', circleId),
    {
      liveCall: {
        active: true,
        startedBy: uid,
        startedAt: Date.now(),
      },
    },
    { merge: true },
  );
}

/** Mark the live call as ended. Anyone in the circle may end it. */
export async function endCall(circleId: string): Promise<void> {
  requireUid();
  await setDoc(
    doc(db, 'hifz_circles', circleId),
    { liveCall: { active: false, startedBy: null, startedAt: null } },
    { merge: true },
  );
}

/** Subscribe to live-call status. Returns an unsubscribe fn. */
export function subscribeToCall(circleId: string, cb: (call: LiveCall) => void): Unsubscribe {
  return onSnapshot(doc(db, 'hifz_circles', circleId), (snap) => {
    const data = snap.data();
    const lc = data?.liveCall as LiveCall | undefined;
    cb({
      active: Boolean(lc?.active),
      startedBy: lc?.startedBy,
      startedAt: lc?.startedAt,
    });
  });
}

/** Deterministic per-circle Jitsi room URL. */
export function jitsiRoomUrl(circleId: string, displayName?: string): string {
  const base = `https://meet.jit.si/zp-circle-${circleId.toLowerCase()}`;
  const params = new URLSearchParams();
  if (displayName) params.set('userInfo.displayName', displayName);
  // Sensible defaults: prejoin off, audio on, video on.
  const hash = `#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false${
    displayName ? `&userInfo.displayName=${encodeURIComponent(displayName)}` : ''
  }`;
  return base + hash;
}

export function getCurrentDisplayName(): string {
  return currentDisplayName();
}

// ── Synced reading position ──────────────────────────────────────────────

export interface CurrentReading {
  surahId: number;
  ayahKey: string;     // "2:255"
  hostUid: string;
  updatedAt: number;
}

/** Host broadcasts their current ayah to the circle. */
export async function setCurrentReading(circleId: string, surahId: number, ayahKey: string): Promise<void> {
  const uid = requireUid();
  await setDoc(
    doc(db, 'hifz_circles', circleId),
    {
      currentReading: {
        surahId,
        ayahKey,
        hostUid: uid,
        updatedAt: Date.now(),
      },
    },
    { merge: true },
  );
}

/** Subscribe to the circle's current-reading broadcast. */
export function subscribeToCurrentReading(circleId: string, cb: (reading: CurrentReading | null) => void): Unsubscribe {
  return onSnapshot(doc(db, 'hifz_circles', circleId), (snap) => {
    const data = snap.data();
    const cr = data?.currentReading as CurrentReading | undefined;
    cb(cr && cr.ayahKey ? cr : null);
  });
}

// ── Invites (out-of-band; recipients accept to join) ─────────────────────

export interface CircleInvite {
  id: string;
  circleId: string;
  circleName: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  createdAt: number;
}

/** Invite a connection to a circle. Writes to top-level `circle_invites`. */
export async function sendInvite(circleId: string, circleName: string, toUid: string): Promise<void> {
  const fromUid = requireUid();
  if (toUid === fromUid) throw new Error("Can't invite yourself.");
  await addDoc(collection(db, 'circle_invites'), {
    circleId,
    circleName,
    fromUid,
    fromName: currentDisplayName(),
    toUid,
    createdAt: serverTimestamp(),
  });
}

/** Realtime listener for invites addressed to me. */
export function subscribeMyInvites(myUid: string, cb: (invites: CircleInvite[]) => void): Unsubscribe {
  const q = query(collection(db, 'circle_invites'), where('toUid', '==', myUid));
  return onSnapshot(q, (snaps) => {
    const list = snaps.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        circleId: data.circleId as string,
        circleName: data.circleName as string,
        fromUid: data.fromUid as string,
        fromName: data.fromName as string,
        toUid: data.toUid as string,
        createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
      } satisfies CircleInvite;
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    cb(list);
  });
}

/** Accept an invite: join the circle, then delete the invite. */
export async function acceptInvite(invite: CircleInvite): Promise<HifzCircle> {
  const circle = await joinCircle(invite.circleId);
  await deleteDoc(doc(db, 'circle_invites', invite.id)).catch(() => {});
  return circle;
}

/** Decline (delete) an invite without joining. */
export async function declineInvite(inviteId: string): Promise<void> {
  await deleteDoc(doc(db, 'circle_invites', inviteId));
}

// ── Notes (per-circle pinboard) ──────────────────────────────────────────

export type NoteType = 'manual' | 'raya-summary' | 'raya-prompt' | 'raya-plan';

export interface CircleNote {
  id: string;
  authorUid: string;
  authorName: string;
  type: NoteType;
  body: string;
  pinned: boolean;
  createdAt: number;
}

/** Add a note (manual or AI-generated). Returns the new note's id. */
export async function addNote(
  circleId: string,
  payload: { type: NoteType; body: string; pinned?: boolean },
): Promise<string> {
  const uid = requireUid();
  const ref = await addDoc(collection(db, 'hifz_circles', circleId, 'notes'), {
    authorUid: uid,
    authorName: currentDisplayName(),
    type: payload.type,
    body: payload.body.trim().slice(0, 4000),
    pinned: Boolean(payload.pinned),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Toggle the pinned flag — open to any signed-in user (per rules). */
export async function togglePinNote(circleId: string, noteId: string, pinned: boolean): Promise<void> {
  await updateDoc(doc(db, 'hifz_circles', circleId, 'notes', noteId), { pinned });
}

/** Delete a note — only the author can (per rules). */
export async function deleteNote(circleId: string, noteId: string): Promise<void> {
  await deleteDoc(doc(db, 'hifz_circles', circleId, 'notes', noteId));
}

/** Live notes list, pinned first then newest first. */
export function subscribeToNotes(circleId: string, cb: (notes: CircleNote[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'hifz_circles', circleId, 'notes'), (snaps) => {
    const list = snaps.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        authorUid: data.authorUid as string,
        authorName: data.authorName as string,
        type: (data.type as NoteType) ?? 'manual',
        body: data.body as string,
        pinned: Boolean(data.pinned),
        createdAt: data.createdAt?.toMillis?.() ?? 0,
      } satisfies CircleNote;
    });
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
    cb(list);
  });
}

/** One-shot fetch (for AI context-builder). */
export async function listRecentNotes(circleId: string, lim = 5): Promise<CircleNote[]> {
  const q = query(
    collection(db, 'hifz_circles', circleId, 'notes'),
    orderBy('createdAt', 'desc'),
    fsLimit(lim),
  );
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      authorUid: data.authorUid as string,
      authorName: data.authorName as string,
      type: (data.type as NoteType) ?? 'manual',
      body: data.body as string,
      pinned: Boolean(data.pinned),
      createdAt: data.createdAt?.toMillis?.() ?? 0,
    } satisfies CircleNote;
  });
}

/** One-shot fetch of circle metadata (for invite previews / context-builder). */
export async function getCircleMeta(circleId: string): Promise<HifzCircle | null> {
  const snap = await getDoc(doc(db, 'hifz_circles', circleId));
  if (!snap.exists()) return null;
  return { ...(snap.data() as HifzCircle), id: circleId };
}
