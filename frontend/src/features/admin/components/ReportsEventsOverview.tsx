/**
 * Pending/Approved/Rejected progress bars for the Reports tab.
 * Phase 5 split.
 */

import { motion } from 'framer-motion';

const ITEMS = [
  { label: 'Pending', count: 12, total: 57, color: '#FB923C' },
  { label: 'Approved', count: 45, total: 57, color: '#10B981' },
  { label: 'Rejected', count: 0, total: 57, color: '#EF4444' },
];

export function ReportsEventsOverview() {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: '#F5E8C7', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Events Overview
      </h3>
      <div
        style={{
          background: '#10151F',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid rgba(212,168,83,0.2)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {ITEMS.map((item) => (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#C9C0A8', fontSize: '14px' }}>{item.label}</span>
                <span style={{ color: '#F5E8C7', fontSize: '14px', fontWeight: '600' }}>
                  {item.count} / {item.total}
                </span>
              </div>
              <div
                style={{
                  background: '#10151F',
                  borderRadius: '8px',
                  height: '10px',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / item.total) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ background: item.color, height: '100%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
