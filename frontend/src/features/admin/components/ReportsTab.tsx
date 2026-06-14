/**
 * Reports & Analytics tab wrapper. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { ReportsQuickSummary } from './ReportsQuickSummary';
import { ReportsEventsOverview } from './ReportsEventsOverview';
import { ReportsHostsOverview } from './ReportsHostsOverview';
import { ReportsCategoryDistribution } from './ReportsCategoryDistribution';
import { ReportsPerformanceMetrics } from './ReportsPerformanceMetrics';
import { ReportsRecentActivity } from './ReportsRecentActivity';

export function ReportsTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px' }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#F5E8C7', fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
          Reports & Analytics
        </h2>
        <p style={{ color: '#7A7363', fontSize: '14px' }}>
          Platform statistics and performance metrics
        </p>
      </div>

      <ReportsQuickSummary />
      <ReportsEventsOverview />
      <ReportsHostsOverview />
      <ReportsCategoryDistribution />
      <ReportsPerformanceMetrics />
      <ReportsRecentActivity />
    </motion.div>
  );
}
