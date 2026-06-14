/**
 * Single referral card (used in sent + received views). Phase 5 split.
 */

import { motion } from 'framer-motion';
import { COLORS } from '../_constants';
import type { Referral } from '../_types';

interface Props {
  referral: Referral;
  idx: number;
  partyLabel: 'To' | 'From';
  partyValue: string;
  showActions?: boolean;
}

export function ReferralCard({ referral, idx, partyLabel, partyValue, showActions = false }: Props) {
  const statusBg =
    referral.status === 'completed'
      ? '#05966920'
      : referral.status === 'accepted'
        ? '#0284C720'
        : '#D4A85320';
  const statusColor =
    referral.status === 'completed'
      ? '#059669'
      : referral.status === 'accepted'
        ? '#0284C7'
        : COLORS.gold.base;

  return (
    <motion.div
      key={referral.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.1 }}
      style={{
        background: COLORS.navy.darker,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text.primary }}>
              {partyLabel}: {partyValue}
            </span>
            <span
              style={{
                padding: '4px 12px',
                background: statusBg,
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                color: statusColor,
                textTransform: 'capitalize',
              }}
            >
              {referral.status}
            </span>
          </div>
          <div style={{ fontSize: '14px', color: COLORS.text.muted }}>{referral.type}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: COLORS.gold.base }}>
            {referral.value}
          </div>
          <div style={{ fontSize: '12px', color: COLORS.text.muted, marginTop: '4px' }}>
            {referral.date}
          </div>
        </div>
      </div>
      <p style={{
        fontSize: '14px',
        color: COLORS.text.secondary,
        lineHeight: '1.5',
        marginBottom: showActions ? '16px' : '0',
      }}>
        {referral.details}
      </p>
      {showActions && referral.status === 'pending' && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              flex: 1,
              padding: '10px 24px',
              background: '#059669',
              border: 'none',
              borderRadius: '10px',
              color: '#FFF',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Accept
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              flex: 1,
              padding: '10px 24px',
              background: 'transparent',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '10px',
              color: COLORS.text.secondary,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Decline
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
