/**
 * CommentRow — recursive comment + reply UI for the inline community thread.
 */

import { useState } from 'react';
import { Heart } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';
import type { CommunityComment } from '../../types/barka-labs.types';
import { timeAgo } from './_helpers';

interface CommentRowProps {
  comment: CommunityComment;
  replies: CommunityComment[];
  allComments: CommunityComment[];
  depth: number;
  replyingTo: string | null;
  onSetReplyingTo: (id: string | null) => void;
  onAddComment: (blessingId: string, text: string, parentId?: string) => void;
  blessingId: string;
}

export function CommentRow({
  comment, replies, allComments, depth, replyingTo,
  onSetReplyingTo, onAddComment, blessingId,
}: CommentRowProps) {
  const [replyText, setReplyText] = useState('');
  const isReplying = replyingTo === comment.id;
  const [showReplies, setShowReplies] = useState(true);

  const handleReply = () => {
    if (!replyText.trim()) return;
    onAddComment(blessingId, replyText.trim(), comment.id);
    setReplyText('');
    onSetReplyingTo(null);
  };

  // Nested replies to this comment
  const childReplies = (id: string) => allComments.filter((c) => c.parent_id === id);

  return (
    <div style={{ marginLeft: depth > 0 ? 20 : 0 }}>
      <div className="flex gap-2.5 py-2">
        {/* Avatar */}
        {comment.photo_url ? (
          <img src={comment.photo_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold"
            style={{ background: 'rgba(215,181,106,0.12)', color: C.gold }}
          >
            {(comment.name || '?')[0].toUpperCase()}
          </div>
        )}
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[12px] font-semibold" style={{ color: C.t1 }}>{comment.name}</span>
            <span className="text-[10px]" style={{ color: C.t3 }}>{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-[12px] m-0 mt-0.5 leading-relaxed" style={{ color: C.t2 }}>{comment.text}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => onSetReplyingTo(isReplying ? null : comment.id)}
              className="text-[10px] font-semibold bg-transparent border-none cursor-pointer p-0"
              style={{ color: isReplying ? C.gold : C.t3 }}
            >
              Reply
            </button>
            {replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-[10px] font-semibold bg-transparent border-none cursor-pointer p-0 flex items-center gap-1"
                style={{ color: C.t3 }}
              >
                <span className="inline-block w-4 h-px" style={{ background: C.t3 }} />
                {showReplies ? 'Hide' : 'View'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Inline reply input */}
          {isReplying && (
            <div className="flex gap-2 mt-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                placeholder={`Reply to ${comment.name}...`}
                className="flex-1 bg-transparent text-[11px] outline-none border rounded-lg px-3 py-1.5 transition-colors focus:border-[#D7B56A]"
                style={{ borderColor: C.cardB, color: C.t1 }}
                // eslint-disable-next-line jsx-a11y/no-autofocus -- user-action-triggered reply input; auto-focus is expected UX
                autoFocus
              />
              {replyText.trim() && (
                <button
                  onClick={handleReply}
                  className="text-[11px] font-bold bg-transparent border-none cursor-pointer p-0 shrink-0"
                  style={{ color: C.gold }}
                >
                  Post
                </button>
              )}
            </div>
          )}
        </div>
        {/* Heart on comment */}
        <Heart size={12} weight="regular" className="shrink-0 mt-2 cursor-pointer" style={{ color: C.t3 }} />
      </div>

      {/* Nested replies */}
      {showReplies && replies.map((r) => (
        <CommentRow
          key={r.id}
          comment={r}
          replies={childReplies(r.id)}
          allComments={allComments}
          depth={depth + 1}
          replyingTo={replyingTo}
          onSetReplyingTo={onSetReplyingTo}
          onAddComment={onAddComment}
          blessingId={blessingId}
        />
      ))}
    </div>
  );
}
