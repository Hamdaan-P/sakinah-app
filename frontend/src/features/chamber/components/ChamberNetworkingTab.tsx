/**
 * ChamberV2 Networking tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { COLORS } from '../_constants';
import { mockSessions } from '../_data';
import { NetworkingSessionCard } from './NetworkingSessionCard';
import type { NetworkingSession } from '../_types';

interface Props {
  onSelectSession: (s: NetworkingSession) => void;
}

export function ChamberNetworkingTab({ onSelectSession }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '32px' }}
    >
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '32px' }}>
        Upcoming Networking Sessions
      </h2>

      <div style={{ display: 'grid', gap: '24px' }}>
        {mockSessions.map((session, idx) => (
          <NetworkingSessionCard
            key={session.id}
            session={session}
            idx={idx}
            onSelect={onSelectSession}
          />
        ))}
      </div>
    </motion.div>
  );
}
