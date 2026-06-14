/**
 * One card in the Members tab grid. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Crown, CheckCircle, MapPin } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { getAvatarColor } from '../_helpers';
import type { Member } from '../_types';

interface Props {
  member: Member;
  idx: number;
  onSelect: (m: Member) => void;
}

export function MemberCard({ member, idx, onSelect }: Props) {
  return (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: idx * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(member)}
      style={{
        background: COLORS.navy.darker,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${COLORS.border}`,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: getAvatarColor(member.name),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '600',
            color: '#FFF',
            marginRight: '16px',
            position: 'relative',
          }}
        >
          {member.avatar}
          {member.premium && (
            <Crown size={16} color={COLORS.gold.base} style={{ position: 'absolute', top: '-4px', right: '-4px' }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text.primary }}>
              {member.name}
            </span>
            {member.verified && <CheckCircle size={16} color="#10B981" />}
          </div>
          <div style={{ fontSize: '14px', color: COLORS.text.secondary, marginTop: '4px' }}>
            {member.role}
          </div>
          <div style={{ fontSize: '13px', color: COLORS.text.muted, marginTop: '2px' }}>
            {member.company}
          </div>
        </div>
      </div>

      <p
        style={{
          fontSize: '14px',
          color: COLORS.text.secondary,
          lineHeight: '1.5',
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {member.bio}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} color={COLORS.text.muted} />
            <span style={{ fontSize: '12px', color: COLORS.text.muted }}>
              {member.location.split(',')[0]}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: COLORS.text.muted }}>
            {member.connections} connections
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '6px 16px',
            background: COLORS.gold.base,
            border: 'none',
            borderRadius: '8px',
            color: COLORS.navy.darkest,
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Connect
        </motion.button>
      </div>
    </motion.div>
  );
}
