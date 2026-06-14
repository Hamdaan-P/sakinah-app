/**
 * Approval confirmation dialog. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { PendingEvent } from '../_types';

interface Props {
  event: PendingEvent | null;
  open: boolean;
  approvalNotes: string;
  sendEmail: boolean;
  onChangeNotes: (v: string) => void;
  onChangeSendEmail: (v: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ApprovalDialog({
  event,
  open,
  approvalNotes,
  sendEmail,
  onChangeNotes,
  onChangeSendEmail,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <AnimatePresence>
      {open && event && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0, 0.7)', zIndex: 52 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#10151F',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid rgba(212,168,83,0.2)',
              width: '90%',
              maxWidth: '500px',
              zIndex: 53,
            }}
          >
            <h3 style={{ color: '#F5E8C7', fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Approve Event
            </h3>
            <p style={{ color: '#C9C0A8', fontSize: '14px', marginBottom: '24px' }}>
              Are you sure you want to approve "{event.name}"?
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="halaqahadminpage-fld-1" style={{ color: '#7A7363', fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                Admin Notes (Optional)
              </label>
              <textarea id="halaqahadminpage-fld-1"
                value={approvalNotes}
                onChange={(e) => onChangeNotes(e.target.value)}
                placeholder="Add any notes for the host..."
                style={{
                  width: '100%',
                  background: '#10151F',
                  border: '1px solid rgba(212,168,83,0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#F5E8C7',
                  fontSize: '14px',
                  minHeight: '100px',
                  resize: 'vertical',
                }}
              />
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '24px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => onChangeSendEmail(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: '#C9C0A8', fontSize: '14px' }}>
                Send approval email to host
              </span>
            </label>

            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                style={{
                  flex: 1,
                  background: '#10151F',
                  color: '#C9C0A8',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(212,168,83,0.2)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                style={{
                  flex: 1,
                  background: '#10B981',
                  color: '#FFFFFF',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Confirm Approval
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
