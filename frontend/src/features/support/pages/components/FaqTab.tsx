/**
 * FaqTab — FAQ list with search, category filters, expandable accordion
 * answers, and a "still need help" CTA at the bottom.
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass, Chat, CaretDown, CaretRight, Sparkle,
  ThumbsUp, ThumbsDown,
} from '@phosphor-icons/react';

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: string;
  isPopular?: boolean;
  tags: string[];
}

interface FaqTabProps {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (s: string) => void;
  expandedFaqIds: Set<string>;
  toggleFaq: (id: string) => void;
  filteredFaqs: FaqEntry[];
  onOpenCreateTicket: () => void;
  onOpenLiveChat: () => void;
}

const CATEGORIES = [
  'All', 'Popular', 'General', 'Account', 'Islamic Finance',
  'Zakat', 'Stocks', 'Networking', 'Technical', 'Billing',
];

export function FaqTab({
  searchQuery, setSearchQuery, categoryFilter, setCategoryFilter,
  expandedFaqIds, toggleFaq, filteredFaqs, onOpenCreateTicket, onOpenLiveChat,
}: FaqTabProps) {
  return (
    <motion.div
      key="faq"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Search Bar */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: '#10151F', borderRadius: '12px',
          border: '1px solid rgba(212,168,83,0.2)',
          padding: '12px 16px', marginBottom: '24px',
        }}
      >
        <MagnifyingGlass size={20} style={{ color: '#7A7363' }} />
        <input
          type="text"
          placeholder="Search FAQ..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#F5E8C7', fontSize: '15px',
          }}
        />
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setCategoryFilter(category)}
            style={{
              padding: '8px 16px',
              background: categoryFilter === category ? '#161D2C' : 'transparent',
              border: `1px solid ${categoryFilter === category ? '#D4A853' : 'rgba(212,168,83,0.2)'}`,
              borderRadius: '8px',
              color: categoryFilter === category ? '#F5E8C7' : '#C9C0A8',
              fontSize: '14px',
              fontWeight: categoryFilter === category ? '600' : '500',
              cursor: 'pointer',
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {filteredFaqs.map(faq => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#10151F', borderRadius: '12px',
              border: '1px solid rgba(212,168,83,0.2)', overflow: 'hidden',
            }}
          >
            <button
              onClick={() => toggleFaq(faq.id)}
              style={{
                width: '100%', padding: '20px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'flex-start', gap: '16px', textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: '#161D2C', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', flexShrink: 0,
                }}
              >
                {faq.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '4px 10px', borderRadius: '6px',
                      background: '#161D2C', color: '#D4A853',
                      fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
                    }}
                  >
                    {faq.category}
                  </span>
                  {faq.isPopular && (
                    <span
                      style={{
                        padding: '4px 10px', borderRadius: '6px',
                        background: '#FF980020', color: '#FF9800',
                        fontSize: '11px', fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <Sparkle size={12} />
                      POPULAR
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#F5E8C7', marginBottom: '4px' }}>
                  {faq.question}
                </div>
              </div>
              {expandedFaqIds.has(faq.id) ? (
                <CaretDown size={20} style={{ color: '#D4A853', flexShrink: 0 }} />
              ) : (
                <CaretRight size={20} style={{ color: '#7A7363', flexShrink: 0 }} />
              )}
            </button>

            <AnimatePresence>
              {expandedFaqIds.has(faq.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 20px 20px 76px' }}>
                    <div style={{ fontSize: '15px', color: '#C9C0A8', lineHeight: '1.6', marginBottom: '16px' }}>
                      {faq.answer}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      {faq.tags.map(tag => (
                        <span key={tag} style={{ fontSize: '13px', color: '#7A7363' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(212,168,83,0.2)' }}>
                      <span style={{ fontSize: '14px', color: '#C9C0A8' }}>Was this helpful?</span>
                      <button
                        style={{
                          padding: '6px 12px', background: 'transparent',
                          border: '1px solid rgba(212,168,83,0.2)', borderRadius: '6px',
                          color: '#C9C0A8', fontSize: '13px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        <ThumbsUp size={14} />
                        Yes
                      </button>
                      <button
                        style={{
                          padding: '6px 12px', background: 'transparent',
                          border: '1px solid rgba(212,168,83,0.2)', borderRadius: '6px',
                          color: '#C9C0A8', fontSize: '13px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        <ThumbsDown size={14} />
                        No
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Still Need Help Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #161D2C 0%, #10151F 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(212,168,83,0.2)',
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <Chat size={48} style={{ color: '#D4A853', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#F5E8C7', marginBottom: '12px' }}>
          Still need help?
        </h3>
        <p style={{ fontSize: '15px', color: '#C9C0A8', marginBottom: '24px' }}>
          Can't find what you're looking for? Our support team is here to help you.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onOpenCreateTicket}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #00A885 0%, #008F6F 100%)',
              border: 'none', borderRadius: '8px',
              color: '#FFFFFF', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Contact Support
          </button>
          <button
            onClick={onOpenLiveChat}
            style={{
              padding: '12px 24px', background: 'transparent',
              border: '1px solid rgba(212,168,83,0.2)', borderRadius: '8px',
              color: '#F5E8C7', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Start Live Chat
          </button>
        </div>
      </div>
    </motion.div>
  );
}
