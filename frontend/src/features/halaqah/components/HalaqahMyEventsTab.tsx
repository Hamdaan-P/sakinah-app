/**
 * Halaqah "My Events" tab — sub-tabs + three list variants. Phase 5
 * split.
 */

import { motion } from 'framer-motion';
import { WarningCircle } from '@phosphor-icons/react';
import { MyEventCardHeader } from './MyEventCardHeader';
import { myUpcomingEvents, myPastEvents, myCancelledEvents } from '../_data';
import type { MyEventsTab } from '../_types';

interface Props {
  myEventsTab: MyEventsTab;
  onChangeSubTab: (t: MyEventsTab) => void;
}

const SUB_TABS = [
  { id: 'upcoming' as MyEventsTab, label: 'Upcoming' },
  { id: 'past' as MyEventsTab, label: 'Past' },
  { id: 'cancelled' as MyEventsTab, label: 'Cancelled' },
];

const cardStyle = {
  background: '#10151F',
  border: '1px solid rgba(212,168,83,0.2)',
  borderRadius: '12px',
  padding: '24px',
};

export function HalaqahMyEventsTab({ myEventsTab, onChangeSubTab }: Props) {
  return (
    <motion.div
      key="myEvents"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '32px' }}
    >
      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {SUB_TABS.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onChangeSubTab(tab.id)}
            style={{
              padding: '10px 24px',
              borderRadius: '20px',
              border: '1px solid rgba(212,168,83,0.2)',
              background: myEventsTab === tab.id ? '#D4A853' : '#10151F',
              color: myEventsTab === tab.id ? '#10151F' : '#C9C0A8',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {myEventsTab === 'upcoming' &&
          myUpcomingEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={cardStyle}
            >
              <MyEventCardHeader event={event} badgeLabel="REGISTERED" badgeColor="#10B981" />
              <div
                style={{
                  padding: '12px',
                  background: '#161D2C',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#C9C0A8',
                  marginBottom: '16px',
                }}
              >
                Registration ID: REG-{event.id}-001
              </div>
              <motion.button
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid #EF4444',
                  borderRadius: '8px',
                  color: '#EF4444',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                whileHover={{ scale: 1.02, background: '#EF444410' }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel Registration
              </motion.button>
            </motion.div>
          ))}

        {myEventsTab === 'past' &&
          myPastEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={cardStyle}
            >
              <MyEventCardHeader event={event} badgeLabel="COMPLETED" badgeColor="#7A7363" />
              <motion.button
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #D4A853 0%, #E8C97A 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#10151F',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Leave Feedback
              </motion.button>
            </motion.div>
          ))}

        {myEventsTab === 'cancelled' &&
          myCancelledEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={cardStyle}
            >
              <MyEventCardHeader event={event} badgeLabel="CANCELLED" badgeColor="#EF4444" />
              <div
                style={{
                  padding: '12px',
                  background: '#161D2C',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#C9C0A8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <WarningCircle size={16} color="#F59E0B" />
                <span style={{ color: '#7A7363' }}>Reason:</span> {event.cancellationReason}
              </div>
            </motion.div>
          ))}
      </div>
    </motion.div>
  );
}
