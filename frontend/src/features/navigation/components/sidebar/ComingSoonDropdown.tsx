/**
 * Collapsible "Coming Soon" section for sidebar items not yet shipped.
 * Verbatim from Sidebar.tsx — no behavior changes.
 */

import { useState } from 'react';
import { House, CaretDown } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { NavItemConfig } from '../../types/navigation.types';
import { ICON_MAP, ICON_COLOR_MAP } from './_constants';

interface ComingSoonDropdownProps {
  items: NavItemConfig[];
  sectionTitle: string;
  onNav: (item: NavItemConfig) => void;
  /** Hide entirely when the parent sidebar is in collapsed-rail mode on lg+. */
  persistent?: boolean;
}

export function ComingSoonDropdown({ items, onNav, persistent = false }: ComingSoonDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(
      'mt-0.5',
      // In persistent mode on lg+, only appear when the sidebar is hovered
      // (i.e. expanded). Stay hidden while the rail is collapsed.
      persistent && 'lg:hidden lg:group-hover/sidebar:block'
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-8 flex items-center gap-2 rounded-lg px-2.5 hover:bg-white/5 transition-all duration-200"
      >
        <span className="text-[10px] font-medium text-[#5C5749]">
          Coming Soon ({items.length})
        </span>
        <CaretDown
          size={12}
          className={cn('text-[#5C5749] transition-transform duration-200 ml-auto', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="ml-1 border-l border-[rgba(212,168,83,0.1)] pl-1.5 space-y-0.5">
          {items.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? House;
            const iconColor = ICON_COLOR_MAP[item.id] || '#7A7363';
            return (
              <button
                key={item.id}
                onClick={() => onNav(item)}
                className="w-full h-8 flex items-center gap-2.5 rounded-lg px-2 opacity-50 hover:opacity-70 hover:bg-white/5 transition-all duration-200"
              >
                <Icon size={16} weight="regular" style={{ color: iconColor }} />
                <span className="text-[10px] font-medium text-[#7A7363] truncate">
                  {item.label}
                </span>
                <span className="ml-auto text-[7px] font-bold px-1 py-0.5 rounded shrink-0"
                  style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
                >
                  SOON
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
