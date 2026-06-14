/**
 * One row in the Host Dashboard overlay's filtered events list.
 * Phase 5 split.
 */

import { motion } from 'framer-motion';
import {
  Calendar,
  UsersThree,
  WarningCircle,
  PencilSimple,
  ChartBar,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import type { HalaqahEvent } from '../_types';

interface Props {
  event: HalaqahEvent;
  idx: number;
}

const statusColor = (status: HalaqahEvent['status']): string =>
  status === 'approved' ? '#10B981' : status === 'pending' ? '#F59E0B' : status === 'rejected' ? '#EF4444' : '#6B7280';

const actionBtnStyle = (color: string) => ({
  padding: '8px 16px',
  background: `${color}20`,
  border: `1px solid ${color}`,
  borderRadius: '8px',
  color,
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

export function HostDashboardEventRow({ event, idx }: Props) {
  const color = statusColor(event.status);
  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      style={{
        background: '#10151F',
        border: '1px solid rgba(212,168,83,0.2)',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#F5E8C7', marginBottom: '8px' }}>
            {event.name}
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#C9C0A8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              {event.date}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UsersThree size={14} />
              {event.attendeeCount}/{event.capacity}
            </div>
          </div>
        </div>
        <div
          style={{
            padding: '6px 16px',
            background: `${color}20`,
            border: `1px solid ${color}`,
            borderRadius: '20px',
            fontSize: '12px',
            color,
            height: 'fit-content',
          }}
        >
          {event.status.toUpperCase()}
        </div>
      </div>
      {event.status === 'rejected' && event.rejectionReason && (
        <div
          style={{
            padding: '12px',
            background: '#EF444420',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#EF4444',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <WarningCircle size={16} />
          {event.rejectionReason}
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px' }}>
        {event.status === 'approved' && (
          <>
            <motion.button
              style={actionBtnStyle('#10B981')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UsersThree size={16} />
              Attendees
            </motion.button>
            <motion.button
              style={actionBtnStyle('#3B82F6')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChartBar size={16} />
              Analytics
            </motion.button>
          </>
        )}
        {event.status === 'pending' && (
          <motion.button
            style={actionBtnStyle('#F59E0B')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PencilSimple size={16} />
            PencilSimple Event
          </motion.button>
        )}
        {event.status === 'rejected' && (
          <motion.button
            style={actionBtnStyle('#10B981')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowsClockwise size={16} />
            Resubmit
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
