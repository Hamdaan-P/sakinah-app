/**
 * DashboardTab — landing tab with ticket stats, quick action buttons, and a
 * "Recent Tickets" list.
 */

import { motion } from 'framer-motion';
import {
  Chat, BookOpen, Plus, CheckCircle, WarningCircle, XCircle,
  FileText, VideoCamera, ArrowRight,
} from '@phosphor-icons/react';
import { MOCK_TICKETS, type Ticket } from '../../_supportData';
import { getStatusColor } from './_helpers';

interface DashboardTabProps {
  ticketStats: { total: number; open: number; resolved: number; closed: number };
  onOpenCreateTicket: () => void;
  onOpenLiveChat: () => void;
  onGoFaq: () => void;
  onGoTutorials: () => void;
  onGoTickets: () => void;
  onSelectTicket: (t: Ticket) => void;
}

export function DashboardTab({
  ticketStats, onOpenCreateTicket, onOpenLiveChat, onGoFaq, onGoTutorials,
  onGoTickets, onSelectTicket,
}: DashboardTabProps) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Tickets', value: ticketStats.total, color: '#2196F3', icon: FileText },
          { label: 'Open',          value: ticketStats.open, color: '#FF9800', icon: WarningCircle },
          { label: 'Resolved',      value: ticketStats.resolved, color: '#4CAF50', icon: CheckCircle },
          { label: 'Closed',        value: ticketStats.closed, color: '#9E9E9E', icon: XCircle },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: '#10151F',
              borderRadius: '12px',
              border: '1px solid rgba(212,168,83,0.2)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <stat.icon size={24} style={{ color: stat.color }} />
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#F5E8C7' }}>{stat.value}</div>
            </div>
            <div style={{ fontSize: '14px', color: '#C9C0A8' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '16px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {[
            { label: 'New Ticket',      icon: Plus,        color: '#00A885', action: onOpenCreateTicket },
            { label: 'Live Chat',       icon: Chat,        color: '#2196F3', action: onOpenLiveChat },
            { label: 'Browse FAQ',      icon: BookOpen,    color: '#FF9800', action: onGoFaq },
            { label: 'View Tutorials',  icon: VideoCamera, color: '#9C27B0', action: onGoTutorials },
          ].map(action => (
            <motion.button
              key={action.label}
              onClick={action.action}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: '#10151F',
                borderRadius: '12px',
                border: '1px solid rgba(212,168,83,0.2)',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${action.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <action.icon size={24} style={{ color: action.color }} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#F5E8C7' }}>{action.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Tickets */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', margin: 0 }}>Recent Tickets</h2>
          <button
            onClick={onGoTickets}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRadius: '8px',
              color: '#D4A853',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            View All Tickets
            <ArrowRight size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MOCK_TICKETS.slice(0, 5).map(ticket => (
            <motion.div
              key={ticket.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onSelectTicket(ticket)}
              style={{
                background: '#10151F',
                borderRadius: '12px',
                border: '1px solid rgba(212,168,83,0.2)',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#F5E8C7', marginBottom: '8px' }}>
                  {ticket.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      background: `${getStatusColor(ticket.status)}20`,
                      color: getStatusColor(ticket.status),
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {ticket.status}
                  </span>
                  <span style={{ fontSize: '13px', color: '#C9C0A8' }}>{ticket.category}</span>
                </div>
              </div>
              {ticket.unreadCount && ticket.unreadCount > 0 && (
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#00A885',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {ticket.unreadCount}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
