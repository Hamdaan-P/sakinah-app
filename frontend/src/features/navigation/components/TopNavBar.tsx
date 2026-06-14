/**
 * Top Navigation Bar — pill-shaped horizontal tabs
 * Matches Flutter's DashboardTopNav exactly
 * Hidden below md breakpoint
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { CaretDown, List } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/core/stores/auth.store';
import { TOP_NAV_TABS } from '../types/navigation.types';

interface TopNavBarProps {
  onHamburgerClick?: () => void;
}

export function TopNavBar({ onHamburgerClick }: TopNavBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const userInitial = (user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <div className="hidden md:flex items-center justify-between px-4 py-3">
      {/* Hamburger menu button — only on md (tablet). On lg+ the sidebar is persistent. */}
      <div className="w-[120px] flex items-center">
        <button
          onClick={onHamburgerClick}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-[#C9C0A8] lg:hidden"
          aria-label="Open menu"
        >
          <List size={22} weight="bold" />
        </button>
      </div>

      {/* Pill tabs — centered */}
      <nav className="flex items-center gap-1 rounded-full bg-[#0F141F] border border-[rgba(212,168,83,0.1)] px-1.5 py-1.5">
        {TOP_NAV_TABS.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5',
                active
                  ? 'text-[#0A0E16] font-semibold shadow-md'
                  : 'text-[#C9C0A8] hover:text-[#F5E8C7] hover:bg-[#10151F]'
              )}
              style={active ? { background: 'linear-gradient(90deg, #D4A853, #E8C97A)' } : undefined}
            >
              {tab.label}
              {tab.badge && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded leading-none',
                  active
                    ? 'bg-[#0A0E16]/20 text-[#0A0E16]'
                    : 'bg-[#4FB892] text-white'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User avatar — far right */}
      <div className="w-[120px] flex justify-end">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-[#4FB892] text-white text-sm font-bold flex items-center justify-center">
            {userInitial}
          </div>
          <CaretDown size={12} className="text-[#7A7363]" />
        </button>
      </div>
    </div>
  );
}
