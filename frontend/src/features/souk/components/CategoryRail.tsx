import { useListingTypes } from '../services/soukConfigService';
import type { ListingType } from '../types/souk.types';

interface Props {
  active: ListingType | 'all';
  onChange: (type: ListingType | 'all') => void;
}

export function CategoryRail({ active, onChange }: Props) {
  const types = useListingTypes();
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <button
        onClick={() => onChange('all')}
        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
          active === 'all'
            ? 'bg-[#D7B56A] text-[#1E293A]'
            : 'bg-[#2C3C55] text-[#D5DDEA] border border-[rgba(215,181,106,0.2)]'
        }`}
      >
        All
      </button>
      {types.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              isActive
                ? 'bg-[#D7B56A] text-[#1E293A]'
                : 'bg-[#2C3C55] text-[#D5DDEA] border border-[rgba(215,181,106,0.2)] hover:border-[#D7B56A]/40'
            }`}
          >
            <Icon size={13} />
            {t.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
