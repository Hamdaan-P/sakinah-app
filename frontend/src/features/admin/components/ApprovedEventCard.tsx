/**
 * One card in the approved-events grid. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { CheckCircle, Calendar, MapPin, UsersThree, Eye } from '@phosphor-icons/react';
import { EVENT_CATEGORIES } from '../_constants';
import { formatDate } from '../_helpers';
import type { ApprovedEvent } from '../_types';

interface Props {
  event: ApprovedEvent;
  onShowDetails: (event: ApprovedEvent) => void;
  onShowAttendees: (event: ApprovedEvent) => void;
}

export function ApprovedEventCard({ event, onShowDetails, onShowAttendees }: Props) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
      whileHover={{ y: -4 }}
      style={{
        background: '#10151F',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(212,168,83,0.2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div
          style={{
            background: 'rgba(16,185,129, 0.1)',
            color: '#10B981',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <CheckCircle size={12} />
          APPROVED
        </div>
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
      </div>

      <h3 style={{ color: '#F5E8C7', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
        {event.name}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C9C0A8', fontSize: '13px' }}>
          <Calendar size={14} style={{ color: '#7A7363' }} />
          {formatDate(event.date)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C9C0A8', fontSize: '13px' }}>
          <UsersThree size={14} style={{ color: '#7A7363' }} />
          {event.attendees}/{event.capacity} attendees
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C9C0A8', fontSize: '13px' }}>
          <MapPin size={14} style={{ color: '#7A7363' }} />
          {event.location}
        </div>
      </div>

      <p style={{ color: '#7A7363', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
        {event.description}
      </p>

      <div style={{ display: 'flex', gap: '8px' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onShowDetails(event)}
          style={{
            flex: 1,
            background: '#161D2C',
            color: '#F5E8C7',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(212,168,83,0.2)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Eye size={14} />
          Details
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onShowAttendees(event)}
          style={{
            flex: 1,
            background: '#161D2C',
            color: '#F5E8C7',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(212,168,83,0.2)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <UsersThree size={14} />
          Attendees
        </motion.button>
      </div>
    </motion.div>
  );
}
