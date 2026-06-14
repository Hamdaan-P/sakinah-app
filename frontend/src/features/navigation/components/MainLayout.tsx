/**
 * Main Layout Shell — responsive layout
 *
 * Desktop (lg+): [Sidebar 72px, hover-expands to 240px] [TopNav + Content]
 * Tablet (md):   [TopNav + Content] (sidebar via hamburger drawer)
 * Mobile (<md):  [Content + BottomNav] (sidebar via hamburger drawer)
 *
 * The right sidebar feature panel has been hidden for the marketing launch
 * (RightSidebar.tsx code is preserved). The persistent left sidebar fills the
 * desktop chrome and gives the page a framed shell instead of stretched-edge
 * content.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { List } from '@phosphor-icons/react';
import logoGold from '@/assets/zaryah-logo-gold.png';
import { Sidebar } from './Sidebar';
import { TopNavBar } from './TopNavBar';
// Hidden on website per request — restore by uncommenting this import and the {isOverview && <RightSidebar />} usage below.
// import { RightSidebar } from './RightSidebar';
import { BottomNavBar } from './BottomNavBar';
import { FirstLaunchDisclaimerModal, AppWalkthrough } from '@/components/shared';
import { LegacyCreditModal } from '@/features/wallet/components/LegacyCreditModal';
import { logFeatureVisit } from '@/lib/analytics';
import { useDisclaimerSeen } from '@/features/legal/hooks/useDisclaimerSeen';
import { useWalkthroughSeen } from '@/components/shared/useWalkthroughSeen';
import { useNotificationStore } from '@/features/notifications/stores/notification.store';
import { useKycStore } from '@/features/kyc/stores/kyc.store';

export function MainLayout() {
  const [firstLaunchSeen, markFirstLaunchSeen] = useDisclaimerSeen('first_launch');
  const [walkthroughSeen, markWalkthroughSeen] = useWalkthroughSeen();
  const { initialize, dispose } = useNotificationStore();
  const kycTier = useKycStore((s) => s.kycTier);
  const kycInitialized = useKycStore((s) => s.initialized);
  const location = useLocation();
  const navigate = useNavigate();
  const isChatPage = location.pathname === '/ai-assistant';
  // Hidden — restore alongside the {isOverview && <RightSidebar />} line below.
  // const isOverview = location.pathname === '/' || location.pathname === '/dashboard';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  // <main> is `overflow-y-auto`, so window.scrollTo is a no-op for our pages.
  // The browser/RR doesn't reset this scroller on route changes, which made
  // pages "start at the bottom" when the previous page had been scrolled far
  // down. Reset it explicitly on every route change.
  const mainRef = useRef<HTMLElement>(null);

  // Close sidebar drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Reset <main> scroll to top on every route change.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  // Track feature usage
  useEffect(() => {
    logFeatureVisit(location.pathname);
  }, [location.pathname]);

  // Initialize notification subscription for unread badge count
  // Skip if KYC Tier 0 — AuthGuard will redirect to /quick-kyc, unmounting this layout
  useEffect(() => {
    if (!kycInitialized || kycTier === 0) return;
    initialize();
    return () => dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialize/dispose are stable zustand actions; only re-subscribe when KYC gate flips
  }, [kycInitialized, kycTier]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0E16]">
      {/* Left: Sidebar — persistent on lg+, drawer overlay below lg.
          `persistent={true}` makes it always visible at 72px on lg+ (hover→240).
          Pages routed outside MainLayout (e.g. BarkaLabsPage) render their own
          Sidebar in default drawer mode. */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} persistent />

      {/* Center: Top nav + scrollable content.
          `lg:pl-[72px]` reserves space for the collapsed 72px sidebar rail at lg+;
          the sidebar is `fixed`, so this padding is what stops the content from
          sitting underneath it. When the sidebar is hovered it expands to 240px,
          and `lg:peer-hover/sidebar:pl-[240px]` grows this padding in lockstep
          (same 300ms easing) so the whole page shifts right by exactly the
          navbar's width instead of being overlapped. */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-[72px] lg:peer-hover/sidebar:pl-[240px] transition-[padding] duration-300 ease-in-out">
        {/* Top pill nav bar — hidden below md */}
        <TopNavBar onHamburgerClick={toggleSidebar} />

        {/* Mobile header with hamburger — visible below md only */}
        <div className="md:hidden flex items-center gap-2.5 px-4 py-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))] border-b border-[rgba(212,168,83,0.1)]">
          <button
            onClick={toggleSidebar}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-[#C9C0A8]"
            aria-label="Open menu"
          >
            <List size={22} weight="bold" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 -ml-1 pl-1 pr-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Go to dashboard"
          >
            <div className="w-9 h-9 flex items-center justify-center">
              <img src={logoGold} alt="ZaryahPlus" className="w-7 h-7 object-contain" />
            </div>
            <span className="text-base font-bold text-[#D4A853]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Zaryah<span className="text-[#E8C97A] text-[0.75em] align-super">+</span>
            </span>
          </button>
        </div>

        {/* Main content area. The bottom nav is `h-16 + env(safe-area-inset-bottom)`
            on mobile (Android edge-to-edge), so we have to clear that combined height
            plus a small breathing gap or the last row of the page sits under the nav. */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0"
        >
          <Outlet />
        </main>
      </div>

      {/* Right: Feature cards sidebar — only on overview/dashboard */}
      {/* Hidden on website per request — code preserved in RightSidebar.tsx */}
      {/* {isOverview && <RightSidebar />} */}

      {/* Mobile bottom nav — shared across every route below md. */}
      <BottomNavBar />

      {!firstLaunchSeen && <FirstLaunchDisclaimerModal onAccept={markFirstLaunchSeen} />}

      {/* App walkthrough — shows after disclaimer is accepted, per-user */}
      {firstLaunchSeen && !walkthroughSeen && !isChatPage && (
        <AppWalkthrough onComplete={markWalkthroughSeen} />
      )}

      {/* Legacy DNZ restoration — one-time claim for pre-existing investors */}
      {firstLaunchSeen && walkthroughSeen && <LegacyCreditModal />}

      {/* Phase 6 — version badge for incident triage.
          Tiny fixed-position pill, dim enough to ignore in normal use,
          but captured in any user-submitted screenshot so on-call can
          confirm which commit was deployed. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-1 right-1 z-50 select-none rounded px-1.5 py-0.5 font-mono text-[8px] text-[#5C5749]/40"
        title={`Build ${__APP_VERSION__}`}
      >
        v{__APP_VERSION__}
      </div>
    </div>
  );
}
