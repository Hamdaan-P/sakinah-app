/**
 * Industry breakdown bar list for the Analytics tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { COLORS } from '../_constants';

const ITEMS = [
  { industry: 'Technology', percentage: 28, count: 69 },
  { industry: 'Finance', percentage: 22, count: 55 },
  { industry: 'Healthcare', percentage: 18, count: 45 },
  { industry: 'Real Estate', percentage: 15, count: 37 },
  { industry: 'Education', percentage: 10, count: 25 },
  { industry: 'Other', percentage: 7, count: 17 },
];

export function AnalyticsIndustryBreakdown() {
  return (
    <div
      style={{
        background: COLORS.navy.darker,
        borderRadius: '16px',
        padding: '32px',
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '24px' }}>
        Industry Breakdown
      </h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        {ITEMS.map((item, idx) => (
          <div key={item.industry}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: COLORS.text.secondary }}>{item.industry}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: COLORS.text.primary }}>
                {item.percentage}% ({item.count})
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: COLORS.navy.dark, borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                style={{
                  height: '100%',
                  background: `linear-gradient(to right, ${COLORS.gold.base}, ${COLORS.gold.light})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
