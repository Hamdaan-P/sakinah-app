/**
 * App Providers
 * Wraps the application with necessary context providers
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/core/stores/auth.store';
import { useWalletStore } from '@/features/wallet/stores/wallet.store';
import { DnzRewardToast } from '@/features/wallet/components/DnzRewardToast';
import { SplashScreen } from '@/features/splash/SplashScreen';

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </QueryClientProvider>
  );
}

/**
 * Auth Initializer
 * Initializes the auth store on app load, shows splash screen
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initialize();
      setReady(true);
    };
    init();
  }, [initialize]);

  // Claim daily login DNZ + refresh balance after auth is ready
  useEffect(() => {
    if (ready && isInitialized) {
      const user = useAuthStore.getState().user;
      if (user?.id) {
        const wallet = useWalletStore.getState();
        wallet.claimLogin();
        wallet.refreshBalance();
      }
    }
  }, [ready, isInitialized]);

  const handleSplashFinished = useCallback(() => {
    setSplashDone(true);
  }, []);

  // Show splash while auth is initializing
  if (!ready && !isInitialized) {
    return <SplashScreen onFinished={handleSplashFinished} />;
  }

  // Auth is ready but splash animation hasn't finished
  if (!splashDone) {
    return <SplashScreen onFinished={handleSplashFinished} />;
  }

  return (
    <>
      {children}
      <DnzRewardToast />
    </>
  );
}
