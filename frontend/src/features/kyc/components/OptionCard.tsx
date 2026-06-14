/**
 * Option Card
 * Niyyah-style selectable card for single-select questions
 */

import { cn } from '@/lib/utils';
import { Check } from '@phosphor-icons/react';

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({ label, description, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-xl border transition-all duration-200',
        selected
          ? 'bg-[#D4A853]/10 border-[#D4A853]/40'
          : 'bg-[#10151F]/50 border-[rgba(212,168,83,0.12)] hover:border-[#D4A853]/25 hover:bg-[#10151F]/70'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <span className={cn(
            'text-sm font-medium',
            selected ? 'text-[#D4A853]' : 'text-[#F5E8C7]'
          )}>
            {label}
          </span>
          {description && (
            <p className="text-[11px] text-[#7A7363] mt-0.5">{description}</p>
          )}
        </div>
        {selected && (
          <div className="w-6 h-6 rounded-full bg-[#D4A853]/20 flex items-center justify-center shrink-0 ml-3">
            <Check size={14} className="text-[#D4A853]" weight="bold" />
          </div>
        )}
      </div>
    </button>
  );
}
