/**
 * Speakers tab content. Phase 5 split.
 */

import { motion } from 'framer-motion';
import type { Conference } from '../_types';

interface Props {
  conference: Conference;
}

export function ConferenceDetailSpeakers({ conference }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
      {conference.speakers.map((speaker, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ scale: 1.05, y: -4 }}
          style={{
            padding: '20px',
            background: '#10151F',
            border: '1px solid rgba(212,168,83,0.2)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: speaker.avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '32px',
              fontWeight: '700',
              color: '#FFFFFF',
            }}
          >
            {speaker.name.charAt(0)}
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#F5E8C7', marginBottom: '4px' }}>{speaker.name}</h4>
          <p style={{ fontSize: '13px', color: '#C9C0A8', marginBottom: '2px' }}>{speaker.title}</p>
          <p style={{ fontSize: '12px', color: '#7A7363', marginBottom: '12px' }}>{speaker.company}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {speaker.expertise.map((exp) => (
              <div
                key={exp}
                style={{
                  padding: '4px 8px',
                  background: '#161D2C',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#C9C0A8',
                }}
              >
                {exp}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
