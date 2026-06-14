/**
 * CircleInvitesBanner
 *
 * A collapsible banner shown above the Hifz Circles list when the current
 * user has pending circle invites. Realtime via Firestore.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CaretDown, CaretUp, EnvelopeSimple, Check, X, Spinner } from '@phosphor-icons/react';
import { auth } from '@/config/firebase.config';
import {
  subscribeMyInvites,
  acceptInvite,
  declineInvite,
  type CircleInvite,
} from '../services/hifzCirclesService';

export function CircleInvitesBanner() {
  const navigate = useNavigate();
  const [invites, setInvites] = useState<CircleInvite[]>([]);
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const me = auth.currentUser?.uid;
    if (!me) return;
    const unsub = subscribeMyInvites(me, setInvites);
    return () => unsub();
  }, []);

  if (invites.length === 0) return null;

  const handleAccept = async (inv: CircleInvite) => {
    setBusy(inv.id);
    try {
      const c = await acceptInvite(inv);
      navigate(`/quran/hifz/circles/${c.id}`);
    } catch {
      // ignore — invite stays in list
    } finally {
      setBusy(null);
    }
  };

  const handleDecline = async (inv: CircleInvite) => {
    setBusy(inv.id);
    try {
      await declineInvite(inv.id);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="px-4 pt-3">
      <div className="rounded-xl border border-[#D4A853]/30 bg-gradient-to-r from-[#D4A853]/12 to-transparent overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 p-3 text-left"
        >
          <span className="relative flex w-8 h-8 items-center justify-center rounded-full bg-[#D4A853]/20">
            <EnvelopeSimple size={16} weight="fill" className="text-[#D4A853]" />
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {invites.length}
            </span>
          </span>
          <span className="flex-1">
            <p className="text-sm font-semibold text-white">
              {invites.length} circle invite{invites.length === 1 ? '' : 's'}
            </p>
            <p className="text-[11px] text-white/55">Tap to {open ? 'hide' : 'view'}</p>
          </span>
          {open ? <CaretUp size={14} className="text-white/50" /> : <CaretDown size={14} className="text-white/50" />}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-1.5">
                {invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0A0E16]/60 border border-white/8"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{inv.circleName}</p>
                      <p className="text-[11px] text-white/55 truncate">from {inv.fromName}</p>
                    </div>
                    <button
                      onClick={() => handleDecline(inv)}
                      disabled={busy === inv.id}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/15 text-rose-300"
                      aria-label="Decline"
                    >
                      <X size={14} weight="bold" />
                    </button>
                    <button
                      onClick={() => handleAccept(inv)}
                      disabled={busy === inv.id}
                      className="px-3 py-1.5 rounded-lg bg-[#D4A853] text-[#0A0E16] text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                    >
                      {busy === inv.id ? <Spinner size={12} className="animate-spin" /> : <Check size={12} weight="bold" />}
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
