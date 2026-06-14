/**
 * TicketDetailModal — right-side slide-in panel showing the full conversation
 * for a single ticket.
 */

import { motion } from 'framer-motion';
import { X, PaperPlaneRight } from '@phosphor-icons/react';
import type { Ticket } from '../../_supportData';
import { getStatusColor, getPriorityColor } from './_helpers';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
}

export function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0, 0.7)', zIndex: 1000,
        }}
      />
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '90%', maxWidth: '600px',
          background: '#10151F',
          borderLeft: '1px solid rgba(212,168,83,0.2)',
          zIndex: 1001, overflow: 'auto', padding: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#F5E8C7', margin: 0 }}>Ticket Details</h2>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: '#161D2C', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={20} style={{ color: '#C9C0A8' }} />
          </button>
        </div>

        {/* Ticket Info */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '12px' }}>
            {ticket.title}
          </h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '6px 14px', borderRadius: '6px',
                background: `${getStatusColor(ticket.status)}20`,
                color: getStatusColor(ticket.status),
                fontSize: '13px', fontWeight: '600',
              }}
            >
              {ticket.status}
            </span>
            <span
              style={{
                padding: '6px 14px', borderRadius: '6px',
                background: '#161D2C', color: '#C9C0A8',
                fontSize: '13px',
              }}
            >
              {ticket.category}
            </span>
            <span
              style={{
                padding: '6px 14px', borderRadius: '6px',
                background: `${getPriorityColor(ticket.priority)}20`,
                color: getPriorityColor(ticket.priority),
                fontSize: '13px', fontWeight: '600',
              }}
            >
              {ticket.priority}
            </span>
          </div>
          <p style={{ fontSize: '15px', color: '#C9C0A8', lineHeight: '1.6' }}>{ticket.description}</p>
          <div style={{ fontSize: '13px', color: '#7A7363', marginTop: '12px' }}>Created: {ticket.createdAt}</div>
        </div>

        {/* Messages */}
        {ticket.messages && ticket.messages.length > 0 && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#F5E8C7', marginBottom: '16px' }}>Conversation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ticket.messages.map(message => (
                <div
                  key={message.id}
                  style={{
                    padding: '16px',
                    background: message.sender === 'user' ? '#161D2C' : '#161D2C',
                    borderRadius: '12px',
                    border: `1px solid ${message.sender === 'user' ? 'rgba(212,168,83,0.2)' : '#D4A85340'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: message.sender === 'user' ? '#F5E8C7' : '#D4A853' }}>
                      {message.sender === 'user' ? 'You' : 'Support Team'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#7A7363' }}>{message.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '15px', color: '#C9C0A8', lineHeight: '1.5' }}>{message.message}</div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Type your reply..."
                style={{
                  flex: 1, padding: '12px',
                  background: '#161D2C', border: '1px solid rgba(212,168,83,0.2)',
                  borderRadius: '8px', color: '#F5E8C7', fontSize: '15px', outline: 'none',
                }}
              />
              <button
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #00A885 0%, #008F6F 100%)',
                  border: 'none', borderRadius: '8px',
                  color: '#FFFFFF', fontSize: '15px', fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <PaperPlaneRight size={16} />
                PaperPlaneRight
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
