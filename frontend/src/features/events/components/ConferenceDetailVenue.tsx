/**
 * Venue tab content. Phase 5 split.
 */

import { MapPin, Car, WifiHigh, Buildings, CheckCircle } from '@phosphor-icons/react';
import type { Conference } from '../_types';

interface Props {
  conference: Conference;
}

export function ConferenceDetailVenue({ conference }: Props) {
  return (
    <div>
      <div style={{ padding: '24px', background: '#10151F', borderRadius: '12px', border: '1px solid rgba(212,168,83,0.2)', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#F5E8C7', marginBottom: '12px' }}>
          {conference.venue.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#C9C0A8', marginBottom: '24px' }}>
          <MapPin size={18} color="#D4A853" style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>{conference.venue.address}</span>
        </div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#7A7363', marginBottom: '12px' }}>AMENITIES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {conference.venue.amenities.map((amenity) => {
            let icon = null;
            if (amenity.includes('Parking')) icon = <Car size={16} />;
            else if (amenity.includes('WiFi')) icon = <WifiHigh size={16} />;
            else if (amenity.includes('Access')) icon = <Buildings size={16} />;
            else icon = <CheckCircle size={16} />;

            return (
              <div
                key={amenity}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: '#161D2C',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#C9C0A8',
                }}
              >
                <div style={{ color: '#D4A853' }}>{icon}</div>
                {amenity}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
