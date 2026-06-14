/**
 * 4-tile key metrics row for the Analytics tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { UsersThree, ShareNetwork, Lightning, Calendar, ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { COLORS } from '../_constants';

const METRICS = [
  { label: 'Total Members', value: '248', change: '+12%', up: true, icon: UsersThree, color: '#7C3AED' },
  { label: 'Referrals Sent', value: '156', change: '+8%', up: true, icon: ShareNetwork, color: '#0284C7' },
  { label: 'Deals Closed', value: '42', change: '+15%', up: true, icon: Lightning, color: '#059669' },
  { label: 'Events Hosted', value: '18', change: '+5%', up: true, icon: Calendar, color: '#EA580C' },
];

export function AnalyticsKeyMetrics() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
      {METRICS.map((metric, idx) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          style={{
            background: COLORS.navy.darker,
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: COLORS.text.muted }}>{metric.label}</span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `${metric.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <metric.icon size={20} color={metric.color} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.text.primary, marginBottom: '8px' }}>
            {metric.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {metric.up ? (
              <ArrowUp size={16} color="#059669" />
            ) : (
              <ArrowDown size={16} color="#DC2626" />
            )}
            <span style={{ fontSize: '14px', fontWeight: '600', color: metric.up ? '#059669' : '#DC2626' }}>
              {metric.change}
            </span>
            <span style={{ fontSize: '14px', color: COLORS.text.muted }}>vs last period</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
