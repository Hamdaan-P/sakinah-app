import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AdminHeader } from '../components/AdminHeader';
import { DashboardTab } from '../components/DashboardTab';
import { PendingEventsTab } from '../components/PendingEventsTab';
import { ApprovedEventsTab } from '../components/ApprovedEventsTab';
import { HostsTab } from '../components/HostsTab';
import { ReportsTab } from '../components/ReportsTab';
import { MOCK_APPROVED_EVENTS, MOCK_HOSTS, MOCK_PENDING_EVENTS } from '../_mockData';
import type {
  AdminStats,
  ApprovedEvent,
  Host,
  HostFilter,
  PendingEvent,
  TabType,
} from '../_types';

export function HalaqahAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [hostFilter, setHostFilter] = useState<HostFilter>('all');

  // Dialog states
  const [selectedPendingEvent, setSelectedPendingEvent] = useState<PendingEvent | null>(null);
  const [selectedApprovedEvent, setSelectedApprovedEvent] = useState<ApprovedEvent | null>(null);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showAttendeesDialog, setShowAttendeesDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');

  // Stats
  const stats: AdminStats = {
    pending: MOCK_PENDING_EVENTS.length,
    approved: MOCK_APPROVED_EVENTS.length,
    totalHosts: MOCK_HOSTS.length,
    reports: 8,
  };

  // Filtered data
  const filteredApprovedEvents = useMemo(() => {
    if (!searchQuery) return MOCK_APPROVED_EVENTS;
    const query = searchQuery.toLowerCase();
    return MOCK_APPROVED_EVENTS.filter(
      (event) =>
        event.name.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredHosts = useMemo(() => {
    let filtered = MOCK_HOSTS;

    if (hostFilter === 'verified') {
      filtered = filtered.filter((h) => h.verified);
    } else if (hostFilter === 'unverified') {
      filtered = filtered.filter((h) => !h.verified);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (host) =>
          host.name.toLowerCase().includes(query) ||
          host.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [hostFilter, searchQuery]);

  // Handlers
  const handleApproveEvent = (event: PendingEvent) => {
    setSelectedPendingEvent(event);
    setShowApprovalDialog(true);
  };

  const handleRejectEvent = (event: PendingEvent) => {
    setSelectedPendingEvent(event);
    setShowRejectionDialog(true);
  };

  const confirmApproval = () => {
    console.log('Approving event:', selectedPendingEvent?.id, approvalNotes, sendEmail);
    setShowApprovalDialog(false);
    setSelectedPendingEvent(null);
    setApprovalNotes('');
    setSendEmail(true);
  };

  const confirmRejection = () => {
    console.log('Rejecting event:', selectedPendingEvent?.id, rejectionReason);
    setShowRejectionDialog(false);
    setSelectedPendingEvent(null);
    setRejectionReason('');
  };

  const handleChangeTab = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery('');
    setHostFilter('all');
  };

  const handleToggleVerify = (host: Host) => {
    console.log(host.verified ? 'Revoking' : 'Verifying', host.id);
    setSelectedHost(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#10151F',
        color: '#F5E8C7',
      }}
    >
      <AdminHeader activeTab={activeTab} onChangeTab={handleChangeTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && (
            <DashboardTab stats={stats} onNavigate={setActiveTab} />
          )}
          {activeTab === 'pending' && (
            <PendingEventsTab
              selectedPendingEvent={selectedPendingEvent}
              showApprovalDialog={showApprovalDialog}
              showRejectionDialog={showRejectionDialog}
              approvalNotes={approvalNotes}
              sendEmail={sendEmail}
              rejectionReason={rejectionReason}
              onSelect={setSelectedPendingEvent}
              onApprove={handleApproveEvent}
              onReject={handleRejectEvent}
              onChangeApprovalNotes={setApprovalNotes}
              onChangeSendEmail={setSendEmail}
              onChangeRejectionReason={setRejectionReason}
              onCloseApproval={() => setShowApprovalDialog(false)}
              onCloseRejection={() => setShowRejectionDialog(false)}
              onConfirmApproval={confirmApproval}
              onConfirmRejection={confirmRejection}
            />
          )}
          {activeTab === 'approved' && (
            <ApprovedEventsTab
              searchQuery={searchQuery}
              onChangeSearch={setSearchQuery}
              filteredApprovedEvents={filteredApprovedEvents}
              selectedApprovedEvent={selectedApprovedEvent}
              showAttendeesDialog={showAttendeesDialog}
              onSelectEvent={setSelectedApprovedEvent}
              onOpenAttendees={(event) => {
                setSelectedApprovedEvent(event);
                setShowAttendeesDialog(true);
              }}
              onCloseAttendees={() => {
                setShowAttendeesDialog(false);
                setSelectedApprovedEvent(null);
              }}
            />
          )}
          {activeTab === 'hosts' && (
            <HostsTab
              searchQuery={searchQuery}
              hostFilter={hostFilter}
              filteredHosts={filteredHosts}
              selectedHost={selectedHost}
              onChangeSearch={setSearchQuery}
              onChangeFilter={setHostFilter}
              onSelectHost={setSelectedHost}
              onToggleVerify={handleToggleVerify}
            />
          )}
          {activeTab === 'reports' && <ReportsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
