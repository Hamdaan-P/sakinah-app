/**
 * CreateTicketModal — modal form for opening a new support ticket.
 */

import { motion } from 'framer-motion';
import { X, PaperPlaneRight } from '@phosphor-icons/react';
import { getPriorityColor } from './_helpers';

interface CreateTicketModalProps {
  subject: string;
  setSubject: (s: string) => void;
  category: string;
  setCategory: (s: string) => void;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  setPriority: (s: 'Low' | 'Medium' | 'High' | 'Urgent') => void;
  description: string;
  setDescription: (s: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function CreateTicketModal({
  subject, setSubject, category, setCategory, priority, setPriority,
  description, setDescription, onClose, onSubmit,
}: CreateTicketModalProps) {
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: '600px', maxHeight: '90vh',
          background: '#10151F', borderRadius: '16px',
          border: '1px solid rgba(212,168,83,0.2)',
          padding: '32px', zIndex: 1001, overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#F5E8C7', margin: 0 }}>Create Support Ticket</h2>
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

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="supportpage-fld-1" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#F5E8C7', marginBottom: '8px' }}>
              Subject
            </label>
            <input id="supportpage-fld-1"
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              style={{
                width: '100%', padding: '12px',
                background: '#161D2C', border: '1px solid rgba(212,168,83,0.2)',
                borderRadius: '8px', color: '#F5E8C7', fontSize: '15px', outline: 'none',
              }}
            />
          </div>

          <div>
            <label htmlFor="supportpage-fld-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#F5E8C7', marginBottom: '8px' }}>
              Category
            </label>
            <select id="supportpage-fld-2"
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%', padding: '12px',
                background: '#161D2C', border: '1px solid rgba(212,168,83,0.2)',
                borderRadius: '8px', color: '#F5E8C7', fontSize: '15px', outline: 'none',
              }}
            >
              <option value="General">General</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="Account">Account</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Feature Request">Feature Request</option>
            </select>
          </div>

          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#F5E8C7', marginBottom: '8px' }}>
              Priority
            </legend>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['Low', 'Medium', 'High', 'Urgent'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1, padding: '10px',
                    background: priority === p ? `${getPriorityColor(p)}20` : '#161D2C',
                    border: `2px solid ${priority === p ? getPriorityColor(p) : 'rgba(212,168,83,0.2)'}`,
                    borderRadius: '8px',
                    color: priority === p ? getPriorityColor(p) : '#C9C0A8',
                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="supportpage-fld-3" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#F5E8C7', marginBottom: '8px' }}>
              Description
            </label>
            <textarea id="supportpage-fld-3"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Please provide detailed information about your issue..."
              rows={6}
              style={{
                width: '100%', padding: '12px',
                background: '#161D2C', border: '1px solid rgba(212,168,83,0.2)',
                borderRadius: '8px', color: '#F5E8C7', fontSize: '15px',
                outline: 'none', resize: 'vertical', fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={onSubmit}
              style={{
                flex: 1, padding: '14px',
                background: 'linear-gradient(135deg, #00A885 0%, #008F6F 100%)',
                border: 'none', borderRadius: '8px',
                color: '#FFFFFF', fontSize: '16px', fontWeight: '600',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <PaperPlaneRight size={18} />
              Submit Ticket
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '14px 24px', background: 'transparent',
                border: '1px solid rgba(212,168,83,0.2)', borderRadius: '8px',
                color: '#C9C0A8', fontSize: '16px', fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
