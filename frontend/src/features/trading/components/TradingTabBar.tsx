/**
 * TradingTabBar — bottom navigation for the Halal Trading section shell.
 *
 * v1 (read-only): Explore + Watchlist are live; Portfolio + Orders are visible
 * but disabled so the IA doesn't shift when they land (T2/T3). Keeping the
 * disabled tabs present is deliberate — users see where the product is going.
 */

import { useNavigate } from 'react-router-dom';
import { Compass, Star, ChartPieSlice, Receipt } from '@phosphor-icons/react';

type TabKey = 'explore' | 'watchlist' | 'portfolio' | 'orders';

const TABS: { key: TabKey; label: string; icon: typeof Compass; path?: string }[] = [
  { key: 'explore', label: 'Explore', icon: Compass, path: '/trading' },
  { key: 'watchlist', label: 'Watchlist', icon: Star, path: '/trading/watchlist' },
  { key: 'portfolio', label: 'Portfolio', icon: ChartPieSlice }, // disabled (T2/T3)
  { key: 'orders', label: 'Orders', icon: Receipt }, // disabled (T3)
];

export function TradingTabBar({ active }: { active: TabKey }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-[#0c1320] border-t border-[rgba(212,168,83,0.16)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-3xl mx-auto grid grid-cols-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = t.key === active;
          const disabled = !t.path;
          return (
            <button
              key={t.key}
              disabled={disabled}
              onClick={() => t.path && navigate(t.path)}
              className={
                'flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ' +
                (disabled
                  ? 'text-[#3a4252] cursor-not-allowed'
                  : isActive
                    ? 'text-[#D4A853]'
                    : 'text-[#7A7363] hover:text-[#F5E8C7]')
              }
            >
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
              {t.label}
              {disabled && <span className="text-[7.5px] uppercase tracking-wide text-[#3a4252]">soon</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
