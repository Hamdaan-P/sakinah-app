/**
 * Top hero band (gradient + close button + title) for the event-detail
 * overlay. Phase 5 split.
 */

import { X } from '@phosphor-icons/react';
import { getCategoryData } from '../_helpers';
import type { HalaqahEvent } from '../_types';

interface Props {
  event: HalaqahEvent;
  onClose: () => void;
}

export function EventDetailHeader({ event, onClose }: Props) {
  const cat = getCategoryData(event.category);
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${cat.color}20 0%, ${cat.color}40 100%)`,
        padding: '32px',
        borderBottom: '1px solid rgba(212,168,83,0.2)',
        position: 'relative',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            background: cat.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {cat.icon}
        </div>
        <div>
          <div style={{ fontSize: '14px', color: '#C9C0A8', marginBottom: '4px' }}>{cat.name}</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#F5E8C7' }}>{event.name}</div>
        </div>
      </div>
    </div>
  );
}
