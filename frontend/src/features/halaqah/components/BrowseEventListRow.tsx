/**
 * One row in the list layout of the Browse Events tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Calendar, Clock } from '@phosphor-icons/react';
import { getCategoryData } from '../_helpers';
import type { HalaqahEvent } from '../_types';

interface Props {
  event: HalaqahEvent;
  idx: number;
  onSelect: (event: HalaqahEvent) => void;
}

export function BrowseEventListRow({ event, idx, onSelect }: Props) {
  const categoryData = getCategoryData(event.category);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={() => onSelect(event)}
      style={{
        background: '#10151F',
        border: '1px solid rgba(212,168,83,0.2)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        gap: '20px',
        cursor: 'pointer',
      }}
      whileHover={{ scale: 1.01 }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '8px',
          background: `${categoryData.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: categoryData.color,
          flexShrink: 0,
        }}
      >
        {categoryData.icon}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#F5E8C7', marginBottom: '8px' }}>
          {event.name}
        </div>
        <div
          style={{
            fontSize: '14px',
            color: '#C9C0A8',
            marginBottom: '12px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {event.description}
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '4px 12px',
              background: '#161D2C',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#C9C0A8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Calendar size={12} />
            {event.date}
          </div>
          <div
            style={{
              padding: '4px 12px',
              background: '#161D2C',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#C9C0A8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={12} />
            {event.startTime} - {event.endTime}
          </div>
          <div
            style={{
              padding: '4px 12px',
              background:
                event.status === 'approved'
                  ? '#10B98120'
                  : event.status === 'pending'
                    ? '#F59E0B20'
                    : '#EF444420',
              borderRadius: '12px',
              fontSize: '12px',
              color:
                event.status === 'approved'
                  ? '#10B981'
                  : event.status === 'pending'
                    ? '#F59E0B'
                    : '#EF4444',
            }}
          >
            {event.status.toUpperCase()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
