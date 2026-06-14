/**
 * Dashboard tab for the Halaqah Admin page.
 * Phase 5 split.
 */

import { motion } from 'framer-motion';
import { StatsGrid } from './StatsGrid';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import type { AdminStats, TabType } from '../_types';

interface Props {
  stats: AdminStats;
  onNavigate: (tab: TabType) => void;
}

export function DashboardTab({ stats, onNavigate }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px' }}
    >
      <StatsGrid stats={stats} />
      <QuickActions onNavigate={onNavigate} />
      <RecentActivity />
    </motion.div>
  );
}
