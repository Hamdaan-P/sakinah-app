/**
 * Host wizard step 5: review. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { getCategoryData } from '../_helpers';
import type { HostFormData } from '../_types';

interface Props {
  hostFormData: HostFormData;
}

export function HostFormStep5({ hostFormData }: Props) {
  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div style={{ fontSize: '24px', fontWeight: '600', color: '#F5E8C7', marginBottom: '24px' }}>
        Review & Submit
      </div>
      <div
        style={{
          background: '#10151F',
          border: '1px solid rgba(212,168,83,0.2)',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#E8C97A', marginBottom: '16px' }}>
          Event Summary
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
          <div>
            <span style={{ color: '#7A7363' }}>Event Name: </span>
            <span style={{ color: '#F5E8C7' }}>{hostFormData.eventName || 'N/A'}</span>
          </div>
          <div>
            <span style={{ color: '#7A7363' }}>Category: </span>
            <span style={{ color: '#F5E8C7' }}>
              {getCategoryData(hostFormData.category || 'other').name}
            </span>
          </div>
          <div>
            <span style={{ color: '#7A7363' }}>Date: </span>
            <span style={{ color: '#F5E8C7' }}>{hostFormData.eventDate || 'N/A'}</span>
          </div>
          <div>
            <span style={{ color: '#7A7363' }}>Time: </span>
            <span style={{ color: '#F5E8C7' }}>
              {hostFormData.startTime || 'N/A'} - {hostFormData.endTime || 'N/A'}
            </span>
          </div>
          <div>
            <span style={{ color: '#7A7363' }}>Venue: </span>
            <span style={{ color: '#F5E8C7' }}>{hostFormData.venueName || 'N/A'}</span>
          </div>
          <div>
            <span style={{ color: '#7A7363' }}>Capacity: </span>
            <span style={{ color: '#F5E8C7' }}>{hostFormData.capacity || 'N/A'}</span>
          </div>
          <div>
            <span style={{ color: '#7A7363' }}>Agenda Items: </span>
            <span style={{ color: '#F5E8C7' }}>{(hostFormData.agenda || []).length}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
