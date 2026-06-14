/**
 * Upload-presentation dialog. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadSimple } from '@phosphor-icons/react';
import { COLORS } from '../_constants';

interface Props {
  open: boolean;
  onClose: () => void;
}

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

export function UploadPresentationDialog({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '600px',
              background: COLORS.navy.darker,
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text.primary }}>
                UploadSimple Presentation
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: COLORS.navy.dark,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={20} color={COLORS.text.secondary} />
              </motion.button>
            </div>

            <div style={{ display: 'grid', gap: '24px' }}>
              <div>
                <label htmlFor="chamberv2page-fld-6" style={labelStyle}>
                  Presentation Title
                </label>
                <input id="chamberv2page-fld-6" type="text" placeholder="Enter title..." style={inputStyle} />
              </div>

              <div>
                <label htmlFor="chamberv2page-fld-7" style={labelStyle}>Category</label>
                <select id="chamberv2page-fld-7" style={inputStyle}>
                  <option>Select category...</option>
                  <option>Investment</option>
                  <option>Startup</option>
                  <option>Technology</option>
                  <option>Islamic Finance</option>
                  <option>Business Plan</option>
                  <option>Marketing</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="chamberv2page-fld-8" style={labelStyle}>Description</label>
                <textarea id="chamberv2page-fld-8"
                  placeholder="Brief description of your presentation..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={labelStyle}>UploadSimple File</legend>
                <div
                  style={{
                    padding: '48px',
                    background: COLORS.navy.dark,
                    border: `2px dashed ${COLORS.border}`,
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <UploadSimple size={32} color={COLORS.text.muted} style={{ margin: '0 auto 16px' }} />
                  <div style={{ fontSize: '14px', color: COLORS.text.secondary, marginBottom: '4px' }}>
                    Click to upload or drag and drop
                  </div>
                  <div style={{ fontSize: '12px', color: COLORS.text.muted }}>
                    PDF, PPT, PPTX (Max 50MB)
                  </div>
                </div>
              </fieldset>

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
                <UploadSimple size={20} />
                Upload Presentation
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
