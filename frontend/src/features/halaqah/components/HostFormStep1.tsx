/**
 * Host wizard step 1: event details. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { eventCategories } from '../_data';
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

const labelStyle = { display: 'block', fontSize: '14px', color: '#C9C0A8', marginBottom: '8px' };

export function HostFormStep1({ hostFormData, onChange }: Props) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div style={{ fontSize: '24px', fontWeight: '600', color: '#F5E8C7', marginBottom: '24px' }}>
        Event Details
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="halaqahpage-fld-3" style={labelStyle}>Event Name</label>
          <input id="halaqahpage-fld-3"
            type="text"
            value={hostFormData.eventName || ''}
            onChange={(e) => onChange({ ...hostFormData, eventName: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="halaqahpage-fld-4" style={labelStyle}>Description</label>
          <textarea id="halaqahpage-fld-4"
            value={hostFormData.description || ''}
            onChange={(e) => onChange({ ...hostFormData, description: e.target.value })}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
        <div>
          <label htmlFor="halaqahpage-fld-5" style={labelStyle}>Category</label>
          <select id="halaqahpage-fld-5"
            value={hostFormData.category || ''}
            onChange={(e) => onChange({ ...hostFormData, category: e.target.value })}
            style={inputStyle}
          >
            <option value="">Select Category</option>
            {eventCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="halaqahpage-fld-6" style={labelStyle}>Capacity</label>
          <input id="halaqahpage-fld-6"
            type="number"
            value={hostFormData.capacity || ''}
            onChange={(e) => onChange({ ...hostFormData, capacity: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>
    </motion.div>
  );
}
