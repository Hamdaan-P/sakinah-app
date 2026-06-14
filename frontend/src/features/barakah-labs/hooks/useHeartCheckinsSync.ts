import { useEffect } from 'react';
import { useAuthStore } from '@/core/stores/auth.store';
import { useBarakahFlow } from '../stores/barakah-flow.store';
import { subscribeToHeartCheckins } from '../services/heartCheckinService';

/**
 * Subscribes to the user's heart_checkins collection and mirrors it into
 * the flow-store `heartHistory`. Mount once at the Barakah root so every
 * screen that reads heartHistory (s01, s19) stays in sync.
 */
export function useHeartCheckinsSync(): void {
  const uid = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToHeartCheckins(uid, (rows) => {
      useBarakahFlow.setState({
        heartHistory: rows.map((r) => ({ day: r.day, heart: r.heart })),
      });
    });
    return () => unsub();
  }, [uid]);
}
