/**
 * ComingSoonBanner — A small sticky banner that overlays on pages
 * to indicate the feature is still under development.
 * Use <ComingSoonWrapper> to wrap a page component with the banner.
 */

import { RocketLaunch } from '@phosphor-icons/react';

export function ComingSoonBanner() {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-2 py-2 px-4 text-center"
      style={{
        background: 'linear-gradient(90deg, #D4A853, #E8C97A)',
        color: '#0A0E16',
      }}
    >
      <RocketLaunch size={16} weight="bold" />
      <span className="text-xs font-bold uppercase tracking-wide">
        Coming Soon — Preview Mode
      </span>
    </div>
  );
}

export function ComingSoonWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <ComingSoonBanner />
      {children}
    </div>
  );
}
