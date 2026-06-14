/**
 * Actionable Gratitude — Islamic actions to express gratitude
 * Shows specific actions with Quran/Hadith references
 */

import { motion } from 'framer-motion';
import { HandHeart, BookOpen, ArrowRight } from '@phosphor-icons/react';
import type { DecompositionAction } from '../types/barka-labs.types';

const TYPE_ICONS: Record<string, typeof HandHeart> = {
  sadaqah: HandHeart,
  worship: BookOpen,
  dhikr: BookOpen,
  charity: HandHeart,
};

interface ActionableGratitudeProps {
  actions: DecompositionAction[];
}

export function ActionableGratitude({ actions }: ActionableGratitudeProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ArrowRight size={16} className="text-[#D7B56A]" />
        <h3
          className="text-sm font-semibold text-[#EBDCB8]"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          What You Can Do Next
        </h3>
      </div>

      <div className="space-y-2">
        {actions.map((action, i) => {
          const Icon = TYPE_ICONS[action.type] || HandHeart;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="rounded-xl p-3 flex gap-3"
              style={{
                backgroundColor: 'rgba(36,50,70,0.5)',
                border: '1px solid rgba(215,181,106,0.12)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(215,181,106,0.12)' }}
              >
                <Icon size={16} weight="duotone" className="text-[#D7B56A]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#EBDCB8] leading-relaxed">
                  {action.text}
                </p>
                {action.reference && (
                  <p className="text-[10px] text-[#7F8A9A] italic">
                    {action.reference}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
