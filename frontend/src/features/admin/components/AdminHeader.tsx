/**
 * Page header + tabs row for the Halaqah Admin page. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { SquaresFour, Clock, CheckCircle, UsersThree, ChartBar } from '@phosphor-icons/react';
import type { TabType } from '../_types';

const TABS = [
  { id: 'dashboard' as TabType, label: 'Dashboard', icon: SquaresFour },
  { id: 'pending' as TabType, label: 'Pending Events', icon: Clock },
  { id: 'approved' as TabType, label: 'Approved Events', icon: CheckCircle },
  { id: 'hosts' as TabType, label: 'Hosts', icon: UsersThree },
  { id: 'reports' as TabType, label: 'Reports', icon: ChartBar },
];

interface Props {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export function AdminHeader({ activeTab, onChangeTab }: Props) {
  return (
    <>
      <div
        style={{
          padding: '24px',
          borderBottom: '1px solid rgba(212,168,83,0.2)',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#7A7363', fontSize: '14px' }}>
          Manage events, hosts, and platform operations
        </p>
      </div>

      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(212,168,83,0.2)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
        }}
      >
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChangeTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#161D2C' : 'transparent',
              color: activeTab === tab.id ? '#F5E8C7' : '#7A7363',
              padding: '10px 20px',
              borderRadius: '20px',
              border: `1px solid ${activeTab === tab.id ? '#D4A853' : 'transparent'}`,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </motion.button>
        ))}
      </div>
    </>
  );
}
