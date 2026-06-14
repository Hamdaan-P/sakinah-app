/**
 * PayWithDinarzSheet — confirm-and-pay modal for listings priced in DNZ.
 *
 * The actual transfer is atomic on the server (engine.transfer in
 * dnz_engine.py). This UI just collects an optional note + quantity and
 * shows the resulting receipt.
 */

import { useState } from 'react';
import { Coins, X, CheckCircle, ArrowRight } from '@phosphor-icons/react';
import { payListingDnz, type PayResponse } from '../services/soukService';
import type { Listing } from '../types/souk.types';

interface Props {
  open: boolean;
  listing: Listing;
  onClose: () => void;
  onSuccess?: (r: PayResponse) => void;
}

export function PayWithDinarzSheet({ open, listing, onClose, onSuccess }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PayResponse | null>(null);

  if (!open) return null;

  const unit = listing.price.amount ?? 0;
  const total = unit * quantity;
  const canSubmit = listing.price.acceptsDinarz && unit > 0 && quantity > 0;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await payListingDnz(listing.id, {
        quantity,
        note: note.trim() || undefined,
      });
      setReceipt(r);
      onSuccess?.(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="souk-pay-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm cursor-default"
      />
      <div className="relative w-full sm:max-w-md rounded-2xl bg-[#1E293A] border border-[#D7B56A]/30 shadow-2xl p-5 space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D7B56A] to-amber-700 flex items-center justify-center shrink-0">
              <Coins size={18} className="text-[#1E293A]" weight="fill" />
            </div>
            <div>
              <h2 id="souk-pay-title" className="text-[#EBDCB8] font-semibold">
                Pay with Dinarz
              </h2>
              <p className="text-[#A7B1C0] text-xs truncate max-w-[260px]">{listing.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-[#A7B1C0] hover:text-[#EBDCB8]"
          >
            <X size={18} />
          </button>
        </header>

        {receipt ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} weight="fill" className="text-emerald-400" />
              <p className="text-[#EBDCB8] font-semibold">Payment sent</p>
            </div>
            <p className="text-[#D5DDEA] text-sm">
              {receipt.amount.toLocaleString()} DNZ sent to the seller.
            </p>
            <p className="text-[#A7B1C0] text-xs">
              New balance: {receipt.senderBalance.toLocaleString()} DNZ
            </p>
            <p className="text-[#56627A] text-[10px] font-mono break-all">
              Receipt: {receipt.transferId}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-4 py-2 rounded-lg bg-[#D7B56A] text-[#1E293A] font-bold text-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-[rgba(215,181,106,0.18)] bg-[#2C3C55]/40 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A7B1C0]">Unit price</span>
                <span className="text-[#EBDCB8] font-semibold">
                  {unit.toLocaleString()} DNZ
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A7B1C0]">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-md bg-[#1E293A] border border-[rgba(215,181,106,0.20)] text-[#D7B56A]"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="text-[#EBDCB8] font-semibold w-8 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(999, q + 1))}
                    className="w-7 h-7 rounded-md bg-[#1E293A] border border-[rgba(215,181,106,0.20)] text-[#D7B56A]"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="border-t border-[rgba(215,181,106,0.15)] pt-2 flex items-center justify-between">
                <span className="text-[#A7B1C0] text-sm">Total</span>
                <span className="text-[#D7B56A] font-bold text-base">
                  {total.toLocaleString()} DNZ
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="souk-pay-note" className="text-[10px] uppercase tracking-wider text-[#A7B1C0]">
                Note to seller (optional)
              </label>
              <textarea
                id="souk-pay-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Delivery address, special requests…"
                className="w-full rounded-lg bg-[#2C3C55]/60 border border-[rgba(215,181,106,0.20)] text-[#EBDCB8] text-sm px-3 py-2 placeholder-[#56627A]"
              />
            </div>

            <p className="text-[#A7B1C0] text-[10px] leading-relaxed">
              Dinarz move from your wallet to the seller's instantly. No refunds are
              automated — contact the seller directly if anything goes wrong.
            </p>

            {error && <p className="text-rose-400 text-xs">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-lg text-[#A7B1C0] text-xs hover:text-[#EBDCB8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit || submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#D7B56A] to-[#E7CF8C] text-[#1E293A] font-bold text-xs disabled:opacity-40"
              >
                {submitting ? 'Sending…' : `Pay ${total.toLocaleString()} DNZ`}
                {!submitting && <ArrowRight size={12} weight="bold" />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
