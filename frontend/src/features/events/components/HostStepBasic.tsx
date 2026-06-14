/**
 * Host wizard step 1 — basic info. Phase 5 split.
 */

import { getFormatIcon } from '../_helpers';
import type { EventFormat, HostForm } from '../_types';

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

export function HostStepBasic({ hostForm, onChange }: Props) {
  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '24px' }}>Basic Information</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="eventspage-fld-1" style={labelStyle}>
            Conference Name *
          </label>
          <input id="eventspage-fld-1"
            type="text"
            placeholder="e.g., Global Tech Summit 2025"
            value={hostForm.name}
            onChange={(e) => onChange({ ...hostForm, name: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="eventspage-fld-2" style={labelStyle}>
            Website URL
          </label>
          <input id="eventspage-fld-2"
            type="url"
            placeholder="https://yourconference.com"
            value={hostForm.website}
            onChange={(e) => onChange({ ...hostForm, website: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="eventspage-fld-3" style={labelStyle}>
            About the Conference *
          </label>
          <textarea id="eventspage-fld-3"
            placeholder="Describe your conference, its goals, and what attendees can expect..."
            value={hostForm.description}
            onChange={(e) => onChange({ ...hostForm, description: e.target.value })}
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={labelStyle}>
            Event Format *
          </legend>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['In-Person', 'Virtual', 'Hybrid'] as EventFormat[]).map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => onChange({ ...hostForm, format })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: hostForm.format === format ? '#D4A853' : '#10151F',
                  border: '1px solid rgba(212,168,83,0.2)',
                  borderRadius: '8px',
                  color: hostForm.format === format ? '#10151F' : '#C9C0A8',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {getFormatIcon(format)} {format}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
