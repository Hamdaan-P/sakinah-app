/**
 * LegacyCreditModal — one-time restoration popup for early DNZ investors.
 *
 * Rendered globally whenever the signed-in user has a matching pending
 * credit in Firestore (`pending_dinar_credits/{emailLower}`). Shows the
 * amount we're holding and a Claim button. On successful claim, fires
 * RewardCelebration (confetti) and redirects to the wallet page.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchPendingLegacyCredit,
  claimLegacyCredit,
} from '../services/walletService';
import { useAuthStore } from '@/core/stores/auth.store';
import { useWalletStore } from '../stores/wallet.store';
import { RewardCelebration } from './RewardCelebration';
import { LegacyCreditDialog } from './legacy-credit/LegacyCreditDialog';

type Phase = 'idle' | 'checking' | 'prompt' | 'claiming' | 'celebrating' | 'done' | 'error';

export function LegacyCreditModal() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const userId = useAuthStore((s) => s.user?.id);
  const userEmail = useAuthStore((s) => s.user?.email);
  const refreshBalance = useWalletStore((s) => s.refreshBalance);
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('idle');
  const [amount, setAmount] = useState(0);
  const [newBalance, setNewBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Check for a pending credit whenever we have a fresh authenticated session.
  useEffect(() => {
    if (!isAuthenticated || !userId || !userEmail) return;
    let cancelled = false;

    setPhase('checking');
    fetchPendingLegacyCredit()
      .then((res) => {
        if (cancelled) return;
        if (res.has_pending && res.amount > 0) {
          setAmount(res.amount);
          setPhase('prompt');
        } else {
          setPhase('idle');
        }
      })
      .catch(() => {
        if (!cancelled) setPhase('idle');
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userId, userEmail]);

  const handleClaim = useCallback(async () => {
    setPhase('claiming');
    setError(null);
    try {
      const result = await claimLegacyCredit();
      if (!result.claimed) {
        setError(result.reason || 'Could not claim right now');
        setPhase('error');
        return;
      }
      setAmount(result.amount);
      setNewBalance(result.new_balance);
      await refreshBalance();
      setPhase('celebrating');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setPhase('error');
    }
  }, [refreshBalance]);

  const handleCelebrationDone = useCallback(() => {
    setPhase('done');
    navigate('/wallet');
  }, [navigate]);

  if (phase === 'celebrating') {
    return (
      <RewardCelebration
        amount={amount}
        reason="Legacy balance restored"
        newBalance={newBalance}
        onComplete={handleCelebrationDone}
      />
    );
  }

  const showModal = phase === 'prompt' || phase === 'claiming' || phase === 'error';

  return (
    <LegacyCreditDialog
      open={showModal}
      amount={amount}
      claiming={phase === 'claiming'}
      hasError={phase === 'error'}
      error={error}
      onClaim={handleClaim}
    />
  );
}
