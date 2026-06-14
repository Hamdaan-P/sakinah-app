/**
 * Host wizard step 3: venue. Phase 5 split.
 */

import { motion } from 'framer-motion';
import type { HostFormData } from '../_types';

interface Props {
  hostFormData: HostFormData;
  onChange: (data: HostFormData) => void;
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  background: '#10151F',
  border: '1px solid rgba(212,168,83,0.2)',
  borderRadius: '8px',
  color: '#F5E8C7',
  fontSize: '14px',
  outline: 'none',
};

const TEXT_FIELDS = [
  { label: 'Venue Name', type: 'text', key: 'venueName' },
  { label: 'Full Address', type: 'text', key: 'venueAddress' },
  { label: 'Landmarks', type: 'text', key: 'landmarks' },
];

const TOGGLES = [
  { label: 'Has Parking', key: 'hasParking' },
  { label: 'Has Prayer Space', key: 'hasPrayerSpace' },
  { label: 'Wheelchair Accessible', key: 'wheelchairAccessible' },
];

export function HostFormStep3({ hostFormData, onChange }: Props) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div style={{ fontSize: '24px', fontWeight: '600', color: '#F5E8C7', marginBottom: '24px' }}>
        Venue Information
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {TEXT_FIELDS.map((field) => (
          <div key={field.key}>
            <label htmlFor="halaqahpage-fld-8" style={{ display: 'block', fontSize: '14px', color: '#C9C0A8', marginBottom: '8px' }}>
              {field.label}
            </label>
            <input id="halaqahpage-fld-8"
              type={field.type}
              value={(hostFormData[field.key] as string | number | undefined) || ''}
              onChange={(e) => onChange({ ...hostFormData, [field.key]: e.target.value })}
              style={inputStyle}
            />
          </div>
        ))}
        {TOGGLES.map((toggle) => (
          <div key={toggle.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              checked={Boolean(hostFormData[toggle.key])}
              onChange={(e) => onChange({ ...hostFormData, [toggle.key]: e.target.checked })}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label style={{ fontSize: '14px', color: '#C9C0A8' }}>{toggle.label}</label>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
