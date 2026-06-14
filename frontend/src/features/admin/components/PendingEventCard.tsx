/**
 * One card in the pending-events grid. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Clock, Calendar, MapPin, UsersThree, CheckCircle, XCircle } from '@phosphor-icons/react';
import { EVENT_CATEGORIES } from '../_constants';
import { formatDate, formatDateTime } from '../_helpers';
import type { PendingEvent } from '../_types';

interface Props {
  event: PendingEvent;
  onSelect: (event: PendingEvent) => void;
  onApprove: (event: PendingEvent) => void;
  onReject: (event: PendingEvent) => void;
}

export function PendingEventCard({ event, onSelect, onApprove, onReject }: Props) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
      whileHover={{ y: -4 }}
      style={{
        background: '#10151F',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(212,168,83,0.2)',
        cursor: 'pointer',
      }}
      onClick={() => onSelect(event)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div
          style={{
            background: EVENT_CATEGORIES[event.category]?.color + '20',
            color: EVENT_CATEGORIES[event.category]?.color,
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          {event.category}
        </div>
        <div style={{ color: '#7A7363', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={14} />
          {formatDateTime(event.submittedAt)}
        </div>
      </div>

      <h3 style={{ color: '#F5E8C7', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
        {event.name}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C9C0A8', fontSize: '13px' }}>
          <Calendar size={14} style={{ color: '#7A7363' }} />
          {formatDate(event.date)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C9C0A8', fontSize: '13px' }}>
          <MapPin size={14} style={{ color: '#7A7363' }} />
          {event.venue}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C9C0A8', fontSize: '13px' }}>
          <UsersThree size={14} style={{ color: '#7A7363' }} />
          {event.hostName} • Capacity: {event.capacity}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            onApprove(event);
          }}
          style={{
            flex: 1,
            background: 'rgba(16,185,129, 0.1)',
            color: '#10B981',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(16,185,129, 0.3)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <CheckCircle size={16} />
          Approve
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            onReject(event);
          }}
          style={{
            flex: 1,
            background: 'rgba(239,68,68, 0.1)',
            color: '#EF4444',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(239,68,68, 0.3)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <XCircle size={16} />
          Reject
        </motion.button>
      </div>
    </motion.div>
  );
}
