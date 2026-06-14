/**
 * FAQAccordion — collapsible Q&A row.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown } from '@phosphor-icons/react';

interface FAQAccordionProps {
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

export function FAQAccordion({ question, answer, isExpanded, onToggle, index }: FAQAccordionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gradient-to-br from-[#1a2f3a] to-[#0d1f29] rounded-xl border border-[#D4A853]/20 overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-medium text-sm pr-4">{question}</span>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <CaretDown size={20} className="text-[#D4A853] flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="px-4 pb-4 text-white/60 text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
