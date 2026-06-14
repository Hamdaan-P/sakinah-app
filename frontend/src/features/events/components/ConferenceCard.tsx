/**
 * Single conference card used in the Browse view (both featured and
 * grid variants). Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Star, Calendar, MapPin, UsersThree, ArrowRight } from '@phosphor-icons/react';
import { formatDate, getCategoryGradient, getFormatIcon } from '../_helpers';
import type { Conference } from '../_types';

interface Props {
  conference: Conference;
  featured?: boolean;
  onSelect: (c: Conference) => void;
}

export function ConferenceCard({ conference, featured = false, onSelect }: Props) {
  const progress = (conference.registered / conference.capacity) * 100;
  return (
    <motion.div
      key={conference.id}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={() => onSelect(conference)}
      style={{
        background: '#10151F',
        border: '1px solid rgba(212,168,83,0.2)',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        ...(featured && { gridColumn: '1 / -1' }),
      }}
    >
      <div
        style={{
          height: featured ? '240px' : '180px',
          background: conference.bannerGradient,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: featured ? '24px' : '18px',
          fontWeight: '700',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        {featured && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'rgba(212,168,83, 0.9)',
              color: '#10151F',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Star size={14} fill="#10151F" />
            Featured
          </div>
        )}
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: featured ? '22px' : '18px', fontWeight: '700', color: '#F5E8C7', marginBottom: '6px' }}>
              {conference.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#C9C0A8' }}>{conference.organizer}</p>
          </div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: getCategoryGradient(conference.category),
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}
          >
            {conference.category}
          </div>
        </div>

        {featured && (
          <p style={{ fontSize: '14px', color: '#7A7363', marginBottom: '16px', lineHeight: '1.6' }}>
            {conference.description}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#C9C0A8' }}>
            <Calendar size={16} color="#D4A853" />
            {formatDate(conference.startDate)} - {formatDate(conference.endDate)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#C9C0A8' }}>
            <MapPin size={16} color="#D4A853" />
            {conference.location}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#C9C0A8' }}>
            <span>{getFormatIcon(conference.format)}</span>
            {conference.format}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#7A7363', marginBottom: '6px' }}>
            <span>
              <UsersThree size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              {conference.registered} / {conference.capacity} registered
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: '#161D2C', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: progress > 80 ? '#EF4444' : progress > 50 ? '#F59E0B' : '#10B981',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#D4A853' }}>
            ₹{conference.price.toLocaleString()}
            <span style={{ fontSize: '13px', fontWeight: '400', color: '#7A7363', marginLeft: '4px' }}>onwards</span>
          </div>
          <button
            style={{
              background: '#D4A853',
              color: '#10151F',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(conference);
            }}
          >
            View Details
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
