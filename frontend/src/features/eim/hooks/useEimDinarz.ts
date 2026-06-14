/**
 * useEimDinarz — small hook that wraps the EIM Dinarz claim endpoint and
 * keeps the global wallet store in sync.
 *
 * EIM rewards plug into the same site-wide DNZ engine as daily login,
 * chat rewards, mining, and Barka Labs niyaamat — single source of truth.
 * The shared wallet UI (sidebar pill, wallet page, reward-celebration overlay)
 * automatically reflects EIM earnings — we just set `lastAward` on the
 * global wallet store after a successful claim and the existing celebration
 * component fires.
 *
 * Idempotency is enforced server-side via the `dnz_claims/{claim_key}`
 * subcollection — a second call for the same event returns awarded=false
 * with reason "Already claimed", so it's safe to call from useEffect /
 * event handlers without bookkeeping on the client.
 */

import { useCallback } from 'react';
import { useAuthStore } from '@/core/stores/auth.store';
import { useWalletStore } from '@/features/wallet/stores/wallet.store';
import { eimService } from '../services/eim.service';
import type { DinarzClaimKind, DinarzClaimResponse } from '../types/eim.types';

export function useEimDinarz() {
  const claim = useCallback(
    async (kind: DinarzClaimKind, refId?: string): Promise<DinarzClaimResponse | null> => {
      const user = useAuthStore.getState().user;
      if (!user?.id) return null;
      try {
        const resp = await eimService.claimDinarz({
          user_id: user.id,
          kind,
          ref_id: refId,
        });
        // On a successful new award, mirror into the global wallet store so
        // the existing wallet pill + celebration overlay update without
        // needing a separate refetch.
        if (resp.awarded) {
          useWalletStore.setState({
            balance: resp.new_balance,
            todayEarned: resp.daily_total,
            todayRemaining: resp.daily_remaining,
            lastAward: {
              awarded: resp.awarded,
              amount: resp.amount,
              new_balance: resp.new_balance,
              reason: resp.reason,
              daily_total: resp.daily_total,
              daily_remaining: resp.daily_remaining,
            },
          });
          // Best-effort: kick a refresh so any other derived state (lifetime
          // earned, daily breakdown) catches up too. Non-blocking.
          void useWalletStore.getState().refreshBalance();
        }
        return resp;
      } catch (e) {
        // Earning failures are non-fatal — never block the user's flow.
        console.warn('[EIM] Dinarz claim failed:', kind, refId, e);
        return null;
      }
    },
    [],
  );

  return { claim };
}
