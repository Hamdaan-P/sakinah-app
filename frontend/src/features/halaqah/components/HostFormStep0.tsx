/**
 * Host wizard step 0: host info. Phase 5 split.
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
  { label: 'Full Name', type: 'text', key: 'fullName' },
  { label: 'Email', type: 'email', key: 'email' },
  { label: 'Phone', type: 'tel', key: 'phone' },
  { label: 'Age', type: 'number', key: 'age' },
  { label: 'Date of Birth', type: 'date', key: 'dob' },
  { label: 'Place of Birth', type: 'text', key: 'pob' },
];

export function HostFormStep0({ hostFormData, onChange }: Props) {
  return (
    <motion.div
      key="step0"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div style={{ fontSize: '24px', fontWeight: '600', color: '#F5E8C7', marginBottom: '24px' }}>
        Host Information
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label htmlFor="halaqahpage-fld-1" style={{ display: 'block', fontSize: '14px', color: '#C9C0A8', marginBottom: '8px' }}>
              {field.label}
            </label>
            <input id="halaqahpage-fld-1"
              type={field.type}
              value={(hostFormData[field.key] as string | number | undefined) || ''}
              onChange={(e) => onChange({ ...hostFormData, [field.key]: e.target.value })}
              style={inputStyle}
            />
          </div>
        ))}
        <div>
          <label htmlFor="halaqahpage-fld-2" style={{ display: 'block', fontSize: '14px', color: '#C9C0A8', marginBottom: '8px' }}>
            Gender
          </label>
          <select id="halaqahpage-fld-2"
            value={hostFormData.gender || ''}
            onChange={(e) => onChange({ ...hostFormData, gender: e.target.value })}
            style={inputStyle}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Prefer not to say</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}
