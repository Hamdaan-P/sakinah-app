/**
 * Host wizard step 4 — review. Phase 5 split.
 */

import type { HostForm } from '../_types';

interface Props {
  hostForm: HostForm;
}

export function HostStepReview({ hostForm }: Props) {
  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '24px' }}>Review Your Conference</h3>
      <div style={{ padding: '24px', background: '#10151F', borderRadius: '12px', border: '1px solid rgba(212,168,83,0.2)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#D4A853', marginBottom: '12px' }}>Basic Information</h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#7A7363' }}>Name:</span>
              <span style={{ fontSize: '14px', color: '#F5E8C7', fontWeight: '600' }}>{hostForm.name || 'Not provided'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#7A7363' }}>Format:</span>
              <span style={{ fontSize: '14px', color: '#F5E8C7', fontWeight: '600' }}>{hostForm.format}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#7A7363' }}>Website:</span>
              <span style={{ fontSize: '14px', color: '#F5E8C7', fontWeight: '600' }}>{hostForm.website || 'Not provided'}</span>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#D4A853', marginBottom: '12px' }}>Event Details</h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#7A7363' }}>Dates:</span>
              <span style={{ fontSize: '14px', color: '#F5E8C7', fontWeight: '600' }}>
                {hostForm.startDate || 'TBD'} to {hostForm.endDate || 'TBD'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#7A7363' }}>Time:</span>
              <span style={{ fontSize: '14px', color: '#F5E8C7', fontWeight: '600' }}>
                {hostForm.startTime || 'TBD'} - {hostForm.endTime || 'TBD'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#7A7363' }}>Capacity:</span>
              <span style={{ fontSize: '14px', color: '#F5E8C7', fontWeight: '600' }}>{hostForm.capacity} attendees</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#7A7363' }}>Venue:</span>
              <span style={{ fontSize: '14px', color: '#F5E8C7', fontWeight: '600' }}>{hostForm.venueName || 'Not provided'}</span>
            </div>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#D4A853', marginBottom: '12px' }}>Pricing</h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#7A7363' }}>Standard:</span>
              <span style={{ fontSize: '14px', color: '#F5E8C7', fontWeight: '600' }}>₹{hostForm.standardPrice.toLocaleString()}</span>
            </div>
            {hostForm.vipPrice > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#7A7363' }}>VIP:</span>
                <span style={{ fontSize: '14px', color: '#F5E8C7', fontWeight: '600' }}>₹{hostForm.vipPrice.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
