/**
 * Single networking-session card. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Clock, Calendar, UsersThree } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { getAvatarColor } from '../_helpers';
import type { NetworkingSession } from '../_types';

interface Props {
  session: NetworkingSession;
  idx: number;
  onSelect: (s: NetworkingSession) => void;
}

export function NetworkingSessionCard({ session, idx, onSelect }: Props) {
  return (
    <motion.div
      key={session.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(session)}
      style={{
        background: COLORS.navy.darker,
        borderRadius: '16px',
        padding: '32px',
        border: `1px solid ${COLORS.border}`,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text.primary }}>
              {session.title}
            </h3>
            <span
              style={{
                padding: '4px 12px',
                background: `${COLORS.gold.base}20`,
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                color: COLORS.gold.base,
              }}
            >
              {session.category}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: COLORS.text.secondary, lineHeight: '1.6', marginBottom: '16px' }}>
            {session.description}
          </p>

          <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color={COLORS.text.muted} />
              <span style={{ fontSize: '14px', color: COLORS.text.secondary }}>{session.time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color={COLORS.text.muted} />
              <span style={{ fontSize: '14px', color: COLORS.text.secondary }}>{session.duration}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: getAvatarColor(session.host),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: '#FFF',
              }}
            >
              {session.host
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text.primary }}>
                {session.host}
              </div>
              <div style={{ fontSize: '12px', color: COLORS.text.muted }}>
                {session.hostRole}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UsersThree size={16} color={COLORS.text.muted} />
              <span style={{ fontSize: '14px', color: COLORS.text.secondary }}>
                {session.attendees}/{session.capacity} attendees
              </span>
            </div>
            <div
              style={{
                flex: 1,
                height: '6px',
                background: COLORS.navy.dark,
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(session.attendees / session.capacity) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(to right, ${COLORS.gold.base}, ${COLORS.gold.light})`,
                }}
              />
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 32px',
            background: session.attendees < session.capacity ? COLORS.gold.base : COLORS.navy.dark,
            border: 'none',
            borderRadius: '12px',
            color: session.attendees < session.capacity ? COLORS.navy.darkest : COLORS.text.muted,
            fontSize: '14px',
            fontWeight: '600',
            cursor: session.attendees < session.capacity ? 'pointer' : 'not-allowed',
            marginLeft: '24px',
          }}
        >
          {session.attendees < session.capacity ? 'Join Session' : 'Full'}
        </motion.button>
      </div>
    </motion.div>
  );
}
