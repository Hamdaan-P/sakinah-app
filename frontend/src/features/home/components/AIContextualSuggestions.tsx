import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightning, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { AISuggestion } from '../types/home.types';
import { generateContextualSuggestions } from './_aiSuggestions';

interface AIContextualSuggestionsProps {
  nextPrayer?: string;
  onSuggestionTap: (prompt: string) => void;
  className?: string;
}

export function AIContextualSuggestions({
  nextPrayer,
  onSuggestionTap,
  className,
}: AIContextualSuggestionsProps) {
  const suggestions = useMemo(() => generateContextualSuggestions(nextPrayer), [nextPrayer]);

  return (
    <div className={cn('w-full', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="p-1.5 rounded-lg bg-gradient-to-br from-[#D4A853] to-[#D4A853]/80"
            animate={{
              boxShadow: [
                '0 0 8px rgba(212,168,83,0.3)',
                '0 0 16px rgba(212,168,83,0.5)',
                '0 0 8px rgba(212,168,83,0.3)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Lightning size={16} className="text-white" />
          </motion.div>
          <div>
            <h3 className="text-white font-bold">Ask AI Now</h3>
            <p className="text-white/50 text-xs">Personalized for you</p>
          </div>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-xl',
            'bg-[#D4A853]/15 border border-[#D4A853]/30'
          )}
        >
          <Sparkle size={14} className="text-[#D4A853]" />
          <span className="text-[#D4A853] text-xs font-bold">AI</span>
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="px-4 flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <SuggestionChip
            key={index}
            suggestion={suggestion}
            index={index}
            onClick={() => onSuggestionTap(suggestion.prompt)}
          />
        ))}
      </div>
    </div>
  );
}

interface SuggestionChipProps {
  suggestion: AISuggestion;
  index: number;
  onClick: () => void;
}

function SuggestionChip({ suggestion, index, onClick }: SuggestionChipProps) {
  const accent = '#2B6F6B';
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={cn('flex items-center gap-1.5 px-3 py-2 rounded-2xl', 'border transition-all hover:scale-105')}
      style={{
        backgroundColor: '#0F141F',
        borderColor: 'rgba(212,168,83,0.25)',
        boxShadow: `0 2px 8px ${accent}26`,
      }}
    >
      <span style={{ color: '#D4A853' }}>{suggestion.icon}</span>
      <span className="text-[#E8C97A] text-xs font-medium">{suggestion.text}</span>
    </motion.button>
  );
}
