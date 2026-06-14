/**
 * Recent activity feed for the Analytics tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { COLORS } from '../_constants';

const ACTIVITIES = [
  { action: 'New member joined', detail: 'Zainab Ali from Brand Builders', time: '2 hours ago' },
  { action: 'Referral completed', detail: 'Ahmed → Fatima ($250K deal)', time: '5 hours ago' },
  { action: 'Event registered', detail: '12 members registered for Fintech Summit', time: '1 day ago' },
  { action: 'Presentation uploaded', detail: 'Islamic Finance Trends 2024', time: '2 days ago' },
  { action: 'Networking session', detail: 'Investment Opportunities completed', time: '3 days ago' },
];

export function AnalyticsRecentActivity() {
  return (
    <div
      style={{
        background: COLORS.navy.darker,
        borderRadius: '16px',
        padding: '32px',
        border: `1px solid ${COLORS.border}`,
        marginTop: '24px',
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '24px' }}>
        Recent Activity
      </h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        {ACTIVITIES.map((activity, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              background: COLORS.navy.dark,
              borderRadius: '12px',
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: COLORS.gold.base,
                marginRight: '16px',
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text.primary }}>
                {activity.action}
              </div>
              <div style={{ fontSize: '13px', color: COLORS.text.muted, marginTop: '4px' }}>
                {activity.detail}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: COLORS.text.muted }}>
              {activity.time}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
