/**
 * Single sidebar nav item button. Verbatim from Sidebar.tsx — no behavior changes.
 */

import { House, Lock } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { GATED_SIDEBAR_IDS } from '@/features/kyc/types/kyc.types';
import type { NavItemConfig } from '../../types/navigation.types';
import { ICON_MAP, ICON_COLOR_MAP } from './_constants';

interface SidebarItemProps {
  item: NavItemConfig;
  isActive: boolean;
  kycTier: number;
  unreadCount: number;
  onNav: (item: NavItemConfig) => void;
  /** When the parent sidebar is in persistent (lg+ collapsed-rail) mode,
   *  labels and badges hide unless the rail is hovered. */
  persistent?: boolean;
}

export function SidebarItem({
  item, isActive: active, kycTier, unreadCount, onNav, persistent = false,
}: SidebarItemProps) {
  const Icon = ICON_MAP[item.icon] ?? House;
  const isNotification = item.id === 'notifications';
  const iconColor = ICON_COLOR_MAP[item.id] || '#7A7363';
  const isGated = kycTier < 2 && GATED_SIDEBAR_IDS.has(item.id);

  const tourId =
    item.id === 'zakat' ? 'sidebar-zakat'
    : item.id === 'screener' ? 'sidebar-screener'
    : item.id === 'quran' ? 'sidebar-quran'
    : item.id === 'wallet' ? 'sidebar-wallet'
    : undefined;

  return (
    <button
      data-tour={tourId}
      onClick={() => onNav(item)}
      title={isGated ? `${item.label} (locked)` : item.label}
      className={cn(
        'w-full h-9 flex items-center gap-2.5 rounded-lg px-2.5 relative transition-all duration-200',
        active
          ? 'bg-[#4FB892]/15 border border-[#4FB892]/25'
          : 'hover:bg-white/5',
        isGated && 'opacity-60'
      )}
    >
      <div className="relative shrink-0">
        <Icon
          size={18}
          weight={active ? 'duotone' : 'regular'}
          style={{ color: active ? '#FFFFFF' : iconColor }}
        />
        {isGated && (
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#0F1724] rounded-full flex items-center justify-center border border-[rgba(212,168,83,0.3)]">
            <Lock size={7} className="text-[#D4A853]" weight="bold" />
          </span>
        )}
        {isNotification && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[7px] text-white flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
      <span className={cn(
        'text-[11px] font-medium truncate',
        active ? 'text-white' : 'text-[#7A7363]',
        // In persistent rail mode on lg+, hide label until the rail expands on
        // hover. In drawer mode (BarkaLabsPage etc.) labels always show.
        persistent && 'lg:hidden lg:group-hover/sidebar:inline'
      )}>
        {item.label}
      </span>
      {item.badge && item.badge !== 'SOON' && !isGated && (
        <span className={cn(
          'ml-auto text-[7px] font-bold px-1 py-0.5 rounded shrink-0',
          persistent && 'lg:hidden lg:group-hover/sidebar:inline-block'
        )}
          style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}
