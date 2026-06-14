import { useCallback, useEffect, useState } from 'react';

const KEY = 'quran_mushaf_recent_v1';
const MAX = 20;

function load(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 604);
  } catch {
    return [];
  }
}

function save(list: number[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function useMushafRecent() {
  const [recents, setRecents] = useState<number[]>(load);

  const push = useCallback((page: number) => {
    setRecents((prev) => {
      const next = [page, ...prev.filter((p) => p !== page)].slice(0, MAX);
      save(next);
      return next;
    });
  }, []);

  // Re-read on mount in case another tab changed it.
  useEffect(() => {
    setRecents(load());
  }, []);

  return { recents, push };
}
