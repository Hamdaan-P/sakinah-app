/**
 * New-referral form (stats + form). Phase 5 split.
 */

import { motion } from 'framer-motion';
import { PaperPlaneRight, Tray, TrendUp } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { mockMembers } from '../_data';
import { REFERRAL_TYPES } from '../_helpers';

const STATS = [
  { label: 'Sent', value: '24', icon: PaperPlaneRight, color: '#7C3AED' },
  { label: 'Received', value: '18', icon: Tray, color: '#0284C7' },
  { label: 'Success Rate', value: '78%', icon: TrendUp, color: '#059669' },
];

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: COLORS.navy.dark,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '12px',
  color: COLORS.text.primary,
  fontSize: '14px',
  outline: 'none',
};

const labelStyle = { display: 'block', fontSize: '14px', color: COLORS.text.secondary, marginBottom: '8px' };

export function NewReferralForm() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {STATS.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: COLORS.navy.darker,
              borderRadius: '16px',
              padding: '24px',
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: COLORS.text.muted }}>{stat.label}</span>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <stat.icon size={20} color={stat.color} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.text.primary }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: COLORS.navy.darker,
          borderRadius: '16px',
          padding: '32px',
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '24px' }}>
          Create New Referral
        </h3>
        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <label htmlFor="chamberv2page-fld-1" style={labelStyle}>Select Member</label>
            <select id="chamberv2page-fld-1" style={inputStyle}>
              <option>Choose a member...</option>
              {mockMembers.map((m) => (
                <option key={m.id}>{m.name} - {m.company}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="chamberv2page-fld-2" style={labelStyle}>Referral Type</label>
            <select id="chamberv2page-fld-2" style={inputStyle}>
              <option>Select type...</option>
              {REFERRAL_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="chamberv2page-fld-3" style={labelStyle}>Details</label>
            <textarea id="chamberv2page-fld-3"
              placeholder="Describe the referral opportunity..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label htmlFor="chamberv2page-fld-4" style={labelStyle}>Expected Value</label>
              <input id="chamberv2page-fld-4" type="text" placeholder="e.g., $50K" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="chamberv2page-fld-5" style={labelStyle}>Urgency</label>
              <select id="chamberv2page-fld-5" style={inputStyle}>
                <option>Select urgency...</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '14px 32px',
              background: COLORS.gold.base,
              border: 'none',
              borderRadius: '12px',
              color: COLORS.navy.darkest,
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <PaperPlaneRight size={20} />
            PaperPlaneRight Referral
          </motion.button>
        </div>
      </div>
    </div>
  );
}
