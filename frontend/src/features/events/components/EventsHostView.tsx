/**
 * Host-conference wizard view. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { CaretLeft, CaretRight, Check } from '@phosphor-icons/react';
import { HostStepBasic } from './HostStepBasic';
import { HostStepDetails } from './HostStepDetails';
import { HostStepContacts } from './HostStepContacts';
import { HostStepReview } from './HostStepReview';
import { HostSuccessScreen } from './HostSuccessScreen';
import type { HostForm } from '../_types';

interface Props {
  showHostSuccess: boolean;
  hostStep: number;
  hostForm: HostForm;
  onChangeStep: (step: number) => void;
  onChangeForm: (form: HostForm) => void;
  onSubmit: () => void;
  onBackToOptions: () => void;
  onCompleteSuccess: () => void;
}

export function EventsHostView({
  showHostSuccess,
  hostStep,
  hostForm,
  onChangeStep,
  onChangeForm,
  onSubmit,
  onBackToOptions,
  onCompleteSuccess,
}: Props) {
  if (showHostSuccess) {
    return <HostSuccessScreen onContinue={onCompleteSuccess} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}
    >
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#F5E8C7', marginBottom: '8px' }}>
        Host Your Conference
      </h1>
      <p style={{ fontSize: '16px', color: '#C9C0A8', marginBottom: '32px' }}>
        Fill in the details to create your event
      </p>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        {[1, 2, 3, 4].map((step, idx) => (
          <div key={step} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: hostStep >= step ? '#D4A853' : '#161D2C',
                color: hostStep >= step ? '#10151F' : '#7A7363',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '700',
              }}
            >
              {step}
            </div>
            {idx < 3 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background: hostStep > step ? '#D4A853' : '#161D2C',
                  margin: '0 8px',
                }}
              />
            )}
          </div>
        ))}
      </div>

      <motion.div
        key={hostStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        style={{ marginBottom: '32px' }}
      >
        {hostStep === 1 && <HostStepBasic hostForm={hostForm} onChange={onChangeForm} />}
        {hostStep === 2 && <HostStepDetails hostForm={hostForm} onChange={onChangeForm} />}
        {hostStep === 3 && <HostStepContacts hostForm={hostForm} onChange={onChangeForm} />}
        {hostStep === 4 && <HostStepReview hostForm={hostForm} />}
      </motion.div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
        <button
          onClick={() => (hostStep === 1 ? onBackToOptions() : onChangeStep(hostStep - 1))}
          style={{
            padding: '14px 24px',
            background: '#10151F',
            border: '1px solid rgba(212,168,83,0.2)',
            borderRadius: '10px',
            color: '#F5E8C7',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CaretLeft size={18} />
          Back
        </button>
        <button
          onClick={() => (hostStep === 4 ? onSubmit() : onChangeStep(hostStep + 1))}
          style={{
            padding: '14px 24px',
            background: '#D4A853',
            border: 'none',
            borderRadius: '10px',
            color: '#10151F',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {hostStep === 4 ? 'Submit' : 'Next'}
          {hostStep === 4 ? <Check size={18} /> : <CaretRight size={18} />}
        </button>
      </div>
    </motion.div>
  );
}
