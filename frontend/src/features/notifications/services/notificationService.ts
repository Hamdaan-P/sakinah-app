/**
 * Notification Service
 * Mirrors Flutter's notifications_cubit.dart Firestore operations
 * and notification_storage_service.dart local caching
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '@/config/firebase.config';
import { parseNotification, type NotificationItem } from '../types/notification.types';

const COLLECTION = 'notifications';
const CACHE_KEY = 'cached_notifications';
const CACHE_FETCH_KEY = 'last_notifications_fetch';

// --- Firestore Operations ---

/** Subscribe to real-time notification updates (unread only, limit 50) */
export function subscribeToNotifications(
  onData: (notifications: NotificationItem[]) => void,
  onError: (error: string) => void
): Unsubscribe {
  const user = auth.currentUser;
  if (!user) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const all = snapshot.docs.map((d) => parseNotification(d.id, d.data()));
      const unread = all.filter((n) => !n.isRead);
      // Cache locally
      cacheNotifications(unread);
      onData(unread);
    },
    (error) => {
      onError(`Failed to load notifications: ${error.message}`);
    }
  );
}

/** Mark a single notification as read */
export async function markAsRead(notificationId: string): Promise<void> {
  if (!auth.currentUser) return;
  await updateDoc(doc(db, COLLECTION, notificationId), { read: true });
}

/** Mark a single notification as unread */
export async function markAsUnread(notificationId: string): Promise<void> {
  if (!auth.currentUser) return;
  await updateDoc(doc(db, COLLECTION, notificationId), { read: false });
}

/** Mark all user notifications as read (batch) */
export async function markAllAsRead(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, COLLECTION), where('userId', '==', user.uid));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((d) => {
    if (!(d.data().read as boolean)) {
      batch.update(d.ref, { read: true });
    }
  });

  await batch.commit();
}

/** Delete a single notification */
export async function deleteNotification(notificationId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, notificationId));
}

/** Clear all notifications for current user (batch delete) */
export async function clearAllNotifications(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, COLLECTION), where('userId', '==', user.uid));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// --- Local Cache (mirrors NotificationStorageService) ---

function cacheNotifications(notifications: NotificationItem[]): void {
  try {
    const serialized = notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    }));
    localStorage.setItem(CACHE_KEY, JSON.stringify(serialized));
    localStorage.setItem(CACHE_FETCH_KEY, Date.now().toString());
  } catch {
    // localStorage may be full or unavailable
  }
}

export function getCachedNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
    return parsed.map((item) => ({
      ...(item as unknown as NotificationItem),
      createdAt: new Date(item.createdAt as string),
    }));
  } catch {
    return [];
  }
}

export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_FETCH_KEY);
}
