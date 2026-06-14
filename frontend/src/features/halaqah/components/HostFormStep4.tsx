/**
 * Host wizard step 4: agenda. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Plus, Trash } from '@phosphor-icons/react';
import type { HostFormData } from '../_types';

interface Props {
  hostFormData: HostFormData;
  onChange: (data: HostFormData) => void;
}

const inputStyle = {
  padding: '10px',
  background: '#10151F',
  border: '1px solid rgba(212,168,83,0.2)',
  borderRadius: '6px',
  color: '#F5E8C7',
  fontSize: '14px',
  outline: 'none',
};

export function HostFormStep4({ hostFormData, onChange }: Props) {
  const agenda = hostFormData.agenda || [
    { title: '', arabicTitle: '', duration: '' },
    { title: '', arabicTitle: '', duration: '' },
    { title: '', arabicTitle: '', duration: '' },
  ];

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div style={{ fontSize: '24px', fontWeight: '600', color: '#F5E8C7', marginBottom: '24px' }}>
        Event Agenda
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {agenda.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: '#10151F',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#F5E8C7' }}>Item {idx + 1}</div>
              {(hostFormData.agenda || []).length > 1 && (
                <button
                  onClick={() => {
                    const newAgenda = [...(hostFormData.agenda || [])];
                    newAgenda.splice(idx, 1);
                    onChange({ ...hostFormData, agenda: newAgenda });
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                  }}
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Title (English)"
                value={item.title}
                onChange={(e) => {
                  const newAgenda = [...(hostFormData.agenda || [])];
                  newAgenda[idx] = { ...newAgenda[idx], title: e.target.value };
                  onChange({ ...hostFormData, agenda: newAgenda });
                }}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Title (Arabic)"
                value={item.arabicTitle}
                onChange={(e) => {
                  const newAgenda = [...(hostFormData.agenda || [])];
                  newAgenda[idx] = { ...newAgenda[idx], arabicTitle: e.target.value };
                  onChange({ ...hostFormData, agenda: newAgenda });
                }}
                style={{ ...inputStyle, direction: 'rtl' }}
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={item.duration}
                onChange={(e) => {
                  const newAgenda = [...(hostFormData.agenda || [])];
                  newAgenda[idx] = { ...newAgenda[idx], duration: e.target.value };
                  onChange({ ...hostFormData, agenda: newAgenda });
                }}
                style={inputStyle}
              />
            </div>
          </div>
        ))}
        <motion.button
          onClick={() => {
            const newAgenda = [
              ...(hostFormData.agenda || []),
              { title: '', arabicTitle: '', duration: '' },
            ];
            onChange({ ...hostFormData, agenda: newAgenda });
          }}
          style={{
            padding: '12px',
            background: '#10151F',
            border: '1px dashed #D4A853',
            borderRadius: '8px',
            color: '#D4A853',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={20} />
          Add Agenda Item
        </motion.button>
      </div>
    </motion.div>
  );
}
