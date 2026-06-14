/**
 * Modal showing host details + verify/revoke action. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { formatDate, getInitials } from '../_helpers';
import { StarRating } from './StarRating';
import type { Host } from '../_types';

interface Props {
  host: Host | null;
  onClose: () => void;
  onToggleVerify: (host: Host) => void;
}

export function HostDetailDialog({ host, onClose, onToggleVerify }: Props) {
  return (
    <AnimatePresence>
      {host && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0, 0.7)',
              zIndex: 50,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
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
              maxHeight: '80vh',
              overflowY: 'auto',
              zIndex: 51,
            }}
          >
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #D4A853, #E8C97A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: '600',
                  color: '#10151F',
                  flexShrink: 0,
                }}
              >
                {getInitials(host.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <h2 style={{ color: '#F5E8C7', fontSize: '22px', fontWeight: '600' }}>{host.name}</h2>
                  {host.verified && (
                    <div
                      style={{
                        background: 'rgba(16,185,129, 0.1)',
                        color: '#10B981',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle size={12} />
                      VERIFIED
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <StarRating rating={host.rating} />
                  <span style={{ color: '#C9C0A8', fontSize: '14px' }}>{host.rating} rating</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Email</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>{host.email}</div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Phone</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>{host.phone}</div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Bio</div>
                <div style={{ color: '#C9C0A8', fontSize: '14px', lineHeight: '1.6' }}>{host.bio}</div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Events Hosted</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>{host.eventsHosted} events</div>
              </div>
              <div>
                <div style={{ color: '#7A7363', fontSize: '12px', marginBottom: '4px' }}>Member Since</div>
                <div style={{ color: '#F5E8C7', fontSize: '14px' }}>{formatDate(host.joinedDate)}</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggleVerify(host)}
              style={{
                width: '100%',
                background: host.verified
                  ? 'rgba(239,68,68, 0.1)'
                  : 'rgba(16,185,129, 0.1)',
                color: host.verified ? '#EF4444' : '#10B981',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${host.verified ? 'rgba(239,68,68, 0.3)' : 'rgba(16,185,129, 0.3)'}`,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {host.verified ? (
                <>
                  <XCircle size={16} />
                  Revoke Verification
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Verify Host
                </>
              )}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
