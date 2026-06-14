/**
 * Recent activity feed for the Halaqah Admin dashboard tab.
 * Phase 5 split.
 */

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, UserCheck } from '@phosphor-icons/react';
import { MOCK_ACTIVITIES } from '../_mockData';
import { formatDateTime } from '../_helpers';

export function RecentActivity() {
  return (
    <div>
      <h3 style={{ color: '#F5E8C7', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Recent Activity
      </h3>
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}
        initial="hidden"
        animate="show"
      >
        {MOCK_ACTIVITIES.map((activity) => (
          <motion.div
            key={activity.id}
            variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
            style={{
              background: '#10151F',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(212,168,83,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  background:
                    activity.type === 'approved'
                      ? 'rgba(16,185,129, 0.1)'
                      : activity.type === 'rejected'
                      ? 'rgba(239,68,68, 0.1)'
                      : 'rgba(59,130,246, 0.1)',
                  padding: '8px',
                  borderRadius: '6px',
                }}
              >
                {activity.type === 'approved' && (
                  <CheckCircle size={18} style={{ color: '#10B981' }} />
                )}
                {activity.type === 'rejected' && (
                  <XCircle size={18} style={{ color: '#EF4444' }} />
                )}
                {activity.type === 'verified' && (
                  <UserCheck size={18} style={{ color: '#3B82F6' }} />
                )}
              </div>
              <div>
                <div style={{ color: '#F5E8C7', fontSize: '14px', fontWeight: '500' }}>
                  {activity.action}
                </div>
                <div style={{ color: '#7A7363', fontSize: '13px' }}>{activity.eventName}</div>
              </div>
            </div>
            <div style={{ color: '#7A7363', fontSize: '13px' }}>
              {formatDateTime(activity.timestamp)}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
