/**
 * Approved events tab — search + card grid + detail/attendees dialogs.
 * Phase 5 split.
 */

import { motion } from 'framer-motion';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { ApprovedEventCard } from './ApprovedEventCard';
import { ApprovedEventDetailDialog } from './ApprovedEventDetailDialog';
import { AttendeesDialog } from './AttendeesDialog';
import type { ApprovedEvent } from '../_types';

interface Props {
  searchQuery: string;
  onChangeSearch: (v: string) => void;
  filteredApprovedEvents: ApprovedEvent[];
  selectedApprovedEvent: ApprovedEvent | null;
  showAttendeesDialog: boolean;
  onSelectEvent: (event: ApprovedEvent | null) => void;
  onOpenAttendees: (event: ApprovedEvent) => void;
  onCloseAttendees: () => void;
}

export function ApprovedEventsTab({
  searchQuery,
  onChangeSearch,
  filteredApprovedEvents,
  selectedApprovedEvent,
  showAttendeesDialog,
  onSelectEvent,
  onOpenAttendees,
  onCloseAttendees,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px' }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#F5E8C7', fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
          Approved Events
        </h2>
        <p style={{ color: '#7A7363', fontSize: '14px' }}>
          Manage and monitor approved events
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <MagnifyingGlass
            size={18}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#7A7363' }}
          />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            style={{
              width: '100%',
              background: '#10151F',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRadius: '10px',
              padding: '12px 12px 12px 44px',
              color: '#F5E8C7',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      <motion.div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        initial="hidden"
        animate="show"
      >
        {filteredApprovedEvents.map((event) => (
          <ApprovedEventCard
            key={event.id}
            event={event}
            onShowDetails={onSelectEvent}
            onShowAttendees={onOpenAttendees}
          />
        ))}
      </motion.div>

      <ApprovedEventDetailDialog
        event={selectedApprovedEvent}
        open={!!selectedApprovedEvent && !showAttendeesDialog}
        onClose={() => onSelectEvent(null)}
      />

      <AttendeesDialog
        event={selectedApprovedEvent}
        open={showAttendeesDialog}
        onClose={onCloseAttendees}
      />
    </motion.div>
  );
}
