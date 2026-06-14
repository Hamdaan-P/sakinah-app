/**
 * Animated page header + main pill tabs. Phase 5 split.
 */

import { motion } from 'framer-motion';
import type { MainTab } from '../_types';

interface Props {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
}

const TABS = [
  { id: 'dashboard' as MainTab, label: 'Dashboard' },
  { id: 'browse' as MainTab, label: 'Browse Events' },
  { id: 'host' as MainTab, label: 'Host Event' },
  { id: 'myEvents' as MainTab, label: 'My Events' },
];

export function HalaqahPageHeader({ activeTab, onChangeTab }: Props) {
  return (
    <>
      <div
        style={{
          background: 'linear-gradient(135deg, #10151F 0%, #10151F 100%)',
          borderBottom: '1px solid rgba(212,168,83,0.2)',
          padding: '24px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '40px',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.1,
            fontSize: '80px',
          }}
        >
          🕌
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #D4A853 0%, #E8C97A 50%, #D4A853 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
              fontFamily: 'serif',
            }}
          >
            حلقة
          </div>
          <div style={{ fontSize: '18px', color: '#C9C0A8' }}>Islamic Community Gatherings</div>
        </div>
      </div>

      <div
        style={{
          background: '#10151F',
          borderBottom: '1px solid rgba(212,168,83,0.2)',
          padding: '16px 32px',
          display: 'flex',
          gap: '12px',
        }}
      >
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            style={{
              padding: '10px 24px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #D4A853 0%, #E8C97A 100%)' : 'transparent',
              color: activeTab === tab.id ? '#10151F' : '#C9C0A8',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>
    </>
  );
}
