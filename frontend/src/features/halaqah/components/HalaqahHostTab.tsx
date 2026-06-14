/**
 * Halaqah host-an-event wizard tab. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { HostFormStep0 } from './HostFormStep0';
import { HostFormStep1 } from './HostFormStep1';
import { HostFormStep2 } from './HostFormStep2';
import { HostFormStep3 } from './HostFormStep3';
import { HostFormStep4 } from './HostFormStep4';
import { HostFormStep5 } from './HostFormStep5';
import { HostSuccessScreen } from './HostSuccessScreen';
import type { HostFormData } from '../_types';

interface Props {
  showSuccess: boolean;
  hostStep: number;
  hostFormData: HostFormData;
  onChangeStep: (step: number) => void;
  onChangeForm: (data: HostFormData) => void;
  onSubmit: () => void;
  onBackToDashboard: () => void;
}

const STEPS_LABELS = ['Host Info', 'Event', 'Date/Time', 'Venue', 'Agenda', 'Review'];

export function HalaqahHostTab({
  showSuccess,
  hostStep,
  hostFormData,
  onChangeStep,
  onChangeForm,
  onSubmit,
  onBackToDashboard,
}: Props) {
  return (
    <motion.div
      key="host"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}
    >
      {!showSuccess ? (
        <>
          {/* Progress Bar */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              {STEPS_LABELS.map((label, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '12px',
                    color: hostStep >= idx ? '#D4A853' : '#7A7363',
                    fontWeight: hostStep === idx ? '600' : '400',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div style={{ height: '4px', background: '#161D2C', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #D4A853 0%, #E8C97A 100%)',
                  borderRadius: '2px',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${((hostStep + 1) / 6) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            {hostStep === 0 && <HostFormStep0 hostFormData={hostFormData} onChange={onChangeForm} />}
            {hostStep === 1 && <HostFormStep1 hostFormData={hostFormData} onChange={onChangeForm} />}
            {hostStep === 2 && <HostFormStep2 hostFormData={hostFormData} onChange={onChangeForm} />}
            {hostStep === 3 && <HostFormStep3 hostFormData={hostFormData} onChange={onChangeForm} />}
            {hostStep === 4 && <HostFormStep4 hostFormData={hostFormData} onChange={onChangeForm} />}
            {hostStep === 5 && <HostFormStep5 hostFormData={hostFormData} />}
          </AnimatePresence>

          {/* NavigationArrow Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            {hostStep > 0 && (
              <motion.button
                onClick={() => onChangeStep(hostStep - 1)}
                style={{
                  padding: '12px 24px',
                  background: '#10151F',
                  border: '1px solid rgba(212,168,83,0.2)',
                  borderRadius: '8px',
                  color: '#C9C0A8',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
            )}
            <motion.button
              onClick={() => {
                if (hostStep === 5) {
                  onSubmit();
                } else {
                  onChangeStep(hostStep + 1);
                }
              }}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #D4A853 0%, #E8C97A 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#10151F',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {hostStep === 5 ? 'Submit Event' : 'Next'}
            </motion.button>
          </div>
        </>
      ) : (
        <HostSuccessScreen onBackToDashboard={onBackToDashboard} />
      )}
    </motion.div>
  );
}
