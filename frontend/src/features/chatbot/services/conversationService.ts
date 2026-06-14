/**
 * Conversation Persistence Service
 * Firestore CRUD for chat conversations and messages.
 * Model: users/{userId}/conversations/{convId}/messages/{msgId}
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  increment,
  writeBatch,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseStubbed } from '@/config/firebase.config';
import { authGet } from '@/lib/api';
import type { ChatMessage, MoodLogEntry, UserEmotionalProfile } from '../types/chatbot.types';
import type { ConversationMeta, ConversationSummary } from '../types/chatbot.types';

// ── Helpers ──

/** Replacement shown when a value is still ciphertext we can't decrypt
 *  client-side (the key is server-only). Keeps raw `enc:v1:` tokens out of
 *  the UI for conversation-list previews/titles. */
const ENC_PREFIX = 'enc:v1:';
export function maskCiphertext(value: string | undefined | null, fallback = '🔒 Encrypted message'): string {
  const v = value ?? '';
  return v.startsWith(ENC_PREFIX) ? fallback : v;
}

/** Parse a timestamp from the backend (ISO string) or Firestore (Timestamp). */
function parseTimestamp(ts: unknown): Date {
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts instanceof Date) return ts;
  if (typeof ts === 'string' && ts) {
    const d = new Date(ts);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (typeof ts === 'number') return new Date(ts);
  return new Date();
}

function conversationsRef(userId: string) {
  return collection(db, 'users', userId, 'conversations');
}

function messagesRef(userId: string, convId: string) {
  return collection(db, 'users', userId, 'conversations', convId, 'messages');
}

function toDate(ts: unknown): Date {
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date();
}

// ── Create ──

export async function createConversation(
  userId: string,
  companionId: string,
  firstMessage: string,
): Promise<string> {
  if (isFirebaseStubbed) return `stub-${Date.now()}`;
  console.log('ConversationService: Creating conversation for user', userId, 'companion', companionId);
  const docRef = await addDoc(conversationsRef(userId), {
    title: firstMessage.slice(0, 60),
    companionId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messageCount: 0,
    lastUserMessage: '',
    lastAiResponse: '',
    summary: '',
  });
  return docRef.id;
}

// ── Save Message ──

export async function saveMessage(
  userId: string,
  convId: string,
  message: ChatMessage,
): Promise<void> {
  if (isFirebaseStubbed) return;
  // Strip chartData (too large for Firestore, regenerated on demand)
  // Also strip undefined values to prevent Firestore write failures
  const { chartData: _strip, ...raw } = message;
  const msgData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value !== undefined) msgData[key] = value;
  }

  await setDoc(doc(messagesRef(userId, convId), message.id), {
    ...msgData,
    timestamp: Timestamp.fromDate(
      message.timestamp instanceof Date ? message.timestamp : new Date(),
    ),
  });

  // Increment message count on parent conversation
  await updateDoc(doc(db, 'users', userId, 'conversations', convId), {
    messageCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}

// ── Update Conversation Meta ──

export async function updateConversationMeta(
  userId: string,
  convId: string,
  updates: Partial<Pick<ConversationMeta, 'title' | 'summary' | 'lastUserMessage' | 'lastAiResponse'>>,
): Promise<void> {
  if (isFirebaseStubbed) return;
  await updateDoc(doc(db, 'users', userId, 'conversations', convId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// ── Load Messages ──

export async function loadConversationMessages(
  _userId: string,
  convId: string,
): Promise<ChatMessage[]> {
  if (isFirebaseStubbed) return [];
  // Read through the backend rather than Firestore directly: backend-written
  // turns (e.g. WhatsApp) are stored encrypted-at-rest (`enc:v1:…`), and the
  // decryption key lives only in the server env. The backend derives the uid
  // from the auth token, so `_userId` is intentionally unused here.
  const { messages } = await authGet<{ messages: Array<Record<string, unknown>> }>(
    `/chat/conversations/${encodeURIComponent(convId)}/messages`,
  );

  return (messages ?? []).map((data) => {
    // Handle both formats: frontend (text/isUser) and backend (content/role)
    const text = typeof data.text === 'string' ? data.text
      : typeof data.content === 'string' ? data.content
      : '';
    const isUser = data.isUser === true || data.role === 'user';
    return {
      ...data,
      id: data.id as string,
      text,
      isUser,
      timestamp: parseTimestamp(data.timestamp),
    } as ChatMessage;
  });
}

// ── Subscribe to Conversation List ──

export function subscribeToConversations(
  userId: string,
  onData: (convs: ConversationMeta[]) => void,
): Unsubscribe {
  if (isFirebaseStubbed) {
    onData([]);
    return () => {};
  }
  const q = query(
    conversationsRef(userId),
    orderBy('updatedAt', 'desc'),
    limit(200),
  );

  return onSnapshot(q, (snapshot) => {
    console.log('ConversationService: Received', snapshot.size, 'conversations for user', userId);
    const convs: ConversationMeta[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        // title/last-message previews are written encrypted for backend
        // (e.g. WhatsApp) conversations; the list reads Firestore directly
        // for realtime, so mask any ciphertext rather than show raw tokens.
        title: maskCiphertext(data.title, 'WhatsApp conversation'),
        companionId: data.companionId ?? 'raya',
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        messageCount: data.messageCount ?? 0,
        lastUserMessage: maskCiphertext(data.lastUserMessage, ''),
        lastAiResponse: maskCiphertext(data.lastAiResponse, ''),
        summary: data.summary ?? '',
      };
    });
    onData(convs);
  }, (error) => {
    console.error('ConversationService: Subscription error:', error);
  });
}

// ── Delete Conversation ──

async function deleteSubcollectionInBatches(userId: string, convId: string): Promise<void> {
  const msgRef = messagesRef(userId, convId);
  // Firestore writeBatch supports max 500 operations — delete in chunks
  let snapshot = await getDocs(query(msgRef, limit(450)));
  while (snapshot.size > 0) {
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    if (snapshot.size < 450) break;
    snapshot = await getDocs(query(msgRef, limit(450)));
  }
}

export async function deleteConversation(
  userId: string,
  convId: string,
): Promise<void> {
  if (isFirebaseStubbed) return;
  // Delete all messages in subcollection first (batched)
  await deleteSubcollectionInBatches(userId, convId);
  // Delete the conversation doc
  await deleteDoc(doc(db, 'users', userId, 'conversations', convId));
}

// ── Bulk Delete Conversations Below Message Threshold ──

export async function deleteConversationsBelowCount(
  userId: string,
  minMessages: number,
): Promise<number> {
  if (isFirebaseStubbed) return 0;
  console.log(`[Cleanup] Starting cleanup for user ${userId}, minMessages=${minMessages}`);

  // Step 1: Fetch ALL conversations
  const snapshot = await getDocs(conversationsRef(userId));
  console.log(`[Cleanup] Fetched ${snapshot.size} total conversations from Firestore`);

  const toDelete = snapshot.docs.filter((d) => {
    const count = d.data().messageCount ?? 0;
    return count < minMessages;
  });
  console.log(`[Cleanup] ${toDelete.length} conversations have < ${minMessages} messages`);

  if (toDelete.length === 0) return 0;

  // Step 2: Delete in batches of 400 using writeBatch (atomic per batch)
  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += 400) {
    const chunk = toDelete.slice(i, i + 400);
    const batch = writeBatch(db);
    chunk.forEach((d) => batch.delete(d.ref));

    try {
      await batch.commit();
      deleted += chunk.length;
      console.log(`[Cleanup] Batch committed: deleted ${deleted}/${toDelete.length}`);
    } catch (err) {
      console.error(`[Cleanup] BATCH FAILED (items ${i}-${i + chunk.length}):`, err);
    }
  }

  // Step 3: Verify by re-querying Firestore
  const verifySnapshot = await getDocs(conversationsRef(userId));
  console.log(`[Cleanup] VERIFY: ${verifySnapshot.size} conversations remain after cleanup (was ${snapshot.size})`);

  // Step 4: Clean up orphaned message subcollections in background (non-blocking)
  for (const d of toDelete) {
    deleteSubcollectionInBatches(userId, d.id).catch(() => {});
  }

  return deleted;
}

// ── Get Recent Summaries (for backend context injection) ──

export async function getRecentConversationSummaries(
  userId: string,
  count = 5,
): Promise<ConversationSummary[]> {
  if (isFirebaseStubbed) return [];
  const q = query(
    conversationsRef(userId),
    orderBy('updatedAt', 'desc'),
    limit(count),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => {
      const data = d.data();
      return {
        title: data.title ?? '',
        summary: data.summary ?? '',
        companionId: data.companionId ?? 'raya',
        updatedAt: toDate(data.updatedAt),
      };
    })
    .filter((s) => s.summary); // Only include conversations that have a summary
}

// ==================== RAYA EVOLUTION: Mood & Profile Persistence ====================

function moodLogRef(userId: string) {
  return collection(db, 'users', userId, 'moodLog');
}

function profileRef(userId: string) {
  return doc(db, 'users', userId, 'profile', 'emotional');
}

/** Save a mood entry to Firestore */
export async function saveMoodEntry(
  userId: string,
  entry: Omit<MoodLogEntry, 'timestamp'> & { timestamp: Date },
): Promise<void> {
  if (isFirebaseStubbed) return;
  await addDoc(moodLogRef(userId), {
    primaryEmotion: entry.primaryEmotion,
    secondaryEmotion: entry.secondaryEmotion ?? null,
    intensity: entry.intensity,
    sentiment: entry.sentiment,
    underlyingNeed: entry.underlyingNeed ?? null,
    conversationId: entry.conversationId,
    timestamp: serverTimestamp(),
  });
}

/** Get mood log entries (most recent first) */
export async function getMoodLog(
  userId: string,
  maxEntries = 100,
): Promise<MoodLogEntry[]> {
  if (isFirebaseStubbed) return [];
  const q = query(moodLogRef(userId), orderBy('timestamp', 'desc'), limit(maxEntries));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      primaryEmotion: data.primaryEmotion ?? 'neutral',
      secondaryEmotion: data.secondaryEmotion ?? undefined,
      intensity: data.intensity ?? 0.5,
      sentiment: data.sentiment ?? 0,
      underlyingNeed: data.underlyingNeed ?? undefined,
      conversationId: data.conversationId ?? '',
      timestamp: toDate(data.timestamp),
    };
  });
}

/** Get user emotional profile */
export async function getUserProfile(userId: string): Promise<UserEmotionalProfile | null> {
  if (isFirebaseStubbed) return null;
  try {
    const snap = await getDoc(profileRef(userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      recurringThemes: data.recurringThemes ?? [],
      copingPatterns: data.copingPatterns ?? [],
      growthAreas: data.growthAreas ?? [],
      triggers: data.triggers ?? [],
      dominantEmotions: data.dominantEmotions ?? [],
      communicationStyle: data.communicationStyle ?? '',
      lastUpdated: toDate(data.lastUpdated),
    };
  } catch (e) {
    console.error('Error fetching user profile:', e);
    return null;
  }
}

/** Merge updates into user emotional profile */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserEmotionalProfile>,
): Promise<void> {
  if (isFirebaseStubbed) return;
  await setDoc(
    profileRef(userId),
    {
      ...updates,
      lastUpdated: serverTimestamp(),
    },
    { merge: true },
  );
}

// ==================== SOULBUDDY: Relationship & Cognitive Pattern Persistence ====================

function relationshipsRef(userId: string) {
  return doc(db, 'users', userId, 'profile', 'relationships');
}

/** Save relationship data to Firestore */
export async function saveRelationships(
  userId: string,
  relationships: Record<string, unknown>,
): Promise<void> {
  if (isFirebaseStubbed) return;
  await setDoc(
    relationshipsRef(userId),
    {
      ...relationships,
      lastUpdated: serverTimestamp(),
    },
    { merge: true },
  );
}

/** Get relationship data from Firestore */
export async function getRelationships(
  userId: string,
): Promise<Record<string, unknown> | null> {
  if (isFirebaseStubbed) return null;
  try {
    const snap = await getDoc(relationshipsRef(userId));
    if (!snap.exists()) return null;
    return snap.data();
  } catch (e) {
    console.error('Error fetching relationships:', e);
    return null;
  }
}
