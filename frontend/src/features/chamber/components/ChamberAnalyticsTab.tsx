/**
 * ChamberV2 Analytics tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { COLORS } from '../_constants';
import { AnalyticsKeyMetrics } from './AnalyticsKeyMetrics';
import { AnalyticsMemberGrowth } from './AnalyticsMemberGrowth';
import { AnalyticsIndustryBreakdown } from './AnalyticsIndustryBreakdown';
import { AnalyticsTopReferrers } from './AnalyticsTopReferrers';
import { AnalyticsRecentActivity } from './AnalyticsRecentActivity';
import type { AnalyticsPeriod } from '../_types';

interface Props {
  analyticsPeriod: AnalyticsPeriod;
  onChangePeriod: (p: AnalyticsPeriod) => void;
}

const PERIODS: AnalyticsPeriod[] = ['Week', 'Month', 'Quarter', 'Year'];

export function ChamberAnalyticsTab({ analyticsPeriod, onChangePeriod }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '32px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: COLORS.text.primary }}>
          Chamber Analytics
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {PERIODS.map((period) => (
            <motion.button
              key={period}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChangePeriod(period)}
              style={{
                padding: '8px 20px',
                background: analyticsPeriod === period ? COLORS.gold.base : COLORS.navy.dark,
                border: `1px solid ${analyticsPeriod === period ? COLORS.gold.base : COLORS.border}`,
                borderRadius: '10px',
                color: analyticsPeriod === period ? COLORS.navy.darkest : COLORS.text.secondary,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {period}
            </motion.button>
          ))}
        </div>
      </div>

      <AnalyticsKeyMetrics />
      <AnalyticsMemberGrowth />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <AnalyticsIndustryBreakdown />
        <AnalyticsTopReferrers />
      </div>

      <AnalyticsRecentActivity />
    </motion.div>
  );
}
