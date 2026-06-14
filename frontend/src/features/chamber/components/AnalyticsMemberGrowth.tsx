/**
 * Member growth bar chart for the Analytics tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { COLORS } from '../_constants';

const DATA = [
  { month: 'Jul', value: 65 },
  { month: 'Aug', value: 72 },
  { month: 'Sep', value: 78 },
  { month: 'Oct', value: 85 },
  { month: 'Nov', value: 91 },
  { month: 'Dec', value: 100 },
];

export function AnalyticsMemberGrowth() {
  return (
    <div
      style={{
        background: COLORS.navy.darker,
        borderRadius: '16px',
        padding: '32px',
        border: `1px solid ${COLORS.border}`,
        marginBottom: '24px',
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '24px' }}>
        Member Growth
      </h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px' }}>
        {DATA.map((data, idx) => (
          <div key={data.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${data.value}%` }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              style={{
                width: '100%',
                background: `linear-gradient(to top, ${COLORS.gold.base}, ${COLORS.gold.light})`,
                borderRadius: '8px 8px 0 0',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '-24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: COLORS.text.secondary,
                }}
              >
                {Math.round((data.value / 100) * 248)}
              </span>
            </motion.div>
            <span style={{ fontSize: '12px', color: COLORS.text.muted, marginTop: '8px' }}>
              {data.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
