/**
 * LegacyCreditDialog — presentational dialog body for the legacy-restore
 * flow. All state and side effects live in LegacyCreditModal; this file is
 * pure JSX so the parent stays focused on phase orchestration.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ShieldCheck, Info } from '@phosphor-icons/react';

interface Props {
  open: boolean;
  amount: number;
  claiming: boolean;
  hasError: boolean;
  error: string | null;
  onClaim: () => void;
}

export function LegacyCreditDialog({ open, amount, claiming, hasError, error, onClaim }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="legacy-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md"
          />
          <motion.div
            key="legacy-content"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md my-4 bg-gradient-to-b from-[#0F141F] to-[#0A0E16] rounded-2xl border border-[rgba(212,168,83,0.3)] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative px-6 pt-8 pb-4 text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#D4A853]/15 blur-3xl rounded-full" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', damping: 12 }}
                  className="relative mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #D4A853, #E8C97A)',
                    boxShadow: '0 0 40px rgba(212,168,83,0.5)',
                  }}
                >
                  <Coins size={40} weight="fill" className="text-[#0A0E16]" />
                </motion.div>
                <h2 className="relative text-xl font-bold text-[#F5E8C7]">
                  Your Dinarz are safe with us
                </h2>
                <p className="relative mt-2 text-sm text-[#7A7363] leading-relaxed">
                  Assalamu alaikum. We've been holding the Dinarz you bought from us,
                  waiting for you to come back.
                </p>
              </div>

              {/* Amount card */}
              <div className="mx-6 mt-2 mb-5 p-5 rounded-xl bg-gradient-to-br from-[#D4A853]/15 to-[#0F141F]/40 border border-[#D4A853]/30 text-center">
                <p className="text-xs uppercase tracking-widest text-[#D4A853]/80 mb-2">
                  Pending balance
                </p>
                <p className="text-4xl font-bold text-[#F5E8C7] tabular-nums">
                  {amount.toLocaleString()}
                </p>
                <p className="text-xs text-[#7A7363] mt-2">DNZ ready to be added to your wallet</p>
              </div>

              {/* Trust line */}
              <div className="mx-6 mb-3 flex items-start gap-2 p-3 rounded-lg bg-[#0A0E16]/60 border border-[rgba(212,168,83,0.12)]">
                <ShieldCheck size={18} className="text-[#D4A853] shrink-0 mt-0.5" />
                <p className="text-xs text-[#7A7363] leading-relaxed">
                  Tap Claim and we'll credit this straight into your wallet. No catch, no fees —
                  this is your money.
                </p>
              </div>

              {/* Cash-out notice */}
              <div className="mx-6 mb-5 flex items-start gap-2 p-3 rounded-lg bg-[#D4A853]/10 border border-[#D4A853]/25">
                <Info size={18} className="text-[#D4A853] shrink-0 mt-0.5" />
                <p className="text-xs text-[#F5E8C7] leading-relaxed">
                  <span className="font-semibold">Note:</span> These Dinarz aren't cashable yet —
                  you'll be able to withdraw them later once cash-out opens. For now they sit
                  safely in your wallet.
                </p>
              </div>

              {/* Error */}
              {hasError && error && (
                <div className="mx-6 mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-xs text-red-200 text-center">
                  {error}
                </div>
              )}

              {/* Claim button */}
              <div className="px-6 pb-6">
                <button
                  onClick={onClaim}
                  disabled={claiming}
                  className="w-full py-4 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-wait"
                  style={{
                    background: 'linear-gradient(135deg, #D4A853, #E8C97A)',
                    color: '#0A0E16',
                    boxShadow: '0 4px 20px rgba(212,168,83,0.35)',
                  }}
                >
                  {claiming
                    ? 'Claiming…'
                    : hasError
                      ? 'Try again'
                      : `Claim ${amount.toLocaleString()} DNZ`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
