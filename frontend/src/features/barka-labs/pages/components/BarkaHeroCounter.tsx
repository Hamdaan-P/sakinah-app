/**
 * Hero blessing counter + streak chip used at the top of BarkaLabsPage.
 */

import { forwardRef } from 'react';
import { Fire } from '@phosphor-icons/react';
import { AnimatedCounter } from '../../components/AnimatedCounter';

interface BarkaHeroCounterProps {
  totalBlessings: number;
  currentStreak: number;
  speedoKey: number;
  confettiRef: React.RefObject<HTMLCanvasElement | null>;
  onOpenJournal: () => void;
}

export const BarkaHeroCounter = forwardRef<HTMLDivElement, BarkaHeroCounterProps>(
  function BarkaHeroCounter({ totalBlessings, currentStreak, speedoKey, confettiRef, onOpenJournal }, ref) {
    const speedoMax = Math.max(100, Math.ceil(totalBlessings * 1.5 / 100) * 100);
    const digits = totalBlessings >= 1000 ? 4 : 3;

    return (
      <div
        ref={ref}
        className="rounded-2xl md:rounded-3xl py-6 md:py-8 px-4 md:px-8 mb-4 md:mb-5 text-center relative"
        style={{
          background: 'linear-gradient(160deg, rgba(215,181,106,0.10) 0%, rgba(42,157,111,0.06) 50%, rgba(184,137,58,0.08) 100%)',
          border: '1px solid rgba(215,181,106,0.2)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(215,181,106,0.1)',
        }}
      >
        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[3px] md:tracking-[4px] mb-2 md:mb-4" style={{ color: 'rgba(215,181,106,0.7)' }}>
          Blessings Counted
        </p>
        <div className="hidden md:block">
          <AnimatedCounter key={`desk-${speedoKey}`} value={totalBlessings} digits={digits} fontSize={140} gap={2} color="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight={900} gradientFrom="rgba(30,41,58,0)" showSpeedo speedoMax={speedoMax} />
        </div>
        <div className="md:hidden">
          <AnimatedCounter key={`mob-${speedoKey}`} value={totalBlessings} digits={digits} fontSize={80} gap={1} color="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight={900} gradientFrom="rgba(30,41,58,0)" showSpeedo speedoMax={speedoMax} />
        </div>
        <div className="flex items-center justify-center gap-3 mt-3 md:mt-4">
          <button
            onClick={onOpenJournal}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] backdrop-blur-md"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#EBDCB8',
              border: '1px solid rgba(215,181,106,0.35)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            <span className="text-base">🤲</span>
            Count a Blessing
          </button>
          <div
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(215,181,106,0.15)' }}
          >
            <Fire size={16} weight="fill" className="text-[#D7B56A]" />
            <span className="text-base font-bold text-[#D7B56A]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {currentStreak}
            </span>
            <span className="text-[10px] font-medium text-[#A7B1C0]">day streak</span>
          </div>
        </div>

        {/* Confetti canvas — overlays the hero, pointer-events-none */}
        <canvas
          ref={confettiRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 10 }}
        />
      </div>
    );
  }
);
