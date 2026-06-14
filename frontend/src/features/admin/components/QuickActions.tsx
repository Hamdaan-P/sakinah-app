/**
 * Quick-action buttons row for the Halaqah Admin dashboard tab.
 * Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Clock, CheckCircle, UsersThree } from '@phosphor-icons/react';
import type { TabType } from '../_types';

interface Props {
  onNavigate: (tab: TabType) => void;
}

const btnStyle = {
  background: '#161D2C',
  color: '#F5E8C7',
  padding: '12px 20px',
  borderRadius: '8px',
  border: '1px solid rgba(212,168,83,0.2)',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

export function QuickActions({ onNavigate }: Props) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: '#F5E8C7', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Quick Actions
      </h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('pending')}
          style={btnStyle}
        >
          <Clock size={16} />
          Review Pending Events
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('approved')}
          style={btnStyle}
        >
          <CheckCircle size={16} />
          Manage Approved Events
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('hosts')}
          style={btnStyle}
        >
          <UsersThree size={16} />
          View Hosts
        </motion.button>
      </div>
    </div>
  );
}
