/**
 * Pending events tab. Renders the card grid and the three dialogs.
 * Phase 5 split.
 */

import { motion } from 'framer-motion';
import { MOCK_PENDING_EVENTS } from '../_mockData';
import { PendingEventCard } from './PendingEventCard';
import { PendingEventDetailDialog } from './PendingEventDetailDialog';
import { ApprovalDialog } from './ApprovalDialog';
import { RejectionDialog } from './RejectionDialog';
import type { PendingEvent } from '../_types';

interface Props {
  selectedPendingEvent: PendingEvent | null;
  showApprovalDialog: boolean;
  showRejectionDialog: boolean;
  approvalNotes: string;
  sendEmail: boolean;
  rejectionReason: string;
  onSelect: (event: PendingEvent | null) => void;
  onApprove: (event: PendingEvent) => void;
  onReject: (event: PendingEvent) => void;
  onChangeApprovalNotes: (v: string) => void;
  onChangeSendEmail: (v: boolean) => void;
  onChangeRejectionReason: (v: string) => void;
  onCloseApproval: () => void;
  onCloseRejection: () => void;
  onConfirmApproval: () => void;
  onConfirmRejection: () => void;
}

export function PendingEventsTab(props: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px' }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#F5E8C7', fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
          Pending Events
        </h2>
        <p style={{ color: '#7A7363', fontSize: '14px' }}>
          Review and approve or reject pending event submissions
        </p>
      </div>

      <motion.div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
        initial="hidden"
        animate="show"
      >
        {MOCK_PENDING_EVENTS.map((event) => (
          <PendingEventCard
            key={event.id}
            event={event}
            onSelect={props.onSelect}
            onApprove={props.onApprove}
            onReject={props.onReject}
          />
        ))}
      </motion.div>

      <PendingEventDetailDialog
        event={props.selectedPendingEvent}
        open={!!props.selectedPendingEvent && !props.showApprovalDialog && !props.showRejectionDialog}
        onClose={() => props.onSelect(null)}
        onApprove={props.onApprove}
        onReject={props.onReject}
      />

      <ApprovalDialog
        event={props.selectedPendingEvent}
        open={props.showApprovalDialog}
        approvalNotes={props.approvalNotes}
        sendEmail={props.sendEmail}
        onChangeNotes={props.onChangeApprovalNotes}
        onChangeSendEmail={props.onChangeSendEmail}
        onCancel={props.onCloseApproval}
        onConfirm={props.onConfirmApproval}
      />

      <RejectionDialog
        event={props.selectedPendingEvent}
        open={props.showRejectionDialog}
        rejectionReason={props.rejectionReason}
        onChangeReason={props.onChangeRejectionReason}
        onCancel={props.onCloseRejection}
        onConfirm={props.onConfirmRejection}
      />
    </motion.div>
  );
}
