/**
 * Host info card + statistics grid for the event-detail overlay.
 * Phase 5 split.
 */

import { ShieldCheck, Star, UserCheck, Check, TrendUp } from '@phosphor-icons/react';
import type { HalaqahEvent } from '../_types';

interface Props {
  event: HalaqahEvent;
}

export function EventDetailHostStats({ event }: Props) {
  return (
    <>
      {/* Host */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '12px' }}>Host</div>
        <div
          style={{
            padding: '20px',
            background: '#10151F',
            border: '1px solid rgba(212,168,83,0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '28px',
              background: 'linear-gradient(135deg, #D4A853 0%, #E8C97A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#10151F',
            }}
          >
            {event.hostName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: '500', color: '#F5E8C7' }}>{event.hostName}</div>
              {event.hostVerified && (
                <ShieldCheck size={16} color="#10B981" style={{ fill: '#10B981' }} />
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} color="#F59E0B" style={{ fill: '#F59E0B' }} />
              <span style={{ fontSize: '14px', color: '#C9C0A8' }}>{event.hostRating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '12px' }}>
          Statistics
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Registered', value: event.registeredCount, icon: <UserCheck size={20} /> },
            { label: 'Checked In', value: event.checkedInCount, icon: <Check size={20} /> },
            {
              label: 'Attendance',
              value: `${Math.round((event.checkedInCount / event.registeredCount) * 100)}%`,
              icon: <TrendUp size={20} />,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                background: '#10151F',
                border: '1px solid rgba(212,168,83,0.2)',
                borderRadius: '8px',
              }}
            >
              <div style={{ color: '#D4A853', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F5E8C7', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: '#7A7363' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
