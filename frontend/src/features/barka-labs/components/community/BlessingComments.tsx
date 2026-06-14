/**
 * BlessingComments — comments list + composer for a single blessing card.
 */

import { useRef } from 'react';
import { SpinnerGap, PaperPlaneTilt } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';
import type { CommunityComment } from '../../types/barka-labs.types';
import { timeAgo } from './_data';

interface BlessingCommentsProps {
  comments: CommunityComment[];
  commentsLoading: boolean;
  commentText: string;
  setCommentText: (s: string) => void;
  onSend: () => void;
}

export function BlessingComments({
  comments, commentsLoading, commentText, setCommentText, onSend,
}: BlessingCommentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="px-5 pb-4 pt-2 space-y-3" style={{ borderTop: '1px solid rgba(215,181,106,0.08)' }}>
      {commentsLoading ? (
        <div className="flex items-center justify-center py-4">
          <SpinnerGap size={20} className="animate-spin" style={{ color: C.t3 }} />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-center py-3" style={{ color: C.t3 }}>
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        comments.map((c: CommunityComment) => (
          <div key={c.id} className="flex gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
              style={{ background: 'rgba(215,181,106,0.10)', color: C.gold }}
            >
              {(c.name || '?')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: C.t2 }}>{c.name}</span>
                <span className="text-[9px]" style={{ color: C.t3 }}>{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: C.t3 }}>{c.text}</p>
            </div>
          </div>
        ))
      )}

      {/* Comment input */}
      <div className="flex items-center gap-2 pt-1">
        <input
          ref={inputRef}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder="Add a comment..."
          className="flex-1 text-xs px-3 py-2.5 rounded-xl outline-none placeholder:text-[#7F8A9A]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(215,181,106,0.12)',
            color: C.t1,
          }}
        />
        <button
          onClick={onSend}
          disabled={!commentText.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity"
          style={{
            background: commentText.trim() ? `linear-gradient(135deg, ${C.gold}, ${C.goldD})` : 'rgba(255,255,255,0.04)',
            opacity: commentText.trim() ? 1 : 0.4,
          }}
        >
          <PaperPlaneTilt size={16} weight="fill" style={{ color: commentText.trim() ? '#1E293A' : C.t3 }} />
        </button>
      </div>
    </div>
  );
}
