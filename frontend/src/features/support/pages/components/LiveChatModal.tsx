/**
 * LiveChatModal — bottom-right floating chat panel placeholder for support
 * agents.
 */

import { motion } from 'framer-motion';
import { X, Chat, PaperPlaneRight } from '@phosphor-icons/react';

export function LiveChatModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0, 0.7)', zIndex: 1000,
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '400px', height: '600px',
          background: '#10151F', borderRadius: '16px',
          border: '1px solid rgba(212,168,83,0.2)',
          zIndex: 1001, display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid rgba(212,168,83,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #00A885 0%, #008F6F 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Chat size={20} style={{ color: '#FFFFFF' }} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#F5E8C7' }}>Live Support</div>
              <div style={{ fontSize: '13px', color: '#4CAF50', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4CAF50' }} />
                Online
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: '#161D2C', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={20} style={{ color: '#C9C0A8' }} />
          </button>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <div
            style={{
              padding: '16px',
              background: '#161D2C', borderRadius: '12px',
              border: '1px solid #D4A85340', marginBottom: '12px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#D4A853', marginBottom: '8px' }}>Support Agent</div>
            <div style={{ fontSize: '15px', color: '#C9C0A8', lineHeight: '1.5' }}>
              As-salamu alaykum! Welcome to ZaryahPlus support. How can I help you today?
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(212,168,83,0.2)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Type your message..."
              style={{
                flex: 1, padding: '12px',
                background: '#161D2C', border: '1px solid rgba(212,168,83,0.2)',
                borderRadius: '8px', color: '#F5E8C7', fontSize: '15px', outline: 'none',
              }}
            />
            <button
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #00A885 0%, #008F6F 100%)',
                border: 'none', borderRadius: '8px',
                color: '#FFFFFF', fontSize: '15px', fontWeight: '600',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <PaperPlaneRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
