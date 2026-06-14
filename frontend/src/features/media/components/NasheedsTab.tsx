/**
 * Nasheeds tab — artist sections with play/pause rows. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Pause, Play } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { NASHEED_ARTISTS } from '../_data';
import type { PlayingNasheed } from '../_types';

interface Props {
  playingNasheed: PlayingNasheed | null;
  onTogglePlayNasheed: (next: PlayingNasheed | null) => void;
}

export function NasheedsTab({ playingNasheed, onTogglePlayNasheed }: Props) {
  return (
    <motion.div
      key="nasheeds"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '1000px', margin: '0 auto' }}
    >
      {NASHEED_ARTISTS.map((artist, artistIndex) => (
        <motion.div
          key={artist.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: artistIndex * 0.1 }}
          style={{
            backgroundColor: COLORS.navy.secondary,
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h3 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: COLORS.gold.secondary,
            marginBottom: '20px',
          }}>
            {artist.name}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {artist.nasheeds.map((nasheed, nasheedIndex) => {
              const isPlaying =
                playingNasheed?.artist === artist.name && playingNasheed?.title === nasheed.title;
              return (
                <motion.div
                  key={nasheedIndex}
                  whileHover={{ backgroundColor: COLORS.navy.tertiary }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isPlaying ? COLORS.navy.tertiary : 'transparent',
                  }}
                  onClick={() => {
                    if (isPlaying) {
                      onTogglePlayNasheed(null);
                    } else {
                      onTogglePlayNasheed({ artist: artist.name, title: nasheed.title });
                    }
                  }}
                >
                  <button
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
                    {isPlaying ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" />
                    )}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: COLORS.text.cream,
                      marginBottom: '2px',
                    }}>
                      {nasheed.title}
                    </div>
                    <div style={{ fontSize: '13px', color: COLORS.text.muted }}>
                      {artist.name}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: COLORS.text.secondary }}>
                    {nasheed.duration}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
