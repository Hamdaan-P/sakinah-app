/**
 * Overview tab content for the conference-detail overlay. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Calendar, MapPin, UsersThree, Check } from '@phosphor-icons/react';
import { formatDate } from '../_helpers';
import type { Conference } from '../_types';

interface Props {
  conference: Conference;
}

export function ConferenceDetailOverview({ conference }: Props) {
  const progress = (conference.registered / conference.capacity) * 100;
  return (
    <div>
      <p style={{ fontSize: '14px', color: '#C9C0A8', lineHeight: '1.8', marginBottom: '32px' }}>
        {conference.description}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '16px', background: '#10151F', borderRadius: '12px', border: '1px solid rgba(212,168,83,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Calendar size={18} color="#D4A853" />
            <span style={{ fontSize: '12px', color: '#7A7363', fontWeight: '600' }}>Date</span>
          </div>
          <div style={{ fontSize: '14px', color: '#F5E8C7', fontWeight: '600' }}>
            {formatDate(conference.startDate)} - {formatDate(conference.endDate)}
          </div>
        </div>
        <div style={{ padding: '16px', background: '#10151F', borderRadius: '12px', border: '1px solid rgba(212,168,83,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MapPin size={18} color="#D4A853" />
            <span style={{ fontSize: '12px', color: '#7A7363', fontWeight: '600' }}>Location</span>
          </div>
          <div style={{ fontSize: '14px', color: '#F5E8C7', fontWeight: '600' }}>{conference.location}</div>
        </div>
        <div style={{ padding: '16px', background: '#10151F', borderRadius: '12px', border: '1px solid rgba(212,168,83,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <UsersThree size={18} color="#D4A853" />
            <span style={{ fontSize: '12px', color: '#7A7363', fontWeight: '600' }}>Capacity</span>
          </div>
          <div style={{ fontSize: '14px', color: '#F5E8C7', fontWeight: '600' }}>
            {conference.registered} / {conference.capacity}
          </div>
          <div style={{ marginTop: '8px', width: '100%', height: '4px', background: '#161D2C', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#D4A853' }} />
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#F5E8C7', marginBottom: '16px' }}>Ticket Tiers</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {conference.tickets.map((ticket) => (
          <motion.div
            key={ticket.tier}
            whileHover={{ scale: 1.02, y: -4 }}
            style={{
              padding: '24px',
              background: ticket.popular ? 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)' : '#10151F',
              border: ticket.popular ? 'none' : '1px solid rgba(212,168,83,0.2)',
              borderRadius: '12px',
              position: 'relative',
            }}
          >
            {ticket.popular && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#D4A853',
                  color: '#10151F',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '700',
                }}
              >
                POPULAR
              </div>
            )}
            <div style={{ fontSize: '16px', fontWeight: '700', color: ticket.popular ? '#FFFFFF' : '#F5E8C7', marginBottom: '8px' }}>
              {ticket.tier}
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: ticket.popular ? '#E8C97A' : '#D4A853', marginBottom: '16px' }}>
              ₹{ticket.price.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: ticket.popular ? '#E8C97A' : '#7A7363', marginBottom: '12px', fontWeight: '600' }}>
              BENEFITS:
            </div>
            {ticket.benefits.map((benefit, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: ticket.popular ? '#FFFFFF' : '#C9C0A8',
                }}
              >
                <Check size={16} style={{ marginTop: '2px', flexShrink: 0 }} color={ticket.popular ? '#E8C97A' : '#D4A853'} />
                <span>{benefit}</span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#F5E8C7', marginBottom: '16px' }}>Key Topics</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {conference.topics.map((topic) => (
          <div
            key={topic}
            style={{
              padding: '8px 16px',
              background: '#161D2C',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRadius: '20px',
              fontSize: '13px',
              color: '#C9C0A8',
            }}
          >
            {topic}
          </div>
        ))}
      </div>
    </div>
  );
}
