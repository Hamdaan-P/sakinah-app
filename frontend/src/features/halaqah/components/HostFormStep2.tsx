/**
 * Host wizard step 2: date/time. Phase 5 split.
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

const FIELDS = [
  { label: 'Event Date', type: 'date', key: 'eventDate' },
  { label: 'Start Time', type: 'time', key: 'startTime' },
  { label: 'End Time', type: 'time', key: 'endTime' },
];

export function HostFormStep2({ hostFormData, onChange }: Props) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div style={{ fontSize: '24px', fontWeight: '600', color: '#F5E8C7', marginBottom: '24px' }}>
        Date & Time
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label htmlFor="halaqahpage-fld-7" style={{ display: 'block', fontSize: '14px', color: '#C9C0A8', marginBottom: '8px' }}>
              {field.label}
            </label>
            <input id="halaqahpage-fld-7"
              type={field.type}
              value={(hostFormData[field.key] as string | number | undefined) || ''}
              onChange={(e) => onChange({ ...hostFormData, [field.key]: e.target.value })}
              style={inputStyle}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
