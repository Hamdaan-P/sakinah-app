/**
 * Modal showing the full details of a pending event with Approve/Reject
 * actions. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { EVENT_CATEGORIES } from '../_constants';
import { formatDate } from '../_helpers';
import type { PendingEvent } from '../_types';

interface Props {
  event: PendingEvent | null;
  open: boolean;
  onClose: () => void;
  onApprove: (event: PendingEvent) => void;
  onReject: (event: PendingEvent) => void;
}

export function PendingEventDetailDialog({ event, open, onClose, onApprove, onReject }: Props) {
  return (
    <AnimatePresence>
      {open && event && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0, 0.7)',
              zIndex: 50,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#10151F',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid rgba(212,168,83,0.2)',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              zIndex: 51,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div
                style={{
                  background: EVENT_CATEGORIES[event.category]?.color + '20',
                  color: EVENT_CATEGORIES[event.category]?.color,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                {event.category}
              </div>
            </div>

            <h2 style={{ color: '#F5E8C7', fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>
              {event.name}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Date</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>{formatDate(event.date)}</div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Venue</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>{event.venue}</div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Host</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>{event.hostName}</div>
                <div style={{ color: '#7A7363', fontSize: '13px' }}>{event.hostEmail}</div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Capacity</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>{event.capacity} attendees</div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '8px' }}>Description</div>
                <div style={{ color: '#C9C0A8', fontSize: '14px', lineHeight: '1.6' }}>
                  {event.description}
                </div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '8px' }}>Agenda</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {event.agenda.map((item, idx) => (
                    <div
                      key={idx}
                      style={{ color: '#C9C0A8', fontSize: '14px', display: 'flex', gap: '8px' }}
                    >
                      <span style={{ color: '#D4A853' }}>{idx + 1}.</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onApprove(event)}
                style={{
                  flex: 1,
                  background: 'rgba(16,185,129, 0.1)',
                  color: '#10B981',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(16,185,129, 0.3)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle size={18} />
                Approve Event
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onReject(event)}
                style={{
                  flex: 1,
                  background: 'rgba(239,68,68, 0.1)',
                  color: '#EF4444',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239,68,68, 0.3)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <XCircle size={18} />
                Reject Event
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
