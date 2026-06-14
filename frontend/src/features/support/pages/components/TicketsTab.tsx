/**
 * TicketsTab — searchable, filterable list of support tickets + floating
 * action button to create a new one.
 */

import { motion } from 'framer-motion';
import { MagnifyingGlass, Plus } from '@phosphor-icons/react';
import type { Ticket } from '../../_supportData';
import { getStatusColor, getPriorityColor } from './_helpers';

interface TicketsTabProps {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  statusFilter: 'All' | 'Open' | 'Resolved' | 'Closed';
  setStatusFilter: (s: 'All' | 'Open' | 'Resolved' | 'Closed') => void;
  filteredTickets: Ticket[];
  onSelectTicket: (t: Ticket) => void;
  onOpenCreate: () => void;
}

export function TicketsTab({
  searchQuery, setSearchQuery, statusFilter, setStatusFilter,
  filteredTickets, onSelectTicket, onOpenCreate,
}: TicketsTabProps) {
  return (
    <motion.div
      key="tickets"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#10151F',
          borderRadius: '12px',
          border: '1px solid rgba(212,168,83,0.2)',
          padding: '12px 16px',
          marginBottom: '24px',
        }}
      >
        <MagnifyingGlass size={20} style={{ color: '#7A7363' }} />
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#F5E8C7',
            fontSize: '15px',
          }}
        />
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {(['All', 'Open', 'Resolved', 'Closed'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '8px 20px',
              background: statusFilter === status ? '#161D2C' : 'transparent',
              border: `1px solid ${statusFilter === status ? '#D4A853' : 'rgba(212,168,83,0.2)'}`,
              borderRadius: '8px',
              color: statusFilter === status ? '#F5E8C7' : '#C9C0A8',
              fontSize: '14px',
              fontWeight: statusFilter === status ? '600' : '500',
              cursor: 'pointer',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredTickets.map(ticket => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => onSelectTicket(ticket)}
            style={{
              background: '#10151F',
              borderRadius: '12px',
              border: '1px solid rgba(212,168,83,0.2)',
              padding: '20px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#F5E8C7', marginBottom: '8px' }}>
                  {ticket.title}
                </div>
                <div style={{ fontSize: '14px', color: '#C9C0A8', marginBottom: '12px', lineHeight: '1.5' }}>
                  {ticket.description}
                </div>
              </div>
              {ticket.unreadCount && ticket.unreadCount > 0 && (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#00A885',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '12px',
                  }}
                >
                  {ticket.unreadCount}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: `${getStatusColor(ticket.status)}20`,
                  color: getStatusColor(ticket.status),
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                {ticket.status}
              </span>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: '#161D2C',
                  color: '#C9C0A8',
                  fontSize: '13px',
                }}
              >
                {ticket.category}
              </span>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: `${getPriorityColor(ticket.priority)}20`,
                  color: getPriorityColor(ticket.priority),
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                {ticket.priority}
              </span>
              <span style={{ fontSize: '13px', color: '#7A7363', marginLeft: 'auto' }}>
                {ticket.createdAt} • {ticket.messageCount} messages
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Ticket FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenCreate}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00A885 0%, #008F6F 100%)',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,168,133, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}
      >
        <Plus size={28} style={{ color: '#FFFFFF' }} />
      </motion.button>
    </motion.div>
  );
}
