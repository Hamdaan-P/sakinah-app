/**
 * One card in the grid layout of the Browse Events tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Calendar, MapPin } from '@phosphor-icons/react';
import { getCategoryData } from '../_helpers';
import type { HalaqahEvent } from '../_types';

interface Props {
  event: HalaqahEvent;
  idx: number;
  onSelect: (event: HalaqahEvent) => void;
}

export function BrowseEventGridCard({ event, idx, onSelect }: Props) {
  const categoryData = getCategoryData(event.category);
  const attendancePercent = (event.attendeeCount / event.capacity) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={() => onSelect(event)}
      style={{
        background: '#10151F',
        border: '1px solid rgba(212,168,83,0.2)',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${categoryData.color}20 0%, ${categoryData.color}40 100%)`,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            background: categoryData.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {categoryData.icon}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#F5E8C7', marginBottom: '12px' }}>
          {event.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Calendar size={16} color="#C9C0A8" />
          <span style={{ fontSize: '14px', color: '#C9C0A8' }}>{event.date}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <MapPin size={16} color="#C9C0A8" />
          <span style={{ fontSize: '14px', color: '#C9C0A8' }}>{event.venue}</span>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <div
            style={{
              height: '6px',
              background: '#161D2C',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${attendancePercent}%`,
                background: attendancePercent > 80 ? '#EF4444' : '#10B981',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <div style={{ fontSize: '12px', color: '#7A7363', marginTop: '4px' }}>
            {event.attendeeCount}/{event.capacity} registered
          </div>
        </div>
      </div>
    </motion.div>
  );
}
