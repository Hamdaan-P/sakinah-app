/**
 * Mobile Bottom Navigation Bar — single shared dock for every mobile route.
 * 4 tabs: Home, Raya, Quran, Barakah. Phosphor icons, gold active state,
 * glassmorphism. Replaces the previous per-feature docks (HomeReferenceDock,
 * barakah-labs Dock) so users see one consistent bottom nav everywhere.
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { House, BookOpen, Sparkle, Flask } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { BOTTOM_NAV_ITEMS, type NavItemConfig } from '../types/navigation.types';

const ICON_MAP: Record<string, Icon> = {
  Home: House,
  BookOpen,
  Sparkles: Sparkle,
  Flask,
};

const TOUR_IDS: Record<string, string> = {
  home: 'bottomnav-home',
  ai: 'bottomnav-raya',
  quran: 'bottomnav-quran',
  barakah: 'bottomnav-barakah',
};

export function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleTap = (item: NavItemConfig) => {
    // Always start a fresh chat when tapping Raya
    if (item.path === '/ai-assistant') {
      navigate(item.path, { state: { newChat: Date.now() } });
    } else {
      navigate(item.path);
    }
  };

  return (
    <nav
      data-tour="mhome-dock"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F141F]/95 backdrop-blur-xl border-t border-[rgba(212,168,83,0.15)]"
      // safe-area-inset-bottom pushes the buttons above Android's gesture/3-button
      // nav so they don't get tapped through. Without this Samsung's nav bar
      // overlaps the app tabs (visible on Android 15+ edge-to-edge enforcement).
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? House;
          const active = isActive(item.path);

          const tourId = TOUR_IDS[item.id];

          return (
            <button
              key={item.id}
              data-tour={tourId}
              onClick={() => handleTap(item)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-16 py-1.5 rounded-xl transition-all relative',
                active ? 'text-[#D4A853]' : 'text-[#7A7363]'
              )}
            >
              <div className="relative">
                <Icon size={22} weight={active ? 'fill' : 'regular'} className={cn(active && 'drop-shadow-[0_0_6px_rgba(212,168,83,0.5)]')} />
                {item.badge && (
                  <span
                    className="absolute -top-1.5 -right-3 text-[7px] font-bold px-1 rounded"
                    style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-medium', active ? 'text-[#D4A853]' : 'text-[#7A7363]')}>
                {item.label}
              </span>
              {active && (
                <div
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
