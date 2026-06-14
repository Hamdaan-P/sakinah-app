/**
 * ScholarEscalateSheet — asks the scholar team a fiqh question about a
 * listing. Distinct from ReportSheet (which is for abuse / prohibited
 * content); this is for honest "is this halal-fit?" questions.
 *
 * Spec §10 calls this "scholar escalation for sensitive categories."
 */

import { useState } from 'react';
import { Books, X } from '@phosphor-icons/react';
import { escalateToScholar } from '../services/soukService';

interface Props {
  open: boolean;
  listingId: string;
  listingTitle?: string;
  onClose: () => void;
}

const REASON_OPTIONS = [
  { value: 'financing_model', label: 'Financing model — riba / gharar / qarḍ ḥasan?' },
  { value: 'service_type', label: 'Service type — does it cross a sharʿi line?' },
  { value: 'product_category', label: 'Product category — is the item itself permissible?' },
  { value: 'pricing', label: 'Pricing — fairness, hidden fees, dual-currency arbitrage' },
  { value: 'other', label: 'Other — explain in the question below' },
] as const;

export function ScholarEscalateSheet({ open, listingId, listingTitle, onClose }: Props) {
  const [reason, setReason] = useState<string>(REASON_OPTIONS[0].value);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!open) return null;

  async function submit() {
    if (question.trim().length < 8) {
      setError('Please write at least one sentence so the scholar team can review.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await escalateToScholar(listingId, reason, question.trim());
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your question');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="souk-escalate-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
      />
      <div className="relative w-full sm:max-w-md rounded-2xl bg-[#1E293A] border border-[rgba(215,181,106,0.25)] shadow-2xl p-5 space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#D7B56A]/15 flex items-center justify-center shrink-0">
              <Books size={18} className="text-[#D7B56A]" weight="fill" />
            </div>
            <div>
              <h2 id="souk-escalate-title" className="text-[#EBDCB8] font-semibold">
                Ask the scholar team
              </h2>
              <p className="text-[#A7B1C0] text-xs">
                For honest fiqh questions about a listing — not for abuse reports.
              </p>
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

        {done ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1">
            <p className="text-[#EBDCB8] text-sm font-semibold">Sent to the scholar team</p>
            <p className="text-[#A7B1C0] text-xs leading-relaxed">
              You'll get a reply via notifications. Reviews typically take 1-3 business days.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-3 py-1.5 rounded-lg bg-[#D7B56A] text-[#1E293A] font-bold text-xs"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {listingTitle && (
              <p className="text-[#A7B1C0] text-xs">
                About: <span className="text-[#EBDCB8] font-medium">{listingTitle}</span>
              </p>
            )}

            <fieldset className="space-y-1.5">
              <legend className="text-[10px] uppercase tracking-wider text-[#A7B1C0]">
                What's the concern?
              </legend>
              {REASON_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  htmlFor={`escalate-${o.value}`}
                  aria-label={o.label}
                  className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs cursor-pointer ${
                    reason === o.value
                      ? 'border-[#D7B56A]/60 bg-[#D7B56A]/10'
                      : 'border-[rgba(215,181,106,0.15)] bg-[#2C3C55]/40'
                  }`}
                >
                  <input
                    id={`escalate-${o.value}`}
                    type="radio"
                    name="souk-escalate-reason"
                    checked={reason === o.value}
                    onChange={() => setReason(o.value)}
                    className="mt-0.5"
                  />
                  <span className="text-[#D5DDEA]">{o.label}</span>
                </label>
              ))}
            </fieldset>

            <div className="space-y-1">
              <label
                htmlFor="souk-escalate-question"
                className="block text-[10px] uppercase tracking-wider text-[#A7B1C0]"
              >
                Your question
              </label>
              <textarea
                id="souk-escalate-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="What specifically would you like the scholar team to check?"
                className="w-full rounded-lg bg-[#2C3C55]/60 border border-[rgba(215,181,106,0.20)] text-[#EBDCB8] text-sm px-3 py-2 placeholder-[#56627A]"
              />
            </div>

            {error && <p className="text-rose-400 text-xs">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
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
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D7B56A] to-[#E7CF8C] text-[#1E293A] font-bold text-xs disabled:opacity-40"
              >
                {submitting ? 'Sending…' : 'Send to scholars'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
