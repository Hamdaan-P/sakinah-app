/**
 * Shared header (title + date/time/venue chips + status badge) used by
 * each row in the "My Events" tab. Phase 5 split.
 */

import { Calendar, Clock, MapPin } from '@phosphor-icons/react';
import type { HalaqahEvent } from '../_types';

interface Props {
  event: HalaqahEvent;
  badgeLabel: string;
  badgeColor: string;
}

export function MyEventCardHeader({ event, badgeLabel, badgeColor }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '8px' }}>
          {event.name}
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#C9C0A8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} />
            {event.date}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} />
            {event.startTime}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} />
            {event.venue}
          </div>
        </div>
      </div>
      <div
        style={{
          padding: '6px 16px',
          background: `${badgeColor}20`,
          border: `1px solid ${badgeColor}`,
          borderRadius: '20px',
          fontSize: '12px',
          color: badgeColor,
          height: 'fit-content',
        }}
      >
        {badgeLabel}
      </div>
    </div>
  );
}
