/**
 * Reusable big-card CTA used by the debt-restructuring selection view.
 * One card per path (company/individual). Phase 5 split.
 */

import { motion } from 'framer-motion';
import { CaretDown } from '@phosphor-icons/react';
import type { ComponentType } from 'react';

interface Props {
  delay: number;
  fromLeft: boolean;
  hoverBorder: string;
  iconGradient: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
  ctaColor: string;
  onClick: () => void;
}

export function PathSelectionCard({
  delay,
  fromLeft,
  hoverBorder,
  iconGradient,
  Icon,
  title,
  description,
  ctaColor,
  onClick,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      style={{
        background: '#10151F',
        borderRadius: '16px',
        padding: '32px',
        border: '2px solid rgba(212,168,83,0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = hoverBorder;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212,168,83,0.2)';
      }}
    >
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '20px',
        background: iconGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <Icon size={40} color="#FFFFFF" />
      </div>
      <h2 style={{
        fontSize: '28px',
        fontWeight: '700',
        color: '#F5E8C7',
        marginBottom: '12px',
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#C9C0A8',
        lineHeight: '1.6',
        marginBottom: '24px',
      }}>
        {description}
      </p>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: ctaColor,
        fontSize: '15px',
        fontWeight: '600',
      }}>
        <span>Get Started</span>
        <CaretDown size={20} style={{ transform: 'rotate(-90deg)' }} />
      </div>
    </motion.div>
  );
}
