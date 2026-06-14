/**
 * Single registration card in the My Events view. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Calendar, MapPin, Trophy, ShareNetwork } from '@phosphor-icons/react';
import { calculateDaysUntil, formatDate, getCategoryGradient } from '../_helpers';
import type { Conference, Registration } from '../_types';

interface Props {
  reg: Registration;
  conf: Conference;
  onSelectConference: (c: Conference) => void;
}

export function MyEventCard({ reg, conf, onSelectConference }: Props) {
  const daysUntil = calculateDaysUntil(reg.date);
  const isPast = reg.status === 'past';
  const isCancelled = reg.status === 'cancelled';

  return (
    <motion.div
      key={reg.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      style={{
        background: '#10151F',
        border: `1px solid ${isCancelled ? '#EF4444' : 'rgba(212,168,83,0.2)'}`,
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '120px',
          background: isCancelled ? 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)' : conf.bannerGradient,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!isPast && !isCancelled && daysUntil > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(212,168,83, 0.9)',
              color: '#10151F',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
            }}
          >
            {daysUntil} days left
          </div>
        )}
        {isCancelled && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: '#EF4444',
              color: '#FFFFFF',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
            }}
          >
            CANCELLED
          </div>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            background: isCancelled ? '#7F1D1D' : getCategoryGradient(conf.category),
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: '12px',
          }}
        >
          {reg.ticketTier} TICKET
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F5E8C7', marginBottom: '12px' }}>
          {reg.conferenceName}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#C9C0A8' }}>
            <Calendar size={16} color="#D4A853" />
            {formatDate(reg.date)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#C9C0A8' }}>
            <MapPin size={16} color="#D4A853" />
            {reg.location}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#C9C0A8' }}>
            <Trophy size={16} color="#D4A853" />
            Registration ID: {reg.registrationId}
          </div>
        </div>

        {!isCancelled && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onSelectConference(conf)}
              style={{
                flex: 1,
                padding: '10px',
                background: '#D4A853',
                border: 'none',
                borderRadius: '8px',
                color: '#10151F',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              View Details
            </button>
            <button
              style={{
                padding: '10px',
                background: '#161D2C',
                border: '1px solid rgba(212,168,83,0.2)',
                borderRadius: '8px',
                color: '#F5E8C7',
                cursor: 'pointer',
              }}
            >
              <ShareNetwork size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
