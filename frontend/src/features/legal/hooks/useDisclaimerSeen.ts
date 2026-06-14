/**
 * Hook: track whether a user has seen/accepted a specific disclaimer
 * Uses localStorage with the project's zaryah_* key convention
 */

import { useState, useCallback } from 'react';

const KEY_PREFIX = 'zaryah_disclaimer_seen_';

export function useDisclaimerSeen(id: string): [boolean, () => void] {
  const key = KEY_PREFIX + id;

  const [seen, setSeen] = useState(() => {
    try {
      return localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  });

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
