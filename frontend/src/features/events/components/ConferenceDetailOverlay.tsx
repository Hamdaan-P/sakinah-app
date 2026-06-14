/**
 * Full-screen conference-detail overlay. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from '@phosphor-icons/react';
import { ConferenceDetailOverview } from './ConferenceDetailOverview';
import { ConferenceDetailSchedule } from './ConferenceDetailSchedule';
import { ConferenceDetailSpeakers } from './ConferenceDetailSpeakers';
import { ConferenceDetailVenue } from './ConferenceDetailVenue';
import { ConferenceDetailAttendees } from './ConferenceDetailAttendees';
import type { Conference, DetailTab } from '../_types';

interface Props {
  conference: Conference | null;
  detailTab: DetailTab;
  onClose: () => void;
  onChangeTab: (tab: DetailTab) => void;
}

const TABS: DetailTab[] = ['Overview', 'Schedule', 'Speakers', 'Venue', 'Attendees'];

export function ConferenceDetailOverlay({ conference, detailTab, onClose, onChangeTab }: Props) {
  return (
    <AnimatePresence>
      {conference && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#10151F',
              borderRadius: '20px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header with Banner */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  height: '200px',
                  background: conference.bannerGradient,
                  position: 'relative',
                }}
              />
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(10,14,22, 0.8)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} color="#F5E8C7" />
              </button>
              <div style={{ position: 'absolute', bottom: '24px', left: '32px', right: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
                  {conference.title}
                </h2>
                <p style={{ fontSize: '16px', color: '#E8C97A' }}>{conference.organizer}</p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid rgba(212,168,83,0.2)', padding: '0 32px' }}>
              <div style={{ display: 'flex', gap: '32px' }}>
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => onChangeTab(tab)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '16px 0',
                      color: detailTab === tab ? '#D4A853' : '#7A7363',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      borderBottom: detailTab === tab ? '2px solid #D4A853' : '2px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
              {detailTab === 'Overview' && <ConferenceDetailOverview conference={conference} />}
              {detailTab === 'Schedule' && <ConferenceDetailSchedule conference={conference} />}
              {detailTab === 'Speakers' && <ConferenceDetailSpeakers conference={conference} />}
              {detailTab === 'Venue' && <ConferenceDetailVenue conference={conference} />}
              {detailTab === 'Attendees' && <ConferenceDetailAttendees conference={conference} />}
            </div>

            {/* Footer with Register Button */}
            <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(212,168,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#10151F' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#7A7363', marginBottom: '4px' }}>Starting from</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#D4A853' }}>
                  ₹{conference.price.toLocaleString()}
                </div>
              </div>
              <button
                style={{
                  padding: '14px 32px',
                  background: '#D4A853',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#10151F',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => {
                  alert('Registration feature coming soon!');
                }}
              >
                Register Now
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
