/**
 * 4-tile "Quick Summary" grid for the Reports tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Calendar, UsersThree, Target, TrendUp } from '@phosphor-icons/react';

const STATS = [
  { label: 'Total Events', value: '57', icon: Calendar, color: '#3B82F6' },
  { label: 'Total Hosts', value: '28', icon: UsersThree, color: '#8B5CF6' },
  { label: 'Total Attendees', value: '1,245', icon: Target, color: '#10B981' },
  { label: 'Approval Rate', value: '78%', icon: TrendUp, color: '#D4A853' },
];

export function ReportsQuickSummary() {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: '#F5E8C7', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Quick Summary
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {STATS.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              background: '#10151F',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(212,168,83,0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
              }}
            >
              <div style={{ color: '#7A7363', fontSize: '13px' }}>{stat.label}</div>
              <div style={{ background: `${stat.color}20`, padding: '6px', borderRadius: '6px' }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            </div>
            <div style={{ color: '#F5E8C7', fontSize: '28px', fontWeight: '600' }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
