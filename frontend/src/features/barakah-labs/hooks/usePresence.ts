import { useEffect, useState } from 'react';
import { useAuthStore } from '@/core/stores/auth.store';
import {
  fetchActiveCount,
  HEARTBEAT_INTERVAL_MS,
  writeHeartbeat,
} from '../services/presenceService';

/**
 * Mounted once at the Barakah root. Writes a heartbeat immediately, then
 * on a 60s interval. Pauses while the tab is hidden (no point burning
 * writes when the user isn't looking).
 */
export function usePresenceHeartbeat(): void {
  const uid = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!uid) return;
    let intervalId: number | null = null;
    let active = true;

    const tick = () => {
      if (!active || document.visibilityState === 'hidden') return;
      void writeHeartbeat(uid).catch(() => {
        /* offline — next tick will retry */
      });
    };

    tick(); // immediate first beat
    intervalId = window.setInterval(tick, HEARTBEAT_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      active = false;
      if (intervalId !== null) window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [uid]);
}

/**
 * Polls the active-count every 60s. Re-fetches when the tab regains focus
 * so users coming back to the page see a fresh number immediately.
 */
export function useActiveCount(): number {
  const [count, setCount] = useState<number>(1);

  useEffect(() => {
    let alive = true;
    const tick = () => {
      void fetchActiveCount().then((n) => {
        if (alive) setCount(n);
      });
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return count;
}
