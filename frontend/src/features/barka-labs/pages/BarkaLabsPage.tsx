/**
 * Barka Labs — Blessings tracker with gratitude scoring and DinarZ rewards
 * Fits inside the app's 3-column MainLayout like every other feature.
 */

import i18n from '@/i18n';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { House, ChartBar, UsersThree } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { FiLoader } from 'react-icons/fi';
import { trackFeature } from '@/lib/analytics';
import { useBarkaLabsStore } from '../stores/barka-labs.store';
import { useCommunityStore } from '../stores/community.store';
import * as barkaLabsApi from '../services/barkaLabsService';
import { useAuthStore } from '@/core/stores/auth.store';
import { Sidebar } from '@/features/navigation/components/Sidebar';
import { BottomNavBar } from '@/features/navigation/components/BottomNavBar';
import { BarkaLabsHome } from '../components/BarkaLabsHome';
import { BarkaLabsJournal } from '../components/BarkaLabsJournal';
import { OneMinChallenge } from '../components/OneMinChallenge';
import { BarkaLabsReport } from '../components/BarkaLabsReport';
import { CreativityDetail } from '../components/CreativityDetail';
import { LevelDetail } from '../components/LevelDetail';
import { DnzDetail } from '../components/DnzDetail';
import { CommunityScreen } from '../components/CommunityScreen';
import { GratitudeModal } from '../components/GratitudeModal';
import { DecompositionTree } from '../components/DecompositionTree';
import { BattleLobby } from '../components/BattleLobby';
import { BattleArena } from '../components/BattleArena';
import { BattleResults } from '../components/BattleResults';
import { C } from '../barka-labs.constants';
import { seedDemoBlessings } from '../data/barka-labs-demo.data';
import type { BattleData } from '../types/barka-labs.types';
import { BarkaTopNav } from './components/BarkaTopNav';
import { BarkaHeroCounter } from './components/BarkaHeroCounter';
import { BarkaDecomposingOverlay } from './components/BarkaDecomposingOverlay';
import { BlessingFocusModal } from '../components/BlessingFocusModal';
import { fireConfetti } from './components/_confetti';

export type BarkaLabsScreen = 'home' | 'report' | 'levels' | 'creativity' | 'journal' | 'challenge' | 'dnz' | 'community' | 'battle';

const TABS: { key: BarkaLabsScreen; label: string; Icon: Icon }[] = [
  { key: 'home', label: 'Home', Icon: House },
  { key: 'report', label: 'Reports', Icon: ChartBar },
  { key: 'community', label: 'Community', Icon: UsersThree },
];

// Module-level flag — survives StrictMode remounts
let _anonSignInAttempted = false;

export function BarkaLabsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { trackFeature('barka-labs'); }, []);

  // Main app always uses English — reset if demo left it in another language
  useEffect(() => { if (i18n.language !== 'en') i18n.changeLanguage('en'); }, []);

  const user = useAuthStore((s) => s.user);
  const authState = useAuthStore((s) => s.state);
  const signInAnonymously = useAuthStore((s) => s.signInAnonymously);
  const isAnonymous = user?.isAnonymous === true;
  const [seeding, setSeeding] = useState(false);

  // Use individual selectors to avoid re-rendering on unrelated store changes
  const blessings = useBarkaLabsStore((s) => s.blessings);
  const stats = useBarkaLabsStore((s) => s.stats);
  const submitting = useBarkaLabsStore((s) => s.submitting);
  const activeDecomposition = useBarkaLabsStore((s) => s.activeDecomposition);
  const decomposing = useBarkaLabsStore((s) => s.decomposing);
  const percentile = useBarkaLabsStore((s) => s.percentile);
  const lastMilestones = useBarkaLabsStore((s) => s.lastMilestones);
  const lastDnzAwarded = useBarkaLabsStore((s) => s.lastDnzAwarded);
  const error = useBarkaLabsStore((s) => s.error);
  const logBlessing = useBarkaLabsStore((s) => s.logBlessing);
  const fetchBlessings = useBarkaLabsStore((s) => s.fetchBlessings);
  const fetchStats = useBarkaLabsStore((s) => s.fetchStats);
  const fetchPercentile = useBarkaLabsStore((s) => s.fetchPercentile);
  const deleteBlessing = useBarkaLabsStore((s) => s.deleteBlessing);
  const decomposeBlessing = useBarkaLabsStore((s) => s.decomposeBlessing);
  const clearDecomposition = useBarkaLabsStore((s) => s.clearDecomposition);
  const clearMilestones = useBarkaLabsStore((s) => s.clearMilestones);

  // Auto sign-in anonymously for guests
  useEffect(() => {
    if (!user && authState.type !== 'loading' && !_anonSignInAttempted) {
      _anonSignInAttempted = true;
      signInAnonymously();
    }
  }, [user, authState.type, signInAnonymously]);

  // Seed demo blessings on first anonymous visit
  useEffect(() => {
    if (!user?.id || !isAnonymous) return;
    let cancelled = false;
    const SEED_KEY = `barka_demo_seeded_${user.id}`;
    (async () => {
      try {
        if (localStorage.getItem(SEED_KEY)) return;
        setSeeding(true);
        await seedDemoBlessings(user.id, barkaLabsApi);
        localStorage.setItem(SEED_KEY, 'true');
        if (!cancelled) {
          await fetchBlessings();
          await fetchStats();
          await fetchPercentile();
          setSeeding(false);
        }
      } catch {
        if (!cancelled) setSeeding(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAnonymous]);

  const [screen, setScreen] = useState<BarkaLabsScreen>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGratModal, setShowGratModal] = useState(false);
  const [showBlessingFocus, setShowBlessingFocus] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [activeBattle, setActiveBattle] = useState<BattleData | null>(null);
  const [battleResult, setBattleResult] = useState<BattleData | null>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const confettiFired = useRef(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [speedoKey, setSpeedoKey] = useState(0);

  const scrollToCounter = useCallback(() => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchBlessings(); fetchStats(); fetchPercentile(); }, [user?.id]);

  // Pre-warm the community feed + leaderboard once we have a user — when the
  // user navigates to /community (e.g. after a hero submit), the data is
  // already there. The community store's _initialized guard makes this a
  // no-op on the second call from CommunityScreen.
  const prefetchCommunity = useBarkaLabsStore((s) => s.fetchLeaderboard);
  const prefetchGlobalStats = useBarkaLabsStore((s) => s.fetchGlobalStats);
  useEffect(() => {
    if (!user?.id) return;
    void useCommunityStore.getState().fetchFeed();
    void prefetchCommunity();
    void prefetchGlobalStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Confetti burst every time count goes up
  const prevBlessingCount = useRef<number | null>(null);
  useEffect(() => {
    if (stats.total_blessings === 0) return;
    if (prevBlessingCount.current === stats.total_blessings) return;
    const isFirstLoad = prevBlessingCount.current === null;
    prevBlessingCount.current = stats.total_blessings;
    setSpeedoKey((k) => k + 1);
    if (isFirstLoad) return;
    const delay = setTimeout(() => {
      confettiFired.current = true;
      const canvas = confettiRef.current;
      if (!canvas) return;
      fireConfetti(canvas);
    }, 2500);

    return () => clearTimeout(delay);
  }, [stats.total_blessings]);

  useEffect(() => {
    if (lastMilestones.length > 0) {
      setShowMilestone(true);
      const t = setTimeout(() => { setShowMilestone(false); clearMilestones(); }, 4000);
      return () => clearTimeout(t);
    }
  }, [lastMilestones, clearMilestones]);

  const go = useCallback((s: BarkaLabsScreen) => { setScreen(s); }, []);

  const handleSubmit = useCallback(async (text: string) => { await logBlessing(text); }, [logBlessing]);

  const handleDecompose = useCallback(async (id: string) => { await decomposeBlessing(id); }, [decomposeBlessing]);

  const userName = user?.displayName?.split(' ')[0] || (isAnonymous ? 'Explorer' : 'Friend');
  const userInitial = (user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase();

  const isTabActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleTopNavClick = (path: string) => {
    if (path === '/barakah-labs') return; // already here
    if (isAnonymous) {
      navigate('/signup');
    } else {
      navigate(path);
    }
  };

  // Loading state while auth or seeding is in progress
  if (!user || seeding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E293A]">
        <FiLoader className="w-8 h-8 text-[#D7B56A] animate-spin" />
      </div>
    );
  }

  const renderScreen = () => {
    const common = { stats, blessings, percentile, go };
    switch (screen) {
      case 'home': return <BarkaLabsHome {...common} userName={userName} onOpenGratModal={() => setShowGratModal(true)} />;
      case 'report': return <BarkaLabsReport stats={stats} blessings={blessings} go={go} />;
      case 'levels': return <LevelDetail stats={stats} go={go} />;
      case 'creativity': return <CreativityDetail stats={stats} blessings={blessings} go={go} />;
      case 'journal': return <BarkaLabsJournal blessings={blessings} stats={stats} onDelete={deleteBlessing} onDecompose={handleDecompose} go={go} onSubmitBlessing={handleSubmit} submitting={submitting} onScrollToCounter={scrollToCounter} />;
      case 'challenge': return <OneMinChallenge onSubmitBlessing={handleSubmit} submitting={submitting} go={go} />;
      case 'dnz': return <DnzDetail stats={stats} go={go} />;
      case 'community': return <CommunityScreen stats={stats} percentile={percentile} go={go} onOpenComposer={() => setShowBlessingFocus(true)} />;
      case 'battle': return <BattleLobby onBattleReady={(battle) => { setActiveBattle(battle); }} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#1E293A] via-[#1A2332] to-[#1E293A] lg:pl-[72px]">

      {/* Sidebar — persistent narrow rail on lg+, same as MainLayout pages.
          `lg:pl-[72px]` above reserves the gutter so this fixed sidebar doesn't
          overlap the dial / content. */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} persistent />

      <BarkaTopNav
        isAnonymous={isAnonymous}
        userInitial={userInitial}
        onOpenSidebar={() => setSidebarOpen(true)}
        isTabActive={isTabActive}
        onTopNavClick={handleTopNavClick}
      />

      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.015, backgroundImage: 'repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg 30deg, rgba(212,168,83,0.4) 30deg 31deg, transparent 31deg 60deg)', backgroundSize: '100px 100px' }} />

      {/* Ambient glows — kept inside the wrapper so they don't trigger a horizontal scroll axis */}
      <div className="absolute pointer-events-none" style={{ top: 0, left: 0, width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(27,107,74,0.08) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: 0, right: 0, width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)' }} />

      {/* ── Content ── BarkaLabs is a top-level route (NOT inside MainLayout),
          so it has no parent-nav clearance — it needs its own bottom padding for
          Samsung's system nav strip. 8rem covers gesture/3-button nav comfortably,
          plus safe-area-inset-bottom on devices that report it (iOS, modern gesture). */}
      <div className="relative z-[1] px-4 md:px-8 py-5 md:py-8 pb-[calc(8rem+env(safe-area-inset-bottom,0px))] md:pb-8">

        <BarkaHeroCounter
          ref={heroRef}
          totalBlessings={stats.total_blessings}
          currentStreak={stats.current_streak}
          speedoKey={speedoKey}
          confettiRef={confettiRef}
          onOpenJournal={() => setShowBlessingFocus(true)}
        />

        {screen !== 'journal' && (
          <>
            {/* ── Page Title ── */}
            <div className="mb-4 md:mb-6">
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1"
                style={{ fontFamily: 'Cormorant Garamond, serif', color: '#D7B56A', letterSpacing: '-0.02em' }}
              >
                Barakah Labs
              </h1>
              <p className="text-sm md:text-base" style={{ color: '#D5DDEA', lineHeight: 1.4 }}>
                Track your gratitude, grow your mental health, earn DinarZ
              </p>
            </div>

            {/* ── Tab Navigation (horizontal scroll on mobile, wrap on desktop) ── */}
            <div className="flex gap-2 md:gap-3 mb-5 md:mb-8 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible md:pb-0">
              {TABS.map(tab => {
                const active = screen === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => go(tab.key)}
                    className="flex items-center gap-2 px-3.5 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl text-[13px] md:text-[14px] font-semibold whitespace-nowrap transition-all shrink-0 active:scale-[0.97]"
                    style={active ? {
                      background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                      color: '#1E293A',
                      boxShadow: '0 4px 16px rgba(212,168,83,0.25)',
                    } : {
                      border: '1px solid rgba(215,181,106,0.2)',
                      color: '#D5DDEA',
                      background: 'rgba(44,60,85,0.3)',
                    }}
                  >
                    <tab.Icon size={16} weight={active ? 'fill' : 'duotone'} style={{ color: active ? '#1E293A' : '#D7B56A' }} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Active Screen ── */}
        {renderScreen()}
      </div>

      {/* Mobile bottom nav — matches MainLayout so users keep their tabs here */}
      <BottomNavBar />

      {/* ── Error toast ── */}
      {error && !error.startsWith('Decomposition') && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3 rounded-2xl max-w-[calc(100%-2rem)]"
          style={{ background: 'rgba(224,122,107,0.95)', border: '1px solid rgba(224,122,107,0.6)', backdropFilter: 'blur(16px)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
        >
          <span className="text-sm font-semibold text-white">{error}</span>
        </div>
      )}

      {/* ── Milestone toast ── */}
      {showMilestone && lastMilestones.length > 0 && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 px-5 py-3 rounded-2xl max-w-[calc(100%-2rem)]"
          style={{ top: 'calc(env(safe-area-inset-top) + 1rem)', background: 'rgba(13,19,35,0.96)', border: '1px solid rgba(212,168,83,0.4)', backdropFilter: 'blur(16px)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <span className="font-bold text-sm" style={{ color: C.t1 }}>{lastMilestones[0].description}</span>
          </div>
          {lastDnzAwarded > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.dnz }}>
              <span>◈</span> +{lastDnzAwarded} DinarZ
            </div>
          )}
        </div>
      )}

      {showGratModal && (
        <GratitudeModal onSubmit={handleSubmit} submitting={submitting} onClose={() => setShowGratModal(false)} lastBlessing={blessings[0] || null} activeDecomposition={activeDecomposition} decomposing={decomposing} />
      )}

      {/* Hero "Count a Blessing" → focus-mode modal. Backdrop blurs the home
          page so OthersStream + chatbox become the focal anchor; rest of the
          dashboard stays mounted behind for instant resume on close. */}
      <BlessingFocusModal
        open={showBlessingFocus}
        onClose={() => setShowBlessingFocus(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        onSubmitted={() => go('community')}
      />

      {/* Decomposition loading → tree transition */}
      {decomposing && !activeDecomposition && !showGratModal && <BarkaDecomposingOverlay />}

      {activeDecomposition && !showGratModal && (
        <DecompositionTree data={activeDecomposition} onClose={clearDecomposition} />
      )}

      {activeBattle && !battleResult && (
        <BattleArena battle={activeBattle} onBattleEnd={(result) => { setActiveBattle(null); setBattleResult(result); }} />
      )}

      {battleResult && (
        <BattleResults battle={battleResult} onClose={() => { setBattleResult(null); fetchStats(); fetchBlessings(); go('home'); }} />
      )}
    </div>
  );
}
