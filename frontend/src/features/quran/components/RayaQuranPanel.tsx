/**
 * RayaQuranPanel
 *
 * In-page side drawer for asking Raya about the currently-focused ayah.
 * Replaces the previous chatbot handoff with an in-context conversation.
 *
 * Governance contract (Workstream 4):
 *   - AiDisclaimerBanner is rendered at the top before the first message.
 *   - Every AI message renders SourceCitationChips for every returned source.
 *   - Low-confidence responses surface LowConfidenceNotice instead of the
 *     bare text — never silently fall back to speculation.
 *   - No emojis, no emotionalised copy.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RayaQuranAyahContext, RayaQuranMessage } from '../types/quran.types';
import {
  askRayaAboutAyah,
  appendRayaHistory,
} from '../services/rayaQuranService';
import { AiDisclaimerBanner } from './governance/AiDisclaimerBanner';
import { SourceCitationChip } from './governance/SourceCitationChip';
import { LowConfidenceNotice } from './governance/LowConfidenceNotice';
import { EscalateToScholarModal } from './governance/EscalateToScholarModal';
import { ScholarlyPerspectivesNotice } from './governance/ScholarlyPerspectivesNotice';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Currently-focused ayah. Drives the context prefix sent to /chat/islamic. */
  context: RayaQuranAyahContext | null;
  /** Optional pre-filled question (used when Concept Search opens Raya in-context). */
  initialQuestion?: string;
  /**
   * Optional opening question that is auto-sent on mount. Used by the
   * Depth FAQs clever loop — tapping a question seeds the conversation
   * so the user lands inside a streaming reply instead of a blank input.
   */
  autoSendSeed?: string;
  className?: string;
}

function makeId(): string {
  return `raya_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function RayaQuranPanel({ open, onClose, context, initialQuestion, autoSendSeed, className }: Props) {
  const [messages, setMessages] = useState<RayaQuranMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [escalation, setEscalation] = useState<{ question: string; answer: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const seedFiredRef = useRef<string | null>(null);

  // Apply initial question once when panel opens.
  useEffect(() => {
    if (open && initialQuestion && messages.length === 0) {
      setInput(initialQuestion);
    }
  }, [open, initialQuestion, messages.length]);

  // Auto-scroll on new message.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const send = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || sending) return;
      const userMsg: RayaQuranMessage = {
        id: makeId(),
        role: 'user',
        content: trimmed,
        citations: [],
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setSending(true);
      try {
        const answer = await askRayaAboutAyah({
          question: trimmed,
          context: context ?? undefined,
        });
        const aiMsg: RayaQuranMessage = {
          id: makeId(),
          role: 'assistant',
          content: answer.text,
          citations: answer.citations,
          createdAt: Date.now(),
          lowConfidence: answer.lowConfidence,
        };
        setMessages((prev) => [...prev, aiMsg]);
        appendRayaHistory({
          id: aiMsg.id,
          verseKey: context?.verseKey,
          question: trimmed,
          answer: answer.text,
          citations: answer.citations,
          lowConfidence: answer.lowConfidence,
          createdAt: aiMsg.createdAt,
        });
      } catch (e) {
        const errMsg: RayaQuranMessage = {
          id: makeId(),
          role: 'assistant',
          content: e instanceof Error ? e.message : 'Could not reach the assistant.',
          citations: [],
          createdAt: Date.now(),
          lowConfidence: true,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setSending(false);
      }
    },
    [context, sending],
  );

  // The "clever loop": if opened with an auto-send seed (Depth FAQ tap),
  // fire that question once so the user lands inside a streaming reply.
  // The ref guards against React strict-mode double-effect firing.
  useEffect(() => {
    if (!open) return;
    if (!autoSendSeed) return;
    if (seedFiredRef.current === autoSendSeed) return;
    if (messages.length > 0) return;
    seedFiredRef.current = autoSendSeed;
    void send(autoSendSeed);
  }, [open, autoSendSeed, messages.length, send]);

  if (!open) return null;

  return (
    <aside
      role="dialog"
      aria-label="Ask Raya about this ayah"
      className={`fixed top-0 right-0 bottom-[calc(4rem_+_env(safe-area-inset-bottom,0px))] md:bottom-0 z-40 flex w-full max-w-md flex-col bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl ${className ?? ''}`}
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Ask Raya</h2>
          {context && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Anchored to {context.surahName ? `${context.surahName} · ` : ''}Quran {context.verseKey}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Raya panel"
          className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ✕
        </button>
      </header>

      {/* Disclaimer */}
      <div className="px-4 pt-3">
        <AiDisclaimerBanner compact />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ask a question grounded in the currently-open ayah. Raya draws only from verified Islamic
            sources; if no source is found, no answer will be given.
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === 'user'
                ? 'flex justify-end'
                : 'flex flex-col gap-2'
            }
          >
            {m.role === 'user' ? (
              <div className="max-w-[85%] rounded-lg bg-primaryTeal text-white px-3 py-2 text-sm">
                {m.content}
              </div>
            ) : m.lowConfidence ? (
              <LowConfidenceNotice
                reason={m.content || undefined}
                suggestion="Try a more specific question, or open the Research workspace to explore the topic across Quran, hadith, and tafsir."
              />
            ) : (
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-100 dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
                  {m.content}
                </div>
                {m.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.citations.map((c, i) => (
                      <SourceCitationChip key={`${m.id}-${i}`} citation={c} />
                    ))}
                  </div>
                )}
                <ScholarlyPerspectivesNotice
                  sources={m.citations.map((c) =>
                    c.kind === 'quran' ? c.surah_name : c.kind === 'hadith' ? c.collection : c.book,
                  )}
                />
                <button
                  type="button"
                  onClick={() => {
                    // Find the preceding user message to include in the escalation payload.
                    const idx = messages.findIndex((x) => x.id === m.id);
                    const prevUser = idx > 0 ? messages[idx - 1] : null;
                    setEscalation({
                      question: prevUser?.role === 'user' ? prevUser.content : '',
                      answer: m.content,
                    });
                  }}
                  className="text-[11px] text-slate-500 hover:text-primaryTeal underline-offset-2 hover:underline"
                >
                  Confirm with a scholar
                </button>
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-1 px-3 py-2 text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:240ms]" />
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        className="border-t border-slate-200 dark:border-slate-800 p-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={2}
          placeholder="Ask about this ayah…"
          aria-label="Question to Raya"
          className="flex-1 resize-none rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryTeal/30"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-md bg-primaryTeal px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ask
        </button>
      </form>

      <EscalateToScholarModal
        open={escalation !== null}
        onClose={() => setEscalation(null)}
        question={escalation?.question}
        aiAnswer={escalation?.answer}
      />
    </aside>
  );
}
