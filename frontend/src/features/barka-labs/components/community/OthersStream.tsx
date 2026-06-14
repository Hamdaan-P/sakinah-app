/**
 * OthersStream — single-card rotator showing live community blessings above
 * the journal input. Polls every 10s (via `useOthersBlessingsStream`) and
 * rotates between latest + most-liked picks every 5s.
 *
 * Rhythm: 3 latest → 1 most-liked → 3 latest → 1 most-liked …
 *
 * Pause-on-interaction:
 *   - Desktop: hover pauses; mouse-leave resumes immediately.
 *   - Touch: tap pauses; rotation resumes ~3s after touch-end (gives the user
 *     time to finish reading without holding their finger down).
 *
 * Hides itself entirely when there are no real community blessings — no
 * synthetic placeholder text, per founder's call.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, Heart, Clock, Pause } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';
import {
  useOthersBlessingsStream,
  type StreamItem,
} from '../../hooks/useOthersBlessingsStream';
import { timeAgo, DEPTH_STYLES } from './_data';
import { SourceChip } from '../common/SourceChip';

const ROTATE_INTERVAL_MS = 5_000;
/** Pattern: positions 0..2 are "latest", position 3 is "most-liked", then repeat. */
const PATTERN_LENGTH = 4;
/** Grace period after touch-end before rotation resumes. */
const TOUCH_RESUME_DELAY_MS = 3_000;

interface OthersStreamProps {
  className?: string;
}

function pickItem(
  latest: StreamItem[],
  mostLiked: StreamItem[],
  tick: number,
): StreamItem | null {
  if (latest.length === 0 && mostLiked.length === 0) return null;
  const slot = tick % PATTERN_LENGTH;
  if (slot === 3 && mostLiked.length > 0) {
    // Cycle through most-liked across "most-liked slots" (4th, 8th, 12th tick…)
    const mostLikedIdx = Math.floor(tick / PATTERN_LENGTH) % mostLiked.length;
    return mostLiked[mostLikedIdx];
  }
  if (latest.length === 0) return mostLiked[0];
  return latest[tick % latest.length];
}

export function OthersStream({ className }: OthersStreamProps) {
  const { latest, mostLiked, isLoading } = useOthersBlessingsStream();
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paused) return;
    if (latest.length === 0 && mostLiked.length === 0) return;
    const id = setInterval(() => setTick((t) => t + 1), ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [latest.length, mostLiked.length, paused]);

  // Clean up any in-flight resume timer on unmount so we don't flip state
  // on a stale component.
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current !== null) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const clearResumeTimer = () => {
    if (resumeTimerRef.current !== null) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearResumeTimer();
    setPaused(true);
  };

  const handleMouseLeave = () => {
    clearResumeTimer();
    setPaused(false);
  };

  const handleTouchStart = () => {
    clearResumeTimer();
    setPaused(true);
  };

  const handleTouchEnd = () => {
    // Schedule resume after the grace window so the user can read after lifting.
    clearResumeTimer();
    resumeTimerRef.current = setTimeout(() => {
      setPaused(false);
      resumeTimerRef.current = null;
    }, TOUCH_RESUME_DELAY_MS);
  };

  const item = useMemo(() => pickItem(latest, mostLiked, tick), [latest, mostLiked, tick]);
  const isMostLikedSlot = tick % PATTERN_LENGTH === 3 && mostLiked.length > 0;

  if (isLoading && !item) {
    return (
      <div
        className={`rounded-2xl px-3 py-2.5 md:px-4 md:py-3 mb-3 ${className ?? ''}`}
        style={{
          background: 'rgba(36,50,70,0.4)',
          border: '1px solid rgba(215,181,106,0.12)',
        }}
      >
        <div className="h-4 w-32 rounded animate-pulse" style={{ background: 'rgba(215,181,106,0.12)' }} />
      </div>
    );
  }

  if (!item) return null;

  const depthStyle = item.depth ? DEPTH_STYLES[item.depth] : null;

  return (
    <div
      className={`rounded-2xl mb-3 ${className ?? ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(36,50,70,0.6), rgba(36,50,70,0.3))',
        border: '1px solid rgba(215,181,106,0.18)',
        overflow: 'hidden',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header — chip + live-dot (swaps to "Paused" indicator on interaction). */}
      <div
        className="flex items-center justify-between px-3 md:px-4 pt-2.5 md:pt-3 pb-1.5"
      >
        <div className="flex items-center gap-1.5">
          <SourceChip kind="others" />
          <span className="text-[10px] md:text-[11px] font-semibold" style={{ color: C.t3 }}>
            {isMostLikedSlot ? 'Most Loved' : 'Live'}
          </span>
        </div>
        {paused ? (
          <div className="flex items-center gap-1.5">
            <Pause size={10} weight="fill" style={{ color: C.t3 }} />
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.t3 }}>
              Paused
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                style={{ background: C.emL }}
              />
              <span
                className="relative inline-flex rounded-full h-1.5 w-1.5"
                style={{ background: C.emL }}
              />
            </span>
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.emL }}>
              Live
            </span>
          </div>
        )}
      </div>

      {/* Rotating card body — `min-h` keeps the card from collapsing on short
          blessings; no max-height + no line-clamp so long blessings show in
          full instead of truncating mid-sentence. `items-start` lets the card
          grow downward naturally rather than vertically centring a long block
          inside a fixed area. */}
      <div className="px-3 md:px-4 pb-3 md:pb-3.5 min-h-[60px] md:min-h-[68px] flex items-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${item.id}-${tick}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full flex items-start gap-2.5 md:gap-3"
          >
            <div
              className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: isMostLikedSlot
                  ? 'rgba(224,122,107,0.15)'
                  : 'rgba(215,181,106,0.12)',
              }}
            >
              {isMostLikedSlot ? (
                <Heart size={14} weight="fill" style={{ color: '#E07A6B' }} />
              ) : (
                <Sparkle size={14} weight="fill" style={{ color: C.gold }} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[12px] md:text-[13px] leading-snug italic whitespace-pre-wrap break-words"
                style={{ color: C.t1, fontFamily: 'inherit' }}
              >
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {depthStyle && (
                  <span
                    className="text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: depthStyle.bg,
                      color: depthStyle.color,
                      border: `1px solid ${depthStyle.border}`,
                    }}
                  >
                    {depthStyle.label}
                  </span>
                )}
                {item.likes_count > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] md:text-[10px]" style={{ color: '#E07A6B' }}>
                    <Heart size={9} weight="fill" />
                    {item.likes_count}
                  </span>
                )}
                <span className="flex items-center gap-0.5 text-[9px] md:text-[10px]" style={{ color: C.t3 }}>
                  <Clock size={9} />
                  {timeAgo(item.created_at)}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
