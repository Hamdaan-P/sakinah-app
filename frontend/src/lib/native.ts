/**
 * Capacitor native-app integration.
 *
 * The same frontend bundle serves both web visitors and the native mobile
 * WebView. All calls here detect the Capacitor runtime first and no-op in
 * a regular browser — so this is safe to ship on the live site.
 *
 * What this sets up when running inside the native app:
 *   - Status bar: white icons on a dark theme
 *   - Splash screen: hide once React has rendered
 *   - Hardware back button (Android): pop history, or prompt exit at root
 *   - Network status: dispatch a global `zp:offline` / `zp:online` event
 *     the UI can listen to for the offline banner
 *   - App state (background/foreground): for future analytics hooks
 */

// Runtime check without importing Capacitor when in a regular browser —
// keeps the web bundle lean and avoids SSR-style issues.
function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;
  // Capacitor injects this global in the WebView.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export function isNative(): boolean {
  return isNativeApp();
}

export function getPlatform(): 'web' | 'ios' | 'android' {
  if (typeof window === 'undefined') return 'web';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor;
  const p = cap?.getPlatform?.() ?? 'web';
  return p === 'ios' || p === 'android' ? p : 'web';
}

/**
 * Call once from App.tsx useEffect(..., []).
 * Idempotent — safe to call multiple times.
 */
let initialized = false;
export async function initNativeBridge(): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (!isNativeApp()) return;

  // Dynamic imports so the web bundle doesn't pull these in.
  try {
    const [{ StatusBar, Style }, { SplashScreen }, { App }, { Network }] =
      await Promise.all([
        import('@capacitor/status-bar'),
        import('@capacitor/splash-screen'),
        import('@capacitor/app'),
        import('@capacitor/network'),
      ]);

    // --- Status bar ---
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    if (getPlatform() === 'android') {
      StatusBar.setBackgroundColor({ color: '#000000' }).catch(() => {});
      // Force overlay mode at runtime. Android 15+ enforces edge-to-edge so the
      // WebView extends behind the status bar regardless of capacitor.config's
      // `overlaysWebView: false`. By explicitly setting overlay=true the
      // StatusBar plugin populates `env(safe-area-inset-top)` for the WebView,
      // which the body padding and individual fixed overlays use to push their
      // content below the notch / camera punch-hole.
      StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
    }

    // --- Splash screen: hide once we're here, React has clearly mounted ---
    // Small delay so first paint looks smooth instead of flashing.
    setTimeout(() => {
      SplashScreen.hide().catch(() => {});
    }, 250);

    // --- Android hardware back button ---
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        // At root of nav stack — prompt exit instead of dead-buttoning.
        // We dispatch an event so the app can show its own confirm UI.
        window.dispatchEvent(new CustomEvent('zp:backExit'));
      }
    });

    // --- Network status (for offline banner) ---
    const status = await Network.getStatus();
    if (!status.connected) {
      window.dispatchEvent(new CustomEvent('zp:offline'));
    }
    Network.addListener('networkStatusChange', (s) => {
      window.dispatchEvent(
        new CustomEvent(s.connected ? 'zp:online' : 'zp:offline')
      );
    });

    // --- App state (future analytics / refresh-on-foreground hooks) ---
    App.addListener('appStateChange', (s) => {
      window.dispatchEvent(
        new CustomEvent('zp:appStateChange', { detail: s })
      );
    });
  } catch (err) {
    // Plugin missing / native crash — don't block the app.
     
    console.warn('[native] bridge init failed:', err);
  }
}
