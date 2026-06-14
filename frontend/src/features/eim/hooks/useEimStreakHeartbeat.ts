/**
 * useEimStreakHeartbeat — fire-and-forget EIM activity heartbeat on mount.
 *
 * Idempotent server-side within a calendar day, so calling from every EIM page
 * mount is safe and cheap. We additionally guard with a per-day localStorage
 * flag so unnecessary network round-trips are skipped after the first
 * heartbeat of the day.
 *
 * When the heartbeat is the one that crosses the 100-day milestone, the
 * response carries an `award` — we mirror that into the global wallet store
 * so the existing reward-celebration overlay fires automatically.
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/core/stores/auth.store';
import { useWalletStore } from '@/features/wallet/stores/wallet.store';
import { eimTrack } from '../analytics';
import { eimService } from '../services/eim.service';

const TODAY_KEY = (uid: string) =>
  `eim_streak_heartbeat:${uid}:${new Date().toISOString().slice(0, 10)}`;

export function useEimStreakHeartbeat() {
  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (!user?.id) return;

    // Per-day client throttle: skip if we already heartbeat-ed for this user
    // today. The server is the authority — this just spares the network call.
    const key = TODAY_KEY(user.id);
    try {
      if (localStorage.getItem(key) === '1') return;
    } catch {
      // localStorage unavailable — fall through and call the API.
    }

    (async () => {
      try {
        const state = await eimService.streakHeartbeat(user.id);
        try {
          localStorage.setItem(key, '1');
        } catch {
          // ignore quota / private-mode failures
        }
        // If this heartbeat crossed the 100-day milestone, the response
        // includes an award echo — mirror into the wallet store so the
        // existing celebration overlay fires.
        if (state.award && state.award.awarded) {
          eimTrack('eim_streak_milestone_reached');
          useWalletStore.setState({
            balance: state.award.new_balance,
            lastAward: {
              awarded: state.award.awarded,
              amount: state.award.amount,
              new_balance: state.award.new_balance,
              reason: state.award.reason,
              daily_total: 0,  // milestone bypasses daily counter
              daily_remaining: 0,
            },
          });
          void useWalletStore.getState().refreshBalance();
        }
      } catch (e) {
        // Streak failures are non-fatal — never block the user's flow.
        console.warn('[EIM] Streak heartbeat failed:', e);
      }
    })();
  }, []);
}
