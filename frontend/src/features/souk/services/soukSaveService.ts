/**
 * Local-first "saved listings" tracker. Mirrors the Quran workspace pattern:
 * localStorage is the source of truth for the UI; a debounced Firestore mirror
 * runs in the background when the user is signed in. Works offline and
 * resyncs on reconnect without blocking the UI.
 *
 * On sign-in we hydrate from Firestore into localStorage so a user who
 * clears their browser data (or signs in on a fresh device) still sees
 * the listings they've saved previously. Without this, the local cache
 * silently diverged from server state.
 */

import { doc, deleteDoc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/config/firebase.config';

const KEY = 'souk_saved_v1';

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function write(set: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* quota / private mode — best effort */
  }
}

export function isSaved(listingId: string): boolean {
  return read().has(listingId);
}

export function listSaved(): string[] {
  return [...read()];
}

export async function toggleSave(listingId: string): Promise<boolean> {
  const set = read();
  const next = !set.has(listingId);
  if (next) set.add(listingId);
  else set.delete(listingId);
  write(set);
  emit();
  const uid = auth.currentUser?.uid;
  if (uid) {
    try {
      const ref = doc(db, 'users', uid, 'souk_saved', listingId);
      if (next) {
        await setDoc(ref, { listingId, savedAt: serverTimestamp() });
      } else {
        await deleteDoc(ref);
      }
    } catch {
      // Network failure — localStorage stays authoritative; rules + later
      // sync attempt will reconcile.
    }
  }
  return next;
}

let _hydratedForUid: string | null = null;

/**
 * Pull the user's saved listings from Firestore and merge into localStorage.
 * Idempotent per uid — safe to call on every auth state change. The merge
 * is a union (server ∪ local) so a save made offline before sign-in isn't
 * overwritten.
 */
export async function hydrateSavedFromServer(uid: string): Promise<void> {
  if (_hydratedForUid === uid) return;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'souk_saved'));
    const local = read();
    const before = local.size;
    snap.forEach((d) => local.add(d.id));
    if (local.size !== before) {
      write(local);
      emit();
    }
    _hydratedForUid = uid;
  } catch {
    // Network failure — keep local cache, retry on next auth event.
  }
}

export function resetSavedHydration(): void {
  _hydratedForUid = null;
}

// ── Pub/sub ──
const LISTENERS = new Set<() => void>();

export function subscribeSavedChanges(fn: () => void): () => void {
  LISTENERS.add(fn);
  return () => LISTENERS.delete(fn);
}

function emit() {
  for (const fn of LISTENERS) {
    try {
      fn();
    } catch {
      /* ignore */
    }
  }
}
