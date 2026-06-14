import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CaretRight,
  ShieldCheck,
  X,
  Gift,
  Megaphone,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/core/stores/auth.store';
import { useKycStore } from '@/features/kyc/stores/kyc.store';
import { HomeStageEHeader } from '@/features/onboarding/components/HomeStageEHeader';
import { OnboardingTakeover } from '@/features/onboarding/components/OnboardingTakeover';
import { PrayerTimesWidget } from '../components/PrayerTimesWidget';
import { AIQuickChatBar } from '../components/AIQuickChatBar';
import { BarkaLabsWidget } from '../components/BarkaLabsWidget';
import { DailyReflectionCard } from '../components/DailyReflectionCard';
import { TasbihCounter } from '../components/TasbihCounter';
import { PremiumIslamicBackground } from '@/components/shared/PremiumIslamicBackground';
import { getPrayerTimes } from '../services/prayerTimeService';

export function DashboardPage() {
  const navigate = useNavigate();
  const kycTier = useKycStore((s) => s.kycTier);
  const userId = useAuthStore((s) => s.user?.id);
  const [showKycPopup, setShowKycPopup] = useState(false);

  // KYC popup: surface once per session, 2s after mount
  useEffect(() => {
    if (kycTier >= 2) return;
    const key = `zaryah_kyc_popup_dismissed_${userId ?? 'anon'}`;
    if (sessionStorage.getItem(key)) return;
    const timer = setTimeout(() => setShowKycPopup(true), 2000);
    return () => clearTimeout(timer);
  }, [kycTier, userId]);

  const dismissKycPopup = () => {
    setShowKycPopup(false);
    sessionStorage.setItem(`zaryah_kyc_popup_dismissed_${userId ?? 'anon'}`, '1');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 17) return 'good afternoon';
    return 'good evening';
  };

  const [hijriDate, setHijriDate] = useState('');
  useEffect(() => {
    getPrayerTimes()
      .then((data) => { if (data.hijriDate) setHijriDate(data.hijriDate); })
      .catch(() => { /* ignore */ });
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0F141F] overflow-y-auto">
      {/* KYC Popup */}
      <AnimatePresence>
        {showKycPopup && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-md"
            style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
          >
            <div
              className="relative rounded-2xl p-4 shadow-2xl backdrop-blur-xl border border-[#D4A853]/30"
              style={{ background: 'linear-gradient(135deg, #0A0E16 0%, #0F141F 100%)' }}
            >
              <button
                onClick={dismissKycPopup}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={12} className="text-[#7A7363]" />
              </button>

              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center shrink-0">
                  <Gift size={22} weight="fill" className="text-[#0A0E16]" />
                </div>
                <div className="flex-1 pr-4">
                  <p className="text-[#F5E8C7] text-sm font-bold mb-1">Help us build your Digital Twin</p>
                  <p className="text-[#7A7363] text-xs leading-relaxed mb-3">
                    Tell us about yourself so Raya can truly understand you — and earn{' '}
                    <span className="text-[#D4A853] font-semibold">500 DNZ</span> as a reward!
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { dismissKycPopup(); navigate('/deep-kyc'); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
                    >
                      <ShieldCheck size={14} weight="bold" />
                      Complete Now
                    </button>
                    <button
                      onClick={dismissKycPopup}
                      className="px-3 py-2 rounded-xl text-xs text-[#7A7363] hover:text-[#F5E8C7] hover:bg-white/5 transition-colors"
                    >
                      Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage E header — shown on all viewports above existing widgets */}
      <HomeStageEHeader />

      {/* Desktop layout — preserved as-is, sits below the Stage E header */}
      <main className="hidden md:block relative z-10 flex-1 pb-6">
        <div className="space-y-6 py-4">

          {/* KYC persistent banner */}
          {kycTier < 2 && (
            <div className="px-4">
              <button
                onClick={() => navigate('/deep-kyc')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#D4A853]/30 transition-all hover:border-[#D4A853]/50"
                style={{ background: 'linear-gradient(90deg, rgba(212,168,83,0.1), rgba(212,168,83,0.03))' }}
              >
                <div className="w-9 h-9 rounded-lg bg-[#D4A853]/15 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} weight="fill" className="text-[#D4A853]" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[#F5E8C7] text-sm font-semibold">
                    {kycTier === 0 ? 'Set Up Your Identity' : 'Finish Your Profile'}
                  </p>
                  <p className="text-[#5C5749] text-xs">
                    {kycTier === 0 ? 'Help Raya understand you better & earn 50 DNZ' : 'One more step to unlock all features & earn 50 DNZ'}
                  </p>
                </div>
                <CaretRight size={16} className="text-[#D4A853] shrink-0" />
              </button>
            </div>
          )}

          {/* Hero Card with PremiumIslamicBackground — preserved as designed */}
          <div className="px-4" data-tour="dashboard-hero">
            <PremiumIslamicBackground variant="hero" className="rounded-xl p-8">
              <div className="flex flex-col items-center text-center">
                <p className="text-[#E8C97A] text-sm mb-1">
                  Assalamu Alaikum, {getGreeting()}
                </p>
                <h1
                  className="font-display font-bold text-[#F5E8C7] mb-4 leading-tight"
                  style={{ fontSize: 'clamp(1.5rem, 1rem + 2.5vw, 2.5rem)' }}
                >
                  Your Islamic Super Agent<br />is ready.
                </h1>

                {/* Bismillah pill */}
                <div className="mb-4 px-6 py-2 rounded-full border border-[#D4A853]/30 bg-[#D4A853]/10">
                  <span className="text-[#E8C97A] font-arabic text-lg">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
                </div>

                {/* Hijri pill */}
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {hijriDate && (
                    <span className="text-xs text-[#7A7363] bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                      {hijriDate}
                    </span>
                  )}
                </div>
              </div>
            </PremiumIslamicBackground>
          </div>

          {/* Raya quick chat */}
          <AIQuickChatBar />

          {/* Daily Reflection — Ayah ↔ Duʿā tabbed */}
          <div data-tour="dashboard-reflection">
            <DailyReflectionCard />
          </div>

          {/* Barakah Labs — full widget preserved */}
          <div className="px-4" data-tour="barka-labs">
            <BarkaLabsWidget onTap={() => navigate('/barakah-labs')} />
          </div>

          {/* Prayer Times */}
          <div className="px-4" data-tour="dashboard-prayer">
            <PrayerTimesWidget onTap={() => navigate('/prayer-times')} />
          </div>

          {/* Tasbih */}
          <TasbihCounter />

          {/* Feedback card — quote + soft accent */}
          <div className="px-4 pt-1">
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/feedback')}
              className={cn(
                'group relative w-full text-left rounded-2xl border border-[#D4A853]/15 px-5 py-5 overflow-hidden',
                'bg-gradient-to-br from-[#0F141F]/70 via-[#0A0E16] to-[#0A0E16]',
                'hover:border-[#D4A853]/35 transition-colors'
              )}
            >
              {/* Faint corner glow */}
              <div
                className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none opacity-60"
                style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.10), transparent 70%)' }}
              />

              <div className="relative">
                <Megaphone size={20} weight="fill" className="text-[#D4A853]/80 mb-3" />

                <p className="font-display text-[16px] leading-[1.55] text-[#F5E8C7] italic">
                  <span className="text-[#D4A853] text-[20px] leading-none mr-0.5">“</span>
                  Built by Muslims, for Muslims —
                  <br />
                  your input shapes what ships next.
                  <span className="text-[#D4A853] text-[20px] leading-none ml-0.5">”</span>
                </p>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-[#5C5749] font-medium">
                    Zaryah team
                  </span>
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#E8C97A] group-hover:text-[#D4A853] transition-colors">
                    Share feedback
                    <CaretRight
                      size={13}
                      weight="bold"
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </div>
            </motion.button>
          </div>

        </div>
      </main>

      {/* AEBCD takeover overlay — opens stages B/C/D when triggered from /welcome. */}
      <OnboardingTakeover />
    </div>
  );
}
