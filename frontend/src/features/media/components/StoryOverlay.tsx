/**
 * Full-screen overlay shown when a prophet-story tile is tapped.
 * Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, FileText } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import type { ProphetStory } from '../_data';

interface Props {
  selectedStory: ProphetStory | null;
  onClose: () => void;
}

export function StoryOverlay({ selectedStory, onClose }: Props) {
  return (
    <AnimatePresence>
      {selectedStory && (
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
              padding: '32px',
              borderBottom: `1px solid ${COLORS.border}`,
              position: 'relative',
            }}>
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: COLORS.navy.tertiary,
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: COLORS.text.cream,
                }}
              >
                <X size={20} />
              </button>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                color: COLORS.gold.secondary,
                marginBottom: '8px',
              }}>
                {selectedStory.name}
              </h2>
              <p style={{
                fontSize: '16px',
                color: COLORS.text.secondary,
                marginBottom: '16px',
              }}>
                {selectedStory.subtitle}
              </p>
              <div style={{
                display: 'flex',
                gap: '16px',
                fontSize: '13px',
                color: COLORS.text.muted,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} />
                  <span>{selectedStory.readingTime}</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={14} />
                  <span>{selectedStory.wordCount} words</span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: COLORS.text.cream,
                marginBottom: '16px',
              }}>
                The story of {selectedStory.name} is a powerful reminder of faith, patience, and submission to Allah's will.
                Throughout history, the prophets were sent as messengers to guide humanity toward righteousness and away from
                corruption and disbelief.
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: COLORS.text.cream,
                marginBottom: '16px',
              }}>
                {selectedStory.name} faced numerous challenges and trials during their mission, yet they remained steadfast in
                their devotion to Allah. Their story teaches us valuable lessons about perseverance, trust in divine wisdom,
                and the importance of maintaining faith even in the most difficult circumstances.
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: COLORS.text.cream,
                marginBottom: '0',
              }}>
                The legacy of {selectedStory.name} continues to inspire believers today, reminding us of the power of faith
                and the rewards that await those who remain patient and steadfast in the face of adversity. May we all learn
                from their example and strive to embody these noble qualities in our own lives.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
