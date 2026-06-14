/**
 * 4-stat tile grid for the Halaqah Admin dashboard tab.
 * Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Clock, CheckCircle, UsersThree, ChartBar } from '@phosphor-icons/react';
import type { AdminStats } from '../_types';

interface Props {
  stats: AdminStats;
}

const cardStyle = {
  background: '#10151F',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid rgba(212,168,83,0.2)',
};

interface StatCardProps {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  Icon: typeof Clock;
}

function StatCard({ label, value, iconBg, iconColor, Icon }: StatCardProps) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      style={cardStyle}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: '#7A7363', fontSize: '14px', marginBottom: '8px' }}>{label}</div>
          <div style={{ color: '#F5E8C7', fontSize: '32px', fontWeight: '600' }}>{value}</div>
        </div>
        <div style={{ background: iconBg, padding: '10px', borderRadius: '8px' }}>
          <Icon size={24} style={{ color: iconColor }} />
        </div>
      </div>
    </motion.div>
  );
}

export function StatsGrid({ stats }: Props) {
  return (
    <motion.div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        marginBottom: '32px',
      }}
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}
      initial="hidden"
      animate="show"
    >
      <StatCard label="Pending Events" value={stats.pending} iconBg="rgba(251,146,60, 0.1)" iconColor="#FB923C" Icon={Clock} />
      <StatCard label="Approved Events" value={stats.approved} iconBg="rgba(16,185,129, 0.1)" iconColor="#10B981" Icon={CheckCircle} />
      <StatCard label="Total Hosts" value={stats.totalHosts} iconBg="rgba(59,130,246, 0.1)" iconColor="#3B82F6" Icon={UsersThree} />
      <StatCard label="Reports" value={stats.reports} iconBg="rgba(212,168,83, 0.1)" iconColor="#D4A853" Icon={ChartBar} />
    </motion.div>
  );
}
