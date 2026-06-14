/**
 * Hook: track whether the user has completed the app walkthrough
 * Per-user (keyed by user ID) so new accounts always get the tour
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/core/stores/auth.store';

const KEY_PREFIX = 'zaryah_walkthrough_seen_';

export function useWalkthroughSeen(): [boolean, () => void] {
  const userId = useAuthStore((s) => s.user?.id);
  const key = KEY_PREFIX + (userId ?? 'anon');

  const [seen, setSeen] = useState(() => {
    try {
      return localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  });

  // Re-read when userId becomes available (key changes)
  useEffect(() => {
    try {
      setSeen(localStorage.getItem(key) === '1');
    } catch {
      // localStorage unavailable
    }
  }, [key]);

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(key, '1');
    } catch {
      // localStorage unavailable
    }
    setSeen(true);
  }, [key]);

  return [seen, markSeen];
}
