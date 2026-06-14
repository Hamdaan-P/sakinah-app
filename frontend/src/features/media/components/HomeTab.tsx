/**
 * Landing tab — category-tile grid. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { HOME_CATEGORIES } from '../_constants';
import type { ActiveTab } from '../_types';

interface Props {
  onSelectTab: (tab: ActiveTab) => void;
}

export function HomeTab({ onSelectTab }: Props) {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {HOME_CATEGORIES.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            onClick={() => onSelectTab(category.tab)}
            style={{
              background: category.gradient,
              borderRadius: '16px',
              padding: '32px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255,255,255, 0.1)',
              backdropFilter: 'blur(10px)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#FFFFFF',
                margin: '0 0 8px 0',
              }}>
                {category.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255, 0.8)',
                margin: 0,
              }}>
                {category.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
