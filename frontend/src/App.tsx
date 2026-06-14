/**
 * App Root Component
 * Entry point for the ZaryahPlus web application
 */

import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { AppProviders } from '@/app/providers';
import { OfflineBanner } from '@/components/OfflineBanner';
import { OverflowDebugOverlay } from '@/components/dev/OverflowDebugOverlay';
import { initNativeBridge } from '@/lib/native';
// Side-effect: registers an auth listener that syncs Quran progress to Firestore.
import '@/features/quran/services/quranSyncService';
// Side-effect: per-item Firestore sync for the Quran Workspace (notes /
// reflections / reminders / documents).
import '@/features/quran/services/workspaceSyncService';
// Same pattern for EIM (portfolios + lesson progress + persona level).
import '@/features/eim/services/eimSyncService';
import { captureIncomingReferral } from '@/features/halaqah/services/halaqahShareService';
import { useAuthStore } from '@/core/stores/auth.store';
import { useWalletStore } from '@/features/wallet/stores/wallet.store';
import { rescheduleAll, registerPushReceiver } from '@/lib/notificationScheduler';

function App() {
  const userId = useAuthStore((s) => s.user?.id);
  const startLiveBalance = useWalletStore((s) => s.startLiveBalance);
  const refreshBalance = useWalletStore((s) => s.refreshBalance);

  // Defensive wrapper — any single init failure must not brick the whole app
  // on cold start. Each side-effect is wrapped in its own try/catch so one
  // bad plugin (e.g. LocalNotifications missing on a specific Android build)
  // doesn't take down the React tree.
  const safe = <T,>(label: string, fn: () => T): T | undefined => {
    try { return fn(); } catch (err) { console.warn(`[App] init failed [${label}]:`, err); return undefined; }
  };

  useEffect(() => {
    safe('initNativeBridge', () => initNativeBridge());
    safe('captureIncomingReferral', () => captureIncomingReferral());
  }, []);

  // Live DNZ balance: REST fetch once on sign-in for fast initial paint, then
  // a Firestore onSnapshot listener keeps the balance current as the backend
  // mints/awards rewards. Unsubscribes on sign-out / user change.
  useEffect(() => {
    if (!userId) return;
    safe('refreshBalance', () => void refreshBalance());
    const unsub = safe('startLiveBalance', () => startLiveBalance());
    return () => { try { unsub?.(); } catch { /* ignore */ } };
  }, [userId, refreshBalance, startLiveBalance]);

  // Schedule local reminders + register for FCM push. Both swallow errors
  // (e.g. missing google-services.json on Android) so they never crash boot.
  useEffect(() => {
    if (!userId) return;
    safe('rescheduleAll', () => void rescheduleAll());
    safe('registerPushReceiver', () => void registerPushReceiver(userId));
  }, [userId]);

  // Re-arm reminders whenever the app returns to foreground.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        safe('rescheduleAll(visibility)', () => void rescheduleAll());
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return (
    <AppProviders>
      <RouterProvider router={router} />
      <OfflineBanner />
      <OverflowDebugOverlay />
    </AppProviders>
  );
}

export default App;
