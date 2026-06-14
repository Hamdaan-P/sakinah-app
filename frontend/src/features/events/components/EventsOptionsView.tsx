/**
 * Landing view for the Events page — host vs join cards plus quick
 * access to existing registrations. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Plus, Calendar, ArrowRight, MapPin } from '@phosphor-icons/react';
import { EventsHomeCTA } from './EventsHomeCTA';
import { mockConferences, mockRegistrations } from '../_data';
import { formatDate } from '../_helpers';
import type { MainView } from '../_types';

interface Props {
  onChangeView: (v: MainView) => void;
}

export function EventsOptionsView({ onChangeView }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '40px' }}
    >
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#F5E8C7', marginBottom: '12px' }}>
        Events & Conferences
      </h1>
      <p style={{ fontSize: '16px', color: '#C9C0A8', marginBottom: '48px' }}>
        Host your own conference or discover amazing events to attend
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '900px' }}>
        <EventsHomeCTA
          background="linear-gradient(135deg, #D4A853 0%, #E8C97A 100%)"
          iconColor="#10151F"
          Icon={Plus}
          title="Host an Event"
          titleColor="#10151F"
          description="Create and manage your own conference. Reach a global audience and build your community."
          descriptionColor="#161D2C"
          ctaLabel="Get Started"
          ctaColor="#10151F"
          onClick={() => onChangeView('host')}
        />
        <EventsHomeCTA
          background="linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)"
          Icon={Calendar}
          title="Join Events"
          titleColor="#FFFFFF"
          description="Discover conferences and networking events. Learn from industry leaders and expand your network."
          descriptionColor="#E8C97A"
          ctaLabel="Browse Events"
          ctaColor="#FFFFFF"
          onClick={() => onChangeView('browse')}
        />
      </div>

      {mockRegistrations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: '48px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7' }}>My Registrations</h2>
            <button
              onClick={() => onChangeView('myEvents')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#D4A853',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View All
              <ArrowRight size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {mockRegistrations.slice(0, 2).map((reg) => {
              const conf = mockConferences.find((c) => c.id === reg.conferenceId);
              if (!conf) return null;
              return (
                <motion.div
                  key={reg.id}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    background: '#10151F',
                    border: '1px solid rgba(212,168,83,0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#D4A853', fontWeight: '600', marginBottom: '8px' }}>
                    {reg.ticketTier} Ticket
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#F5E8C7', marginBottom: '8px' }}>
                    {reg.conferenceName}
                  </h4>
                  <div style={{ fontSize: '13px', color: '#C9C0A8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    {formatDate(reg.date)}
                  </div>
                  <div style={{ fontSize: '13px', color: '#C9C0A8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} />
                    {reg.location}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
