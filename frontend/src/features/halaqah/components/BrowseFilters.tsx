/**
 * Search + category-pill row + grid/list toggle for the Browse Events
 * tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { MagnifyingGlass, GridFour, List } from '@phosphor-icons/react';
import { eventCategories } from '../_data';
import type { ViewMode } from '../_types';

interface Props {
  searchQuery: string;
  selectedCategory: string;
  viewMode: ViewMode;
  onChangeSearch: (v: string) => void;
  onChangeCategory: (id: string) => void;
  onChangeViewMode: (m: ViewMode) => void;
}

export function BrowseFilters({
  searchQuery,
  selectedCategory,
  viewMode,
  onChangeSearch,
  onChangeCategory,
  onChangeViewMode,
}: Props) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <MagnifyingGlass
          size={20}
          color="#7A7363"
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => onChangeSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px 12px 48px',
            background: '#10151F',
            border: '1px solid rgba(212,168,83,0.2)',
            borderRadius: '8px',
            color: '#F5E8C7',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <motion.button
          onClick={() => onChangeCategory('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(212,168,83,0.2)',
            background: selectedCategory === 'all' ? '#D4A853' : '#10151F',
            color: selectedCategory === 'all' ? '#10151F' : '#C9C0A8',
            fontSize: '14px',
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          All Events
        </motion.button>
        {eventCategories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onChangeCategory(category.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: `1px solid ${selectedCategory === category.id ? category.color : 'rgba(212,168,83,0.2)'}`,
              background: selectedCategory === category.id ? `${category.color}20` : '#10151F',
              color: selectedCategory === category.id ? category.color : '#C9C0A8',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.icon}
            {category.name}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <motion.button
          onClick={() => onChangeViewMode('grid')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(212,168,83,0.2)',
            background: viewMode === 'grid' ? '#D4A853' : '#10151F',
            color: viewMode === 'grid' ? '#10151F' : '#C9C0A8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <GridFour size={16} />
          Grid
        </motion.button>
        <motion.button
          onClick={() => onChangeViewMode('list')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(212,168,83,0.2)',
            background: viewMode === 'list' ? '#D4A853' : '#10151F',
            color: viewMode === 'list' ? '#10151F' : '#C9C0A8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <List size={16} />
          List
        </motion.button>
      </div>
    </div>
  );
}
