/**
 * Presentation detail overlay. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, ProjectorScreen, CheckCircle, Eye, Heart } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { getThumbnailGradient } from '../_helpers';
import type { Presentation } from '../_types';

interface Props {
  presentation: Presentation | null;
  onClose: () => void;
}

export function PresentationDetailOverlay({ presentation, onClose }: Props) {
  return (
    <AnimatePresence>
      {presentation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '700px',
              background: COLORS.navy.darker,
              borderRadius: '24px',
              overflow: 'hidden',
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                height: '200px',
                background: getThumbnailGradient(presentation.thumbnail),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <ProjectorScreen size={64} color="rgba(255,255,255,0.9)" />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={20} color="#FFF" />
              </motion.button>
            </div>

            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '8px' }}>
                    {presentation.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', color: COLORS.text.muted }}>
                      by {presentation.owner}
                    </span>
                    {presentation.verified && <CheckCircle size={14} color="#10B981" />}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.text.muted, marginBottom: '4px' }}>Slides</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text.primary }}>
                    {presentation.slides}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.text.muted, marginBottom: '4px' }}>Views</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text.primary }}>
                    {presentation.views >= 1000
                      ? `${(presentation.views / 1000).toFixed(1)}K`
                      : presentation.views}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.text.muted, marginBottom: '4px' }}>Likes</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text.primary }}>
                    {presentation.likes}
                  </div>
                </div>
              </div>

              {presentation.description && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '8px' }}>
                    Description
                  </h4>
                  <p style={{ fontSize: '14px', color: COLORS.text.secondary, lineHeight: '1.6' }}>
                    {presentation.description}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: COLORS.gold.base,
                    border: 'none',
                    borderRadius: '12px',
                    color: COLORS.navy.darkest,
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Eye size={20} />
                  View Deck
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '14px 24px',
                    background: 'transparent',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '12px',
                    color: COLORS.text.secondary,
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Heart size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
