/**
 * Header row + info bar + warning + tab navigation for PrayerTimesPage.
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowsClockwise, Buildings, Calendar, Info, MapPin,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import {
  CREAM, GOLD, GOLD_LIGHT, NAVY_BG, NAVY_BORDER, NAVY_CARD, NAVY_HOVER,
  TEXT_MUTED, TEXT_SECONDARY,
  type PrayerData,
} from '../../_constants';

interface Tab {
  id: 'today' | 'weekly' | 'tracker' | 'qibla' | 'calendar';
  label: string;
  icon: Icon;
}

interface PrayerHeaderProps {
  prayerData: PrayerData | null;
  isRefreshing: boolean;
  use12Hour: boolean;
  activeTab: Tab['id'];
  tabs: Tab[];
  onToggleUse12Hour: () => void;
  onRefresh: () => void;
  onTabChange: (id: Tab['id']) => void;
}

export function PrayerHeader({
  prayerData, isRefreshing, use12Hour, activeTab, tabs,
  onToggleUse12Hour, onRefresh, onTabChange,
}: PrayerHeaderProps) {
  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Buildings size={24} color={NAVY_BG} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: CREAM, margin: 0 }}>
              Prayer Times
            </h1>
            {prayerData && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <MapPin size={14} color={TEXT_MUTED} />
                <span style={{ fontSize: '13px', color: TEXT_MUTED }}>{prayerData.locationName}</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onToggleUse12Hour}
            style={{
              padding: '8px 12px',
              background: NAVY_CARD,
              border: `1px solid ${NAVY_BORDER}`,
              borderRadius: '8px',
              color: TEXT_SECONDARY,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = NAVY_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.background = NAVY_CARD)}
          >
            {use12Hour ? '12H' : '24H'}
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              padding: '8px',
              background: NAVY_CARD,
              border: `1px solid ${NAVY_BORDER}`,
              borderRadius: '8px',
              color: GOLD,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = NAVY_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.background = NAVY_CARD)}
          >
            <ArrowsClockwise size={18} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </motion.div>

      {/* Info bar */}
      {prayerData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: NAVY_CARD,
            borderRadius: '10px',
            border: `1px solid ${NAVY_BORDER}`,
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} color={GOLD} />
            <span style={{ fontSize: '13px', color: TEXT_SECONDARY }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          {prayerData.hijriDate && (
            <span style={{ fontSize: '13px', color: GOLD, fontWeight: '600' }}>
              {prayerData.hijriDate}
            </span>
          )}
        </motion.div>
      )}

      {/* Warning message */}
      <AnimatePresence>
        {prayerData?.errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '10px 14px',
              background: 'rgba(20,184,166, 0.1)',
              border: '1px solid rgba(20,184,166, 0.3)',
              borderRadius: '10px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Info size={16} color="#14B8A6" />
            <span style={{ fontSize: '13px', color: TEXT_SECONDARY }}>{prayerData.errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          display: 'flex',
          gap: '4px',
          padding: '4px',
          background: NAVY_CARD,
          borderRadius: '12px',
          marginBottom: '24px',
          border: `1px solid ${NAVY_BORDER}`,
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '10px',
                background: isActive ? NAVY_HOVER : 'transparent',
                border: isActive ? `1px solid ${NAVY_BORDER}` : '1px solid transparent',
                color: isActive ? GOLD : TEXT_MUTED,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </motion.div>
    </>
  );
}
