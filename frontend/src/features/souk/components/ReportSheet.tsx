import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, CheckCircle } from '@phosphor-icons/react';
import { reportListing } from '../services/soukService';
import { useReportReasons } from '../services/soukConfigService';
import type { ReportReason } from '../types/souk.types';

interface Props {
  open: boolean;
  listingId: string;
  onClose: () => void;
}

export function ReportSheet({ open, listingId, onClose }: Props) {
  const reasons = useReportReasons();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!reason || busy) return;
    setBusy(true);
    setErr(null);
    try {
      await reportListing(listingId, reason, note || undefined);
      setDone(true);
      setTimeout(() => {
        reset();
        onClose();
      }, 1400);
    } catch {
      setErr("Couldn't submit report — please try again.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setReason(null);
    setNote('');
    setDone(false);
    setErr(null);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
          onClick={() => {
            reset();
            onClose();
          }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#2C3C55] rounded-t-3xl max-h-[85vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-[#2C3C55] px-5 pt-4 pb-3 border-b border-[rgba(215,181,106,0.2)] flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Flag size={18} className="text-rose-400" />
                <h2 className="text-[#EBDCB8] font-bold text-lg">Report listing</h2>
              </div>
              <button
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <X size={20} className="text-[#A7B1C0]" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {done ? (
                <div className="py-8 text-center">
                  <CheckCircle size={48} weight="fill" className="mx-auto text-emerald-400 mb-3" />
                  <h3 className="text-[#EBDCB8] font-semibold">Thank you</h3>
                  <p className="text-[#A7B1C0] text-sm mt-1">Our moderation team will review this listing.</p>
                </div>
              ) : (
                <>
                  <p className="text-[#A7B1C0] text-xs">
                    Help us keep the Souk halal and trustworthy. Reports are reviewed by our moderation team. False reports can affect your own trust score.
                  </p>
                  <div className="space-y-2">
                    {reasons.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setReason(r.id as ReportReason)}
                        className={`w-full text-left p-3 rounded-xl text-sm border transition-colors ${
                          reason === r.id
                            ? 'border-[#D7B56A] bg-[#D7B56A]/10 text-[#EBDCB8]'
                            : 'border-[rgba(215,181,106,0.2)] text-[#D5DDEA] hover:border-[#D7B56A]/40'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note (optional)…"
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-[#1E293A] border border-[rgba(215,181,106,0.2)] text-[#EBDCB8] text-sm placeholder-[#A7B1C0] focus:outline-none focus:border-[#D7B56A]/50 resize-none"
                  />
                  {err && <p className="text-rose-400 text-xs">{err}</p>}
                  <button
                    disabled={!reason || busy}
                    onClick={submit}
                    className="w-full py-3 rounded-xl bg-rose-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-600 transition-colors"
                  >
                    {busy ? 'Submitting…' : 'Submit report'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
