import { useEffect, useState } from 'react';

/**
 * Shows a slim banner at the bottom of the screen when the device is offline.
 * Works in both the native app (via `zp:offline`/`zp:online` events dispatched
 * from `lib/native.ts`) and in regular browsers (via `navigator.onLine`).
 *
 * Required by both stores: store reviewers test with airplane mode, and a
 * blank error page is a common rejection reason.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' && !navigator.onLine
  );

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);

    // Browser events
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    // Native events (dispatched by lib/native.ts)
    window.addEventListener('zp:offline', goOffline);
    window.addEventListener('zp:online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('zp:offline', goOffline);
      window.removeEventListener('zp:online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 9999,
        background: '#111',
        color: '#fff',
        padding: '10px 16px',
        fontSize: '14px',
        textAlign: 'center',
        borderTop: '1px solid #333',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.4)',
      }}
    >
      You're offline. Some features may not work until you reconnect.
    </div>
  );
}
