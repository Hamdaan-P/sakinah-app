/**
 * CommunityCard — public blessing card inside the journal view with like and
 * threaded comment interactions.
 */

import { useState } from 'react';
import { Heart, ChatCircle, SpinnerGap } from '@phosphor-icons/react';
import { C, cardStyle } from '../../barka-labs.constants';
import type { PublicBlessing, CommunityComment } from '../../types/barka-labs.types';
import { depthColor, metacogLevel, timeAgo } from './_helpers';
import { CommentRow } from './CommentRow';
import { ShareButton } from './ShareButton';

interface CommunityCardProps {
  blessing: PublicBlessing;
  onLike: (id: string) => void;
  comments: CommunityComment[];
  commentsLoading: boolean;
  onFetchComments: (id: string) => void;
  onAddComment: (id: string, text: string, parentId?: string) => void;
}

export function CommunityCard({
  blessing, onLike, comments, commentsLoading, onFetchComments, onAddComment,
}: CommunityCardProps) {
  const dc = depthColor(blessing.depth);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) {
      onFetchComments(blessing.id);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    onAddComment(blessing.id, commentText.trim());
    setCommentText('');
  };

  // Build thread: top-level = no parent_id
  const topLevel = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="rounded-2xl p-4 transition-colors cursor-default" style={cardStyle}>
      {/* Card header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold"
          style={{ background: 'rgba(215,181,106,0.12)', color: C.gold }}
        >
          A
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[12px] font-semibold" style={{ color: C.t1 }}>Anonymous</span>
          <span className="text-[10px] ml-2" style={{ color: C.t3 }}>{timeAgo(blessing.created_at)}</span>
        </div>
        <span
          className="inline-block px-2.5 py-0.5 rounded-xl text-[11px] font-semibold"
          style={{ background: dc.bg, color: dc.text }}
        >
          {blessing.score.toFixed(1)}
        </span>
      </div>

      {/* Body */}
      <p className="text-sm leading-relaxed italic mb-2.5 m-0" style={{ color: '#EBDCB8' }}>
        &ldquo;{blessing.text}&rdquo;
      </p>

      {/* Tags */}
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold capitalize" style={{ background: dc.bg, color: dc.text }}>
          {blessing.depth}
        </span>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <span className="text-[11px]" style={{ color: '#A7B1C0' }}>
          Metacog: {metacogLevel(blessing.score)}
        </span>
      </div>

      {/* Like / Comment actions */}
      <div className="flex items-center gap-5 mt-3 pt-2.5" style={{ borderTop: `1px solid ${C.cardB}` }}>
        <button
          onClick={() => onLike(blessing.id)}
          className="flex items-center gap-1.5 cursor-pointer bg-transparent border-none transition-colors"
          style={{ color: blessing.has_liked ? '#E07A6B' : C.t3 }}
        >
          <Heart size={18} weight={blessing.has_liked ? 'fill' : 'regular'} />
          {blessing.likes_count > 0 && (
            <span className="text-[12px] font-semibold">{blessing.likes_count}</span>
          )}
        </button>
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 cursor-pointer bg-transparent border-none transition-colors"
          style={{ color: showComments ? C.gold : C.t3 }}
        >
          <ChatCircle size={18} weight={showComments ? 'fill' : 'regular'} />
          {blessing.comments_count > 0 && (
            <span className="text-[12px] font-semibold">{blessing.comments_count}</span>
          )}
        </button>
        <div className="ml-auto">
          <ShareButton text={blessing.text} depth={blessing.depth} score={blessing.score} isOthers />
        </div>
      </div>

      {/* Inline threaded comments dropdown */}
      {showComments && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.cardB}` }}>
          {commentsLoading ? (
            <div className="flex justify-center py-4">
              <SpinnerGap size={20} className="animate-spin" style={{ color: C.gold }} />
            </div>
          ) : topLevel.length === 0 ? (
            <p className="text-[11px] text-center py-3" style={{ color: C.t3 }}>No comments yet. Be the first!</p>
          ) : (
            <div className="flex flex-col">
              {topLevel.map((c) => (
                <CommentRow
                  key={c.id}
                  comment={c}
                  replies={getReplies(c.id)}
                  allComments={comments}
                  depth={0}
                  replyingTo={replyingTo}
                  onSetReplyingTo={setReplyingTo}
                  onAddComment={onAddComment}
                  blessingId={blessing.id}
                />
              ))}
            </div>
          )}

          {/* Top-level comment input */}
          <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${C.cardB}` }}>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-[12px] outline-none border rounded-lg px-3 py-2 transition-colors focus:border-[#D7B56A]"
              style={{ borderColor: C.cardB, color: C.t1 }}
            />
            {commentText.trim() && (
              <button
                onClick={handleAddComment}
                className="text-[12px] font-bold bg-transparent border-none cursor-pointer p-0 shrink-0"
              >
                <span style={{ color: C.gold }}>Post</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
