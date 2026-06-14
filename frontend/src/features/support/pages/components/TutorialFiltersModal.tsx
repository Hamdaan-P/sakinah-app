/**
 * TutorialFiltersModal — modal with type + difficulty filter chips for the
 * tutorials tab.
 */

import { motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';

interface TutorialFiltersModalProps {
  typeFilter: string;
  setTypeFilter: (s: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (s: string) => void;
  onClose: () => void;
}

export function TutorialFiltersModal({
  typeFilter, setTypeFilter, difficultyFilter, setDifficultyFilter, onClose,
}: TutorialFiltersModalProps) {
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
          width: '90%', maxWidth: '500px',
          background: '#10151F', borderRadius: '16px',
          border: '1px solid rgba(212,168,83,0.2)',
          padding: '32px', zIndex: 1001,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#F5E8C7', margin: 0 }}>Filters</h2>
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

        {/* Type Filter */}
        <fieldset style={{ marginBottom: '24px', border: 'none', padding: 0 }}>
          <legend style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#F5E8C7', marginBottom: '12px' }}>
            Type
          </legend>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Walkthrough', 'Article', 'QuickTip'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                style={{
                  padding: '8px 16px',
                  background: typeFilter === type ? '#161D2C' : 'transparent',
                  border: `1px solid ${typeFilter === type ? '#D4A853' : 'rgba(212,168,83,0.2)'}`,
                  borderRadius: '8px',
                  color: typeFilter === type ? '#F5E8C7' : '#C9C0A8',
                  fontSize: '14px',
                  fontWeight: typeFilter === type ? '600' : '500',
                  cursor: 'pointer',
                }}
              >
                {type === 'QuickTip' ? 'Quick Tip' : type}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Difficulty Filter */}
        <fieldset style={{ marginBottom: '24px', border: 'none', padding: 0 }}>
          <legend style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#F5E8C7', marginBottom: '12px' }}>
            Difficulty
          </legend>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map(difficulty => (
              <button
                key={difficulty}
                type="button"
                onClick={() => setDifficultyFilter(difficulty)}
                style={{
                  padding: '8px 16px',
                  background: difficultyFilter === difficulty ? '#161D2C' : 'transparent',
                  border: `1px solid ${difficultyFilter === difficulty ? '#D4A853' : 'rgba(212,168,83,0.2)'}`,
                  borderRadius: '8px',
                  color: difficultyFilter === difficulty ? '#F5E8C7' : '#C9C0A8',
                  fontSize: '14px',
                  fontWeight: difficultyFilter === difficulty ? '600' : '500',
                  cursor: 'pointer',
                }}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Apply Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, #00A885 0%, #008F6F 100%)',
            border: 'none', borderRadius: '8px',
            color: '#FFFFFF', fontSize: '16px', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Apply Filters
        </button>
      </motion.div>
    </>
  );
}
