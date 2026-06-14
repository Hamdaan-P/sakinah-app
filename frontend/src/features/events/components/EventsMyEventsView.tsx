/**
 * My Events view — sub-tabs + registration cards. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Calendar } from '@phosphor-icons/react';
import { MyEventCard } from './MyEventCard';
import { mockConferences, mockRegistrations } from '../_data';
import type { Conference, MyEventsTab, Registration } from '../_types';

interface Props {
  myEventsTab: MyEventsTab;
  filteredRegistrations: Registration[];
  onChangeSubTab: (tab: MyEventsTab) => void;
  onSelectConference: (c: Conference) => void;
}

const TABS: MyEventsTab[] = ['Upcoming', 'Past', 'Cancelled'];

export function EventsMyEventsView({
  myEventsTab,
  filteredRegistrations,
  onChangeSubTab,
  onSelectConference,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '40px' }}
    >
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#F5E8C7', marginBottom: '8px' }}>
        My Events
      </h1>
      <p style={{ fontSize: '16px', color: '#C9C0A8', marginBottom: '32px' }}>
        Manage your event registrations
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid rgba(212,168,83,0.2)', paddingBottom: '0' }}>
        {TABS.map((tab) => {
          const count = mockRegistrations.filter((r) => {
            if (tab === 'Upcoming') return r.status === 'upcoming';
            if (tab === 'Past') return r.status === 'past';
            if (tab === 'Cancelled') return r.status === 'cancelled';
            return false;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => onChangeSubTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 24px',
                color: myEventsTab === tab ? '#D4A853' : '#7A7363',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: myEventsTab === tab ? '2px solid #D4A853' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {filteredRegistrations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7A7363' }}>
          <Calendar size={48} style={{ margin: '0 auto 16px' }} />
          <p>No {myEventsTab.toLowerCase()} events</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredRegistrations.map((reg) => {
            const conf = mockConferences.find((c) => c.id === reg.conferenceId);
            if (!conf) return null;
            return (
              <MyEventCard
                key={reg.id}
                reg={reg}
                conf={conf}
                onSelectConference={onSelectConference}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
