/**
 * Host wizard step 2 — event details (dates/time/venue/pricing). Phase 5 split.
 */

import type { HostForm } from '../_types';

interface Props {
  hostForm: HostForm;
  onChange: (form: HostForm) => void;
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: '#10151F',
  border: '1px solid rgba(212,168,83,0.2)',
  borderRadius: '8px',
  color: '#F5E8C7',
  fontSize: '14px',
  outline: 'none',
};

const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#C9C0A8', marginBottom: '8px', display: 'block' };

export function HostStepDetails({ hostForm, onChange }: Props) {
  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '24px' }}>Event Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div>
          <label htmlFor="eventspage-fld-4" style={labelStyle}>Start Date *</label>
          <input id="eventspage-fld-4"
            type="date"
            value={hostForm.startDate}
            onChange={(e) => onChange({ ...hostForm, startDate: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="eventspage-fld-5" style={labelStyle}>End Date *</label>
          <input id="eventspage-fld-5"
            type="date"
            value={hostForm.endDate}
            onChange={(e) => onChange({ ...hostForm, endDate: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="eventspage-fld-6" style={labelStyle}>Start Time *</label>
          <input id="eventspage-fld-6"
            type="time"
            value={hostForm.startTime}
            onChange={(e) => onChange({ ...hostForm, startTime: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="eventspage-fld-7" style={labelStyle}>End Time *</label>
          <input id="eventspage-fld-7"
            type="time"
            value={hostForm.endTime}
            onChange={(e) => onChange({ ...hostForm, endTime: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="eventspage-fld-8" style={labelStyle}>
            Expected Capacity: {hostForm.capacity}
          </label>
          <input id="eventspage-fld-8"
            type="range"
            min="50"
            max="2000"
            step="50"
            value={hostForm.capacity}
            onChange={(e) => onChange({ ...hostForm, capacity: parseInt(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label htmlFor="eventspage-fld-9" style={labelStyle}>Venue Name</label>
          <input id="eventspage-fld-9"
            type="text"
            placeholder="e.g., Dubai Convention Centre"
            value={hostForm.venueName}
            onChange={(e) => onChange({ ...hostForm, venueName: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="eventspage-fld-10" style={labelStyle}>Venue Address</label>
          <input id="eventspage-fld-10"
            type="text"
            placeholder="Full address"
            value={hostForm.venueAddress}
            onChange={(e) => onChange({ ...hostForm, venueAddress: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="eventspage-fld-11" style={labelStyle}>Transportation Info</label>
          <textarea id="eventspage-fld-11"
            placeholder="How to reach the venue (metro, bus, parking)"
            value={hostForm.transportation}
            onChange={(e) => onChange({ ...hostForm, transportation: e.target.value })}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="eventspage-fld-12" style={labelStyle}>Nearby Hotels</label>
          <textarea id="eventspage-fld-12"
            placeholder="Recommended hotels for attendees"
            value={hostForm.hotels}
            onChange={(e) => onChange({ ...hostForm, hotels: e.target.value })}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
        <div>
          <label htmlFor="eventspage-fld-13" style={labelStyle}>Standard Ticket Price (₹) *</label>
          <input id="eventspage-fld-13"
            type="number"
            placeholder="5000"
            value={hostForm.standardPrice || ''}
            onChange={(e) => onChange({ ...hostForm, standardPrice: parseInt(e.target.value) || 0 })}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="eventspage-fld-14" style={labelStyle}>VIP Ticket Price (₹)</label>
          <input id="eventspage-fld-14"
            type="number"
            placeholder="12000"
            value={hostForm.vipPrice || ''}
            onChange={(e) => onChange({ ...hostForm, vipPrice: parseInt(e.target.value) || 0 })}
            style={inputStyle}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="eventspage-fld-15" style={labelStyle}>Standard Benefits (comma separated)</label>
          <input id="eventspage-fld-15"
            type="text"
            placeholder="General access, Lunch, Certificate"
            value={hostForm.standardBenefits}
            onChange={(e) => onChange({ ...hostForm, standardBenefits: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="eventspage-fld-16" style={labelStyle}>VIP Benefits (comma separated)</label>
          <input id="eventspage-fld-16"
            type="text"
            placeholder="All Standard, Priority seating, Networking dinner"
            value={hostForm.vipBenefits}
            onChange={(e) => onChange({ ...hostForm, vipBenefits: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}
