/**
 * WalkthroughCard — the floating tooltip card for the wallet walkthrough.
 * Renders icon + title + description + progress dots + Back/Next/Skip.
 */

import { ArrowRight, ArrowLeft } from '@phosphor-icons/react';
import type { WalkthroughStep } from './_walkthroughData';

interface Props {
  step: WalkthroughStep;
  currentStep: number;
  totalSteps: number;
  isMobile: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export function WalkthroughCard({
  step,
  currentStep,
  totalSteps,
  isMobile,
  isLastStep,
  onBack,
  onNext,
  onSkip,
}: Props) {
  const StepIcon = step.icon;
  return (
    <div
      className="relative rounded-2xl overflow-hidden backdrop-blur-xl"
      style={{
        background: 'linear-gradient(145deg, rgba(20,30,42,0.95), rgba(12,18,28,0.97))',
        border: '1px solid rgba(107,175,141,0.12)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Top accent — dual gradient bar */}
      <div className="flex h-[2px]">
        <div className="flex-1" style={{ background: 'linear-gradient(90deg, transparent, #6BAF8D)' }} />
        <div className="flex-1" style={{ background: 'linear-gradient(90deg, #6BAF8D, #C9B57A)' }} />
        <div className="flex-1" style={{ background: 'linear-gradient(90deg, #C9B57A, transparent)' }} />
      </div>

      <div className={isMobile ? 'p-4' : 'px-5 py-4'}>
        {/* Skip */}
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-medium text-[#7A7363] hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
        >
          Skip
        </button>

        {/* Header: icon + title inline */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{
              background: step.iconBg,
              border: `1px solid ${step.iconColor}25`,
            }}
          >
            <StepIcon size={20} weight="duotone" style={{ color: step.iconColor }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-white leading-tight">
              {step.title}
            </h3>
            <p className="text-[11px] font-medium" style={{ color: step.iconColor }}>
              {step.subtitle}
            </p>
          </div>
        </div>

        <p className="text-[13px] text-[#B8C4D4] leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Progress + nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === currentStep ? 20 : 8,
                  height: 4,
                  background:
                    i === currentStep
                      ? 'linear-gradient(90deg, #6BAF8D, #C9B57A)'
                      : i < currentStep
                        ? 'rgba(107,175,141,0.35)'
                        : 'rgba(255,255,255,0.08)',
                }}
              />
            ))}
            <span className="text-[10px] text-white/25 ml-1">{currentStep + 1}/{totalSteps}</span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#7A7363] hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <ArrowLeft size={11} weight="bold" />
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: isLastStep
                  ? 'linear-gradient(135deg, #6BAF8D, #5A9A7C)'
                  : 'rgba(107,175,141,0.08)',
                color: isLastStep ? '#fff' : '#6BAF8D',
                border: isLastStep ? 'none' : '1px solid rgba(107,175,141,0.15)',
                boxShadow: isLastStep ? '0 4px 16px rgba(107,175,141,0.2)' : 'none',
              }}
            >
              {isLastStep ? 'Start Earning' : 'Next'}
              <ArrowRight size={13} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
