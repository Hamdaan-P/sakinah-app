/**
 * PascoAssessment — One-at-a-time card UI for the 20-question PASCO assessment.
 * Progress bar, block labels, animated transitions between questions.
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { PASCO_QUESTIONS, PASCO_DIMENSIONS } from '../data/pasco-questions';
import { scorePasco } from '../data/pasco-scoring';
import type { PascoResult } from '../data/pasco-scoring';
import { BLOCK_COLORS } from './pasco/_constants';
import { PascoQuestionCard } from './pasco/PascoQuestionCard';

interface PascoAssessmentProps {
  onComplete: (result: PascoResult) => void;
  onClose: () => void;
  /** Pre-filled answers (for resuming) */
  initialAnswers?: Record<string, string>;
}

export function PascoAssessment({ onComplete, onClose, initialAnswers }: PascoAssessmentProps) {
  const { t } = useTranslation('demo');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers || {});
  const [direction, setDirection] = useState(1); // 1=forward, -1=back

  const total = PASCO_QUESTIONS.length;
  const question = PASCO_QUESTIONS[currentIdx];
  const blockColor = BLOCK_COLORS[question.block] || '#7F8A9A';
  const blockName = t(`pasco.dim.${question.block}`);
  const blockSubtitle = t(`pasco.block.${question.block}.subtitle`);
  const selected = answers[question.id] || null;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / total) * 100;

  // Check if entering a new block
  const prevBlock = currentIdx > 0 ? PASCO_QUESTIONS[currentIdx - 1].block : null;
  const isNewBlock = question.block !== prevBlock;

  const handleSelect = useCallback((value: string) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    // Auto-advance or auto-finish after short delay
    setTimeout(() => {
      if (currentIdx < total - 1) {
        setDirection(1);
        setCurrentIdx(i => i + 1);
      } else if (Object.keys(newAnswers).length === total) {
        // Last question answered — auto-finish
        const result = scorePasco(newAnswers);
        onComplete(result);
      }
    }, 400);
  }, [question.id, currentIdx, total, answers, onComplete]);

  const goBack = useCallback(() => {
    if (currentIdx > 0) {
      setDirection(-1);
      setCurrentIdx(i => i - 1);
    }
  }, [currentIdx]);

  const goForward = useCallback(() => {
    if (currentIdx < total - 1 && selected) {
      setDirection(1);
      setCurrentIdx(i => i + 1);
    }
  }, [currentIdx, total, selected]);

  const handleFinish = useCallback(() => {
    const result = scorePasco(answers);
    onComplete(result);
  }, [answers, onComplete]);

  const isLast = currentIdx === total - 1;
  const allAnswered = answeredCount === total;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#1E293A]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3" style={{ borderBottom: '1px solid rgba(215,181,106,0.1)' }}>
        <button onClick={onClose} className="text-sm font-medium" style={{ color: '#7F8A9A' }}>
          <ArrowLeft size={18} className="inline me-1 rtl:rotate-180" /> {t('pasco.nav.exit')}
        </button>
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: blockColor }}>
            {blockName}
          </span>
        </div>
        <span className="text-xs font-semibold" style={{ color: '#7F8A9A' }}>
          {currentIdx + 1}/{total}
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full"
          style={{ background: `linear-gradient(90deg, ${PASCO_DIMENSIONS.map(d => d.color).join(', ')})` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* ── Question counter dots ── */}
      <div className="flex items-center justify-center gap-1 py-2 overflow-x-auto scrollbar-hide px-4">
        {PASCO_QUESTIONS.map((q, i) => {
          const isActive = i === currentIdx;
          const isAnswered = !!answers[q.id];
          const dimColor = BLOCK_COLORS[q.block] || '#7F8A9A';
          return (
            <button
              key={q.id}
              onClick={() => { setDirection(i > currentIdx ? 1 : -1); setCurrentIdx(i); }}
              className="shrink-0 rounded-full transition-all"
              style={{
                width: isActive ? 24 : 8,
                height: 8,
                background: isActive ? dimColor : isAnswered ? `${dimColor}60` : 'rgba(255,255,255,0.1)',
              }}
            />
          );
        })}
      </div>

      {/* ── Question card ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={question.id}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 60, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="max-w-2xl mx-auto"
          >
            <PascoQuestionCard
              question={question}
              blockColor={blockColor}
              blockSubtitle={blockSubtitle}
              isNewBlock={isNewBlock}
              selected={selected}
              onSelect={handleSelect}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Footer nav ── */}
      <div className="px-4 md:px-8 py-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(215,181,106,0.1)' }}>
        <button
          onClick={goBack}
          disabled={currentIdx === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
          style={{ color: '#D5DDEA', border: '1px solid rgba(215,181,106,0.15)' }}
        >
          <ArrowLeft size={16} /> {t('pasco.nav.back')}
        </button>

        {isLast && allAnswered ? (
          <button
            onClick={handleFinish}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #D7B56A, #E7CF8C)', color: '#1E293A' }}
          >
            {t('pasco.nav.seeResults')} <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={goForward}
            disabled={!selected}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
            style={{ color: '#D5DDEA', border: '1px solid rgba(215,181,106,0.15)' }}
          >
            {t('pasco.nav.next')} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
