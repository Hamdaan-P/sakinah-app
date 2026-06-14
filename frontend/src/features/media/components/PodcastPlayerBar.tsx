/**
 * Sticky mini-player shown when a podcast episode is selected. Phase 5
 * split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Pause, SkipBack, SkipForward } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { PODCAST_SERIES } from '../_data';
import type { PlayingPodcastEpisode } from '../_types';

interface Props {
  playingPodcastEpisode: PlayingPodcastEpisode | null;
  onStop: () => void;
}

export function PodcastPlayerBar({ playingPodcastEpisode, onStop }: Props) {
  return (
    <AnimatePresence>
      {playingPodcastEpisode && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: COLORS.navy.tertiary,
            borderTop: `1px solid ${COLORS.border}`,
            padding: '16px 48px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            zIndex: 100,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: COLORS.text.cream,
              marginBottom: '4px',
            }}>
              {PODCAST_SERIES.find((s) => s.id === playingPodcastEpisode.seriesId)?.episodesList
                .find((e) => e.number === playingPodcastEpisode.episodeNumber)?.title}
            </div>
            <div style={{ fontSize: '12px', color: COLORS.text.muted }}>
              {PODCAST_SERIES.find((s) => s.id === playingPodcastEpisode.seriesId)?.title}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: COLORS.navy.quaternary,
                color: COLORS.text.cream,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={onStop}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: COLORS.gold.primary,
                color: COLORS.navy.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Pause size={18} fill="currentColor" />
            </button>
            <button
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: COLORS.navy.quaternary,
                color: COLORS.text.cream,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <SkipForward size={16} />
            </button>
          </div>
          <div style={{
            flex: 2,
            height: '4px',
            backgroundColor: COLORS.navy.quaternary,
            borderRadius: '2px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '42%',
              backgroundColor: COLORS.gold.primary,
            }} />
          </div>
          <div style={{
            fontSize: '12px',
            color: COLORS.text.secondary,
            minWidth: '100px',
            textAlign: 'right',
          }}>
            24:30 / 58:30
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
