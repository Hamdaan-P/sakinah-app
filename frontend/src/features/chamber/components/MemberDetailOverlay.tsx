/**
 * Member detail bottom-sheet overlay. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, CheckCircle } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { getAvatarColor } from '../_helpers';
import { MemberDetailExperience } from './MemberDetailExperience';
import type { Member } from '../_types';

interface Props {
  member: Member | null;
  onClose: () => void;
}

export function MemberDetailOverlay({ member, onClose }: Props) {
  return (
    <AnimatePresence>
      {member && (
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
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              background: COLORS.navy.darker,
              borderRadius: '24px 24px 0 0',
              overflow: 'auto',
            }}
          >
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text.primary }}>
                  Member Profile
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

              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: getAvatarColor(member.name),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: '600',
                    color: '#FFF',
                    position: 'relative',
                  }}
                >
                  {member.avatar}
                  {member.premium && (
                    <Crown size={24} color={COLORS.gold.base} style={{ position: 'absolute', top: '-4px', right: '-4px' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '600', color: COLORS.text.primary }}>
                      {member.name}
                    </h3>
                    {member.verified && <CheckCircle size={20} color="#10B981" />}
                  </div>
                  <div style={{ fontSize: '16px', color: COLORS.text.secondary, marginBottom: '4px' }}>
                    {member.role}
                  </div>
                  <div style={{ fontSize: '14px', color: COLORS.text.muted }}>{member.company}</div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '12px' }}>
                  About
                </h4>
                <p style={{ fontSize: '14px', color: COLORS.text.secondary, lineHeight: '1.6' }}>
                  {member.bio}
                </p>
              </div>

              <MemberDetailExperience member={member} />

              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
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
                  Connect
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: 'transparent',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '12px',
                    color: COLORS.text.secondary,
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  PaperPlaneRight Referral
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
