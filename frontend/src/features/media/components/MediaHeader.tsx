/**
 * Animated header band + horizontal pill tabs for the Islamic Media
 * page. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { COLORS, TABS } from '../_constants';
import type { ActiveTab } from '../_types';

interface Props {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export function MediaHeader({ activeTab, onChangeTab }: Props) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #10151F 0%, #161D2C 100%)',
          padding: '32px 48px',
          borderBottom: `1px solid ${COLORS.border}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, transparent 0%, ${COLORS.gold.primary}20 50%, transparent 100%)`,
            backgroundSize: '200% 100%',
            pointerEvents: 'none',
          }}
        />
        <h1 style={{
          fontSize: '32px',
          fontWeight: '600',
          color: COLORS.gold.secondary,
          margin: 0,
          position: 'relative',
          textAlign: 'center',
        }}>
          Islamic Media
        </h1>
      </motion.div>

      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '20px 48px',
        borderBottom: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.navy.secondary,
        overflowX: 'auto',
      }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '24px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                backgroundColor: activeTab === tab.id ? COLORS.gold.primary : 'transparent',
                color: activeTab === tab.id ? COLORS.navy.primary : COLORS.text.secondary,
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}
