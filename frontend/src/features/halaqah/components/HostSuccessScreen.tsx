/**
 * Success splash shown after the host wizard submits. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Check } from '@phosphor-icons/react';

interface Props {
  onBackToDashboard: () => void;
}

export function HostSuccessScreen({ onBackToDashboard }: Props) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '60px',
          background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <Check size={64} color="white" />
      </motion.div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F5E8C7', marginBottom: '12px' }}>
        Event Submitted!
      </div>
      <div style={{ fontSize: '16px', color: '#C9C0A8', textAlign: 'center', marginBottom: '32px' }}>
        Your event is pending admin approval. You will be notified once it's reviewed.
      </div>
      <motion.button
        onClick={onBackToDashboard}
        style={{
          padding: '12px 32px',
          background: 'linear-gradient(135deg, #D4A853 0%, #E8C97A 100%)',
          border: 'none',
          borderRadius: '8px',
          color: '#10151F',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Back to Dashboard
      </motion.button>
    </motion.div>
  );
}
