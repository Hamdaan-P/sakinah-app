/**
 * Native runtime permission helpers.
 *
 * Each helper prefers the relevant Capacitor plugin when running inside the
 * native app, and falls back to the equivalent web API otherwise. Returns
 * `{ granted, denied, prompt? }` so callers can branch consistently.
 *
 * Mirrors the dynamic-import pattern from lib/native.ts so the web bundle
 * doesn't pay for the plugin code path.
 */

import { isNative } from './native';

export interface PermissionResult {
  granted: boolean;
  denied: boolean;
  prompt?: boolean;
}

const GRANTED: PermissionResult = { granted: true, denied: false };
const DENIED: PermissionResult = { granted: false, denied: true };
const PROMPT: PermissionResult = { granted: false, denied: false, prompt: true };

// ---- Microphone -----------------------------------------------------------

export async function requestMicrophone(): Promise<PermissionResult> {
  if (isNative()) {
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      const status = await SpeechRecognition.checkPermissions();
      if (status.speechRecognition === 'granted') return GRANTED;
      const req = await SpeechRecognition.requestPermissions();
      return req.speechRecognition === 'granted' ? GRANTED : DENIED;
    } catch {
      // fall through to web
    }
  }
  if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      return GRANTED;
    } catch {
      return DENIED;
    }
  }
  return PROMPT;
}

// ---- Geolocation ----------------------------------------------------------

export interface LocationCoords {
  lat: number;
  lng: number;
  accuracy?: number;
}

export async function getCurrentLocation(): Promise<LocationCoords | null> {
  if (isNative()) {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const perms = await Geolocation.checkPermissions();
      if (perms.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') return null;
      }
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10_000,
      });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
    } catch {
      // fall through to web
    }
  }
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10_000 },
      );
    });
  }
  return null;
}

// ---- Notifications --------------------------------------------------------

export async function requestNotifications(): Promise<PermissionResult> {
  if (isNative()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return GRANTED;
      const req = await LocalNotifications.requestPermissions();
      return req.display === 'granted' ? GRANTED : DENIED;
    } catch {
      // fall through to web
    }
  }
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') return GRANTED;
    if (Notification.permission === 'denied') return DENIED;
    const result = await Notification.requestPermission();
    return result === 'granted' ? GRANTED : DENIED;
  }
  return PROMPT;
}
