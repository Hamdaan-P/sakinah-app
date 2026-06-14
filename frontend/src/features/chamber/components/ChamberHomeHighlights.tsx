/**
 * "Highlights" two-column panel for the Home tab. Phase 5 split.
 */

import { UsersThree, Graph, Clock } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { mockMembers, mockSessions } from '../_data';
import { getAvatarColor } from '../_helpers';

export function ChamberHomeHighlights() {
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '24px' }}>
        Highlights
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div
          style={{
            background: COLORS.navy.darker,
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <UsersThree size={24} color={COLORS.gold.base} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text.primary, marginLeft: '12px' }}>
              Top Members
            </h3>
          </div>
          {mockMembers.slice(0, 3).map((member) => (
            <div
              key={member.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 0',
                borderTop: `1px solid ${COLORS.border}`,
              }}
            >
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
                  marginRight: '12px',
                }}
              >
                {member.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text.primary }}>
                  {member.name}
                </div>
                <div style={{ fontSize: '12px', color: COLORS.text.muted }}>
                  {member.connections} connections
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: COLORS.navy.darker,
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <Graph size={24} color={COLORS.gold.base} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text.primary, marginLeft: '12px' }}>
              Upcoming Sessions
            </h3>
          </div>
          {mockSessions.slice(0, 3).map((session) => (
            <div
              key={session.id}
              style={{
                padding: '12px 0',
                borderTop: `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text.primary }}>
                {session.title}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: COLORS.text.muted,
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Clock size={12} style={{ marginRight: '4px' }} />
                {session.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
