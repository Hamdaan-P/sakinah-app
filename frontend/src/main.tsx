import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initSentry, SentryErrorBoundary } from './lib/sentry'

// Sentry first — before React mounts, so any render-time error in App is captured.
// No-op if VITE_SENTRY_DSN is unset.
initSentry();

// Capture install prompt BEFORE React mounts (it fires early)
window.__pwaInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__pwaInstallPrompt = e;
  console.log('PWA: beforeinstallprompt captured');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryErrorBoundary
      fallback={({ error, resetError }) => (
        <div role="alert" style={{ padding: 24, fontFamily: 'system-ui' }}>
          <h1>Something went wrong.</h1>
          <p>The error has been reported. Try reloading.</p>
          <button onClick={resetError} type="button">Reload</button>
          {import.meta.env.DEV && <pre>{String(error)}</pre>}
        </div>
      )}
    >
      <App />
    </SentryErrorBoundary>
  </StrictMode>,
)

// Register service worker for PWA + push notifications.
// Check for updates on every app load so new deploys roll out without the
// user having to manually clear site data.
//
// Skip entirely in Capacitor — the native shell does its own update lifecycle
// and registering an SW from the bundled origin can leave a zombie controller
// that causes "clear cache" errors on cold start.
const isCapacitor = typeof (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform === 'function'
  && (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor!.isNativePlatform!();
if (!isCapacitor && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((reg) => {
      console.log('Service Worker registered:', reg.scope);
      reg.update().catch(() => {});
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'activated' && navigator.serviceWorker.controller) {
            // A fresh SW took over mid-session → reload once so the page matches it.
            window.location.reload();
          }
        });
      });
    })
    .catch((err) => console.warn('Service Worker registration failed:', err));
}
