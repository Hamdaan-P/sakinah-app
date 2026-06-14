/**
 * "Recent Activity" feed for the Reports tab (slightly different style
 * from the dashboard's RecentActivity, so kept separate). Phase 5 split.
 */

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, UserCheck } from '@phosphor-icons/react';
import { MOCK_ACTIVITIES } from '../_mockData';
import { formatDateTime } from '../_helpers';

export function ReportsRecentActivity() {
  return (
    <div>
      <h3 style={{ color: '#F5E8C7', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Recent Activity
      </h3>
      <div
        style={{
          background: '#10151F',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(212,168,83,0.2)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MOCK_ACTIVITIES.map((activity, idx) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: '#10151F',
                borderRadius: '8px',
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
                    padding: '6px',
                    borderRadius: '6px',
                  }}
                >
                  {activity.type === 'approved' && <CheckCircle size={16} style={{ color: '#10B981' }} />}
                  {activity.type === 'rejected' && <XCircle size={16} style={{ color: '#EF4444' }} />}
                  {activity.type === 'verified' && <UserCheck size={16} style={{ color: '#3B82F6' }} />}
                </div>
                <div>
                  <div style={{ color: '#F5E8C7', fontSize: '13px', fontWeight: '500' }}>
                    {activity.action}
                  </div>
                  <div style={{ color: '#7A7363', fontSize: '12px' }}>{activity.eventName}</div>
                </div>
              </div>
              <div style={{ color: '#7A7363', fontSize: '12px' }}>
                {formatDateTime(activity.timestamp)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
