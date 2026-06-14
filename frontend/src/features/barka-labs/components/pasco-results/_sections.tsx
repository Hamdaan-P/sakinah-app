/**
 * Reusable sections for PascoResults: archetype hero, dimension grid,
 * top-traits list, and full-breakdown panel.
 */

import { motion } from 'framer-motion';
import { Shield, TrendUp, TrendDown } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { PASCO_SUB_TRAITS, PASCO_DIMENSIONS } from '../../data/pasco-questions';
import type { PascoResult } from '../../data/pasco-scoring';
import { C } from '../../barka-labs.constants';

export function ArchetypeHero({ archetype }: { archetype: PascoResult['archetype'] }) {
  const { t } = useTranslation('demo');
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 md:p-8 text-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(215,181,106,0.10) 0%, rgba(139,126,200,0.08) 50%, rgba(42,157,111,0.06) 100%)',
        border: '1px solid rgba(215,181,106,0.2)',
      }}
    >
      <div className="relative z-[1]">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(215,181,106,0.12)', border: '1px solid rgba(215,181,106,0.25)' }}>
          <Shield size={32} weight="duotone" style={{ color: C.gold }} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[3px] mb-2" style={{ color: 'rgba(215,181,106,0.7)' }}>
          {t('pasco.results.yourArchetype')}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: getDemoDisplayFont(), color: '#EBDCB8' }}>
          {t(`pasco.archetype.${archetype.name}`)}
        </h2>
        <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: '#A7B1C0' }}>
          {t(`pasco.archetype.${archetype.name}.desc`)}
        </p>
      </div>
    </motion.div>
  );
}

export function DimensionGrid({ dimensionScores }: { dimensionScores: Record<string, number> }) {
  const { t } = useTranslation('demo');
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-2 gap-3"
    >
      {PASCO_DIMENSIONS.map((dim, i) => {
        const score = dimensionScores[dim.key] || 0;
        return (
          <div
            key={dim.key}
            className="rounded-2xl p-4 md:p-5"
            style={{
              background: `${dim.color}08`,
              border: `1px solid ${dim.color}25`,
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: dim.color }}>
              {t(`pasco.dim.${dim.key}`)}
            </p>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl md:text-3xl font-bold" style={{ fontFamily: getDemoDisplayFont(), color: '#EBDCB8' }}>
                {score}
              </span>
              <span className="text-xs mb-1" style={{ color: '#7F8A9A' }}>{t('pasco.results.outOf100')}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: dim.color }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
              />
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

interface TraitListProps {
  title: string;
  items: PascoResult['signatureStrengths'];
  variant: 'strength' | 'growth';
  delayBase: number;
}

export function TraitList({ title, items, variant, delayBase }: TraitListProps) {
  const { t } = useTranslation('demo');
  const isStrength = variant === 'strength';
  const accent = isStrength ? '#2A9D6F' : '#E07A6B';
  const gradient = isStrength
    ? 'linear-gradient(90deg, #2A9D6F, #3ABFAD)'
    : 'linear-gradient(90deg, #E07A6B, #D7B56A)';
  const Icon = isStrength ? TrendUp : TrendDown;
  const cardBg = isStrength ? 'rgba(42,157,111,0.06)' : 'rgba(224,122,107,0.06)';
  const cardBorder = isStrength ? '1px solid rgba(42,157,111,0.2)' : '1px solid rgba(224,122,107,0.2)';
  const fallbackIcon = isStrength ? '✨' : '🌱';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delayBase }}
      className="rounded-2xl p-5 md:p-6"
      style={{ background: cardBg, border: cardBorder }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} weight="duotone" style={{ color: accent }} />
        <h3 className="text-base font-bold" style={{ color: '#EBDCB8', fontFamily: getDemoDisplayFont() }}>
          {title}
        </h3>
      </div>
      <div className="space-y-3">
        {items.map((s, i) => {
          const trait = PASCO_SUB_TRAITS[s.code];
          return (
            <div key={s.code} className="flex items-center gap-3">
              <span className="text-lg">{trait?.icon || fallbackIcon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: '#EBDCB8' }}>{t(`pasco.trait.${s.code}`)}</span>
                  <span className="text-xs font-bold" style={{ color: accent }}>{s.score}/100</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: gradient }}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.score}%` }}
                    transition={{ duration: 0.6, delay: delayBase + 0.1 + i * 0.1 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function FullBreakdown({ subTraitScores }: { subTraitScores: Record<string, number> }) {
  const { t } = useTranslation('demo');
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="rounded-2xl p-5 md:p-6"
      style={{ background: 'rgba(44,60,85,0.3)', border: '1px solid rgba(215,181,106,0.12)' }}
    >
      <h3 className="text-base font-bold mb-4" style={{ color: '#EBDCB8', fontFamily: getDemoDisplayFont() }}>
        {t('pasco.results.fullBreakdown')}
      </h3>
      <div className="space-y-4">
        {PASCO_DIMENSIONS.map((dim) => (
          <div key={dim.key}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: dim.color }}>
              {t(`pasco.dim.${dim.key}`)}
            </p>
            <div className="space-y-2">
              {dim.traits.map((code) => {
                const trait = PASCO_SUB_TRAITS[code];
                const score = subTraitScores[code] || 0;
                return (
                  <div key={code} className="flex items-center gap-2.5">
                    <span className="text-sm w-5 text-center">{trait?.icon}</span>
                    <span className="text-xs font-medium w-28 truncate" style={{ color: '#D5DDEA' }}>
                      {t(`pasco.trait.${code}`)}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: dim.color }} />
                    </div>
                    <span className="text-[10px] font-bold w-8 text-right" style={{ color: '#7F8A9A' }}>{score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
