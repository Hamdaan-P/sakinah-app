/**
 * Reusable big-card CTA for the Events home view. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';
import type { ComponentType, ReactNode } from 'react';

interface Props {
  background: string;
  iconColor?: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  titleColor: string;
  description: string;
  descriptionColor: string;
  ctaLabel: string;
  ctaColor: string;
  onClick: () => void;
}

export function EventsHomeCTA({
  background,
  iconColor = '#FFFFFF',
  Icon,
  title,
  titleColor,
  description,
  descriptionColor,
  ctaLabel,
  ctaColor,
  onClick,
}: Props): ReactNode {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background,
        borderRadius: '16px',
        padding: '32px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(255,255,255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <Icon size={32} color={iconColor} />
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: '700', color: titleColor, marginBottom: '12px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '14px', color: descriptionColor, marginBottom: '24px', lineHeight: '1.6' }}>
          {description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: ctaColor, fontSize: '14px', fontWeight: '600' }}>
          {ctaLabel}
          <ArrowRight size={16} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255,255,255, 0.1)',
        }}
      />
    </motion.div>
  );
}
