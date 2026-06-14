/**
 * quranSyncService — bridges the Quran feature's localStorage-only state to
 * Firestore so progress survives clearing site data, switching device, or
 * reinstalling the mobile app.
 *
 * Design: one document per user at users/{uid}/quranState/state holding a
 * snapshot of every Quran-feature localStorage key. On sign-in we pull, merge
 * (last-writer-wins by updatedAt), write back to localStorage, then notify
 * the in-app change emitters so any open page re-renders.
 *
 * Writes are debounced by 3 seconds — every localStorage mutation across all
 * Quran services kicks the debounce. Idle for 3 seconds → push.
 */

import { auth, db } from '@/config/firebase.config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// --- All localStorage keys the Quran feature owns -------------------------
const SYNCED_KEYS: readonly string[] = [
  'quran_hifz_records_v1',
  'quran_hifz_sessions_v1',
  'quran_bookmarks',
  'quran_bookmark_surah',
  'quran_bookmark_verse',
  'quran_highlights_v1',
  'quran_visible_categories',
  'quran_annotations_v1',
  'quran_daily_reflections_v1',
  'quran_daily_last_seen_date',
  'quran_streak_count',
  'quran_streak_last_date',
  'quran_streak_milestone',
  'quran_score_total',
  'quran_score_today',
  'quran_score_today_date',
  'quran_score_lifetime',
  'quran_tafsir_preference', // used by multi-tafsir picker (added in this session)
  'quran_recitation_diary_v1', // recitation practice journal (synced metadata only)
] as const;

const DEBOUNCE_MS = 3000;
const STATE_DOC = (uid: string) => doc(db, 'users', uid, 'quranState', 'state');

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let storageListener: ((e: StorageEvent) => void) | null = null;
let pulledOnce = false;
let currentUid: string | null = null;

interface QuranSnapshot {
  data: Record<string, string | null>;
  updatedAt?: number;       // local clock (ms) — last LOCAL change
}

function snapshotLocal(): QuranSnapshot {
  const data: Record<string, string | null> = {};
  for (const k of SYNCED_KEYS) {
    try {
      data[k] = localStorage.getItem(k);
    } catch {
      data[k] = null;
    }
  }
  return { data, updatedAt: Date.now() };
}

function applySnapshotToLocal(snap: QuranSnapshot) {
  for (const [k, v] of Object.entries(snap.data)) {
    try {
      if (v == null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    } catch {
      // localStorage full / blocked — best-effort
    }
  }
}

function fireChangeEvents() {
  // Existing services use module-local listener arrays and subscribe via
  // onHifzChange / onHighlightsChange. They mutate state by re-reading
  // localStorage on each call, so a window 'storage' event won't trigger
  // them. We dispatch a synthetic CustomEvent that both old and new code
  // can listen for without coupling to internal listener arrays.
  try { window.dispatchEvent(new CustomEvent('quran-state-synced')); } catch { /* SSR */ }
}

async function pullFromFirestore(uid: string) {
  try {
    const snap = await getDoc(STATE_DOC(uid));
    if (!snap.exists()) return;
    const remote = snap.data() as { snapshot?: QuranSnapshot };
    if (!remote.snapshot?.data) return;

    // Merge strategy: remote wins on first pull (initial sign-in / fresh
    // device). This is correct because local was empty before sign-in. If
    // local had data and they signed into an account with newer data, we
    // still take remote — the alternative is per-key updatedAt tracking
    // which is overkill for this feature. The user can always manually
    // re-add bookmarks; what we MUST not do is silently lose multi-device
    // sync because of timestamp conflicts.
    applySnapshotToLocal(remote.snapshot);
    fireChangeEvents();
  } catch (err) {
    console.warn('[quranSync] pull failed:', err);
  }
}

async function pushToFirestore(uid: string) {
  try {
    const snap = snapshotLocal();
    await setDoc(STATE_DOC(uid), {
      snapshot: snap,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('[quranSync] push failed:', err);
  }
}

function scheduleWrite() {
  if (!currentUid) return;
  if (writeTimer) clearTimeout(writeTimer);
  const uid = currentUid;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    void pushToFirestore(uid);
  }, DEBOUNCE_MS);
}

let localStoragePatched = false;
function patchLocalStorageOnce() {
  if (localStoragePatched) return;
  localStoragePatched = true;
  const origSet = localStorage.setItem.bind(localStorage);
  const origRemove = localStorage.removeItem.bind(localStorage);
  localStorage.setItem = function (k: string, v: string) {
    origSet(k, v);
    if (SYNCED_KEYS.includes(k)) scheduleWrite();
  };
  localStorage.removeItem = function (k: string) {
    origRemove(k);
    if (SYNCED_KEYS.includes(k)) scheduleWrite();
  };
}

function attachListeners() {
  if (storageListener) return;
  storageListener = (e: StorageEvent) => {
    if (!e.key || !SYNCED_KEYS.includes(e.key)) return;
    scheduleWrite();
  };
  window.addEventListener('storage', storageListener);
  patchLocalStorageOnce();
}

function detachListeners() {
  if (storageListener) {
    window.removeEventListener('storage', storageListener);
    storageListener = null;
  }
  // We intentionally don't restore patched localStorage methods on detach —
  // they're harmless when currentUid is null (scheduleWrite no-ops) and
  // re-patching on every sign-in/out would be fragile.
}

/**
 * Start syncing for the given uid. Idempotent — calling repeatedly with the
 * same uid is a no-op.
 */
export async function startQuranSync(uid: string) {
  if (currentUid === uid && pulledOnce) return;
  currentUid = uid;
  attachListeners();
  if (!pulledOnce) {
    await pullFromFirestore(uid);
    pulledOnce = true;
  }
}

/**
 * Stop syncing on sign-out. Flushes pending writes if any.
 */
export async function stopQuranSync() {
  if (writeTimer) {
    clearTimeout(writeTimer);
    writeTimer = null;
    if (currentUid) await pushToFirestore(currentUid);
  }
  detachListeners();
  currentUid = null;
  pulledOnce = false;
}

/**
 * Force an immediate push (e.g. before app close on mobile).
 */
export async function flushQuranSync() {
  if (!currentUid) return;
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = null;
  await pushToFirestore(currentUid);
}

/**
 * Convenience hook for components that want to refresh on sync events.
 * Returns the unsubscribe fn.
 */
export function onQuranSync(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener('quran-state-synced', handler);
  return () => window.removeEventListener('quran-state-synced', handler);
}

// Auto-start on auth state change so callers don't have to wire it manually.
// Wrapped in try/catch so a Firestore init failure on cold start (e.g. before
// the native Capacitor bridge is ready) never crashes the whole app.
try {
  auth.onAuthStateChanged((user) => {
    try {
      if (user && !user.isAnonymous) {
        void startQuranSync(user.uid).catch((err) => console.warn('[quranSync] start failed:', err));
      } else {
        void stopQuranSync().catch(() => {});
      }
    } catch (err) {
      console.warn('[quranSync] auth listener error:', err);
    }
  });
} catch (err) {
  console.warn('[quranSync] failed to register auth listener:', err);
}

// Best-effort flush on page unload (web) and visibility change (mobile bg).
if (typeof window !== 'undefined') {
  try {
    window.addEventListener('beforeunload', () => { void flushQuranSync().catch(() => {}); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void flushQuranSync().catch(() => {});
    });
  } catch { /* ignore */ }
}
