/**
 * Sticky mini-player shown when a nasheed is selected and neither the
 * Quran nor a podcast is playing. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Pause } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import type { PlayingNasheed, PlayingPodcastEpisode } from '../_types';

interface Props {
  playingNasheed: PlayingNasheed | null;
  playingPodcastEpisode: PlayingPodcastEpisode | null;
  playingSurah: number | null;
  onStop: () => void;
}

export function NasheedPlayerBar({ playingNasheed, playingPodcastEpisode, playingSurah, onStop }: Props) {
  return (
    <AnimatePresence>
      {playingNasheed && !playingPodcastEpisode && !playingSurah && (
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
              {playingNasheed.title}
            </div>
            <div style={{ fontSize: '12px', color: COLORS.text.muted }}>
              {playingNasheed.artist}
            </div>
          </div>
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
              width: '60%',
              backgroundColor: COLORS.gold.primary,
            }} />
          </div>
          <div style={{
            fontSize: '12px',
            color: COLORS.text.secondary,
            minWidth: '80px',
            textAlign: 'right',
          }}>
            2:45 / 4:32
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
