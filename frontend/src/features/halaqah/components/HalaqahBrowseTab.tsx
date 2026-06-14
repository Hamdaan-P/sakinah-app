/**
 * Halaqah Browse Events tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { BrowseFilters } from './BrowseFilters';
import { BrowseEventGridCard } from './BrowseEventGridCard';
import { BrowseEventListRow } from './BrowseEventListRow';
import type { HalaqahEvent, ViewMode } from '../_types';

interface Props {
  searchQuery: string;
  selectedCategory: string;
  viewMode: ViewMode;
  filteredEvents: HalaqahEvent[];
  onChangeSearch: (v: string) => void;
  onChangeCategory: (id: string) => void;
  onChangeViewMode: (m: ViewMode) => void;
  onSelectEvent: (event: HalaqahEvent) => void;
}

export function HalaqahBrowseTab({
  searchQuery,
  selectedCategory,
  viewMode,
  filteredEvents,
  onChangeSearch,
  onChangeCategory,
  onChangeViewMode,
  onSelectEvent,
}: Props) {
  return (
    <motion.div
      key="browse"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '32px' }}
    >
      <BrowseFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        viewMode={viewMode}
        onChangeSearch={onChangeSearch}
        onChangeCategory={onChangeCategory}
        onChangeViewMode={onChangeViewMode}
      />

      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {filteredEvents.map((event, idx) => (
            <BrowseEventGridCard
              key={event.id}
              event={event}
              idx={idx}
              onSelect={onSelectEvent}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredEvents.map((event, idx) => (
            <BrowseEventListRow
              key={event.id}
              event={event}
              idx={idx}
              onSelect={onSelectEvent}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
