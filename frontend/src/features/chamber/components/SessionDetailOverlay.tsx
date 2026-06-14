/**
 * Networking-session detail overlay. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, UsersThree } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import type { NetworkingSession } from '../_types';

interface Props {
  session: NetworkingSession | null;
  onClose: () => void;
}

export function SessionDetailOverlay({ session, onClose }: Props) {
  return (
    <AnimatePresence>
      {session && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '600px',
              background: COLORS.navy.darker,
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text.primary }}>
                Session Details
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: COLORS.navy.dark,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={20} color={COLORS.text.secondary} />
              </motion.button>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '16px' }}>
              {session.title}
            </h3>
            <p style={{ fontSize: '14px', color: COLORS.text.secondary, lineHeight: '1.6', marginBottom: '24px' }}>
              {session.description}
            </p>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} color={COLORS.gold.base} />
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.text.muted }}>Time</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text.primary }}>
                    {session.time}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={20} color={COLORS.gold.base} />
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.text.muted }}>Duration</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text.primary }}>
                    {session.duration}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <UsersThree size={20} color={COLORS.gold.base} />
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.text.muted }}>Attendees</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text.primary }}>
                    {session.attendees}/{session.capacity}
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: COLORS.gold.base,
                border: 'none',
                borderRadius: '12px',
                color: COLORS.navy.darkest,
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Register for Session
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
