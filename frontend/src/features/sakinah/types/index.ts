/**
 * Sakinah feature types.
 *
 * A `sakinah/matches/{pairKey}` doc represents a potential match between two users.
 * `pairKey` is `${uidA}_${uidB}` where uidA < uidB lexicographically.
 *
 * Core rules: character-first, no swipe mechanic, no browsing feed,
 * photos locked until mutual interest, women initiate or approve first.
 */

export type MatchStatus = 'exploring' | 'interested' | 'mutual' | 'declined' | 'withdrawn';

export type SignalType = 'expressed-interest' | 'approved' | 'declined' | 'withdrawn';

export interface SakinahProfile {
  uid: string;
  displayName: string;
  gender: 'male' | 'female';
  age: number;
  /** Free-text character/values bio — shown before any photo. */
  characterBio: string;
  /** Locked until mutual interest is established. */
  photoURL: string | null;
  createdAt: number;
}

/** A single directional signal of interest from one user to another. */
export interface ConnectionSignal {
  fromUid: string;
  toUid: string;
  type: SignalType;
  sentAt: number;
}

/** Firestore doc representing a potential match between two users. */
export interface Match {
  pairKey: string;
  uidA: string;
  uidB: string;
  status: MatchStatus;
  /** Unlocked only when both sides have expressed interest. */
  photoUnlocked: boolean;
  createdAt: number;
  mutualAt: number | null;
}

/**
 * Viewer-centric match state for the UI.
 * A woman's signal is required before a man can express interest (women-first safety).
 */
export type MatchView =
  | { kind: 'none' }
  | { kind: 'awaiting-her-signal' }
  | { kind: 'signal-sent'; sentAt: number }
  | { kind: 'signal-received'; fromUid: string; sentAt: number }
  | { kind: 'mutual'; since: number; photoUnlocked: boolean }
  | { kind: 'declined' }
  | { kind: 'withdrawn' };

/** Deterministic ID for a (uidA, uidB) pair. Lex-sorted so either caller hits the same doc. */
export function pairKey(a: string, b: string): string {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}
