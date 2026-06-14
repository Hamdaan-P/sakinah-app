/**
 * SimOnboarding — first-run, skippable ~60-second walkthrough (Sprint 8).
 *
 * Per master plan §6.R Sprint 8 ("60-second tutorial scenario, skippable").
 * A 4-step intro shown once on the user's first visit to Market Rewind. The
 * parent decides whether to render it (reading the localStorage flag) and
 * persists dismissal on close, so this component stays presentational.
 *
 * Deliberately NOT a forced tutorial (D5 — open browsing, no gating): Skip
 * is available on every step and closing = never-again.
 */

import { useState } from 'react';
import { ArrowRight, CaretLeft, Clock, Compass, Sparkle, X } from '@phosphor-icons/react';

/** localStorage flag — exported so the page can read/write the same key. */
export const ONBOARDING_FLAG = 'eim:mr:onboarded';

interface Step {
  icon: typeof Clock;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: Clock,
    title: 'Welcome to the Simulator',
    body: 'Pick a moment in market history — 2008, 2020, any year — and live it forward, one step at a time. Everything is virtual: no real money, just learning by doing.',
  },
  {
    icon: ArrowRight,
    title: 'Step through time',
    body: 'Use Step to advance 1 month, 3 months, or a year. Pause whenever you like to buy, sell, or just think. Real historical events surface on your timeline as you cross them — you only ever see what had happened by your current date.',
  },
  {
    icon: Sparkle,
    title: 'A mentor walks with you',
    body: 'A guiding lens may gently interrupt when a decision looks driven by fear or hype, and you can tap Ask to consult one at any pause. The goal is reflection, never a hot tip.',
  },
  {
    icon: Compass,
    title: 'See your reflection',
    body: 'When you end a run you get an honest post-mortem of your decisions. From there, try the same era as a guided dilemma in the Scenario Lab, or compare strategies and project the future.',
  },
];

export function SimOnboarding({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mr-onboarding-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[rgba(212,168,83,0.30)] bg-[#101a2a] p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(212,168,83,0.14)', color: '#D4A853' }}
          >
            <Icon size={22} weight="duotone" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7363] hover:text-[#F5E8C7]"
            aria-label="Skip the walkthrough"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <h2 id="mr-onboarding-title" className="text-[18px] font-bold text-[#F5E8C7]">
          {current.title}
        </h2>
        <p className="text-[13px] text-[#C9C0AB] leading-relaxed mt-1.5">{current.body}</p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mt-4" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={'h-1.5 rounded-full transition-all ' + (i === step ? 'w-5 bg-[#D4A853]' : 'w-1.5 bg-[rgba(212,168,83,0.25)]')}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="h-10 px-3 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363] flex items-center gap-1"
            >
              <CaretLeft size={13} weight="bold" /> Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="h-10 px-3 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363]"
            >
              Skip
            </button>
          )}
          <button
            onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
            className="flex-1 h-10 rounded-xl text-[13px] font-bold text-[#0A0E16] flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
          >
            {isLast ? 'Start exploring' : 'Next'}
            {!isLast && <ArrowRight size={14} weight="bold" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SimOnboarding;
