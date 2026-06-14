/**
 * SuggestionChips
 * Horizontal scrollable row of follow-up suggestion pills
 */

import { cn } from '@/lib/utils';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ suggestions, onSelect, disabled }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s)}
          disabled={disabled}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            'border border-[#D4A853]/30 text-[#D4A853]/90',
            'hover:bg-[#D4A853]/10 hover:border-[#D4A853]/50',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
