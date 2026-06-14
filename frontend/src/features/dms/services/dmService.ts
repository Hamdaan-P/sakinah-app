/**
 * DM service. All reads/writes go straight to Firestore — rules restrict
 * access to the two participants. Raya ingestion runs server-side via admin
 * SDK (outside this client module).
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { convId, sortedPair, type Conversation, type Message } from '../types/dm.types';

const CONVS = 'conversations';

function toMillis(v: unknown): number {
  if (!v) return 0;
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === 'number') return v;
  if (v instanceof Date) return v.getTime();
  return 0;
}

function normalizeConversation(id: string, raw: Record<string, unknown>): Conversation {
  const participants = (raw.participantUids as string[] | undefined) ?? ['', ''];
  const lastMessage = raw.lastMessage as Record<string, unknown> | undefined | null;
  return {
    id,
    participantUids: [participants[0] ?? '', participants[1] ?? ''] as [string, string],
    createdAt: toMillis(raw.createdAt),
    updatedAt: toMillis(raw.updatedAt),
    lastMessage: lastMessage
      ? {
          text: (lastMessage.text as string) ?? '',
          senderId: (lastMessage.senderId as string) ?? '',
          createdAt: toMillis(lastMessage.createdAt),
        }
      : null,
    lastReadAt: (raw.lastReadAt as Record<string, number>) ?? {},
  };
}

function normalizeMessage(id: string, raw: Record<string, unknown>): Message {
  return {
    id,
    senderId: (raw.senderId as string) ?? '',
    text: (raw.text as string) ?? '',
    createdAt: toMillis(raw.createdAt),
  };
}

/**
 * Ensure a conversation doc exists between `me` and `other`. Returns the convId.
 * Idempotent — calling twice just reads the existing doc the second time.
 */
export async function openOrCreateConversation(me: string, other: string): Promise<string> {
  if (me === other) throw new Error("You can't DM yourself.");
  const id = convId(me, other);
  const ref = doc(db, CONVS, id);
  const snap = await getDoc(ref);
  if (snap.exists()) return id;

  const [userA, userB] = sortedPair(me, other);
  await setDoc(ref, {
    participantUids: [userA, userB],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: null,
    lastReadAt: { [userA]: 0, [userB]: 0 },
  });
  return id;
}

/**
 * Send a message. Ensures the conversation doc exists, then writes the
 * message + bumps the conversation's lastMessage / updatedAt.
 */
export async function sendMessage(me: string, other: string, text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  const id = await openOrCreateConversation(me, other);
  const convRef = doc(db, CONVS, id);
  const messagesCol = collection(convRef, 'messages');

  // Message first — so if conversation update fails, the message is still there.
  await addDoc(messagesCol, {
    senderId: me,
    text: trimmed,
    createdAt: serverTimestamp(),
  });

  await updateDoc(convRef, {
    lastMessage: {
      text: trimmed.slice(0, 300),
      senderId: me,
      createdAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
    // Mark the sender as having "read" their own message (they just sent it).
    [`lastReadAt.${me}`]: serverTimestamp(),
  });
}

/** Real-time subscription to a conversation's most recent messages. */
export function subscribeToMessages(
  convIdValue: string,
  cb: (messages: Message[]) => void,
  max = 200,
): Unsubscribe {
  const q = query(
    collection(db, CONVS, convIdValue, 'messages'),
    orderBy('createdAt', 'asc'),
    fsLimit(max),
  );
  return onSnapshot(q, (snap) => {
    const out: Message[] = [];
    snap.forEach((d) => out.push(normalizeMessage(d.id, d.data() as Record<string, unknown>)));
    cb(out);
  });
}

/** Real-time subscription to a single conversation's meta (lastMessage, lastReadAt). */
export function subscribeToConversation(
  convIdValue: string,
  cb: (c: Conversation | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, CONVS, convIdValue), (snap) => {
    cb(snap.exists() ? normalizeConversation(snap.id, snap.data() as Record<string, unknown>) : null);
  });
}

/** List all conversations for `me`, newest-updated first. */
export async function listConversations(me: string): Promise<Conversation[]> {
  const q = query(
    collection(db, CONVS),
    where('participantUids', 'array-contains', me),
    orderBy('updatedAt', 'desc'),
  );
  const snap = await getDocs(q);
  const out: Conversation[] = [];
  snap.forEach((d) => out.push(normalizeConversation(d.id, d.data() as Record<string, unknown>)));
  return out;
}

/** Live-subscribe to all conversations for `me`. */
export function subscribeToConversations(
  me: string,
  cb: (convs: Conversation[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, CONVS),
    where('participantUids', 'array-contains', me),
    orderBy('updatedAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    const out: Conversation[] = [];
    snap.forEach((d) => out.push(normalizeConversation(d.id, d.data() as Record<string, unknown>)));
    cb(out);
  });
}

/** Mark the conversation as read by `me` up to now. */
export async function markConversationRead(convIdValue: string, me: string): Promise<void> {
  await updateDoc(doc(db, CONVS, convIdValue), {
    [`lastReadAt.${me}`]: serverTimestamp(),
  });
}

/** Given a conversation and `me`, return the OTHER user's uid. */
export function otherParticipant(conv: Conversation, me: string): string {
  return conv.participantUids[0] === me ? conv.participantUids[1] : conv.participantUids[0];
}

/** True if `me` has unread messages in this conversation. */
export function hasUnread(conv: Conversation, me: string): boolean {
  if (!conv.lastMessage) return false;
  if (conv.lastMessage.senderId === me) return false; // own message
  const lastRead = conv.lastReadAt[me] ?? 0;
  return conv.lastMessage.createdAt > lastRead;
}
