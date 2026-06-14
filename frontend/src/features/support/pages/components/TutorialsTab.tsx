/**
 * TutorialsTab — searchable tutorial gallery, progress bar, and per-card
 * completion checkbox.
 */

import { motion } from 'framer-motion';
import {
  MagnifyingGlass, Funnel, Clock, Sparkle, TrendUp, Check,
} from '@phosphor-icons/react';
import { MOCK_TUTORIALS, type Tutorial } from '../../_supportData';
import { getTutorialTypeColor, getDifficultyColor, getTutorialTypeIcon } from './_helpers';

interface TutorialsTabProps {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (s: string) => void;
  filteredTutorials: Tutorial[];
  completedTutorials: Set<string>;
  toggleCompletion: (id: string) => void;
  tutorialCompletionPercentage: number;
  onOpenFilters: () => void;
  onSelectTutorial: (t: Tutorial) => void;
}

const CATEGORIES = [
  'All', 'Featured', 'Getting Started', 'Zakat Calculator',
  'Stock Screener', 'Networking', 'Islamic Finance', 'Tips & Tricks',
];

export function TutorialsTab({
  searchQuery, setSearchQuery, categoryFilter, setCategoryFilter,
  filteredTutorials, completedTutorials, toggleCompletion,
  tutorialCompletionPercentage, onOpenFilters, onSelectTutorial,
}: TutorialsTabProps) {
  return (
    <motion.div
      key="tutorials"
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
          placeholder="Search tutorials..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#F5E8C7', fontSize: '15px',
          }}
        />
        <button
          onClick={onOpenFilters}
          style={{
            padding: '6px 12px', background: '#161D2C',
            border: '1px solid rgba(212,168,83,0.2)', borderRadius: '6px',
            color: '#F5E8C7', fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <Funnel size={16} />
          Filters
        </button>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          background: '#10151F', borderRadius: '12px',
          border: '1px solid rgba(212,168,83,0.2)',
          padding: '20px', marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#F5E8C7' }}>Your Progress</span>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#D4A853' }}>
            {completedTutorials.size}/{MOCK_TUTORIALS.length} completed
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#161D2C', borderRadius: '4px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${tutorialCompletionPercentage}%` }}
            transition={{ duration: 0.5 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00A885 0%, #00D9A3 100%)',
              borderRadius: '4px',
            }}
          />
        </div>
        <div style={{ marginTop: '8px', fontSize: '13px', color: '#C9C0A8' }}>
          {tutorialCompletionPercentage}% complete
        </div>
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

      {/* Tutorials Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
        {filteredTutorials.map(tutorial => (
          <motion.div
            key={tutorial.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectTutorial(tutorial)}
            style={{
              background: '#10151F', borderRadius: '12px',
              border: '1px solid rgba(212,168,83,0.2)',
              padding: '20px', cursor: 'pointer', position: 'relative',
            }}
          >
            {/* Type Icon */}
            <div
              style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${getTutorialTypeColor(tutorial.type)}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', marginBottom: '12px',
              }}
            >
              {getTutorialTypeIcon(tutorial.type)}
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {tutorial.isFeatured && (
                <span
                  style={{
                    padding: '4px 10px', borderRadius: '6px',
                    background: '#D4A85320', color: '#D4A853',
                    fontSize: '11px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  <Sparkle size={10} />
                  FEATURED
                </span>
              )}
            </div>

            {/* Title and Description */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F5E8C7', marginBottom: '8px', lineHeight: '1.4' }}>
              {tutorial.title}
            </h3>
            <p
              style={{
                fontSize: '14px', color: '#C9C0A8', lineHeight: '1.5',
                marginBottom: '16px',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}
            >
              {tutorial.description}
            </p>

            {/* Meta Info */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                paddingTop: '16px', borderTop: '1px solid rgba(212,168,83,0.2)',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: '13px', color: '#C9C0A8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                {tutorial.duration}
              </span>
              <span
                style={{
                  padding: '4px 10px', borderRadius: '6px',
                  background: `${getDifficultyColor(tutorial.difficulty)}20`,
                  color: getDifficultyColor(tutorial.difficulty),
                  fontSize: '12px', fontWeight: '600',
                }}
              >
                {tutorial.difficulty}
              </span>
              <span
                style={{
                  padding: '4px 10px', borderRadius: '6px',
                  background: `${getTutorialTypeColor(tutorial.type)}20`,
                  color: getTutorialTypeColor(tutorial.type),
                  fontSize: '12px', fontWeight: '600',
                }}
              >
                {tutorial.type}
              </span>
              <span style={{ fontSize: '13px', color: '#7A7363', marginLeft: 'auto' }}>
                <TrendUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {tutorial.views} views
              </span>
            </div>

            {/* Completion Checkbox */}
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
              <button
                onClick={e => { e.stopPropagation(); toggleCompletion(tutorial.id); }}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  background: completedTutorials.has(tutorial.id) ? '#4CAF50' : '#161D2C',
                  border: `2px solid ${completedTutorials.has(tutorial.id) ? '#4CAF50' : 'rgba(212,168,83,0.2)'}`,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {completedTutorials.has(tutorial.id) && <Check size={16} style={{ color: '#FFFFFF' }} />}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
