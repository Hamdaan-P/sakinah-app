/**
 * Stories tab — prophet-stories tile grid. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Clock, FileText } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { PROPHET_STORIES, type ProphetStory } from '../_data';

interface Props {
  onSelectStory: (story: ProphetStory) => void;
}

export function StoriesTab({ onSelectStory }: Props) {
  return (
    <motion.div
      key="stories"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {PROPHET_STORIES.map((story, index) => (
          <motion.div
            key={story.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.03, y: -5 }}
            onClick={() => onSelectStory(story)}
            style={{
              backgroundColor: COLORS.navy.secondary,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
            }}
          >
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: COLORS.gold.secondary,
              marginBottom: '6px',
            }}>
              {story.name}
            </h3>
            <p style={{
              fontSize: '14px',
              color: COLORS.text.secondary,
              marginBottom: '16px',
            }}>
              {story.subtitle}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              fontSize: '12px',
              color: COLORS.text.muted,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                <span>{story.readingTime}</span>
              </div>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={14} />
                <span>{story.wordCount} words</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
