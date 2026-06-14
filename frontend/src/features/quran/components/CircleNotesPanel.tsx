/**
 * CircleNotesPanel
 *
 * Real-time list of saved insights for a circle. Pinned items first,
 * then newest. Members can add manual notes; AI-generated notes show
 * with a tinted icon. Authors can pin/delete their own.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PushPin, PushPinSlash, Trash, NotePencil, PaperPlaneTilt, Spinner } from '@phosphor-icons/react';
import { auth } from '@/config/firebase.config';
import {
  subscribeToNotes,
  addNote,
  togglePinNote,
  deleteNote,
  type CircleNote,
  type NoteType,
} from '../services/hifzCirclesService';
import { CommunityOversightNotice } from './governance/CommunityOversightNotice';
import { ReportContentButton } from './governance/ReportContentButton';

interface Props {
  circleId: string;
}

const TYPE_META: Record<NoteType, { icon: string; label: string; tint: string }> = {
  manual: { icon: '📝', label: 'Note', tint: '#D4A853' },
  'raya-summary': { icon: '🤖', label: 'Raya summary', tint: '#4FB892' },
  'raya-prompt': { icon: '💭', label: 'Reflection', tint: '#B891E8' },
  'raya-plan': { icon: '📚', label: 'Study plan', tint: '#8FBC8F' },
};

export function CircleNotesPanel({ circleId }: Props) {
  const [notes, setNotes] = useState<CircleNote[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToNotes(circleId, setNotes);
    return () => unsub();
  }, [circleId]);

  const me = auth.currentUser?.uid;

  const handleAdd = async () => {
    if (!draft.trim()) return;
    setSubmitting(true);
    try {
      await addNote(circleId, { type: 'manual', body: draft });
      setDraft('');
      setComposerOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 mt-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs uppercase tracking-wider text-white/55 font-semibold">Saved notes</h3>
        <button
          onClick={() => setComposerOpen((v) => !v)}
          className="flex items-center gap-1 text-[11px] text-[#D4A853] hover:text-[#E8C97A]"
        >
          <NotePencil size={12} weight="fill" /> {composerOpen ? 'Cancel' : 'Add note'}
        </button>
      </div>

      <CommunityOversightNotice className="mb-3" />

      <AnimatePresence>
        {composerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-2"
          >
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 4000))}
                placeholder="Save an insight, an ayah reference, a takeaway from today's session…"
                rows={3}
                className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/30 outline-none resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-white/40">{draft.length}/4000</span>
                <button
                  disabled={submitting || !draft.trim()}
                  onClick={handleAdd}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4A853] text-[#0A0E16] text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? <Spinner size={12} className="animate-spin" /> : <PaperPlaneTilt size={12} weight="fill" />}
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {notes.length === 0 ? (
        <div className="rounded-xl bg-white/3 border border-dashed border-white/10 p-5 text-center">
          <p className="text-[12px] text-white/45">No notes yet. Save important insights or let Raya generate one.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notes.map((n) => {
            const meta = TYPE_META[n.type];
            const mine = me === n.authorUid;
            return (
              <div
                key={n.id}
                className="rounded-xl bg-white/3 border border-white/8 p-3"
                style={n.pinned ? { borderColor: `${meta.tint}55`, background: `${meta.tint}0F` } : undefined}
              >
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-base leading-none" aria-hidden>{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold tracking-wide" style={{ color: meta.tint }}>
                      {meta.label}
                      <span className="ml-2 font-normal text-white/40">· {n.authorName}</span>
                      {n.pinned && (
                        <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] text-white/55">
                          <PushPin size={9} weight="fill" /> pinned
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => togglePinNote(circleId, n.id, !n.pinned)}
                    className="p-1 text-white/40 hover:text-[#D4A853]"
                    aria-label={n.pinned ? 'Unpin' : 'Pin'}
                    title={n.pinned ? 'Unpin' : 'Pin'}
                  >
                    {n.pinned ? <PushPinSlash size={12} /> : <PushPin size={12} />}
                  </button>
                  {mine && (
                    <button
                      onClick={() => deleteNote(circleId, n.id)}
                      className="p-1 text-white/40 hover:text-rose-300"
                      aria-label="Delete"
                    >
                      <Trash size={12} />
                    </button>
                  )}
                </div>
                <p className="text-[13px] text-white/85 whitespace-pre-wrap leading-relaxed">{n.body}</p>
                {!mine && (
                  <div className="mt-1.5 flex justify-end">
                    <ReportContentButton
                      contentType="circle-note"
                      contentId={n.id}
                      contextLabel={`${meta.label} by ${n.authorName}`}
                      reporterUid={me}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
