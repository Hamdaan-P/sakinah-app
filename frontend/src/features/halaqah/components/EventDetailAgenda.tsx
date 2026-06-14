/**
 * Agenda list for the event-detail overlay. Phase 5 split.
 */

import type { HalaqahEvent } from '../_types';

interface Props {
  agenda: HalaqahEvent['agenda'];
}

export function EventDetailAgenda({ agenda }: Props) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '12px' }}>
        Event Agenda
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {agenda.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: '16px',
              background: '#10151F',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRadius: '8px',
              display: 'flex',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                background: '#D4A853',
                color: '#10151F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                flexShrink: 0,
              }}
            >
              {idx + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#F5E8C7', marginBottom: '4px' }}>
                {item.title}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#C9C0A8',
                  marginBottom: '4px',
                  fontFamily: 'serif',
                  direction: 'rtl',
                }}
              >
                {item.arabicTitle}
              </div>
              <div style={{ fontSize: '12px', color: '#7A7363' }}>{item.duration} minutes</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
