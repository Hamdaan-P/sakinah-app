/**
 * Heart check-in persistence.
 *
 * Stored at: users/{uid}/heart_checkins/{YYYY-MM-DD}
 * One document per day per user (last write wins — user can change their
 * mind during the day). Document shape:
 *   { day: 'YYYY-MM-DD', heart: 'still'|..., createdAt: serverTimestamp }
 */

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import type { Heart } from '../stores/barakah-flow.store';

export type HeartCheckin = {
  day: string;
  heart: Heart;
  createdAt: number;
};

function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function colRef(uid: string) {
  return collection(db, 'users', uid, 'heart_checkins');
}

export async function saveHeart(uid: string, heart: Heart): Promise<void> {
  const day = todayKey();
  await setDoc(
    doc(colRef(uid), day),
    { day, heart, createdAt: serverTimestamp() },
    { merge: true },
  );
}

function toView(raw: { day?: string; heart?: string; createdAt?: unknown }): HeartCheckin | null {
  if (!raw.day || !raw.heart) return null;
  return {
    day: raw.day,
    heart: raw.heart as Heart,
    createdAt: raw.createdAt instanceof Timestamp ? raw.createdAt.toMillis() : 0,
  };
}

export async function listHeartCheckins(uid: string, days = 365): Promise<HeartCheckin[]> {
  const snap = await getDocs(query(colRef(uid), orderBy('day', 'desc')));
  const all: HeartCheckin[] = [];
  snap.forEach((s) => {
    const v = toView(s.data() as Record<string, unknown>);
    if (v) all.push(v);
  });
  return all.slice(0, days);
}

export function subscribeToHeartCheckins(
  uid: string,
  cb: (rows: HeartCheckin[]) => void,
): Unsubscribe {
  return onSnapshot(query(colRef(uid), orderBy('day', 'desc')), (snap) => {
    const all: HeartCheckin[] = [];
    snap.forEach((s) => {
      const v = toView(s.data() as Record<string, unknown>);
      if (v) all.push(v);
    });
    cb(all);
  });
}

export async function getTodayHeart(uid: string): Promise<Heart | null> {
  const all = await listHeartCheckins(uid, 1);
  const today = todayKey();
  const match = all.find((c) => c.day === today);
  return match?.heart ?? null;
}
