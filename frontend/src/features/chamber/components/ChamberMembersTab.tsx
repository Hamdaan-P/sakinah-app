/**
 * ChamberV2 Members tab. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { CATEGORIES } from '../_helpers';
import { MemberCard } from './MemberCard';
import type { CategoryFilter, Member } from '../_types';

interface Props {
  searchQuery: string;
  categoryFilter: CategoryFilter;
  filteredMembers: Member[];
  onChangeSearch: (v: string) => void;
  onChangeCategory: (c: CategoryFilter) => void;
  onSelectMember: (m: Member) => void;
}

const STATS = [
  { label: 'Members', value: '248' },
  { label: 'Industries', value: '13' },
  { label: 'Countries', value: '8' },
];

export function ChamberMembersTab({
  searchQuery,
  categoryFilter,
  filteredMembers,
  onChangeSearch,
  onChangeCategory,
  onSelectMember,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '32px' }}
    >
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <MagnifyingGlass
              size={20}
              color={COLORS.text.muted}
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => onChangeSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                background: COLORS.navy.darker,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '12px',
                color: COLORS.text.primary,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChangeCategory(cat)}
              style={{
                padding: '8px 16px',
                background: categoryFilter === cat ? COLORS.gold.base : COLORS.navy.dark,
                border: `1px solid ${categoryFilter === cat ? COLORS.gold.base : COLORS.border}`,
                borderRadius: '20px',
                color: categoryFilter === cat ? COLORS.navy.darkest : COLORS.text.secondary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

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
            <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.gold.base }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '14px', color: COLORS.text.muted, marginTop: '4px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        <AnimatePresence mode="popLayout">
          {filteredMembers.map((member, idx) => (
            <MemberCard key={member.id} member={member} idx={idx} onSelect={onSelectMember} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
