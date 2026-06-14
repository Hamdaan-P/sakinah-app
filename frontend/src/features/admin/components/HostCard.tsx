/**
 * One card in the hosts grid. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { formatDate, getInitials } from '../_helpers';
import { StarRating } from './StarRating';
import type { Host } from '../_types';

interface Props {
  host: Host;
  onSelect: (host: Host) => void;
}

export function HostCard({ host, onSelect }: Props) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(host)}
      style={{
        background: '#10151F',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(212,168,83,0.2)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #D4A853, #E8C97A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: '600',
            color: '#10151F',
            flexShrink: 0,
          }}
        >
          {getInitials(host.name)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <h3 style={{ color: '#F5E8C7', fontSize: '16px', fontWeight: '600' }}>{host.name}</h3>
            {host.verified ? (
              <div
                style={{
                  background: 'rgba(16,185,129, 0.1)',
                  color: '#10B981',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle size={10} />
                VERIFIED
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(251,146,60, 0.1)',
                  color: '#FB923C',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <WarningCircle size={10} />
                UNVERIFIED
              </div>
            )}
          </div>
          <div style={{ color: '#7A7363', fontSize: '13px', marginBottom: '4px' }}>{host.email}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <StarRating rating={host.rating} />
            <span style={{ color: '#7A7363', fontSize: '12px' }}>({host.rating})</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid rgba(212,168,83,0.2)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#D4A853', fontSize: '18px', fontWeight: '600' }}>
            {host.eventsHosted}
          </div>
          <div style={{ color: '#7A7363', fontSize: '12px' }}>Events</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#D4A853', fontSize: '18px', fontWeight: '600' }}>
            {formatDate(host.joinedDate)}
          </div>
          <div style={{ color: '#7A7363', fontSize: '12px' }}>Joined</div>
        </div>
      </div>
    </motion.div>
  );
}
