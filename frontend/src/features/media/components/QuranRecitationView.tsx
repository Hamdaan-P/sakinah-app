/**
 * Quran recitation view — reciter dropdown + surah list. Phase 5 split.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, Play } from '@phosphor-icons/react';
import { COLORS, RECITERS } from '../_constants';
import { SURAHS } from '../_data';

interface Props {
  selectedReciter: string;
  showReciterDropdown: boolean;
  playingSurah: number | null;
  onChangeReciter: (reciter: string) => void;
  onToggleReciterDropdown: () => void;
  onTogglePlaySurah: (number: number) => void;
}

export function QuranRecitationView({
  selectedReciter,
  showReciterDropdown,
  playingSurah,
  onChangeReciter,
  onToggleReciterDropdown,
  onTogglePlaySurah,
}: Props) {
  return (
    <div>
      {/* Reciter Selector */}
      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <button
          onClick={onToggleReciterDropdown}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '300px',
            padding: '12px 16px',
            backgroundColor: COLORS.navy.tertiary,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            color: COLORS.text.cream,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <span>{selectedReciter}</span>
          <CaretDown size={18} />
        </button>
        <AnimatePresence>
          {showReciterDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '300px',
                marginTop: '8px',
                backgroundColor: COLORS.navy.tertiary,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                overflow: 'hidden',
                zIndex: 10,
              }}
            >
              {RECITERS.map((reciter) => (
                <button
                  key={reciter}
                  onClick={() => onChangeReciter(reciter)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: selectedReciter === reciter ? COLORS.navy.quaternary : 'transparent',
                    border: 'none',
                    color: COLORS.text.cream,
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {reciter}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Surah List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
      }}>
        {SURAHS.map((surah) => (
          <motion.div
            key={surah.number}
            whileHover={{ scale: 1.02 }}
            onClick={() => onTogglePlaySurah(surah.number)}
            style={{
              backgroundColor: playingSurah === surah.number ? COLORS.navy.tertiary : COLORS.navy.secondary,
              border: `1px solid ${playingSurah === surah.number ? COLORS.teal : COLORS.border}`,
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: COLORS.navy.quaternary,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '600',
              color: COLORS.gold.primary,
            }}>
              {surah.number}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text.cream }}>
                  {surah.english}
                </span>
                <span style={{ fontSize: '20px', color: COLORS.gold.secondary }}>
                  {surah.arabic}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: COLORS.text.muted }}>
                <span>{surah.type}</span>
                <span>•</span>
                <span>{surah.verses} verses</span>
              </div>
            </div>
            {playingSurah === surah.number && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ color: COLORS.teal }}
              >
                <Play size={24} fill="currentColor" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
