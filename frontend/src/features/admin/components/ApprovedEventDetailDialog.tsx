/**
 * Modal showing the full details of an approved event. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';
import { EVENT_CATEGORIES } from '../_constants';
import { formatDate, formatDateTime } from '../_helpers';
import type { ApprovedEvent } from '../_types';

interface Props {
  event: ApprovedEvent | null;
  open: boolean;
  onClose: () => void;
}

export function ApprovedEventDetailDialog({ event, open, onClose }: Props) {
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
                  background: 'rgba(16,185,129, 0.1)',
                  color: '#10B981',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle size={14} />
                APPROVED
              </div>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Date</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>{formatDate(event.date)}</div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Location</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>{event.location}</div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Host</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>{event.hostName}</div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Attendance</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>
                  {event.attendees} / {event.capacity} registered
                </div>
                <div
                  style={{
                    background: '#10151F',
                    borderRadius: '4px',
                    height: '8px',
                    marginTop: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      background: '#10B981',
                      height: '100%',
                      width: `${(event.attendees / event.capacity) * 100}%`,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '8px' }}>Description</div>
                <div style={{ color: '#C9C0A8', fontSize: '14px', lineHeight: '1.6' }}>
                  {event.description}
                </div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Approved On</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>
                  {formatDateTime(event.approvedAt)}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
