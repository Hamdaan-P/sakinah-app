/**
 * Modal showing the registered-attendees list for an approved event.
 * Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { formatDateTime } from '../_helpers';
import type { ApprovedEvent } from '../_types';

interface Props {
  event: ApprovedEvent | null;
  open: boolean;
  onClose: () => void;
}

export function AttendeesDialog({ event, open, onClose }: Props) {
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
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
              zIndex: 51,
            }}
          >
            <h3 style={{ color: '#F5E8C7', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              Event Attendees
            </h3>
            <p style={{ color: '#7A7363', fontSize: '14px', marginBottom: '24px' }}>
              {event.name}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: '#C9C0A8', fontSize: '14px' }}>
                <span style={{ color: '#D4A853', fontWeight: '600' }}>{event.attendees}</span>{' '}
                / {event.capacity} registered
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {event.attendeesList.map((attendee, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#10151F',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(212,168,83,0.2)',
                  }}
                >
                  <div style={{ color: '#F5E8C7', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    {attendee.name}
                  </div>
                  <div style={{ color: '#7A7363', fontSize: '13px', marginBottom: '4px' }}>
                    {attendee.email}
                  </div>
                  <div style={{ color: '#7A7363', fontSize: '12px' }}>
                    Registered: {formatDateTime(attendee.registeredAt)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
