/**
 * Notifications Store
 * Replaces Flutter's NotificationsCubit with Zustand
 * Manages real-time Firestore subscription, filtering, and CRUD
 */

import { create } from 'zustand';
import type { NotificationType, NotificationsState } from '../types/notification.types';
import {
  subscribeToNotifications,
  markAsRead as markAsReadSvc,
  markAllAsRead as markAllAsReadSvc,
  deleteNotification as deleteNotificationSvc,
  clearAllNotifications as clearAllSvc,
  getCachedNotifications,
  clearCache,
} from '../services/notificationService';
import type { Unsubscribe } from 'firebase/firestore';

interface NotificationStore extends NotificationsState {
  // Actions
  initialize: () => void;
  dispose: () => void;
  setFilter: (filter: NotificationType | null) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

let _unsubscribe: Unsubscribe | null = null;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  selectedFilter: null,
  isLoading: true,
  error: null,

  initialize: () => {
    // Load cached notifications first for instant display
    const cached = getCachedNotifications();
    if (cached.length > 0) {
      set({
        notifications: cached,
        unreadCount: cached.filter((n) => !n.isRead).length,
        isLoading: false,
      });
    }

    // Subscribe to real-time Firestore updates
    _unsubscribe?.();
    try {
      _unsubscribe = subscribeToNotifications(
        (notifications) => {
          const filter = get().selectedFilter;
          const filtered = filter ? notifications.filter((n) => n.type === filter) : notifications;
          set({
            notifications: filtered,
            unreadCount: notifications.length, // all are unread from service
            isLoading: false,
            error: null,
          });
        },
        (error) => {
          set({ error, isLoading: false });
        }
      );
    } catch {
      // Firestore SDK can throw internal assertion errors when the
      // IndexedDB persistence cache is corrupted — fall back gracefully
      console.warn('Notification subscription failed — Firestore cache may be corrupted. Clear site data to fix.');
      set({ isLoading: false, error: null });
    }
  },

  dispose: () => {
    try {
      _unsubscribe?.();
    } catch {
      // Firestore SDK may throw internal assertion errors when unsubscribing
      // during active watch stream processing — safe to swallow
    }
    _unsubscribe = null;
  },

  setFilter: (filter) => {
    set({ selectedFilter: filter });
    // Re-initialize to apply filter
    get().initialize();
  },

  markAsRead: async (id) => {
    try {
      await markAsReadSvc(id);
      // Optimistic update — Firestore listener will reconcile
      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch {
      set({ error: 'Failed to mark notification as read' });
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllAsReadSvc();
      set({ notifications: [], unreadCount: 0 });
    } catch {
      set({ error: 'Failed to mark all as read' });
    }
  },

  deleteNotification: async (id) => {
    try {
      await deleteNotificationSvc(id);
      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch {
      set({ error: 'Failed to delete notification' });
    }
  },

  clearAll: async () => {
    try {
      await clearAllSvc();
      clearCache();
      set({ notifications: [], unreadCount: 0 });
    } catch {
      set({ error: 'Failed to clear notifications' });
    }
  },
}));
