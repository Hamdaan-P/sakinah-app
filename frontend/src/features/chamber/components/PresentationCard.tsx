/**
 * One card in the Presentations tab grid. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { ProjectorScreen, Trophy, CheckCircle, Eye, Heart } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { getThumbnailGradient } from '../_helpers';
import type { Presentation } from '../_types';

interface Props {
  presentation: Presentation;
  idx: number;
  onSelect: (p: Presentation) => void;
}

export function PresentationCard({ presentation, idx, onSelect }: Props) {
  return (
    <motion.div
      key={presentation.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: idx * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(presentation)}
      style={{
        background: COLORS.navy.darker,
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${COLORS.border}`,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          height: '160px',
          background: getThumbnailGradient(presentation.thumbnail),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <ProjectorScreen size={48} color="rgba(255,255,255,0.9)" />
        {presentation.featured && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '6px 12px',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              color: COLORS.gold.base,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Trophy size={14} />
            Featured
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            padding: '6px 12px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <ProjectorScreen size={14} />
          {presentation.slides} slides
        </div>
        {presentation.status && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              padding: '6px 12px',
              background: presentation.status === 'published' ? 'rgba(5,150,105,0.2)' : 'rgba(212,168,83,0.2)',
              backdropFilter: 'blur(8px)',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              color: presentation.status === 'published' ? '#10B981' : COLORS.gold.base,
              textTransform: 'capitalize',
            }}
          >
            {presentation.status}
          </div>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: COLORS.text.primary,
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {presentation.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px', color: COLORS.text.muted }}>{presentation.owner}</span>
          {presentation.verified && <CheckCircle size={14} color="#10B981" />}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye size={14} color={COLORS.text.muted} />
              <span style={{ fontSize: '12px', color: COLORS.text.muted }}>
                {presentation.views >= 1000
                  ? `${(presentation.views / 1000).toFixed(1)}K`
                  : presentation.views}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Heart size={14} color={COLORS.text.muted} />
              <span style={{ fontSize: '12px', color: COLORS.text.muted }}>
                {presentation.likes}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
