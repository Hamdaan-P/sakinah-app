import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration - SAME PROJECT AS FLUTTER APP (zaryahplus-3c85b)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Dev-mode guard: when the api key is missing or a placeholder stub,
// skip Firebase entirely and export inert stand-ins. Lets the UI mount
// for backend-only work (Quran reader, deep dive, x-ray, depth FAQs)
// without real Firebase credentials. Paste real values into .env.local
// to re-enable auth, Firestore, storage, push.
const isStubConfig =
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey.includes('stub') ||
  firebaseConfig.apiKey === 'AIzaSyDEV-stub-key-not-real-replace-me-00000';

if (isStubConfig) {
  // Surface this loudly so it's not mistaken for a deeper bug.
   
  console.warn(
    '[Firebase] Running in stub mode — VITE_FIREBASE_API_KEY is missing or a placeholder. ' +
      'Auth, Firestore sync, Storage, and Push are disabled. ' +
      'Paste real values from Firebase Console → Project Settings → Web app into frontend/.env.local to enable.',
  );
}

// Minimal stand-in objects that satisfy the most common call shapes so
// that imports don't crash. Anything that actually hits Firebase will
// throw lazily with a clear "[stub]" message.
function makeStub<T>(name: string): T {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      // Auth's onAuthStateChanged callback shape — fire once with null user,
      // return an unsubscribe noop so listeners initialise without crashing.
      if (prop === 'onAuthStateChanged' || prop === 'onIdTokenChanged') {
        return (callback: (u: unknown) => void) => {
          queueMicrotask(() => callback(null));
          return () => {};
        };
      }
      if (prop === 'currentUser') return null;
      if (prop === 'app') return {} as FirebaseApp;
      if (prop === 'then' || prop === Symbol.toPrimitive) return undefined; // not a thenable
      return () => {
        throw new Error(`[Firebase stub:${name}] called .${String(prop)} but Firebase is not configured.`);
      };
    },
  };
  return new Proxy({}, handler) as T;
}

// Initialize Firebase (or a stub app)
export const app: FirebaseApp = isStubConfig
  ? makeStub<FirebaseApp>('app')
  : initializeApp(firebaseConfig);

// P2.14 — Firebase App Check (reCAPTCHA v3). Init BEFORE other Firebase
// services so requests carry App Check tokens from the very first call.
//
//  - Skipped in DEV unless VITE_FIREBASE_APP_CHECK_DEBUG=true (dev rebuilds
//    every save = burning reCAPTCHA assessments). Use a debug token via the
//    Firebase Console → App Check → Apps → ⋮ menu instead for local testing.
//  - Skipped if VITE_FIREBASE_APP_CHECK_SITE_KEY is unset so the app still
//    builds for previews / first-time setup before the key is provisioned.
//  - isTokenAutoRefreshEnabled lets the SDK silently refresh App Check
//    tokens before they expire — without this, every backend request after
//    1h of inactivity would get a fresh-token request added to its critical
//    path.
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY;
export let appCheck: AppCheck | null = null;
if (!isStubConfig && appCheckSiteKey && (import.meta.env.PROD || import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG === 'true')) {
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    // Non-fatal — services in "Unenforced" mode tolerate missing tokens.
    // Logging here surfaces config issues during the rollout window before
    // we flip to Enforced.
    console.warn('[App Check] init failed:', err);
  }
}

// Initialize Firebase services — each guarded so a single failure can't
// crash the whole module.
function safeInit<T>(label: string, factory: () => T): T {
  try {
    return factory();
  } catch (err) {
    console.warn(`[Firebase] ${label} init failed, using stub:`, err);
    return makeStub<T>(label);
  }
}

export const auth: Auth = isStubConfig ? makeStub<Auth>('auth') : safeInit('auth', () => getAuth(app));

// Emulator wiring for E2E tests (A10) and local dev. Gated by
// VITE_USE_AUTH_EMULATOR=true; enables Auth + Firestore + Storage emulators.
// All three together give Playwright tests a real auth+data flow without
// touching production. Dev-only — production builds never reach this block.
const useEmulators =
  !isStubConfig && import.meta.env.DEV && import.meta.env.VITE_USE_AUTH_EMULATOR === 'true';

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  console.log('Firebase Auth: Connected to emulator on port 9099');
}

export const db: Firestore = isStubConfig
  ? makeStub<Firestore>('db')
  : safeInit('db', () => initializeFirestore(app, { ignoreUndefinedProperties: true }));
if (useEmulators) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  console.log('Firestore: Connected to emulator on port 8080');
}

export const storage: FirebaseStorage = isStubConfig
  ? makeStub<FirebaseStorage>('storage')
  : safeInit('storage', () => getStorage(app));
if (useEmulators) {
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  console.log('Storage: Connected to emulator on port 9199');
}

export const functions: Functions = isStubConfig
  ? makeStub<Functions>('functions')
  : safeInit('functions', () => getFunctions(app));

// Initialize messaging with support check (messaging requires HTTPS or localhost)
let messagingInstance: ReturnType<typeof getMessaging> | null = null;

if (!isStubConfig) {
  isSupported().then((supported) => {
    if (supported) {
      try {
        messagingInstance = getMessaging(app);
      } catch (err) {
        console.warn('Firebase Messaging init failed:', err);
      }
    }
  }).catch((error) => {
    console.warn('Firebase Messaging not supported:', error);
  });
}

export const messaging = messagingInstance;

// Export a helper to check if messaging is available
export const isMessagingAvailable = () => messagingInstance !== null;

// Export the stub flag so consumers (workspace sync, auth listeners) can
// short-circuit instead of calling into the proxies.
export const isFirebaseStubbed = isStubConfig;
