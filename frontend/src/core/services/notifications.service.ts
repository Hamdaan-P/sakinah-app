/**
 * Push Notification Service
 * Handles FCM token registration and permission requests.
 */

import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase.config';

// VAPID key from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

/**
 * Request notification permission and register FCM token.
 * Returns the token if successful, null otherwise.
 */
export async function requestNotificationPermission(userId: string): Promise<string | null> {
  try {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Wait for service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Dynamic import to avoid issues when messaging isn't supported
    const { getMessaging, isSupported } = await import('firebase/messaging');
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase Messaging not supported');
      return null;
    }

    const { app } = await import('@/config/firebase.config');
    const messaging = getMessaging(app);

    if (!VAPID_KEY) {
      console.warn('VAPID key not configured — push notifications disabled');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      // Save token to Firestore
      await setDoc(doc(db, 'fcm_tokens', userId), {
        token,
        userId,
        platform: 'web',
        userAgent: navigator.userAgent,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });

      console.log('FCM token registered:', token.substring(0, 20) + '...');

      // Listen for foreground messages
      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {};
        if (title) {
          new Notification(title, {
            body: body || '',
            icon: '/favicon.png',
          });
        }
      });

      return token;
    }

    return null;
  } catch (error) {
    console.error('Failed to setup notifications:', error);
    return null;
  }
}

/**
 * Check if notifications are enabled for this user.
 */
export function getNotificationStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
