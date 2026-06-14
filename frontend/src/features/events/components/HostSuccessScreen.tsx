/**
 * Success splash shown after the host wizard submits. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';

interface Props {
  onContinue: () => void;
}

export function HostSuccessScreen({ onContinue }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '500px',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <CheckCircle size={60} color="#FFFFFF" />
      </motion.div>
      <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#F5E8C7', marginBottom: '12px', textAlign: 'center' }}>
        Event Created Successfully!
      </h2>
      <p style={{ fontSize: '16px', color: '#C9C0A8', marginBottom: '32px', textAlign: 'center', maxWidth: '500px' }}>
        Your conference has been submitted for review. You'll receive a confirmation email shortly with next steps.
      </p>
      <button
        onClick={onContinue}
        style={{
          padding: '14px 32px',
          background: '#D4A853',
          border: 'none',
          borderRadius: '10px',
          color: '#10151F',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        Back to Home
      </button>
    </motion.div>
  );
}
