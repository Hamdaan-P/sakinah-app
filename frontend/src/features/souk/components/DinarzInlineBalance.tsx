import { useEffect, useState } from 'react';
import { Coins } from '@phosphor-icons/react';
import { useAuthStore, selectUser } from '@/core/stores/auth.store';
import { fetchDNZBalance } from '@/features/wallet/services/walletService';

interface Props {
  className?: string;
}

/**
 * Lightweight DNZ balance chip used inside the Souk create-listing flow and
 * detail pages. Best-effort — silently hides if the wallet endpoint isn't
 * reachable or the user isn't authenticated.
 */
export function DinarzInlineBalance({ className = '' }: Props) {
  const user = useAuthStore(selectUser);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    fetchDNZBalance(user.id)
      .then((b) => {
        if (!cancelled) setTotal(b.total);
      })
      .catch(() => {
        if (!cancelled) setTotal(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (total == null) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D7B56A]/10 border border-[#D7B56A]/30 text-[#D7B56A] text-xs font-semibold ${className}`}
      title="Your Dinarz balance"
    >
      <Coins size={13} weight="fill" />
      {total.toLocaleString()} DNZ
    </span>
  );
}
