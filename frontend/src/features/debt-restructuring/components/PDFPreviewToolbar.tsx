/**
 * Top toolbar for the debt-restructuring PDF preview — back button,
 * title, share / email / download / send buttons. Phase 5 split.
 */

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShareNetwork,
  Envelope,
  DownloadSimple,
  PaperPlaneRight,
} from '@phosphor-icons/react';

interface Props {
  onBack: () => void;
  onShare: () => void;
  onOpenEmail: () => void;
  onDownload: () => void;
  onSend: () => void;
}

const ghostBtnStyle = {
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
};

export function PDFPreviewToolbar({ onBack, onShare, onOpenEmail, onDownload, onSend }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
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
            Debt Restructuring Report Preview
          </h1>
          <p style={{ fontSize: '14px', color: '#7A7363' }}>
            Page 1 of 3
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onShare}
          style={ghostBtnStyle}
          onMouseEnter={(e) => e.currentTarget.style.background = '#161D2C'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#161D2C'}
        >
          <ShareNetwork size={18} />
          Share
        </button>
        <button
          onClick={onOpenEmail}
          style={ghostBtnStyle}
          onMouseEnter={(e) => e.currentTarget.style.background = '#161D2C'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#161D2C'}
        >
          <Envelope size={18} />
          Email
        </button>
        <button
          onClick={onDownload}
          style={ghostBtnStyle}
          onMouseEnter={(e) => e.currentTarget.style.background = '#161D2C'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#161D2C'}
        >
          <DownloadSimple size={18} />
          DownloadSimple
        </button>
        <button
          onClick={onSend}
          style={{
            padding: '10px 20px',
            background: '#14B8A6',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#0d9488'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#14B8A6'}
        >
          <PaperPlaneRight size={18} />
          PaperPlaneRight
        </button>
      </div>
    </motion.div>
  );
}
