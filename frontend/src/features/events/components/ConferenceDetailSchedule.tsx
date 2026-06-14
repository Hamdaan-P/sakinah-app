/**
 * Schedule tab content. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Clock } from '@phosphor-icons/react';
import { getSessionTypeColor } from '../_helpers';
import type { Conference } from '../_types';

interface Props {
  conference: Conference;
}

export function ConferenceDetailSchedule({ conference }: Props) {
  return (
    <div>
      {conference.schedule.map((day) => (
        <div key={day.day} style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#F5E8C7', marginBottom: '16px' }}>
            Day {day.day}
          </h3>
          <div style={{ position: 'relative', paddingLeft: '40px' }}>
            <div
              style={{
                position: 'absolute',
                left: '15px',
                top: '8px',
                bottom: '8px',
                width: '2px',
                background: 'rgba(212,168,83,0.2)',
              }}
            />
            {day.sessions.map((session, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{ marginBottom: '20px', position: 'relative' }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '-31px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getSessionTypeColor(session.type),
                    border: '2px solid #10151F',
                  }}
                />
                <div style={{ padding: '16px', background: '#10151F', borderRadius: '12px', border: '1px solid rgba(212,168,83,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div
                      style={{
                        padding: '4px 8px',
                        background: getSessionTypeColor(session.type),
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#FFFFFF',
                        textTransform: 'uppercase',
                      }}
                    >
                      {session.type}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#7A7363' }}>
                      <Clock size={14} />
                      {session.time}
                    </div>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#F5E8C7' }}>{session.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
