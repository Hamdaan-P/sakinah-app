/**
 * Browse Events view — greeting, filters, featured event, grid.
 * Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Calendar } from '@phosphor-icons/react';
import { BrowseFilters } from './BrowseFilters';
import { ConferenceCard } from './ConferenceCard';
import { getTimeGreeting } from '../_helpers';
import type { Conference, EventCategory, EventFormat } from '../_types';

interface Props {
  searchQuery: string;
  selectedFormat: EventFormat | 'All';
  selectedCategory: EventCategory | 'All';
  showFilters: boolean;
  featuredConference: Conference | undefined;
  upcomingConferences: Conference[];
  onChangeSearch: (v: string) => void;
  onChangeFormat: (f: EventFormat | 'All') => void;
  onChangeCategory: (c: EventCategory | 'All') => void;
  onToggleFilters: () => void;
  onSelectConference: (c: Conference) => void;
}

export function EventsBrowseView({
  searchQuery,
  selectedFormat,
  selectedCategory,
  showFilters,
  featuredConference,
  upcomingConferences,
  onChangeSearch,
  onChangeFormat,
  onChangeCategory,
  onToggleFilters,
  onSelectConference,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '40px' }}
    >
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#F5E8C7', marginBottom: '8px' }}>
          {getTimeGreeting()}
        </h1>
        <p style={{ fontSize: '16px', color: '#C9C0A8' }}>
          Discover conferences and events to expand your network
        </p>
      </div>

      <BrowseFilters
        searchQuery={searchQuery}
        selectedFormat={selectedFormat}
        selectedCategory={selectedCategory}
        showFilters={showFilters}
        onChangeSearch={onChangeSearch}
        onChangeFormat={onChangeFormat}
        onChangeCategory={onChangeCategory}
        onToggleFilters={onToggleFilters}
      />

      {featuredConference && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '16px' }}>
            Featured Event
          </h2>
          <ConferenceCard
            conference={featuredConference}
            featured
            onSelect={onSelectConference}
          />
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '16px' }}>
          Upcoming Events ({upcomingConferences.length})
        </h2>
        {upcomingConferences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7A7363' }}>
            <Calendar size={48} style={{ margin: '0 auto 16px' }} />
            <p>No events found matching your filters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {upcomingConferences.map((conf) => (
              <ConferenceCard key={conf.id} conference={conf} onSelect={onSelectConference} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
