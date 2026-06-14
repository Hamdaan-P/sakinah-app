/**
 * Tafakkur (contemplation) session persistence.
 *
 * Stored at: users/{uid}/tafakkur_sessions/{auto}
 * Shape:
 *   {
 *     duration: 3 | 7 | 15,           // minutes the user chose
 *     seedContext?: string,            // optional Raya context label
 *     seedPrompt?: string,             // the prompt they sat with
 *     reflection?: string,             // what they wrote at the end
 *     startedAt: serverTimestamp,
 *     endedAt?: serverTimestamp,
 *     completedFully: boolean,         // true if timer ran to end, false if ended early
 *   }
 */

import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import type { TafSeed } from '../stores/barakah-flow.store';

export type TafakkurSession = {
  id: string;
  duration: 3 | 7 | 15;
  seedContext?: string;
  seedPrompt?: string;
  reflection?: string;
  startedAt: number;
  endedAt?: number;
  completedFully: boolean;
};

function colRef(uid: string) {
  return collection(db, 'users', uid, 'tafakkur_sessions');
}

export async function startSession(
  uid: string,
  duration: 3 | 7 | 15,
  seed: TafSeed | null,
): Promise<string> {
  const ref = await addDoc(colRef(uid), {
    duration,
    seedContext: seed?.context ?? null,
    seedPrompt: seed?.prompt ?? null,
    startedAt: serverTimestamp(),
    completedFully: false,
  });
  return ref.id;
}

export async function endSession(
  uid: string,
  sessionId: string,
  reflection: string,
  completedFully: boolean,
): Promise<void> {
  await updateDoc(doc(colRef(uid), sessionId), {
    reflection: reflection || null,
    endedAt: serverTimestamp(),
    completedFully,
  });
}

function toView(id: string, raw: Record<string, unknown>): TafakkurSession {
  const startedAt = raw.startedAt instanceof Timestamp ? raw.startedAt.toMillis() : 0;
  const endedAt = raw.endedAt instanceof Timestamp ? raw.endedAt.toMillis() : undefined;
  return {
    id,
    duration: (raw.duration as 3 | 7 | 15) ?? 7,
    seedContext: (raw.seedContext as string) ?? undefined,
    seedPrompt: (raw.seedPrompt as string) ?? undefined,
    reflection: (raw.reflection as string) ?? undefined,
    startedAt,
    endedAt,
    completedFully: !!raw.completedFully,
  };
}

export async function listSessions(uid: string, limit = 30): Promise<TafakkurSession[]> {
  const snap = await getDocs(
    query(colRef(uid), orderBy('startedAt', 'desc'), fsLimit(limit)),
  );
  const all: TafakkurSession[] = [];
  snap.forEach((s) => all.push(toView(s.id, s.data() as Record<string, unknown>)));
  return all;
}

export function subscribeToSessions(
  uid: string,
  cb: (rows: TafakkurSession[]) => void,
  limit = 30,
): Unsubscribe {
  return onSnapshot(
    query(colRef(uid), orderBy('startedAt', 'desc'), fsLimit(limit)),
    (snap) => {
      const all: TafakkurSession[] = [];
      snap.forEach((s) => all.push(toView(s.id, s.data() as Record<string, unknown>)));
      cb(all);
    },
  );
}
