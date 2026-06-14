/**
 * Search + filter chips for the Browse view. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, Funnel } from '@phosphor-icons/react';
import type { EventCategory, EventFormat } from '../_types';

interface Props {
  searchQuery: string;
  selectedFormat: EventFormat | 'All';
  selectedCategory: EventCategory | 'All';
  showFilters: boolean;
  onChangeSearch: (v: string) => void;
  onChangeFormat: (f: EventFormat | 'All') => void;
  onChangeCategory: (c: EventCategory | 'All') => void;
  onToggleFilters: () => void;
}

const FORMATS: (EventFormat | 'All')[] = ['All', 'In-Person', 'Virtual', 'Hybrid'];
const CATEGORIES: (EventCategory | 'All')[] = ['All', 'Business & Economics', 'Technology', 'Healthcare', 'Education', 'Marketing'];

export function BrowseFilters({
  searchQuery,
  selectedFormat,
  selectedCategory,
  showFilters,
  onChangeSearch,
  onChangeFormat,
  onChangeCategory,
  onToggleFilters,
}: Props) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <MagnifyingGlass size={20} color="#7A7363" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search conferences..."
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              background: '#10151F',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRadius: '12px',
              color: '#F5E8C7',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
        <button
          onClick={onToggleFilters}
          style={{
            padding: '14px 20px',
            background: showFilters ? '#D4A853' : '#10151F',
            border: '1px solid rgba(212,168,83,0.2)',
            borderRadius: '12px',
            color: showFilters ? '#10151F' : '#F5E8C7',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Funnel size={18} />
          Filters
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '16px', background: '#10151F', borderRadius: '12px', border: '1px solid rgba(212,168,83,0.2)' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#7A7363', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Format
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {FORMATS.map((format) => (
                    <button
                      key={format}
                      onClick={() => onChangeFormat(format)}
                      style={{
                        padding: '8px 16px',
                        background: selectedFormat === format ? '#D4A853' : '#161D2C',
                        border: 'none',
                        borderRadius: '20px',
                        color: selectedFormat === format ? '#10151F' : '#C9C0A8',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#7A7363', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Category
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => onChangeCategory(category)}
                      style={{
                        padding: '8px 16px',
                        background: selectedCategory === category ? '#D4A853' : '#161D2C',
                        border: 'none',
                        borderRadius: '20px',
                        color: selectedCategory === category ? '#10151F' : '#C9C0A8',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
