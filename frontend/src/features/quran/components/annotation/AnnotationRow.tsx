/**
 * AnnotationRow — single row in the annotations drawer with edit / resolve / delete.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash, PencilSimpleLine } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { Annotation } from '../../types/quran.types';
import { setAnnotationStatus, deleteAnnotation, updateAnnotation } from '../../services/annotationManager';

export function AnnotationRow({ ann, onJumpToVerse }: { ann: Annotation; onJumpToVerse?: (k: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(ann.comment);
  const resolved = ann.status === 'resolved';

  return (
    <motion.div
      layout
      className={cn(
        'rounded-lg border p-3 transition-colors',
        resolved
          ? 'bg-white/3 border-white/5 opacity-60'
          : 'bg-[#0F141F]/60 border-[#D4A853]/15',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <button
          onClick={() => onJumpToVerse?.(ann.verseKey)}
          className="text-left text-[11px] font-mono text-[#D4A853] hover:underline"
        >
          {ann.verseKey}
          {ann.wordPosition ? ` · word ${ann.wordPosition}` : ''}
          {ann.pageNumber ? ` · p.${ann.pageNumber}` : ''}
        </button>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setAnnotationStatus(ann.id, resolved ? 'open' : 'resolved')}
            title={resolved ? 'Reopen' : 'Resolve'}
            className="p-1 rounded hover:bg-white/10 text-white/50"
          >
            <Check size={14} className={resolved ? 'text-emerald-400' : ''} />
          </button>
          <button
            onClick={() => setEditing((e) => !e)}
            title="Edit"
            className="p-1 rounded hover:bg-white/10 text-white/50"
          >
            <PencilSimpleLine size={14} />
          </button>
          <button
            onClick={() => deleteAnnotation(ann.id)}
            title="Delete"
            className="p-1 rounded hover:bg-white/10 text-red-300"
          >
            <Trash size={14} />
          </button>
        </div>
      </div>
      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full text-sm bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white resize-none"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-1.5">
            <button onClick={() => setEditing(false)} className="text-[11px] text-white/50 hover:text-white">Cancel</button>
            <button
              onClick={() => {
                updateAnnotation(ann.id, { comment: draft.trim() });
                setEditing(false);
              }}
              className="text-[11px] text-[#D4A853] hover:text-[#E8C97A]"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/80 whitespace-pre-wrap">{ann.comment}</p>
      )}
      {ann.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {ann.tags.map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50">#{t}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
