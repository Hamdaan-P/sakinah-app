/**
 * Raya Assistant Sheet
 *
 * Inline AI assistant for the workspace editor — opens from the Ask Raya
 * toolbar button, **never navigates away**. Auto-injects the note's linked
 * ayah(s) as context so Raya stays anchored to what the user is reading.
 *
 * Behaves like a Chrome-extension panel: portal-rendered, sticks to the
 * right on wide screens, slides up as a sheet on mobile, dismissed with
 * ESC or backdrop click.
 *
 * Backend reachability: when `/chat/islamic` is unreachable, we render a
 * calm offline state instead of a stack trace.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperPlaneTilt, Sparkle, X, Trash, Warning } from '@phosphor-icons/react';
import { askRayaAboutAyah, type RayaQuranAnswer } from '../services/rayaQuranService';
import type { AyahPreview } from '../services/workspaceService';

interface Props {
  open: boolean;
  /** Verse keys currently linked to the note (used as default context). */
  linkedAyahs: string[];
  ayahPreviews: Record<string, AyahPreview>;
  onClose: () => void;
}

type Msg =
  | { role: 'user'; text: string }
  | {
      role: 'raya';
      text: string;
      citations?: RayaQuranAnswer['citations'];
      lowConfidence?: boolean;
    }
  | { role: 'error'; text: string };

const SUGGESTIONS = [
  'What is this ayah teaching me?',
  'How do I live this out in my day?',
  'What is the asbāb al-nuzūl (context of revelation)?',
  'Connect this to an authentic hadith.',
  'What did Ibn Kathīr say about this verse?',
];

export function RayaAssistantSheet({ open, linkedAyahs, ayahPreviews, onClose }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const primaryAyah = linkedAyahs[0];
  const primaryPreview = primaryAyah ? ayahPreviews[primaryAyah] : undefined;

  // Reset history when reopened from scratch — but keep the conversation
  // within a single open session so users can ask follow-ups.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, pending]);

  const contextLabel = useMemo(() => {
    if (!primaryAyah) return null;
    if (primaryPreview) return `${primaryPreview.surahName} · ${primaryAyah}`;
    return `Ayah ${primaryAyah}`;
  }, [primaryAyah, primaryPreview]);

  async function send(question: string) {
    const q = question.trim();
    if (!q || pending) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setDraft('');
    setPending(true);
    try {
      const answer = await askRayaAboutAyah({
        question: q,
        context: primaryAyah
          ? {
              verseKey: primaryAyah,
              surahName: primaryPreview?.surahName,
              ayahTranslation: primaryPreview?.translation,
            }
          : undefined,
      });
      setMessages((m) => [
        ...m,
        {
          role: 'raya',
          text: answer.text,
          citations: answer.citations,
          lowConfidence: answer.lowConfidence,
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessages((m) => [
        ...m,
        {
          role: 'error',
          text:
            "Raya can't reach the answer service right now. " +
            (msg.includes('Failed to fetch') || msg.includes('NetworkError')
              ? 'Your backend may not be running locally. Start it and try again.'
              : msg),
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(draft);
    }
  }

  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center sm:items-stretch sm:justify-end p-3 sm:p-4"
        >
          <motion.div
            initial={{ x: 40, opacity: 0, scale: 0.97 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 30, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-[min(720px,calc(100vh-24px))] sm:h-full bg-[#0A0E16] border border-[#3ABFAD]/25 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-lg bg-[#3ABFAD]/15 border border-[#3ABFAD]/30 flex items-center justify-center">
                <Sparkle size={15} weight="fill" className="text-[#3ABFAD]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#3ABFAD]">
                  Raya · in-context
                </p>
                <h2 className="text-base font-bold text-white truncate">
                  {contextLabel ?? 'Ask about this note'}
                </h2>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/55 hover:text-white"
                  aria-label="Clear conversation"
                  title="Clear conversation"
                >
                  <Trash size={15} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70"
                aria-label="Close Raya"
              >
                <X size={18} />
              </button>
            </div>

            {/* Context strip — shows the ayah Raya is anchored to */}
            {primaryPreview && (
              <div className="mx-4 mt-3 rounded-lg border border-[#D4A853]/15 bg-[#D4A853]/[0.04] px-3 py-2">
                <p className="text-[9.5px] uppercase tracking-wider font-semibold text-[#D4A853]/80">
                  Context · {primaryAyah}
                </p>
                <p
                  className="mt-1.5 text-[13px] leading-[1.85] text-right text-white/90 line-clamp-2"
                  style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}
                >
                  {primaryPreview.arabic}
                </p>
                {primaryPreview.translation && (
                  <p className="mt-1 text-[10.5px] text-white/55 italic line-clamp-2">
                    "{primaryPreview.translation}"
                  </p>
                )}
              </div>
            )}

            {/* Conversation */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-[12px] text-white/55 leading-relaxed">
                    Ask Raya about this ayah. Answers stay anchored to the
                    verse and cite the books they draw from.
                  </p>
                  <div className="space-y-1.5">
                    <p className="text-[9.5px] uppercase tracking-wider font-semibold text-white/40">
                      Try
                    </p>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => void send(s)}
                        disabled={pending}
                        className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/75 hover:text-white hover:border-[#3ABFAD]/30 transition-colors disabled:opacity-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <Bubble key={i} message={m} />
              ))}

              {pending && (
                <div className="flex items-center gap-2 text-[11px] text-white/45">
                  <span className="inline-flex w-1.5 h-1.5 rounded-full bg-[#3ABFAD] animate-pulse" />
                  Raya is consulting the books…
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-white/[0.06] px-3 py-2.5 flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                placeholder={
                  primaryAyah
                    ? `Ask Raya about ${primaryAyah}…`
                    : 'Ask Raya a question…'
                }
                rows={1}
                disabled={pending}
                className="flex-1 max-h-32 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[#3ABFAD]/40 resize-none disabled:opacity-50"
              />
              <button
                onClick={() => void send(draft)}
                disabled={pending || !draft.trim()}
                aria-label="Send to Raya"
                className="w-9 h-9 rounded-lg bg-[#3ABFAD]/15 border border-[#3ABFAD]/30 text-[#3ABFAD] hover:bg-[#3ABFAD]/25 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <PaperPlaneTilt size={15} weight="fill" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Bubble({ message }: { message: Msg }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#D4A853]/15 border border-[#D4A853]/25 px-3 py-2 text-[13px] text-white">
          {message.text}
        </div>
      </div>
    );
  }
  if (message.role === 'error') {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-400/[0.05] px-3 py-2.5">
        <Warning size={15} className="text-rose-300 mt-0.5 shrink-0" />
        <p className="text-[12px] text-rose-200 leading-relaxed">{message.text}</p>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] space-y-2">
        <div className="rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-[13px] text-white/90 whitespace-pre-wrap leading-relaxed">
          {message.text}
        </div>
        {message.lowConfidence && (
          <div className="text-[10.5px] text-amber-300/80 px-1">
            Raya wasn't highly confident on this — verify with a scholar before
            acting on it.
          </div>
        )}
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {message.citations.slice(0, 4).map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-white/65 bg-white/[0.04] border border-white/[0.08]"
              >
                {citationLabel(c)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function citationLabel(c: RayaQuranAnswer['citations'][number]): string {
  switch (c.kind) {
    case 'book':
      return c.author ? `${c.book} — ${c.author}` : c.book;
    case 'quran':
      return `Quran ${c.verse_key}`;
    case 'hadith':
      return `${c.collection} ${c.number}`;
    default:
      return 'source';
  }
}

export default RayaAssistantSheet;
