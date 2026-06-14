/**
 * Connections feature types.
 *
 * A `connections/{pairKey}` doc represents a relationship between two users.
 * `pairKey` is `${userA}_${userB}` where userA < userB lexicographically,
 * guaranteeing a single doc per pair regardless of who initiated.
 */

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'removed';

export interface ConnectionDoc {
  userA: string;
  userB: string;
  requestedBy: string;
  status: ConnectionStatus;
  createdAt: number;
  respondedAt: number | null;
}

/**
 * Viewer-centric state used by the UI: describes the connection between
 * the currently signed-in user ("me") and some other profile owner.
 */
export type ConnectionView =
  | { kind: 'none' }
  | { kind: 'request-sent'; otherUid: string; createdAt: number }
  | { kind: 'request-received'; otherUid: string; createdAt: number }
  | { kind: 'connected'; otherUid: string; since: number }
  | { kind: 'declined'; otherUid: string }
  | { kind: 'self' };

/** pairKey: deterministic ID for a (uidA, uidB) pair. Lex-sorted so either caller hits the same doc. */
export function pairKey(a: string, b: string): string {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}
