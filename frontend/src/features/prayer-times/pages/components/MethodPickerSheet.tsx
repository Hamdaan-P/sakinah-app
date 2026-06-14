/**
 * Calculation-method picker bottom sheet for PrayerTimesPage.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from '@phosphor-icons/react';
import {
  CALCULATION_METHODS, CREAM, GOLD, NAVY_CARD, TEXT_MUTED, TEXT_SECONDARY,
} from '../../_constants';

interface MethodPickerSheetProps {
  open: boolean;
  selectedMethod: number;
  onClose: () => void;
  onSelect: (id: number) => void;
}

export function MethodPickerSheet({ open, selectedMethod, onClose, onSelect }: MethodPickerSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '70vh',
              background: NAVY_CARD,
              borderRadius: '20px 20px 0 0',
              padding: '24px',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: CREAM, margin: 0 }}>
                Calculation Method
              </h3>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: TEXT_MUTED,
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(CALCULATION_METHODS).map(([id, name]) => {
                const isSelected = selectedMethod === Number(id);
                return (
                  <button
                    key={id}
                    onClick={() => onSelect(Number(id))}
                    style={{
                      padding: '14px 16px',
                      background: isSelected ? `${GOLD}20` : 'transparent',
                      border: `1px solid ${isSelected ? GOLD + '40' : 'transparent'}`,
                      borderRadius: '10px',
                      color: isSelected ? GOLD : TEXT_SECONDARY,
                      fontSize: '14px',
                      fontWeight: isSelected ? '600' : '400',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{name}</span>
                    {isSelected && <Check size={18} color={GOLD} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
