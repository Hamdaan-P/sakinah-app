/**
 * Full-screen overlay shown when an event card is tapped. Phase 5
 * split — delegates header, agenda, host/stats out to sibling
 * components.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { UsersThree, Calendar, Clock } from '@phosphor-icons/react';
import { EventDetailHeader } from './EventDetailHeader';
import { EventDetailVenueChips } from './EventDetailVenueChips';
import { EventDetailAgenda } from './EventDetailAgenda';
import { EventDetailHostStats } from './EventDetailHostStats';
import type { HalaqahEvent } from '../_types';

interface Props {
  event: HalaqahEvent | null;
  onClose: () => void;
  onShare: () => void;
}

export function EventDetailOverlay({ event, onClose, onShare }: Props) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '32px',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#10151F',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <EventDetailHeader event={event} onClose={onClose} />

            <div style={{ padding: '32px' }}>
              {/* About */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '12px' }}>About</div>
                <div style={{ fontSize: '16px', color: '#C9C0A8', lineHeight: '1.6', marginBottom: '16px' }}>
                  {event.description}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: '#10B98120',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#10B981',
                  }}
                >
                  <UsersThree size={16} />
                  {event.attendeeCount}/{event.capacity} Attendees
                </div>
              </div>

              {/* Date & Time */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '12px' }}>
                  Date & Time
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div
                    style={{
                      flex: 1,
                      padding: '16px',
                      background: '#10151F',
                      border: '1px solid rgba(212,168,83,0.2)',
                      borderRadius: '8px',
                    }}
                  >
                    <Calendar size={20} color="#D4A853" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', color: '#7A7363', marginBottom: '4px' }}>Date</div>
                    <div style={{ fontSize: '16px', color: '#F5E8C7' }}>{event.date}</div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: '16px',
                      background: '#10151F',
                      border: '1px solid rgba(212,168,83,0.2)',
                      borderRadius: '8px',
                    }}
                  >
                    <Clock size={20} color="#D4A853" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', color: '#7A7363', marginBottom: '4px' }}>Time</div>
                    <div style={{ fontSize: '16px', color: '#F5E8C7' }}>
                      {event.startTime} - {event.endTime}
                    </div>
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '12px' }}>Venue</div>
                <div
                  style={{
                    padding: '20px',
                    background: '#10151F',
                    border: '1px solid rgba(212,168,83,0.2)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: '500', color: '#F5E8C7', marginBottom: '8px' }}>
                    {event.venue}
                  </div>
                  <div style={{ fontSize: '14px', color: '#C9C0A8', marginBottom: '16px' }}>
                    {event.venueAddress}
                  </div>
                  <EventDetailVenueChips venueFeatures={event.venueFeatures} />
                </div>
              </div>

              <EventDetailAgenda agenda={event.agenda} />
              <EventDetailHostStats event={event} />

              {/* Share Button — auto-marketing entry point */}
              <button
                onClick={onShare}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(212,168,83,0.1)',
                  border: '1px solid rgba(212,168,83,0.3)',
                  borderRadius: '8px',
                  color: '#D4A853',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                }}
              >
                ✦ Share invite — auto-credit you for everyone who joins
              </button>

              {/* Register Button */}
              <motion.button
                disabled={event.attendeeCount >= event.capacity}
                style={{
                  width: '100%',
                  padding: '16px',
                  background:
                    event.attendeeCount >= event.capacity
                      ? '#161D2C'
                      : 'linear-gradient(135deg, #D4A853 0%, #E8C97A 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: event.attendeeCount >= event.capacity ? '#7A7363' : '#10151F',
                  cursor: event.attendeeCount >= event.capacity ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
                whileHover={
                  event.attendeeCount < event.capacity ? { scale: 1.02 } : {}
                }
                whileTap={
                  event.attendeeCount < event.capacity ? { scale: 0.98 } : {}
                }
              >
                {event.attendeeCount >= event.capacity ? 'Event Full' : 'Register for This Event'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
