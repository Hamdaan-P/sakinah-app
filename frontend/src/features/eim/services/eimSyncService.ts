/**
 * eimSyncService — Firestore persistence for the EIM Zustand store.
 *
 * Mirrors quranSyncService: one snapshot doc per user at
 *   users/{uid}/eimState/state
 * with debounced writes. On sign-in we pull, replace local state, then any
 * subsequent zustand mutation kicks the debounce.
 *
 * What's synced:
 *   - portfolios (Portfolio[])
 *   - lessonProgress (Record<lessonId, LessonProgress>)
 *   - currentLevelTitle (string)
 * lastReport stays transient (in-memory only).
 */

import { auth, db } from '@/config/firebase.config';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEimStore } from '../stores/eim.store';
import type { LessonProgress, Portfolio } from '../types/eim.types';

const DEBOUNCE_MS = 3000;
const STATE_DOC = (uid: string) => doc(db, 'users', uid, 'eimState', 'state');

interface EimSnapshot {
  portfolios: Portfolio[];
  lessonProgress: Record<string, LessonProgress>;
  currentLevelTitle: string;
  updatedAt: number;
}

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let currentUid: string | null = null;
let pulledOnce = false;
let zustandUnsub: (() => void) | null = null;
let applyingRemote = false; // suppress write-back during remote apply

function snapshotLocal(): EimSnapshot {
  const s = useEimStore.getState();
  return {
    portfolios: s.portfolios,
    lessonProgress: s.lessonProgress,
    currentLevelTitle: s.currentLevelTitle,
    updatedAt: Date.now(),
  };
}

function backfillSimFields(portfolios: Portfolio[]): Portfolio[] {
  // Symmetric to the persist `migrate` in eim.store.ts (v1 → v2 migration).
  // A Firestore snapshot written before Sprint 1 won't have cash_balance /
  // currency / transactions; the migrate hook only runs on localStorage
  // hydration, so we backfill here too. New portfolios get defaults that
  // preserve their old "watchlist" semantics: 0 cash, untradeable until
  // the user explicitly deposits.
  return portfolios.map((p) => ({
    ...p,
    cash_balance: typeof p.cash_balance === 'number' ? p.cash_balance : 0,
    currency: p.currency ?? 'USD',
    transactions: Array.isArray(p.transactions) ? p.transactions : [],
  }));
}

function applySnapshotToLocal(snap: EimSnapshot) {
  applyingRemote = true;
  try {
    useEimStore.setState({
      portfolios: backfillSimFields(snap.portfolios ?? []),
      lessonProgress: snap.lessonProgress ?? {},
      currentLevelTitle: snap.currentLevelTitle || 'Foundations',
    });
  } finally {
    // Defer the clear so the in-flight Zustand subscriber notifications all
    // see applyingRemote=true and skip rescheduling a write.
    setTimeout(() => {
      applyingRemote = false;
    }, 0);
  }
}

async function pullFromFirestore(uid: string) {
  try {
    const snap = await getDoc(STATE_DOC(uid));
    if (!snap.exists()) return;
    const remote = snap.data() as { snapshot?: EimSnapshot };
    if (!remote.snapshot) return;
    // Merge strategy: remote wins on first pull (parity with quranSync).
    // Local was empty before sign-in OR is a stale device — pulling is safer
    // than silently losing the cloud copy.
    applySnapshotToLocal(remote.snapshot);
  } catch (err) {
    console.warn('[eimSync] pull failed:', err);
  }
}

async function pushToFirestore(uid: string) {
  try {
    await setDoc(STATE_DOC(uid), {
      snapshot: snapshotLocal(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('[eimSync] push failed:', err);
  }
}

function scheduleWrite() {
  if (!currentUid || applyingRemote) return;
  if (writeTimer) clearTimeout(writeTimer);
  const uid = currentUid;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    void pushToFirestore(uid);
  }, DEBOUNCE_MS);
}

function subscribeToStore() {
  if (zustandUnsub) return;
  let prev = useEimStore.getState();
  zustandUnsub = useEimStore.subscribe((state) => {
    // Only push when persistable fields change. Skip lastReport (transient).
    if (
      state.portfolios !== prev.portfolios ||
      state.lessonProgress !== prev.lessonProgress ||
      state.currentLevelTitle !== prev.currentLevelTitle
    ) {
      scheduleWrite();
    }
    prev = state;
  });
}

function unsubscribeFromStore() {
  if (zustandUnsub) {
    zustandUnsub();
    zustandUnsub = null;
  }
}

/** Start syncing for the given uid. Idempotent. */
export async function startEimSync(uid: string) {
  if (currentUid === uid && pulledOnce) return;
  currentUid = uid;
  subscribeToStore();
  if (!pulledOnce) {
    await pullFromFirestore(uid);
    pulledOnce = true;
  }
}

/** Stop on sign-out, flushing any pending write. */
export async function stopEimSync() {
  if (writeTimer) {
    clearTimeout(writeTimer);
    writeTimer = null;
    if (currentUid) await pushToFirestore(currentUid);
  }
  unsubscribeFromStore();
  currentUid = null;
  pulledOnce = false;
}

/** Force an immediate push (page-unload / app-background). */
export async function flushEimSync() {
  if (!currentUid) return;
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = null;
  await pushToFirestore(currentUid);
}

// Auto-start on auth state change so callers don't wire it manually.
try {
  auth.onAuthStateChanged((user) => {
    try {
      if (user && !user.isAnonymous) {
        void startEimSync(user.uid).catch((err) => console.warn('[eimSync] start failed:', err));
      } else {
        void stopEimSync().catch(() => { /* ignore */ });
      }
    } catch (err) {
      console.warn('[eimSync] auth listener error:', err);
    }
  });
} catch (err) {
  console.warn('[eimSync] failed to register auth listener:', err);
}

// Best-effort flush on page unload / visibility hidden.
if (typeof window !== 'undefined') {
  try {
    window.addEventListener('beforeunload', () => {
      void flushEimSync().catch(() => { /* ignore */ });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void flushEimSync().catch(() => { /* ignore */ });
    });
  } catch {
    /* ignore */
  }
}
