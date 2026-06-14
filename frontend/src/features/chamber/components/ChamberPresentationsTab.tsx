/**
 * ChamberV2 Presentations tab. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, User, Plus } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { PresentationCard } from './PresentationCard';
import type { Presentation, PresentationCategory, PresentationTab } from '../_types';

interface Props {
  presentationTab: PresentationTab;
  presentationCategory: PresentationCategory;
  filteredPresentations: Presentation[];
  onChangeSubTab: (t: PresentationTab) => void;
  onChangeCategory: (c: PresentationCategory) => void;
  onOpenUploadDialog: () => void;
  onSelectPresentation: (p: Presentation) => void;
}

const SUB_TABS = [
  { id: 'browse' as PresentationTab, label: 'Browse Decks', icon: MagnifyingGlass },
  { id: 'mydecks' as PresentationTab, label: 'My Decks', icon: User },
];

const CATEGORIES: PresentationCategory[] = ['All', 'Investment', 'Startup', 'Technology', 'Islamic Finance', 'Business Plan', 'Marketing', 'Other'];

const STATS = [
  { label: 'Total Decks', value: '47' },
  { label: 'Total Views', value: '12.5K' },
  { label: 'Featured', value: '8' },
];

export function ChamberPresentationsTab({
  presentationTab,
  presentationCategory,
  filteredPresentations,
  onChangeSubTab,
  onChangeCategory,
  onOpenUploadDialog,
  onSelectPresentation,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '32px' }}
    >
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {SUB_TABS.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChangeSubTab(tab.id)}
            style={{
              padding: '12px 24px',
              background: presentationTab === tab.id ? COLORS.gold.base : COLORS.navy.dark,
              border: `1px solid ${presentationTab === tab.id ? COLORS.gold.base : COLORS.border}`,
              borderRadius: '12px',
              color: presentationTab === tab.id ? COLORS.navy.darkest : COLORS.text.secondary,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChangeCategory(cat)}
            style={{
              padding: '8px 16px',
              background: presentationCategory === cat ? COLORS.gold.base : COLORS.navy.dark,
              border: `1px solid ${presentationCategory === cat ? COLORS.gold.base : COLORS.border}`,
              borderRadius: '20px',
              color: presentationCategory === cat ? COLORS.navy.darkest : COLORS.text.secondary,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {presentationTab === 'browse' && (
        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
          {STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                background: COLORS.navy.darker,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${COLORS.border}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.gold.base }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '14px', color: COLORS.text.muted, marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {presentationTab === 'mydecks' && (
          <motion.div
            whileHover={{ y: -4 }}
            onClick={onOpenUploadDialog}
            style={{
              background: COLORS.navy.darker,
              borderRadius: '16px',
              padding: '32px',
              border: `2px dashed ${COLORS.border}`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '320px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `${COLORS.gold.base}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Plus size={32} color={COLORS.gold.base} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '8px' }}>
              Create New Deck
            </div>
            <div style={{ fontSize: '14px', color: COLORS.text.muted, textAlign: 'center' }}>
              UploadSimple and share your presentation
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {filteredPresentations.map((presentation, idx) => (
            <PresentationCard
              key={presentation.id}
              presentation={presentation}
              idx={idx}
              onSelect={onSelectPresentation}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
