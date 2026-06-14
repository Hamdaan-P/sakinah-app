/**
 * Tooltip card rendered next to the highlighted target element.
 */

import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react';
import type { WalkthroughStep } from './_steps';

interface TooltipCardProps {
  step: WalkthroughStep;
  steps: WalkthroughStep[];
  currentStep: number;
  isMobile: boolean;
  isLastStep: boolean;
  onSkip: () => void;
  onNext: () => void;
  onBack: () => void;
}

export function TooltipCard({
  step, steps, currentStep, isMobile, isLastStep, onSkip, onNext, onBack,
}: TooltipCardProps) {
  const StepIcon = step.icon;

  return (
    <div
      className="relative flex flex-col w-full max-h-[inherit] bg-gradient-to-b from-[#1A2740] to-[#162030] border border-[rgba(212,168,83,0.25)] rounded-2xl shadow-2xl overflow-hidden"
    >
      <div
        className="h-1 w-full shrink-0"
        style={{ background: `linear-gradient(90deg, ${step.iconColor}, rgba(212,168,83,0.6))` }}
      />

      {/* Skip — pinned to the card, not the scroll area */}
      <button
        onClick={onSkip}
        className={'absolute z-10 right-3 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-[#7A7363] hover:text-[#F5E8C7] ' + (isMobile ? 'top-2.5 w-6 h-6' : 'top-3.5 w-7 h-7')}
      >
        <X size={12} weight="bold" />
      </button>

      {/* Scrollable content */}
      <div className={(isMobile ? 'px-3.5 pt-3.5 pb-2 ' : 'px-5 pt-5 pb-3 ') + 'flex-1 min-h-0 overflow-y-auto'}>
        {/* Counter */}
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A853]/70">
          {currentStep + 1} of {steps.length}
        </span>

        {/* Icon */}
        <div
          className={'rounded-lg flex items-center justify-center ' + (isMobile ? 'w-9 h-9 mt-2 mb-2' : 'w-10 h-10 mt-3 mb-3')}
          style={{ background: step.iconBg }}
        >
          <StepIcon size={isMobile ? 18 : 20} weight="duotone" style={{ color: step.iconColor }} />
        </div>

        <h3 className={'font-display font-bold text-[#F5E8C7] mb-0.5 ' + (isMobile ? 'text-base' : 'text-lg')}>{step.title}</h3>
        <p className={'font-medium text-[#D4A853]/80 mb-2 ' + (isMobile ? 'text-[11px]' : 'text-xs')}>{step.subtitle}</p>
        <p className={'text-[#7A7363] leading-relaxed ' + (isMobile ? 'text-[12.5px]' : 'text-[13px]')}>{step.description}</p>
      </div>

      {/* Dots + nav — pinned at bottom */}
      <div className={'shrink-0 border-t border-white/5 ' + (isMobile ? 'px-3.5 py-2.5' : 'px-5 py-3')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className="transition-all duration-300"
                style={{
                  width: i === currentStep ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  background:
                    i === currentStep
                      ? 'linear-gradient(90deg, #D4A853, #E8C97A)'
                      : i < currentStep
                        ? 'rgba(212,168,83,0.4)'
                        : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#7A7363] hover:text-[#F5E8C7] transition-colors rounded-lg hover:bg-white/5"
              >
                <ArrowLeft size={12} weight="bold" />
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: isLastStep
                  ? 'linear-gradient(90deg, #D4A853, #E8C97A)'
                  : 'rgba(212,168,83,0.15)',
                color: isLastStep ? '#0A0E16' : '#E8C97A',
                border: isLastStep ? 'none' : '1px solid rgba(212,168,83,0.25)',
              }}
            >
              {isLastStep ? "Let's Go" : 'Next'}
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
