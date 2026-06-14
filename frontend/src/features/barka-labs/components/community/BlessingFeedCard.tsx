/**
 * BlessingFeedCard — single anonymous public blessing card with like,
 * comment, and share interactions.
 */

import { useState } from 'react';
import {
  Heart, ChatCircle, ShareFat, Leaf,
} from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';
import type { PublicBlessing } from '../../types/barka-labs.types';
import { useCommunityStore } from '../../stores/community.store';
import {
  DEPTH_STYLES, DIMENSION_LABELS, DIMENSION_KEYS, timeAgo,
} from './_data';
import { BlessingComments } from './BlessingComments';

export function BlessingFeedCard({ blessing }: { blessing: PublicBlessing }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const toggleLike = useCommunityStore((s) => s.toggleLike);
  const fetchComments = useCommunityStore((s) => s.fetchComments);
  const addComment = useCommunityStore((s) => s.addComment);
  const comments = useCommunityStore((s) => s.comments[blessing.id]) ?? [];
  const commentsLoading = useCommunityStore((s) => s.commentsLoading[blessing.id]) ?? false;

  const depthStyle = DEPTH_STYLES[blessing.depth];

  const handleToggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) {
      fetchComments(blessing.id);
    }
  };

  const handleSendComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    await addComment(blessing.id, trimmed);
    setCommentText('');
  };

  const handleShare = async () => {
    const shareText = `"${blessing.text}"\n\nScored ${depthStyle.label} (${blessing.score}/5) on the Niyaamat Meter\nBarakah Labs - zaryahplus.com`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'A blessing from Barakah Labs', text: shareText });
        return;
      } catch { /* fallback */ }
    }
    await navigator.clipboard.writeText(shareText);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: C.card, border: `1px solid ${C.cardB}`, borderRadius: 18 }}
    >
      <div className="px-5 pt-5 pb-4">
        {/* Anonymous label */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(215,181,106,0.10)' }}
          >
            <Leaf size={14} weight="fill" style={{ color: C.gold, opacity: 0.7 }} />
          </div>
          <span className="text-xs font-medium" style={{ color: C.t3 }}>A grateful soul</span>
          <span className="ml-auto text-[10px]" style={{ color: C.t3 }}>{timeAgo(blessing.created_at)}</span>
        </div>

        {/* Blessing text */}
        <p
          className="text-[15px] leading-relaxed mb-4"
          style={{ color: C.t1, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}
        >
          &ldquo;{blessing.text}&rdquo;
        </p>

        {/* Depth badge + score */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: depthStyle.bg, border: `1px solid ${depthStyle.border}`, color: depthStyle.color }}
          >
            {depthStyle.label}
          </span>
          <span className="text-xs font-bold" style={{ color: C.t3 }}>
            {blessing.score.toFixed(1)}<span className="font-normal">/5</span>
          </span>
        </div>

        {/* Reflection bars */}
        {blessing.reflection && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {DIMENSION_KEYS.map((key, i) => {
              const val = blessing.reflection![key];
              return (
                <div key={key}>
                  <p className="text-[9px] mb-1 truncate" style={{ color: C.t3 }}>{DIMENSION_LABELS[i]}</p>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(val / 5) * 100}%`,
                        background: i === 3 ? C.gold : i === 2 ? C.teal : i === 1 ? C.purple : C.emL,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-1 pt-3" style={{ borderTop: '1px solid rgba(215,181,106,0.08)' }}>
          <button
            onClick={() => toggleLike(blessing.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{
              background: blessing.has_liked ? 'rgba(224,122,107,0.12)' : 'transparent',
              color: blessing.has_liked ? '#E07A6B' : C.t3,
            }}
          >
            <Heart size={16} weight={blessing.has_liked ? 'fill' : 'regular'} />
            {blessing.likes_count > 0 && <span>{blessing.likes_count}</span>}
          </button>

          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{
              background: showComments ? 'rgba(91,141,239,0.10)' : 'transparent',
              color: showComments ? C.blue : C.t3,
            }}
          >
            <ChatCircle size={16} weight={showComments ? 'fill' : 'regular'} />
            {blessing.comments_count > 0 && <span>{blessing.comments_count}</span>}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{ color: C.t3 }}
          >
            <ShareFat size={16} />
          </button>
        </div>
      </div>

      {showComments && (
        <BlessingComments
          comments={comments}
          commentsLoading={commentsLoading}
          commentText={commentText}
          setCommentText={setCommentText}
          onSend={handleSendComment}
        />
      )}
    </div>
  );
}
