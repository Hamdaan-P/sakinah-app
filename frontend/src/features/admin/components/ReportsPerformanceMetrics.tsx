/**
 * 3-metric performance row for the Reports tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Pulse, Trophy, TrendUp } from '@phosphor-icons/react';

const METRICS = [
  { label: 'Avg. Attendance', value: '68%', icon: Pulse, color: '#3B82F6' },
  { label: 'Verification Rate', value: '71%', icon: Trophy, color: '#10B981' },
  { label: 'Success Rate', value: '95%', icon: TrendUp, color: '#D4A853' },
];

export function ReportsPerformanceMetrics() {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: '#F5E8C7', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Performance Metrics
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {METRICS.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              background: '#10151F',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(212,168,83,0.2)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                background: `${metric.color}20`,
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <metric.icon size={24} style={{ color: metric.color }} />
            </div>
            <div style={{ color: '#F5E8C7', fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>
              {metric.value}
            </div>
            <div style={{ color: '#7A7363', fontSize: '13px' }}>{metric.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
