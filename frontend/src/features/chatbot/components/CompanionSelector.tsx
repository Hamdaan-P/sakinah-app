/**
 * CompanionSelector
 * Modal bottom sheet for choosing companion personas
 * Mirrors Flutter's companion_selector.dart with 4 sections
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Lock } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { COMPANION_SECTIONS, getCompanionById } from '../types/chatbot.types';
import type { Companion } from '../types/chatbot.types';
import { useKycStore } from '@/features/kyc/stores/kyc.store';
import { DeepKycModal } from '@/features/kyc/components/DeepKycModal';

interface CompanionSelectorProps {
  open: boolean;
  onClose: () => void;
  selectedId: string;
  onSelect: (id: string) => void;
}

export function CompanionSelector({ open, onClose, selectedId, onSelect }: CompanionSelectorProps) {
  const kycTier = useKycStore((s) => s.kycTier);
  const [showKycModal, setShowKycModal] = useState(false);

  const SAHABIYAT_IDS = new Set(['khadijah', 'aisha', 'fatimah']);

  const handleSelect = (id: string) => {
    // Sahabiyat are coming soon
    if (SAHABIYAT_IDS.has(id)) return;
    // Non-Raya companions require Tier 2
    if (id !== 'raya' && kycTier < 2) {
      setShowKycModal(true);
      return;
    }
    onSelect(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-hidden',
              // On lg+, push the sheet right of the 72px persistent sidebar so
              // its title and tags don't get clipped by the icon rail.
              'lg:left-[72px]',
              'bg-gradient-to-b from-[#0A0E16] to-[#0F141F]',
              'rounded-t-3xl border-t border-[#D4A853]/30'
            )}
          >
            {/* Handle bar */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-[#0A0E16] to-[#0A0E16]/95 pb-2 pt-3 px-5">
              <div className="w-10 h-1 mx-auto rounded-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A] mb-4" />
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent">
                  Choose Companion
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={16} className="text-white/60" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-5 pb-8 space-y-5">
              {COMPANION_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-[#C9A85C] uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.companions.map((cid) => {
                      const c = getCompanionById(cid);
                      const isComingSoon = SAHABIYAT_IDS.has(cid);
                      const isLocked = isComingSoon || (cid !== 'raya' && kycTier < 2);
                      return (
                        <CompanionCard
                          key={c.id}
                          companion={c}
                          isSelected={c.id === selectedId}
                          isLocked={isLocked}
                          isComingSoon={isComingSoon}
                          onSelect={() => handleSelect(c.id)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* KYC Modal for locked companions */}
          <DeepKycModal
            open={showKycModal}
            onClose={() => setShowKycModal(false)}
            featureName="Companion Access"
          />
        </>
      )}
    </AnimatePresence>
  );
}

function CompanionCard({
  companion,
  isSelected,
  isLocked = false,
  isComingSoon = false,
  onSelect,
}: {
  companion: Companion;
  isSelected: boolean;
  isLocked?: boolean;
  isComingSoon?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-start gap-3 p-3 rounded-2xl transition-all text-left',
        'border',
        isSelected
          ? 'bg-[#D4A853]/10 border-[#D4A853]/40'
          : 'bg-[#0F141F]/20 border-white/5 hover:bg-[#0F141F]/40',
        isLocked && 'opacity-60'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg relative',
          isSelected ? 'bg-[#D4A853]/20' : 'bg-[#0F141F]/50'
        )}
      >
        {companion.icon}
        {isLocked && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0A0E16] rounded-full flex items-center justify-center border border-[rgba(212,168,83,0.3)]">
            <Lock size={9} className="text-[#D4A853]" weight="bold" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('font-semibold text-sm', isSelected ? 'text-[#D4A853]' : 'text-[#F5E8C7]')}>
            {companion.name}
          </span>
          {isSelected && <Check size={16} className="text-[#D4A853]" />}
          {isComingSoon && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide" style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}>
              Coming Soon
            </span>
          )}
          {isLocked && !isComingSoon && <Lock size={12} className="text-[#D4A853]/60" />}
        </div>
        <p className="text-[11px] text-white/50 mt-0.5">{companion.title}</p>
        <p className="text-[11px] text-white/35 mt-1">{companion.description}</p>
        {/* Keyword tags */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {companion.keywords.slice(0, 4).map((kw) => (
            <span
              key={kw}
              className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/30"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
