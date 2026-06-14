/**
 * Top referrers list for the Analytics tab. Phase 5 split.
 */

import { Trophy } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { mockMembers } from '../_data';
import { getAvatarColor } from '../_helpers';

export function AnalyticsTopReferrers() {
  return (
    <div
      style={{
        background: COLORS.navy.darker,
        borderRadius: '16px',
        padding: '32px',
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '24px' }}>
        Top Referrers
      </h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        {mockMembers.slice(0, 5).map((member, idx) => (
          <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: idx < 3 ? COLORS.gold.base : COLORS.navy.dark,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: idx < 3 ? COLORS.navy.darkest : COLORS.text.muted,
              }}
            >
              {idx + 1}
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: getAvatarColor(member.name),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: '#FFF',
              }}
            >
              {member.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text.primary }}>
                {member.name}
              </div>
              <div style={{ fontSize: '12px', color: COLORS.text.muted }}>
                {15 - idx * 2} referrals · {8 - idx} deals
              </div>
            </div>
            <Trophy size={20} color={idx === 0 ? COLORS.gold.base : COLORS.text.muted} />
          </div>
        ))}
      </div>
    </div>
  );
}
