/**
 * PascoQuestionCard — single-question presentation for the PASCO assessment.
 * Extracted from PascoAssessment to keep the parent under the leaf LOC budget.
 */

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';
import { getDemoDisplayFont } from '@/i18n';
import type { PASCO_QUESTIONS } from '../../data/pasco-questions';

type Question = (typeof PASCO_QUESTIONS)[number];

interface PascoQuestionCardProps {
  question: Question;
  blockColor: string;
  blockSubtitle: string;
  isNewBlock: boolean;
  selected: string | null;
  onSelect: (value: string) => void;
}

export function PascoQuestionCard({
  question, blockColor, blockSubtitle, isNewBlock, selected, onSelect,
}: PascoQuestionCardProps) {
  const { t } = useTranslation('demo');

  return (
    <>
      {/* Block subtitle on new block entry */}
      {isNewBlock && (
        <div className="text-center mb-4">
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-[2px] px-3 py-1 rounded-full"
            style={{ background: `${blockColor}15`, color: blockColor, border: `1px solid ${blockColor}30` }}
          >
            {t('pasco.nav.block', { num: question.block === 'P' ? 1 : question.block === 'A' ? 2 : question.block === 'S' ? 3 : 4, subtitle: blockSubtitle })}
          </span>
        </div>
      )}

      {/* Question title */}
      <h2
        className="text-xl md:text-2xl font-bold mb-3 text-center"
        style={{ fontFamily: getDemoDisplayFont(), color: '#EBDCB8' }}
      >
        {t(`pasco.${question.id}.title`)}
      </h2>

      {/* Scenario */}
      <p className="text-sm md:text-[15px] leading-relaxed mb-6 md:mb-8 text-center max-w-lg mx-auto" style={{ color: '#A7B1C0' }}>
        {t(`pasco.${question.id}.scenario`)}
      </p>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <motion.button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              whileTap={{ scale: 0.98 }}
              className="w-full text-start rounded-2xl p-4 md:p-5 transition-all"
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${blockColor}18, ${blockColor}08)`
                  : 'rgba(44,60,85,0.3)',
                border: isSelected
                  ? `2px solid ${blockColor}`
                  : '1px solid rgba(215,181,106,0.12)',
                boxShadow: isSelected ? `0 4px 20px ${blockColor}20` : 'none',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                  style={{
                    background: isSelected ? blockColor : 'rgba(255,255,255,0.06)',
                    color: isSelected ? '#1E293A' : '#7F8A9A',
                    border: isSelected ? 'none' : '1px solid rgba(215,181,106,0.15)',
                  }}
                >
                  {isSelected ? <CheckCircle size={16} weight="fill" /> : opt.value.toUpperCase()}
                </div>
                <p className="flex-1 text-sm md:text-[15px] leading-relaxed" style={{ color: isSelected ? '#EBDCB8' : '#A7B1C0' }}>
                  {t(`pasco.${question.id}.${opt.value}`)}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}
