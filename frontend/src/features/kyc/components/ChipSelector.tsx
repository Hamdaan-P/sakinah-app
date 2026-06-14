/**
 * Chip Selector
 * Multi-select chip pills for conversational KYC steps
 */

import { cn } from '@/lib/utils';

interface ChipSelectorProps {
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelect?: number;
}

export function ChipSelector({ options, selected, onChange, maxSelect }: ChipSelectorProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      if (maxSelect && selected.length >= maxSelect) return;
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
              isSelected
                ? 'bg-[#D4A853]/15 border-[#D4A853]/50 text-[#D4A853]'
                : 'bg-[#10151F]/50 border-[rgba(212,168,83,0.12)] text-[#C9C0A8] hover:border-[#D4A853]/25'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
