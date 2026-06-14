/**
 * Duas tab — category grid (or detail list when a category is selected).
 * Phase 5 split.
 */

import { motion } from 'framer-motion';
import { CaretRight } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { DUA_CATEGORIES, DUAS } from '../_data';

interface Props {
  selectedDuaCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function DuasTab({ selectedDuaCategory, onSelectCategory }: Props) {
  return (
    <motion.div
      key="duas"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {!selectedDuaCategory ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {DUA_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => onSelectCategory(category.id)}
              style={{
                backgroundColor: COLORS.navy.secondary,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{category.icon}</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: COLORS.text.cream,
                marginBottom: '8px',
              }}>
                {category.name}
              </h3>
              <p style={{ fontSize: '14px', color: COLORS.text.muted, margin: 0 }}>
                {category.count} duas
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => onSelectCategory(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: COLORS.navy.tertiary,
              border: 'none',
              borderRadius: '8px',
              color: COLORS.text.cream,
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '24px',
            }}
          >
            <CaretRight size={18} style={{ transform: 'rotate(180deg)' }} />
            Back to Categories
          </button>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {(DUAS[selectedDuaCategory] || []).map((dua, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  backgroundColor: COLORS.navy.secondary,
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '20px',
                }}
              >
                <p style={{
                  fontSize: '24px',
                  lineHeight: '2',
                  color: COLORS.text.cream,
                  textAlign: 'right',
                  fontFamily: 'serif',
                  marginBottom: '16px',
                }}>
                  {dua.arabic}
                </p>
                <p style={{
                  fontSize: '14px',
                  fontStyle: 'italic',
                  color: COLORS.text.secondary,
                  marginBottom: '12px',
                }}>
                  {dua.transliteration}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: COLORS.text.cream,
                  marginBottom: '12px',
                }}>
                  {dua.translation}
                </p>
                <div style={{
                  fontSize: '12px',
                  color: COLORS.text.muted,
                  fontStyle: 'italic',
                }}>
                  Source: {dua.source}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
