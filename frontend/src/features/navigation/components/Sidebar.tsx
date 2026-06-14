/**
 * Compact Icon Sidebar — matches Flutter's AppSidebar exactly
 * 72px width, icon-only with section dividers, teal active state
 * Each icon has a unique color from ICON_COLOR_MAP
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { SignOut, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/core/stores/auth.store';
import { useNotificationStore } from '@/features/notifications/stores/notification.store';
import { useKycStore } from '@/features/kyc/stores/kyc.store';
import { SIDEBAR_SECTIONS, type NavItemConfig } from '../types/navigation.types';
import logoGold from '@/assets/zaryah-logo-gold.png';
import { SidebarItem } from './sidebar/SidebarItem';
import { ComingSoonDropdown } from './sidebar/ComingSoonDropdown';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  /**
   * When true, sidebar is always visible on lg+ as a narrow icon rail that
   * hover-expands to 240px. Parent layout MUST reserve `lg:pl-[72px]` so the
   * content isn't covered. When false (default), sidebar behaves as a drawer
   * on all sizes (only visible when `isOpen`).
   */
  persistent?: boolean;
}

export function Sidebar({ isOpen = false, onClose, persistent = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const kycTier = useKycStore((s) => s.kycTier);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleNav = (item: NavItemConfig) => {
    // Always start a fresh chat when clicking Raya
    if (item.path === '/ai-assistant') {
      navigate(item.path, { state: { newChat: Date.now() } });
    } else {
      navigate(item.path);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
      navigate('/login');
    }
  };

  return (
    <>
      {/* Overlay backdrop — visible only when drawer is open. In persistent mode
          on lg+, the sidebar is always visible so the backdrop has no role. */}
      {isOpen && (
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- sidebar backdrop; close button & Escape handle a11y */
        <div
          className={cn(
            'fixed inset-0 z-40 transition-opacity',
            persistent && 'lg:hidden'
          )}
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'group/sidebar peer/sidebar fixed top-0 left-0 flex flex-col h-screen bg-[#0A0E16] border-r border-[rgba(212,168,83,0.1)] shrink-0 transition-all duration-300 ease-in-out',
          'z-50',
          // Drawer default: 240px wide, isOpen-controlled translate.
          'w-[240px]',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Persistent mode (lg+): narrow icon rail, hover-expands to 240.
          // `lg:z-[60]` keeps the expanded panel above any sticky top nav
          // (e.g. BarkaTopNav) so the page chrome doesn't bleed into it.
          persistent && 'lg:w-[72px] lg:hover:w-[240px] lg:translate-x-0 lg:z-[60]'
        )}
      >
      {/* Z+ Logo + Close button */}
      <div className="flex items-center justify-between h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] border-b border-[rgba(212,168,83,0.15)] px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <img src={logoGold} alt="ZaryahPlus logo" className="w-7 h-7 object-contain" />
          </div>
          <span
            className={cn(
              'text-sm font-bold text-[#D4A853]',
              // In persistent mode, hide wordmark when rail is collapsed.
              persistent && 'lg:hidden lg:group-hover/sidebar:inline'
            )}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Zaryah<span className="text-[#E8C97A] text-[0.75em] align-super">+</span>
          </span>
        </div>
        {/* Close button — drawer mode only; in persistent mode on lg+, the
            sidebar is always visible so there's nothing to close. */}
        <button
          onClick={onClose}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-[#7A7363] hover:text-white',
            persistent && 'lg:hidden'
          )}
          aria-label="Close menu"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      {/* Nav sections — icons with labels */}
      <div className="flex-1 overflow-y-auto py-3 scrollbar-hide px-2.5 space-y-0.5">
        {SIDEBAR_SECTIONS.map((section, sectionIdx) => {
          const activeItems = section.items.filter((i) => i.badge !== 'SOON');
          const comingSoonItems = section.items.filter((i) => i.badge === 'SOON');

          return (
            <div key={section.title}>
              {sectionIdx > 0 && (
                <div className="mx-2 my-2.5 h-px bg-[rgba(212,168,83,0.12)]" />
              )}
              <p className={cn(
                'text-[9px] font-semibold uppercase tracking-widest text-[#5C5749]/60 px-2 mb-1.5',
                persistent && 'lg:hidden lg:group-hover/sidebar:block'
              )}>
                {section.title}
              </p>

              {/* Active / working features */}
              {activeItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isActive={isActive(item.path)}
                  kycTier={kycTier}
                  unreadCount={unreadCount}
                  onNav={handleNav}
                  persistent={persistent}
                />
              ))}

              {/* Coming Soon dropdown — hidden when sidebar is collapsed rail. */}
              {comingSoonItems.length > 0 && (
                <ComingSoonDropdown
                  items={comingSoonItems}
                  sectionTitle={section.title}
                  onNav={handleNav}
                  persistent={persistent}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer: Logout */}
      <div className="border-t border-[rgba(212,168,83,0.15)] py-2.5 px-2.5">
        <button
          onClick={handleLogout}
          className="w-full h-9 flex items-center gap-2.5 rounded-lg px-2.5 text-[#7A7363] hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <SignOut size={18} weight="bold" />
          <span className={cn(
            'text-[11px] font-medium',
            persistent && 'lg:hidden lg:group-hover/sidebar:inline'
          )}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
    </>
  );
}
