/**
 * Full-screen "Host Dashboard" overlay. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, MagnifyingGlass } from '@phosphor-icons/react';
import { HostDashboardEventRow } from './HostDashboardEventRow';
import type { HalaqahEvent, HostDashboardTab } from '../_types';

interface Props {
  open: boolean;
  hostSearchQuery: string;
  hostDashboardTab: HostDashboardTab;
  filteredHostEvents: HalaqahEvent[];
  onClose: () => void;
  onChangeSearch: (v: string) => void;
  onChangeTab: (t: HostDashboardTab) => void;
}

const STATS = [
  { label: 'Total Events', value: '5', color: '#3B82F6' },
  { label: 'Total Attendees', value: '142', color: '#10B981' },
  { label: 'Pending', value: '2', color: '#F59E0B' },
  { label: 'Approved', value: '3', color: '#00A885' },
];

const TABS = [
  { id: 'all' as HostDashboardTab, label: 'All' },
  { id: 'pending' as HostDashboardTab, label: 'Pending' },
  { id: 'approved' as HostDashboardTab, label: 'Approved' },
  { id: 'rejected' as HostDashboardTab, label: 'Rejected' },
  { id: 'cancelled' as HostDashboardTab, label: 'Cancelled' },
];

export function HostDashboardOverlay({
  open,
  hostSearchQuery,
  hostDashboardTab,
  filteredHostEvents,
  onClose,
  onChangeSearch,
  onChangeTab,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '32px',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#10151F',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRadius: '16px',
              maxWidth: '1000px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div
              style={{
                padding: '24px 32px',
                borderBottom: '1px solid rgba(212,168,83,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#F5E8C7' }}>Host Dashboard</div>
              <button
                onClick={onClose}
                style={{
                  background: '#10151F',
                  border: '1px solid rgba(212,168,83,0.2)',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#C9C0A8',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {STATS.map((stat, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '20px',
                      background: '#10151F',
                      border: '1px solid rgba(212,168,83,0.2)',
                      borderRadius: '12px',
                    }}
                  >
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color, marginBottom: '4px' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '14px', color: '#7A7363' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <MagnifyingGlass
                  size={20}
                  color="#7A7363"
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Search your events..."
                  value={hostSearchQuery}
                  onChange={(e) => onChangeSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 48px',
                    background: '#10151F',
                    border: '1px solid rgba(212,168,83,0.2)',
                    borderRadius: '8px',
                    color: '#F5E8C7',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {TABS.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => onChangeTab(tab.id)}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '20px',
                      border: '1px solid rgba(212,168,83,0.2)',
                      background: hostDashboardTab === tab.id ? '#D4A853' : '#10151F',
                      color: hostDashboardTab === tab.id ? '#10151F' : '#C9C0A8',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredHostEvents.map((event, idx) => (
                  <HostDashboardEventRow key={event.id} event={event} idx={idx} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
