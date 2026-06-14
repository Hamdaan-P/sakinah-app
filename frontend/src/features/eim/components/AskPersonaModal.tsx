/**
 * AskPersonaModal — user-initiated persona Q&A at sim_date (Sprint 4a).
 *
 * Per master plan §6.R + D27 layer (c): the defensive "ask persona"
 * button is always available during idle/paused state. The user can
 * pull persona context manually — they own the moment, not the system.
 *
 * Pre-population: when opened from an event card (via the event's
 * onAskPersona callback), the modal pre-fills `event_context` with the
 * event's headline + context and the question textarea hints at the
 * lens-anchored framing.
 *
 * Privacy: the request body carries persona_id, sim_date, question,
 * optional event_context, optional portfolio_summary string. No user_id,
 * no session_id (the route loads the session for ownership checks).
 */

import { useEffect, useState } from 'react';
import { X, ChatCircleDots } from '@phosphor-icons/react';
import { eimSimService, type AskPersonaResponse } from '../services/eimSim.service';
import type { SimEventCard, SimSession } from '../types/eim.types';

/** The 3 lenses the picker shows. The backend accepts legacy ids too. */
const LENS_OPTIONS: Array<{ id: 'conventional_investor' | 'islamic_finance' | 'compass'; label: string; blurb: string }> = [
  {
    id: 'conventional_investor',
    label: 'Conventional Investor',
    blurb: 'Moat, value, scuttlebutt, indexing — pooled secular schools.',
  },
  {
    id: 'islamic_finance',
    label: 'Islamic Finance',
    blurb: 'AAOIFI-anchored, multi-opinion Shariah lens.',
  },
  {
    id: 'compass',
    label: 'Compass',
    blurb: 'Warm, context-aware personal counsel.',
  },
];

export interface AskPersonaModalProps {
  session: SimSession;
  /** The sim_date the question is anchored at — passed in so the modal
   *  reads from the engine, not from `session.current_sim_date` (which
   *  may lag behind by a step until the next flush). */
  simDate: string;
  /** Optional event card the user is asking about — pre-fills the
   *  context block in the prompt. */
  eventCard?: SimEventCard;
  /** Optional portfolio summary string — server caps to 2000 chars. */
  portfolioSummary?: string;
  /** Optional pre-filled question (e.g. from a Smart Interrupt follow-up). */
  initialQuestion?: string;
  /** Optional pre-filled event_context (e.g. from a Smart Interrupt follow-up).
   *  Takes precedence over `eventCard` derivation when both are supplied. */
  initialContext?: string;
  /** Optional initial lens — defaults to 'compass'. Used by interrupt
   *  follow-ups so the user lands on the same lens that fired the
   *  interrupt rather than always Compass. */
  initialLens?: 'conventional_investor' | 'islamic_finance' | 'compass';
  onClose: () => void;
}

export function AskPersonaModal({
  session,
  simDate,
  eventCard,
  portfolioSummary,
  initialQuestion,
  initialContext,
  initialLens,
  onClose,
}: AskPersonaModalProps) {
  const [personaId, setPersonaId] = useState<typeof LENS_OPTIONS[number]['id']>(initialLens ?? 'compass');
  const [question, setQuestion] = useState<string>(
    initialQuestion
      ?? (eventCard
        ? `As of ${simDate}, how should I think about this event in the context of my portfolio?`
        : ''),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<AskPersonaResponse | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const eventContext = initialContext
    ?? (eventCard
      ? `${eventCard.headline} — ${eventCard.context}`.slice(0, 800)
      : undefined);

  const submit = async () => {
    if (!question.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await eimSimService.askPersona(session.id, {
        persona_id: personaId,
        sim_date: simDate,
        user_question: question.trim(),
        event_context: eventContext,
        portfolio_summary: portfolioSummary,
      });
      setAnswer(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 bg-[rgba(10,14,22,0.85)] flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        role="presentation"
        className="w-full max-w-md rounded-2xl border border-[rgba(212,168,83,0.30)] bg-[#101a2a] p-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold flex items-center gap-1.5">
              <ChatCircleDots size={12} weight="bold" /> Ask a lens
            </div>
            <div className="text-[18px] font-bold text-[#F5E8C7] leading-tight">
              At {simDate}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#7A7363]"
            aria-label="Close"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        {!answer && (
          <>
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-1.5">
              Pick a lens
            </div>
            <div className="space-y-1.5 mb-3">
              {LENS_OPTIONS.map((opt) => {
                const active = personaId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setPersonaId(opt.id)}
                    className={
                      'w-full text-left px-3 py-2 rounded-lg border ' +
                      (active
                        ? 'border-[rgba(212,168,83,0.50)] bg-[rgba(212,168,83,0.10)]'
                        : 'border-[rgba(212,168,83,0.18)] bg-[#0F1724]')
                    }
                  >
                    <div className={'text-[12px] font-bold ' + (active ? 'text-[#F5E8C7]' : 'text-[#D4A853]')}>
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-[#7A7363] leading-snug mt-0.5">
                      {opt.blurb}
                    </div>
                  </button>
                );
              })}
            </div>

            {eventCard && (
              <div className="mb-3 rounded-lg bg-[#0A0E16] border border-[rgba(212,168,83,0.10)] p-2.5">
                <div className="text-[9px] uppercase tracking-widest text-[#5C5749] mb-1">
                  Context
                </div>
                <div className="text-[12px] text-[#F5E8C7] font-semibold leading-snug">
                  {eventCard.headline}
                </div>
                <div className="text-[11px] text-[#7A7363] leading-snug mt-0.5">
                  {eventCard.context}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="ask-persona-q" className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold block mb-1">
                Your question
              </label>
              <textarea
                id="ask-persona-q"
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, 600))}
                placeholder={`What would you like to ask the lens about your portfolio at ${simDate}?`}
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.20)] text-[13px] text-[#F5E8C7] placeholder-[#5C5749] resize-none"
              />
              <div className="text-[10px] text-[#5C5749] text-right mt-0.5">
                {question.length} / 600
              </div>
            </div>

            <div className="text-[10px] text-[#7A7363] leading-relaxed mt-2 mb-3 px-1">
              The lens reasons from the world as it stood on <span className="text-[#D4A853]">{simDate}</span>. It does not know what happened after that date.
            </div>

            {error && (
              <div className="mb-2 px-3 py-2 rounded-lg border border-[rgba(232,67,147,0.30)] bg-[rgba(232,67,147,0.10)] text-[11px] text-[#E84393]">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 h-10 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363]"
              >
                Cancel
              </button>
              <button
                onClick={() => void submit()}
                disabled={submitting || question.trim().length === 0}
                className="flex-1 h-10 rounded-xl text-[12px] font-bold text-[#0A0E16] disabled:opacity-60"
                style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
              >
                {submitting ? 'Thinking…' : 'Ask'}
              </button>
            </div>
          </>
        )}

        {answer && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md border border-[rgba(212,168,83,0.30)] bg-[rgba(212,168,83,0.10)] text-[10px] font-bold uppercase tracking-widest text-[#D4A853]">
                {answer.persona_label}
              </span>
              <span className={
                'px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-widest ' +
                (answer.source === 'llm'
                  ? 'border-[rgba(212,168,83,0.30)] text-[#D4A853]'
                  : 'border-[rgba(232,201,122,0.30)] text-[#E8C97A]')
              }>
                {answer.source === 'llm' ? 'Haiku' : 'Template'}
              </span>
              <span className="text-[10px] text-[#5C5749]">
                · {answer.sim_date}
              </span>
            </div>

            <div className="text-[13px] text-[#F5E8C7] leading-relaxed whitespace-pre-wrap rounded-lg bg-[#0A0E16] border border-[rgba(212,168,83,0.10)] p-3">
              {answer.answer}
            </div>

            <div className="text-[10px] text-[#5C5749] leading-relaxed mt-2 px-1">
              {answer.disclaimer}
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => { setAnswer(null); }}
                className="flex-1 h-10 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363]"
              >
                Ask another
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-10 rounded-xl text-[12px] font-bold text-[#0A0E16]"
                style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AskPersonaModal;
