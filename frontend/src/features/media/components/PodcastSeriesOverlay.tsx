/**
 * Full-screen overlay shown when a podcast series tile is tapped.
 * Lists every episode with a play/pause toggle. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause, Play } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import type { PodcastSeries } from '../_data';
import type { PlayingPodcastEpisode } from '../_types';

interface Props {
  selectedPodcastSeries: PodcastSeries | null;
  playingPodcastEpisode: PlayingPodcastEpisode | null;
  onClose: () => void;
  onTogglePlayEpisode: (next: PlayingPodcastEpisode | null) => void;
}

export function PodcastSeriesOverlay({
  selectedPodcastSeries,
  playingPodcastEpisode,
  onClose,
  onTogglePlayEpisode,
}: Props) {
  return (
    <AnimatePresence>
      {selectedPodcastSeries && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '48px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: COLORS.navy.secondary,
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              background: selectedPodcastSeries.coverGradient,
              padding: '32px',
              position: 'relative',
            }}>
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0,0,0, 0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                }}
              >
                <X size={20} />
              </button>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#FFFFFF',
                marginBottom: '8px',
              }}>
                {selectedPodcastSeries.title}
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255, 0.9)', marginBottom: '0' }}>
                by {selectedPodcastSeries.author}
              </p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {selectedPodcastSeries.episodesList.map((episode) => {
                const isPlaying =
                  playingPodcastEpisode?.seriesId === selectedPodcastSeries.id &&
                  playingPodcastEpisode?.episodeNumber === episode.number;
                const togglePlay = () => {
                  if (isPlaying) {
                    onTogglePlayEpisode(null);
                  } else {
                    onTogglePlayEpisode({
                      seriesId: selectedPodcastSeries.id,
                      episodeNumber: episode.number,
                    });
                  }
                };
                return (
                  <div
                    key={episode.number}
                    role="button"
                    tabIndex={0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      backgroundColor: isPlaying ? COLORS.navy.tertiary : 'transparent',
                    }}
                    onClick={togglePlay}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        togglePlay();
                      }
                    }}
                  >
                    <div style={{
                      minWidth: '32px',
                      height: '32px',
                      backgroundColor: COLORS.navy.quaternary,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: COLORS.gold.primary,
                    }}>
                      {episode.number}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: COLORS.text.cream,
                      }}>
                        {episode.title}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: COLORS.text.muted,
                      marginRight: '8px',
                    }}>
                      {episode.duration}
                    </div>
                    <button
                      style={{
                        width: '32px',
                        height: '32px',
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
                      {isPlaying ? (
                        <Pause size={14} fill="currentColor" />
                      ) : (
                        <Play size={14} fill="currentColor" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
