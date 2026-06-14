/**
 * workspaceSyncService — Firestore sync for the Quran Workspace.
 *
 * Per-item documents at `users/{uid}/quranWorkspace/{itemId}`.
 *
 * Flow:
 *  1. Local mutations in workspaceService.ts call markDirty(id, op) and
 *     dispatch 'quran-workspace-dirty'.
 *  2. This service debounces 2s and then flushes every dirty id in a single
 *     Firestore batch (writeBatch). Deletes are issued as deleteDoc.
 *  3. onSnapshot listens to the collection; on remote change we merge into
 *     local using last-write-wins by `updatedAt`.
 *  4. First-sync migration: if Firestore is empty AND local has items, upload
 *     all local items (one-time per user/device).
 *
 * Offline behavior: dirty ids persist in localStorage (`quran_workspace_dirty`),
 * so a refresh while offline doesn't lose pending writes. Firestore's own SDK
 * also queues writes when offline, but we keep our own dirty set so the
 * post-reconnect flush is explicit and observable.
 */

import { auth, db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  _applyRemoteDelete,
  _applyRemoteItem,
  _clearDirty,
  _readDirty,
  getItem,
  getItems,
  type WorkspaceItem,
} from './workspaceService';

const DEBOUNCE_MS = 2000;
const MIGRATION_FLAG_KEY = 'quran_workspace_migrated_v1';

const collectionRef = (uid: string) => collection(db, 'users', uid, 'quranWorkspace');
const docRef = (uid: string, id: string) => doc(db, 'users', uid, 'quranWorkspace', id);

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let listener: (() => void) | null = null;
let snapshotUnsub: Unsubscribe | null = null;
let currentUid: string | null = null;

function scheduleFlush() {
  if (!currentUid) return;
  if (writeTimer) clearTimeout(writeTimer);
  const uid = currentUid;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    void flush(uid);
  }, DEBOUNCE_MS);
}

async function flush(uid: string) {
  const dirty = _readDirty();
  const ids = Object.keys(dirty);
  if (ids.length === 0) return;

  try {
    const batch = writeBatch(db);
    const handled: string[] = [];
    for (const id of ids) {
      const op = dirty[id];
      if (op === 'delete') {
        batch.delete(docRef(uid, id));
        handled.push(id);
      } else {
        const item = getItem(id);
        if (!item) continue;
        batch.set(docRef(uid, id), {
          ...item,
          serverUpdatedAt: serverTimestamp(),
        });
        handled.push(id);
      }
    }
    if (handled.length > 0) {
      await batch.commit();
      _clearDirty(handled);
    }
  } catch (err) {
    console.warn('[workspaceSync] flush failed:', err);
  }
}

async function migrateIfNeeded(uid: string) {
  if (localStorage.getItem(MIGRATION_FLAG_KEY) === '1') return;
  try {
    const remoteSnap = await getDocs(collectionRef(uid));
    const localItems = getItems('all');
    if (remoteSnap.empty && localItems.length > 0) {
      const batch = writeBatch(db);
      for (const item of localItems) {
        batch.set(docRef(uid, item.id), {
          ...item,
          serverUpdatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }
    localStorage.setItem(MIGRATION_FLAG_KEY, '1');
  } catch (err) {
    console.warn('[workspaceSync] migration failed:', err);
  }
}

function attachSnapshot(uid: string) {
  if (snapshotUnsub) return;
  snapshotUnsub = onSnapshot(
    collectionRef(uid),
    (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          _applyRemoteDelete(change.doc.id);
        } else {
          const raw = change.doc.data();
          const item: WorkspaceItem = {
            id: change.doc.id,
            type: raw.type,
            title: raw.title ?? 'Untitled',
            body: raw.body ?? '',
            linkedAyahs: Array.isArray(raw.linkedAyahs) ? raw.linkedAyahs : [],
            ayahPreviews: raw.ayahPreviews,
            tags: Array.isArray(raw.tags) ? raw.tags : [],
            reminderAt: typeof raw.reminderAt === 'number' ? raw.reminderAt : undefined,
            reminderChannel: raw.reminderChannel,
            createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
            updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
          };
          _applyRemoteItem(item);
        }
      });
      try { window.dispatchEvent(new CustomEvent('quran-workspace-synced')); } catch { /* SSR */ }
    },
    (err) => {
      console.warn('[workspaceSync] snapshot error:', err);
    },
  );
}

function detachSnapshot() {
  if (snapshotUnsub) {
    snapshotUnsub();
    snapshotUnsub = null;
  }
}

function attachDirtyListener() {
  if (listener) return;
  listener = () => scheduleFlush();
  window.addEventListener('quran-workspace-dirty', listener);
}

function detachDirtyListener() {
  if (listener) {
    window.removeEventListener('quran-workspace-dirty', listener);
    listener = null;
  }
}

export async function startWorkspaceSync(uid: string) {
  if (currentUid === uid) return;
  currentUid = uid;
  attachDirtyListener();
  attachSnapshot(uid);
  await migrateIfNeeded(uid);
  // Flush any leftover dirty entries from before the sign-in.
  if (Object.keys(_readDirty()).length > 0) scheduleFlush();
}

export async function stopWorkspaceSync() {
  if (writeTimer) {
    clearTimeout(writeTimer);
    writeTimer = null;
    if (currentUid) await flush(currentUid);
  }
  detachSnapshot();
  detachDirtyListener();
  currentUid = null;
}

export async function flushWorkspaceSync() {
  if (!currentUid) return;
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = null;
  await flush(currentUid);
}

export function onWorkspaceSync(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener('quran-workspace-synced', handler);
  return () => window.removeEventListener('quran-workspace-synced', handler);
}

// Auto-start on auth change (same pattern as quranSyncService).
try {
  auth.onAuthStateChanged((user) => {
    try {
      if (user && !user.isAnonymous) {
        void startWorkspaceSync(user.uid).catch((err) =>
          console.warn('[workspaceSync] start failed:', err),
        );
      } else {
        void stopWorkspaceSync().catch(() => {});
      }
    } catch (err) {
      console.warn('[workspaceSync] auth listener error:', err);
    }
  });
} catch (err) {
  console.warn('[workspaceSync] failed to register auth listener:', err);
}

if (typeof window !== 'undefined') {
  try {
    window.addEventListener('beforeunload', () => {
      void flushWorkspaceSync().catch(() => {});
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void flushWorkspaceSync().catch(() => {});
    });
  } catch {
    /* ignore */
  }
}
