/**
 * Attendees tab content. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';
import { mockAttendees } from '../_data';
import type { Conference } from '../_types';

interface Props {
  conference: Conference;
}

export function ConferenceDetailAttendees({ conference }: Props) {
  return (
    <div>
      <div style={{ marginBottom: '16px', fontSize: '14px', color: '#7A7363' }}>
        {conference.registered} members registered
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {mockAttendees.map((attendee, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '16px',
              background: '#10151F',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: attendee.avatarColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#FFFFFF',
                }}
              >
                {attendee.name.charAt(0)}
              </div>
              {attendee.online && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#10B981',
                    border: '2px solid #10151F',
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#F5E8C7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attendee.name}
                </h4>
                {attendee.verified && <CheckCircle size={14} color="#3B82F6" fill="#3B82F6" />}
              </div>
              <p style={{ fontSize: '12px', color: '#C9C0A8', marginBottom: '2px' }}>{attendee.tagline}</p>
              <p style={{ fontSize: '11px', color: '#7A7363' }}>
                {attendee.designation} @ {attendee.company}
              </p>
            </div>
            <button
              style={{
                padding: '6px 12px',
                background: '#D4A853',
                border: 'none',
                borderRadius: '6px',
                color: '#10151F',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Connect
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
