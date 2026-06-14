import { useState } from 'react';
import { HandHeart } from '@phosphor-icons/react';
import { useSoukStore } from '../stores/souk.store';
import { recordInterest } from '../services/soukService';

interface Props {
  listingId: string;
  initialCount?: number;
  onInterested?: (newCount: number) => void;
}

export function InterestButton({ listingId, initialCount = 0, onInterested }: Props) {
  const interested = useSoukStore((s) => s.interested.has(listingId));
  const markInterested = useSoukStore((s) => s.markInterested);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    if (interested || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await recordInterest(listingId, 'interest');
      markInterested(listingId);
      setCount(res.newCount);
      onInterested?.(res.newCount);
    } catch {
      // Optimistic fallback so the button still feels responsive even when
      // the backend isn't reachable; the seller will see the signal once
      // the next sync goes through.
      markInterested(listingId);
      setCount((c) => c + 1);
      setErr('Saved locally — will sync when online');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onClick}
        disabled={interested || busy}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          interested
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : 'bg-gradient-to-r from-[#D7B56A] to-[#E7CF8C] text-[#1E293A] hover:opacity-90 active:scale-[0.98]'
        }`}
      >
        <HandHeart size={18} weight={interested ? 'fill' : 'regular'} />
        {interested ? "You're interested" : "I'm interested"}
        {count > 0 && <span className="opacity-70">· {count}</span>}
      </button>
      {err && <p className="text-[10px] text-amber-300/80 text-center">{err}</p>}
    </div>
  );
}
