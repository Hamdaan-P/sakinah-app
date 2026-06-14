/**
 * Category-distribution legend for the Reports tab. Phase 5 split.
 */

import { motion } from 'framer-motion';

const ITEMS = [
  { category: 'Quran Study', count: 12, color: '#10B981' },
  { category: 'Islamic Lecture', count: 10, color: '#8B5CF6' },
  { category: 'Community Gathering', count: 9, color: '#F59E0B' },
  { category: 'Youth Program', count: 8, color: '#EC4899' },
  { category: 'Hadith Discussion', count: 7, color: '#3B82F6' },
];

export function ReportsCategoryDistribution() {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: '#F5E8C7', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Category Distribution
      </h3>
      <div
        style={{
          background: '#10151F',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid rgba(212,168,83,0.2)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ITEMS.map((item, idx) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    background: item.color,
                  }}
                />
                <span style={{ color: '#C9C0A8', fontSize: '14px' }}>{item.category}</span>
              </div>
              <span style={{ color: '#F5E8C7', fontSize: '14px', fontWeight: '600' }}>
                {item.count}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
