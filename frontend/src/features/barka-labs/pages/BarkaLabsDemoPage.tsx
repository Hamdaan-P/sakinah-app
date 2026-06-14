/**
 * Barakah Labs Demo Page — Public preview, no sign-in required.
 * Uses Firebase Anonymous Auth silently so all data persists.
 * When the user signs up, linkWithCredential preserves the same uid.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  House, ChartBar, Fire, Sparkle, GlobeHemisphereWest,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import '@/i18n'; // Initialize i18n
import { getDemoDir, getDemoDisplayFont, getDemoBodyFont, hasSelectedLanguage, SUPPORTED_LANGUAGES, setDemoLanguage } from '@/i18n';
import { useBarkaLabsStore } from '../stores/barka-labs.store';
import * as barkaLabsApi from '../services/barkaLabsService';
import { useAuthStore } from '@/core/stores/auth.store';
import { BarkaLabsHome } from '../components/BarkaLabsHome';
import { BarkaLabsJournal } from '../components/BarkaLabsJournal';
import { BarkaLabsReport } from '../components/BarkaLabsReport';
import { CreativityDetail } from '../components/CreativityDetail';
import { LevelDetail } from '../components/LevelDetail';
import { GratitudeModal } from '../components/GratitudeModal';
import { DecompositionTree } from '../components/DecompositionTree';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { DemoSignUpCTA } from '../components/DemoSignUpCTA';
import { LanguageSelectorModal } from '../components/LanguageSelectorModal';
import { C } from '../barka-labs.constants';
import { seedDemoBlessings } from '../data/barka-labs-demo.data';
import logoGold from '@/assets/zaryah-logo-gold.png';
import type { BarkaLabsScreen } from './BarkaLabsPage';

/* ── Tabs (no Community — gated) ── */
const DEMO_TABS: { key: BarkaLabsScreen; label: string; Icon: Icon }[] = [
  { key: 'home', label: 'Home', Icon: House },
  { key: 'report', label: 'Reports', Icon: ChartBar },
];


// Module-level flag — survives StrictMode remounts
let _anonSignInAttempted = false;

export function BarkaLabsDemoPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('demo');
  const user = useAuthStore((s) => s.user);
  const authState = useAuthStore((s) => s.state);
  const signInAnonymously = useAuthStore((s) => s.signInAnonymously);
  const isRealUser = authState.type === 'authenticated' && !user?.isAnonymous;
  const [showLangModal, setShowLangModal] = useState(!hasSelectedLanguage());
  const [showLangSwitcher, setShowLangSwitcher] = useState(false);
  const dir = getDemoDir();

  const {
    blessings, stats, submitting, activeDecomposition, decomposing,
    percentile, lastMilestones, lastDnzAwarded,
    logBlessing, fetchBlessings, fetchStats, fetchPercentile,
    deleteBlessing, decomposeBlessing, clearDecomposition, clearMilestones,
  } = useBarkaLabsStore();

  const [screen, setScreen] = useState<BarkaLabsScreen>('home');
  const [showGratModal, setShowGratModal] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerContext, setBannerContext] = useState<'general' | 'limit'>('general');
  const [speedoKey, setSpeedoKey] = useState(0);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const confettiFired = useRef(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const decompositionClosedOnce = useRef(false);

  // ── 1. Auto sign-in anonymously (module-level guard prevents retry loops) ──
  useEffect(() => {
    if (user && !user.isAnonymous) {
      navigate('/barakah-labs', { replace: true });
      return;
    }
    if (!user && authState.type !== 'loading' && !_anonSignInAttempted) {
      _anonSignInAttempted = true;
      signInAnonymously();
    }
  }, [user, authState.type, signInAnonymously, navigate]);

  // ── 2. Seed demo blessings on first visit ──
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const SEED_KEY = `barka_demo_seeded_${user.id}`;

    (async () => {
      try {
        if (localStorage.getItem(SEED_KEY)) return; // already seeded

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
  }, [user?.id]);

  // ── 3. Fetch data once authenticated ──
  useEffect(() => {
    if (user?.id) {
      fetchBlessings();
      fetchStats();
      fetchPercentile();
    }
  }, [user?.id, fetchBlessings, fetchStats, fetchPercentile]);

  // ── 4. Confetti on count change (same as real page) ──
  const prevBlessingCount = useRef(stats.total_blessings);
  useEffect(() => {
    if (stats.total_blessings === 0) return;
    if (prevBlessingCount.current === stats.total_blessings && confettiFired.current) return;
    prevBlessingCount.current = stats.total_blessings;
    setSpeedoKey((k) => k + 1);

    const delay = setTimeout(() => {
      confettiFired.current = true;
      const canvas = confettiRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const COLORS = ['#D7B56A', '#E7CF8C', '#B8893A', '#2A9D6F', '#3ABFAD', '#8B7EC8', '#F5C842', '#EBDCB8'];
      const pieces: { x: number; y: number; vx: number; vy: number; w: number; h: number; color: string; rot: number; rv: number; opacity: number }[] = [];
      for (let i = 0; i < 80; i++) {
        pieces.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.25, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 10 - 3, w: Math.random() * 8 + 4, h: Math.random() * 6 + 2, color: COLORS[Math.floor(Math.random() * COLORS.length)], rot: Math.random() * Math.PI * 2, rv: (Math.random() - 0.5) * 0.3, opacity: 1 });
      }
      let frame = 0;
      function animate() {
        if (frame >= 120) { ctx!.clearRect(0, 0, W, H); return; }
        ctx!.clearRect(0, 0, W, H);
        const progress = frame / 120;
        for (const p of pieces) {
          p.x += p.vx; p.vy += 0.25; p.y += p.vy; p.rot += p.rv; p.opacity = Math.max(0, 1 - progress * 1.2);
          ctx!.save(); ctx!.translate(p.x, p.y); ctx!.rotate(p.rot); ctx!.globalAlpha = p.opacity; ctx!.fillStyle = p.color; ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx!.restore();
        }
        frame++;
        requestAnimationFrame(animate);
      }
      animate();
    }, 2500);
    return () => clearTimeout(delay);
  }, [stats.total_blessings]);

  // ── 5. Milestone toast ──
  useEffect(() => {
    if (lastMilestones.length > 0) {
      setShowMilestone(true);
      const t = setTimeout(() => { setShowMilestone(false); clearMilestones(); }, 4000);
      return () => clearTimeout(t);
    }
  }, [lastMilestones, clearMilestones]);

  // ── Helpers ──

  const scrollToCounter = useCallback(() => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const go = useCallback((s: BarkaLabsScreen) => {
    const GATED: BarkaLabsScreen[] = ['community', 'battle', 'challenge'];
    if (GATED.includes(s)) {
      setScreen(s); // Will render DemoSignUpCTA in renderScreen
      return;
    }
    setScreen(s);
  }, []);

  const [aiProcessing, setAiProcessing] = useState(false);

  const handleSubmit = useCallback(async (text: string) => {
    setShowGratModal(false);
    setAiProcessing(true);
    await logBlessing(text);
    setAiProcessing(false);
  }, [logBlessing]);

  const handleDecompose = useCallback(async (id: string) => {
    await decomposeBlessing(id);
  }, [decomposeBlessing]);

  const handleDecompositionClose = useCallback(() => {
    clearDecomposition();
    if (!decompositionClosedOnce.current) {
      decompositionClosedOnce.current = true;
      setBannerContext('general');
      setShowBanner(true);
    }
  }, [clearDecomposition]);

  const userName = 'Explorer';

  const renderScreen = () => {
    const common = { stats, blessings, percentile, go };
    switch (screen) {
      case 'home': return <BarkaLabsHome {...common} userName={userName} onOpenGratModal={() => setShowGratModal(true)} isDemo />;
      case 'report': return <BarkaLabsReport stats={stats} blessings={blessings} go={go} isDemo />;
      case 'levels': return <LevelDetail stats={stats} go={go} isDemo />;
      case 'creativity': return <CreativityDetail stats={stats} blessings={blessings} go={go} />;
      case 'journal': return <BarkaLabsJournal blessings={blessings} stats={stats} onDelete={deleteBlessing} onDecompose={handleDecompose} go={go} onSubmitBlessing={handleSubmit} submitting={submitting} onScrollToCounter={scrollToCounter} />;
      case 'dnz': return <DemoSignUpCTA mode="inline" context="general" />;
      case 'community': return <DemoSignUpCTA mode="inline" context="community" />;
      case 'battle': return <DemoSignUpCTA mode="inline" context="battle" />;
      case 'challenge': return <DemoSignUpCTA mode="inline" context="challenge" />;
      default: return null;
    }
  };

  // ── Loading / Error state ──
  if (!user || seeding) {
    const hasError = authState.type === 'error';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1E293A] px-4 relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute pointer-events-none" style={{ top: '-30%', left: '-20%', width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(27,107,74,0.06) 0%, transparent 70%)' }} />
        <div className="absolute pointer-events-none" style={{ bottom: '-20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(212,168,83,0.05) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col items-center">
          <img src={logoGold} alt="ZaryahPlus" className="w-16 h-16 object-contain mb-6" style={{ animation: 'pulse 2s ease-in-out infinite' }} />

          {hasError ? (
            <div className="text-center max-w-sm">
              <p className="text-sm mb-3" style={{ color: '#E7CF8C' }}>{t('loading.error.title')}</p>
              <p className="text-xs mb-4" style={{ color: '#7F8A9A' }}>{t('loading.error.desc')}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { _anonSignInAttempted = false; signInAnonymously(); }} className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ border: '1px solid rgba(215,181,106,0.3)', color: '#D7B56A' }}>
                  {t('loading.error.retry')}
                </button>
                <button onClick={() => navigate('/signup')} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: 'linear-gradient(135deg, #D7B56A, #E7CF8C)', color: '#1E293A' }}>
                  {t('loading.error.signUp')}
                </button>
              </div>
            </div>
          ) : seeding ? (
            <div className="text-center max-w-xs">
              <h2 className="text-xl font-bold mb-2" style={{ color: '#EBDCB8', fontFamily: getDemoDisplayFont() }}>
                {t('loading.preparing')}
              </h2>
              <p className="text-xs mb-5" style={{ color: '#7F8A9A' }}>
                {t('loading.aiScoring')}
              </p>
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: C.gold, animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`, opacity: 0.3 }} />
                ))}
              </div>
              <p className="text-[11px] italic" style={{ color: '#A7B1C0' }}>
                &ldquo;{t('loading.quranVerse')}&rdquo;
              </p>
              <p className="text-[10px] mt-1" style={{ color: '#7F8A9A' }}>
                {t('loading.quranRef')}
              </p>
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#D7B56A' }}>{t('loading.default')}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#1E293A] via-[#1A2332] to-[#1E293A]" dir={dir} style={{ fontFamily: getDemoBodyFont() }}>

      {/* Language selector modal (first visit) */}
      {showLangModal && <LanguageSelectorModal onSelect={() => setShowLangModal(false)} />}

      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.015, backgroundImage: 'repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg 30deg, rgba(212,168,83,0.4) 30deg 31deg, transparent 31deg 60deg)', backgroundSize: '100px 100px' }} />

      {/* Ambient glows */}
      <div className="absolute pointer-events-none" style={{ top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(27,107,74,0.08) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '-15%', right: '-5%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)' }} />

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-3" style={{ background: 'rgba(30,41,58,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(215,181,106,0.12)' }}>
        <div className="flex items-center gap-2">
          <img src={logoGold} alt="ZaryahPlus" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold" style={{ color: '#D7B56A', fontFamily: getDemoDisplayFont() }}>
            {t('topBar.title')}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(42,157,111,0.15)', color: '#2A9D6F', border: '1px solid rgba(42,157,111,0.3)' }}>
            {t('topBar.demo')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangSwitcher(prev => !prev)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={{ border: '1px solid rgba(215,181,106,0.15)', color: '#A7B1C0' }}
            >
              <GlobeHemisphereWest size={14} />
              {SUPPORTED_LANGUAGES.find(l => l.code === i18n.language)?.nativeName || 'EN'}
            </button>
            {showLangSwitcher && (
              <div
                className="absolute top-full mt-1 rounded-xl p-1.5 min-w-[140px] z-50"
                style={{ background: 'rgba(30,41,58,0.97)', border: '1px solid rgba(215,181,106,0.2)', backdropFilter: 'blur(12px)', [dir === 'rtl' ? 'left' : 'right']: 0 }}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setDemoLanguage(lang.code); setShowLangSwitcher(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-colors hover:bg-[rgba(215,181,106,0.08)]"
                    style={{ color: i18n.language === lang.code ? '#D7B56A' : '#A7B1C0' }}
                  >
                    <span className="font-medium">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate(isRealUser ? '/barakah-labs' : '/signup')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #D7B56A, #E7CF8C)', color: '#1E293A' }}
          >
            <Sparkle size={14} weight="fill" />
            {isRealUser ? t('topBar.goToApp') : t('topBar.signUp')}
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-[1] px-4 md:px-8 py-5 md:py-8 pb-28 md:pb-8">

        {/* ── Hero: Blessings Counter ── */}
        <div
          ref={heroRef}
          className="rounded-2xl md:rounded-3xl py-6 md:py-8 px-4 md:px-8 mb-4 md:mb-5 text-center relative"
          style={{
            background: 'linear-gradient(160deg, rgba(215,181,106,0.10) 0%, rgba(42,157,111,0.06) 50%, rgba(184,137,58,0.08) 100%)',
            border: '1px solid rgba(215,181,106,0.2)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(215,181,106,0.1)',
          }}
        >
          <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[3px] md:tracking-[4px] mb-2 md:mb-4" style={{ color: 'rgba(215,181,106,0.7)' }}>
            {t('hero.blessingsCounted')}
          </p>
          <div className="hidden md:block" dir="ltr">
            <AnimatedCounter key={`desk-${speedoKey}`} value={stats.total_blessings} digits={stats.total_blessings >= 1000 ? 4 : 3} fontSize={140} gap={2} color="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight={900} gradientFrom="rgba(30,41,58,0)" showSpeedo speedoMax={Math.max(100, Math.ceil(stats.total_blessings * 1.5 / 100) * 100)} />
          </div>
          <div className="md:hidden" dir="ltr">
            <AnimatedCounter key={`mob-${speedoKey}`} value={stats.total_blessings} digits={stats.total_blessings >= 1000 ? 4 : 3} fontSize={80} gap={1} color="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight={900} gradientFrom="rgba(30,41,58,0)" showSpeedo speedoMax={Math.max(100, Math.ceil(stats.total_blessings * 1.5 / 100) * 100)} />
          </div>
          <div className="flex items-center justify-center gap-3 mt-3 md:mt-4">
            <button
              onClick={() => {
                setShowGratModal(true);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] backdrop-blur-md"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#EBDCB8',
                border: '1px solid rgba(215,181,106,0.35)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
            >
              <span className="text-base">&#x1F932;</span>
              {t('hero.countBlessing')}
            </button>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(215,181,106,0.15)' }}>
              <Fire size={16} weight="fill" className="text-[#D7B56A]" />
              <span className="text-base font-bold text-[#D7B56A]" style={{ fontFamily: getDemoDisplayFont() }}>{stats.current_streak}</span>
              <span className="text-[10px] font-medium text-[#A7B1C0]">{t('hero.dayStreak')}</span>
            </div>
          </div>

          {/* Confetti canvas */}
          <canvas ref={confettiRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }} />
        </div>


        {screen !== 'journal' && (
          <>
            {/* ── Page Title ── */}
            <div className="mb-4 md:mb-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1" style={{ fontFamily: getDemoDisplayFont(), color: '#D7B56A', letterSpacing: '-0.02em' }}>
                {t('page.title')}
              </h1>
              <p className="text-sm md:text-base" style={{ color: '#D5DDEA', lineHeight: 1.4 }}>
                {t('page.subtitle')}
              </p>
            </div>

            {/* ── Tab Navigation ── */}
            <div className="flex gap-2 md:gap-3 mb-5 md:mb-8 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible md:pb-0">
              {DEMO_TABS.map(tab => {
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
                    {t(`tabs.${tab.key === 'home' ? 'home' : 'reports'}`)}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Active Screen ── */}
        {renderScreen()}
      </div>

      {/* ── Milestone toast ── */}
      {showMilestone && lastMilestones.length > 0 && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 px-5 py-3 rounded-2xl max-w-[calc(100%-2rem)]"
          style={{ top: 'calc(env(safe-area-inset-top) + 4rem)', background: 'rgba(13,19,35,0.96)', border: '1px solid rgba(212,168,83,0.4)', backdropFilter: 'blur(16px)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">&#x1F3C6;</span>
            <span className="font-bold text-sm" style={{ color: C.t1 }}>{lastMilestones[0].description}</span>
          </div>
          {lastDnzAwarded > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.dnz }}>
              <span>&#x25C8;</span> +{lastDnzAwarded} DinarZ
            </div>
          )}
        </div>
      )}

      {/* ── AI Processing Overlay ── */}
      {aiProcessing && (
        <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center" style={{ background: 'rgba(13,19,35,0.92)', backdropFilter: 'blur(12px)' }}>
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(215,181,106,0.12)', border: '1px solid rgba(215,181,106,0.25)' }}>
              <Sparkle size={32} weight="duotone" style={{ color: C.gold, animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#EBDCB8', fontFamily: getDemoDisplayFont() }}>
              {t('aiProcessing.title')}
            </h3>
            <p className="text-xs mb-4" style={{ color: '#7F8A9A' }}>
              {t('aiProcessing.desc')}
            </p>
            <div className="flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full" style={{ background: C.gold, animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Gratitude Modal ── */}
      {showGratModal && (
        <GratitudeModal onSubmit={handleSubmit} submitting={submitting} onClose={() => setShowGratModal(false)} lastBlessing={blessings[0] || null} activeDecomposition={activeDecomposition} decomposing={decomposing} />
      )}

      {/* ── Decomposition Tree ── */}
      {activeDecomposition && !showGratModal && (
        <DecompositionTree data={activeDecomposition} onClose={handleDecompositionClose} />
      )}

      {/* ── Floating sign-up banner ── */}
      {showBanner && (
        <DemoSignUpCTA mode="banner" context={bannerContext} onDismiss={() => setShowBanner(false)} />
      )}
    </div>
  );
}

