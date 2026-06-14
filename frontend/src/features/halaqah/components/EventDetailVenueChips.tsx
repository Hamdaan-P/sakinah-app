/**
 * Venue feature chips for the event-detail overlay. Phase 5 split.
 */

import { NavigationArrow, House, Car, UserCheck } from '@phosphor-icons/react';
import type { HalaqahEvent } from '../_types';

interface Props {
  venueFeatures: HalaqahEvent['venueFeatures'];
}

const chipStyle = {
  padding: '6px 12px',
  background: '#161D2C',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#C9C0A8',
} as const;

const chipStyleFlex = {
  ...chipStyle,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
} as const;

export function EventDetailVenueChips({ venueFeatures }: Props) {
  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {venueFeatures.qiblaDirection && (
        <div style={chipStyleFlex}>
          <NavigationArrow size={12} />
          Qibla Direction
        </div>
      )}
      {venueFeatures.prayerSpace && (
        <div style={chipStyleFlex}>
          <House size={12} />
          Prayer Space
        </div>
      )}
      {venueFeatures.wuduFacilities && (
        <div style={chipStyle}>
          Wudu Facilities
        </div>
      )}
      {venueFeatures.parking && (
        <div style={chipStyleFlex}>
          <Car size={12} />
          Parking
        </div>
      )}
      {venueFeatures.wheelchairAccessible && (
        <div style={chipStyleFlex}>
          <UserCheck size={12} />
          Wheelchair Accessible
        </div>
      )}
    </div>
  );
}
