/**
 * Direct Messages feature types.
 *
 * A `conversations/{convId}` doc represents a 1-to-1 chat between two users.
 * `convId` is `${userA}_${userB}` lex-sorted, matching the connection pairKey
 * convention so either participant deterministically resolves the same doc.
 *
 * Messages live in the `conversations/{convId}/messages` subcollection.
 * Messages are immutable — no edits or deletes for now.
 *
 * Privacy model: plaintext in Firestore so Raya's pipeline can ingest
 * conversations for analysis. See memory/project_messaging_privacy_model.md.
 */

export interface Conversation {
  id: string;
  participantUids: [string, string];
  createdAt: number;
  updatedAt: number;
  lastMessage: {
    text: string;
    senderId: string;
    createdAt: number;
  } | null;
  /** Per-user "last read" timestamps so we can compute unread client-side. */
  lastReadAt: Record<string, number>;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
}

/** Deterministic convId given two uids. */
export function convId(a: string, b: string): string {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

/** Pair uids sorted so userA < userB. */
export function sortedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}
