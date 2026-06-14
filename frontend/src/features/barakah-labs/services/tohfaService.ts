/**
 * Tohfa delivery — independent of DMs.
 *
 * Bug history: v1 piggybacked on the DM service, so every Tohfa appeared
 * as a regular message in /messages (both the sender's own inbox AND the
 * receiver's). v2 (this file) writes to a dedicated `tohfas` collection
 * that /messages doesn't read from, so neither side sees Tohfas in their
 * regular chats. The receiver views Tohfas via S10_TohfaReceived.
 *
 * Firestore shape — `tohfas/{tohfaId}`:
 *   {
 *     senderId:   string  // uid of the sender
 *     recipientId: string // uid of the receiver
 *     letter:     string  // the body of the gift
 *     noticing?:  string  // optional: the noticing the Tohfa was born from
 *     createdAt:  Timestamp
 *     kept:       boolean // true once the recipient acknowledges it
 *   }
 *
 * Rules live in /firestore.rules — only sender + recipient can read; only
 * sender can create; only recipient can flip `kept` to true.
 *
 * The `isTohfaMessage` / `stripTohfaPrefix` helpers below are kept as a
 * defensive filter for HISTORICAL Tohfas that were written into the
 * conversations collection back when v1 was active — the DM UI uses them
 * to hide those orphan messages from the user.
 */

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';

const TOHFAS = 'tohfas';

export interface Tohfa {
  id: string;
  senderId: string;
  recipientId: string;
  letter: string;
  noticing?: string;
  createdAt: number;
  kept: boolean;
}

function toMillis(v: unknown): number {
  if (!v) return 0;
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === 'number') return v;
  if (v instanceof Date) return v.getTime();
  return 0;
}

function normalize(id: string, raw: Record<string, unknown>): Tohfa {
  return {
    id,
    senderId: (raw.senderId as string) ?? '',
    recipientId: (raw.recipientId as string) ?? '',
    letter: (raw.letter as string) ?? '',
    noticing: (raw.noticing as string | undefined) ?? undefined,
    createdAt: toMillis(raw.createdAt),
    kept: (raw.kept as boolean) ?? false,
  };
}

/**
 * Send a Tohfa. Throws if the sender is the recipient — Tohfa is meant to
 * be a gift to another person; sending to yourself would land in your own
 * inbox and defeat the point.
 */
export async function sendTohfa(
  senderId: string,
  recipientId: string,
  noticing: string,
  letter: string,
): Promise<string> {
  if (!senderId || !recipientId) throw new Error('Tohfa: missing sender or recipient.');
  if (senderId === recipientId) throw new Error("Tohfa: you can't send a Tohfa to yourself.");
  const body = letter.trim();
  if (!body) throw new Error('Tohfa: the letter is empty.');

  const payload: Record<string, unknown> = {
    senderId,
    recipientId,
    letter: body,
    createdAt: serverTimestamp(),
    kept: false,
  };
  const noticingTrimmed = noticing.trim();
  if (noticingTrimmed) payload.noticing = noticingTrimmed;

  const ref = await addDoc(collection(db, TOHFAS), payload);
  return ref.id;
}

/**
 * Live subscription to all Tohfas addressed to `recipientId`, newest first.
 * Includes both unkept and kept — the screen filters as it likes.
 */
export function subscribeToReceivedTohfas(
  recipientId: string,
  cb: (tohfas: Tohfa[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, TOHFAS),
    where('recipientId', '==', recipientId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    const out: Tohfa[] = [];
    snap.forEach((d) => out.push(normalize(d.id, d.data() as Record<string, unknown>)));
    cb(out);
  });
}

/** Mark a Tohfa as kept (the recipient tapped "Keep this"). */
export async function markTohfaKept(tohfaId: string): Promise<void> {
  await updateDoc(doc(db, TOHFAS, tohfaId), { kept: true });
}

// ─────────────────────────────────────────────────────────────────────────
// Historical-Tohfa-as-DM filter helpers (still used by ChatPage /
// ConversationsPage to hide Tohfas that were written to /conversations
// back when v1 was live).
// ─────────────────────────────────────────────────────────────────────────

const TOHFA_PREFIX = '[Tohfa]';

export function isTohfaMessage(text: string | undefined | null): boolean {
  return !!text && text.startsWith(TOHFA_PREFIX);
}

export function stripTohfaPrefix(text: string): string {
  return text.replace(/^\[Tohfa\]\s*\n?/, '');
}
