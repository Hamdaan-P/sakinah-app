/**
 * Halaqah dashboard tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import {
  Plus,
  MagnifyingGlass,
  ChartBar,
  Calendar,
  UsersThree,
  TrendUp,
  CaretRight,
} from '@phosphor-icons/react';
import { mockEvents } from '../_data';
import { getCategoryData } from '../_helpers';
import type { MainTab } from '../_types';

interface Props {
  onChangeTab: (tab: MainTab) => void;
  onOpenHostDashboard: () => void;
}

export function HalaqahDashboardTab({ onChangeTab, onOpenHostDashboard }: Props) {
  const navCards = [
    { title: 'Host an Event', icon: <Plus size={32} />, color: '#D4A853', action: () => onChangeTab('host') },
    { title: 'Browse Events', icon: <MagnifyingGlass size={32} />, color: '#00A885', action: () => onChangeTab('browse') },
    {
      title: 'Host Dashboard',
      icon: <ChartBar size={32} />,
      color: '#3B82F6',
      action: onOpenHostDashboard,
    },
    { title: 'My Events', icon: <Calendar size={32} />, color: '#8B5CF6', action: () => onChangeTab('myEvents') },
  ];

  const stats = [
    { label: 'Active Events', value: '12', icon: <Calendar size={24} />, color: '#10B981' },
    { label: 'Community Members', value: '246', icon: <UsersThree size={24} />, color: '#3B82F6' },
    { label: 'This Month', value: '8', icon: <TrendUp size={24} />, color: '#F59E0B' },
  ];

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '32px' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {navCards.map((card, idx) => (
          <motion.div
            key={idx}
            onClick={card.action}
            style={{
              background: '#10151F',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRadius: '16px',
              padding: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
            whileHover={{ scale: 1.02, borderColor: card.color }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                background: `${card.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
              }}
            >
              {card.icon}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7' }}>{card.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Community Impact Stats */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '16px' }}>
          Community Impact
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              style={{
                background: '#10151F',
                border: '1px solid rgba(212,168,83,0.2)',
                borderRadius: '12px',
                padding: '24px',
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ color: stat.color }}>{stat.icon}</div>
                <div style={{ fontSize: '14px', color: '#C9C0A8' }}>{stat.label}</div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F5E8C7' }}>{stat.value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '16px' }}>
          Recent Activity
        </div>
        <div style={{ background: '#10151F', border: '1px solid rgba(212,168,83,0.2)', borderRadius: '12px', padding: '24px' }}>
          {mockEvents.slice(0, 3).map((event, idx) => (
            <div
              key={event.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                paddingBottom: idx < 2 ? '16px' : '0',
                marginBottom: idx < 2 ? '16px' : '0',
                borderBottom: idx < 2 ? '1px solid rgba(212,168,83,0.2)' : 'none',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: `${getCategoryData(event.category).color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: getCategoryData(event.category).color,
                }}
              >
                {getCategoryData(event.category).icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#F5E8C7', marginBottom: '4px' }}>
                  {event.name}
                </div>
                <div style={{ fontSize: '14px', color: '#7A7363' }}>
                  {event.date} • {event.startTime}
                </div>
              </div>
              <CaretRight size={20} color="#7A7363" />
            </div>
          ))}
        </div>
      </div>

      {/* Daily Reminder */}
      <div
        style={{
          background: 'linear-gradient(135deg, #161D2C 0%, #161D2C 100%)',
          border: '1px solid #D4A853',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#E8C97A', marginBottom: '12px' }}>
          Daily Reminder
        </div>
        <div style={{ fontSize: '16px', color: '#F5E8C7', fontStyle: 'italic', lineHeight: '1.6' }}>
          "The best of people are those that bring most benefit to the rest of mankind." - Prophet Muhammad (ﷺ)
        </div>
      </div>
    </motion.div>
  );
}
