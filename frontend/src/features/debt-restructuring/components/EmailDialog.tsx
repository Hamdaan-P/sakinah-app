/**
 * Email-the-report modal for the debt-restructuring PDF preview.
 *
 * Phase 5 split — extracted from DebtRestructuringPage.tsx; no
 * behaviour change.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Envelope } from '@phosphor-icons/react';

interface Props {
  open: boolean;
  emailAddress: string;
  onChangeEmail: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function EmailDialog({ open, emailAddress, onChangeEmail, onClose, onSubmit }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#10151F',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              border: '1px solid rgba(212,168,83,0.2)',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#F5E8C7',
              }}>
                Email Report
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#C9C0A8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="debtrestructuringpage-fld-1" style={{
                display: 'block',
                fontSize: '14px',
                color: '#C9C0A8',
                fontWeight: '600',
                marginBottom: '8px',
              }}>
                Restructurer Email Address
              </label>
              <input id="debtrestructuringpage-fld-1"
                type="email"
                value={emailAddress}
                onChange={(e) => onChangeEmail(e.target.value)}
                placeholder="advisor@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#10151F',
                  border: '1px solid rgba(212,168,83,0.2)',
                  borderRadius: '8px',
                  color: '#F5E8C7',
                  fontSize: '15px',
                  outline: 'none',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#14B8A6'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(212,168,83,0.2)'}
              />
            </div>
            <button
              onClick={onSubmit}
              style={{
                width: '100%',
                padding: '12px',
                background: '#14B8A6',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#0d9488'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#14B8A6'}
            >
              <Envelope size={20} />
              PaperPlaneRight Email
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
