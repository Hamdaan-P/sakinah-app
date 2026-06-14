/**
 * Host wizard step 3 — contacts/socials. Phase 5 split.
 */

import { LinkedinLogo, TwitterLogo, InstagramLogo } from '@phosphor-icons/react';
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

export function HostStepContacts({ hostForm, onChange }: Props) {
  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '24px' }}>People & Contacts</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div>
          <label htmlFor="eventspage-fld-17" style={labelStyle}>Contact Phone *</label>
          <input id="eventspage-fld-17"
            type="tel"
            placeholder="+971 50 123 4567"
            value={hostForm.phone}
            onChange={(e) => onChange({ ...hostForm, phone: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="eventspage-fld-18" style={labelStyle}>Contact Email *</label>
          <input id="eventspage-fld-18"
            type="email"
            placeholder="contact@conference.com"
            value={hostForm.email}
            onChange={(e) => onChange({ ...hostForm, email: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="eventspage-fld-19" style={labelStyle}>
            <LinkedinLogo size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            LinkedIn
          </label>
          <input id="eventspage-fld-19"
            type="url"
            placeholder="https://linkedin.com/company/..."
            value={hostForm.linkedin}
            onChange={(e) => onChange({ ...hostForm, linkedin: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="eventspage-fld-20" style={labelStyle}>
            <TwitterLogo size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            TwitterLogo/X
          </label>
          <input id="eventspage-fld-20"
            type="text"
            placeholder="@yourconference"
            value={hostForm.twitter}
            onChange={(e) => onChange({ ...hostForm, twitter: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="eventspage-fld-21" style={labelStyle}>
            <InstagramLogo size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            InstagramLogo
          </label>
          <input id="eventspage-fld-21"
            type="text"
            placeholder="@yourconference"
            value={hostForm.instagram}
            onChange={(e) => onChange({ ...hostForm, instagram: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>
      <div style={{ marginTop: '32px', padding: '20px', background: '#10151F', borderRadius: '12px', border: '1px solid rgba(212,168,83,0.2)' }}>
        <p style={{ fontSize: '13px', color: '#C9C0A8', marginBottom: '12px' }}>
          You can add speakers and sponsors after initial submission. This information is optional for now.
        </p>
      </div>
    </div>
  );
}
