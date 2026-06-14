/**
 * Top bar for the debt-restructuring form view — back button, title,
 * save-draft / generate-report buttons. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { ArrowLeft, FloppyDisk, FileText } from '@phosphor-icons/react';
import type { PathType } from '../_types';

interface Props {
  pathType: PathType;
  progress: number;
  onBack: () => void;
  onSaveDraft: () => void;
  onGenerateReport: () => void;
}

export function FormHeader({ pathType, progress, onBack, onSaveDraft, onGenerateReport }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        background: '#10151F',
        padding: '20px 24px',
        borderRadius: '12px',
        border: '1px solid rgba(212,168,83,0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#C9C0A8',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#161D2C'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#F5E8C7',
            marginBottom: '4px',
          }}>
            {pathType === 'company' ? 'Company' : 'Personal'} Debt Restructuring
          </h1>
          <p style={{ fontSize: '14px', color: '#7A7363' }}>
            Complete the form to generate your restructuring report
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onSaveDraft}
          style={{
            padding: '10px 20px',
            background: '#161D2C',
            border: '1px solid rgba(212,168,83,0.2)',
            borderRadius: '8px',
            color: '#C9C0A8',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#161D2C'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#161D2C'}
        >
          <FloppyDisk size={18} />
          FloppyDisk Draft
        </button>
        <button
          onClick={onGenerateReport}
          disabled={progress < 50}
          style={{
            padding: '10px 20px',
            background: progress >= 50 ? '#14B8A6' : '#161D2C',
            border: 'none',
            borderRadius: '8px',
            color: progress >= 50 ? '#FFFFFF' : '#7A7363',
            fontSize: '15px',
            fontWeight: '600',
            cursor: progress >= 50 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: progress >= 50 ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (progress >= 50) e.currentTarget.style.background = '#0d9488';
          }}
          onMouseLeave={(e) => {
            if (progress >= 50) e.currentTarget.style.background = '#14B8A6';
          }}
        >
          <FileText size={18} />
          Generate Report
        </button>
      </div>
    </motion.div>
  );
}
