/**
 * PascoResults — Displays the PASCO assessment results.
 * Radar chart (4 dimensions), signature strengths, growth edges, archetype.
 */

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkle, ArrowLeft } from '@phosphor-icons/react';
import type { PascoResult } from '../data/pasco-scoring';
import { C } from '../barka-labs.constants';
import {
  ArchetypeHero,
  DimensionGrid,
  TraitList,
  FullBreakdown,
} from './pasco-results/_sections';

interface PascoResultsProps {
  result: PascoResult;
  onClose: () => void;
  isDemo?: boolean;
}

export function PascoResults({ result, onClose, isDemo }: PascoResultsProps) {
  const { t } = useTranslation('demo');
  const { dimensionScores, subTraitScores, signatureStrengths, growthEdges, archetype } = result;

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: '#7F8A9A' }}
      >
        <ArrowLeft size={16} /> {t('pasco.results.backToReport')}
      </button>

      <ArchetypeHero archetype={archetype} />

      <DimensionGrid dimensionScores={dimensionScores} />

      <TraitList
        title={t('pasco.results.signatureStrengths')}
        items={signatureStrengths}
        variant="strength"
        delayBase={0.3}
      />

      <TraitList
        title={t('pasco.results.growthEdges')}
        items={growthEdges}
        variant="growth"
        delayBase={0.5}
      />

      <FullBreakdown subTraitScores={subTraitScores} />

      {/* ── CTA for demo users ── */}
      {isDemo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="rounded-2xl p-5 text-center"
          style={{ background: 'rgba(215,181,106,0.06)', border: '1px solid rgba(215,181,106,0.2)' }}
        >
          <Sparkle size={24} weight="duotone" className="mx-auto mb-2" style={{ color: C.gold }} />
          <p className="text-sm font-semibold mb-1" style={{ color: '#EBDCB8' }}>{t('pasco.results.saved')}</p>
          <p className="text-xs mb-3" style={{ color: '#7F8A9A' }}>{t('pasco.results.savedDesc')}</p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #D7B56A, #E7CF8C)', color: '#1E293A' }}
          >
            {t('pasco.results.createAccount')}
          </a>
        </motion.div>
      )}
    </div>
  );
}
