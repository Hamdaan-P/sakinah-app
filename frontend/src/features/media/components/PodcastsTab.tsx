/**
 * Podcasts tab — series cover grid. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { PODCAST_SERIES, type PodcastSeries } from '../_data';

interface Props {
  onSelectSeries: (series: PodcastSeries) => void;
}

export function PodcastsTab({ onSelectSeries }: Props) {
  return (
    <motion.div
      key="podcasts"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {PODCAST_SERIES.map((series, index) => (
          <motion.div
            key={series.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelectSeries(series)}
            style={{
              background: series.coverGradient,
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              minHeight: '280px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0, 0.3)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#FFFFFF',
                marginBottom: '8px',
              }}>
                {series.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255, 0.9)',
                marginBottom: '4px',
              }}>
                by {series.author}
              </p>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255, 0.8)',
                marginBottom: '16px',
                lineHeight: '1.5',
              }}>
                {series.description}
              </p>
              <div style={{
                display: 'flex',
                gap: '16px',
                fontSize: '13px',
                color: 'rgba(255,255,255, 0.9)',
              }}>
                <span>{series.episodes} episodes</span>
                <span>•</span>
                <span>{series.totalDuration}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
