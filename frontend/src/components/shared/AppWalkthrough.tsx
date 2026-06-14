/**
 * App Walkthrough — First-launch guided tour
 * Stays on the dashboard, highlights UI elements via data-tour attributes.
 * Separate step configs for desktop (sidebar visible) and mobile (bottom nav).
 * Desktop sidebar steps highlight BOTH the dashboard card and the sidebar item.
 * Falls back to a centered card when the target element isn't found.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DESKTOP_STEPS, MOBILE_STEPS } from './walkthrough/_steps';
import { getRect, scrollToTarget, computeTooltipStyle } from './walkthrough/_helpers';
import type { Rect } from './walkthrough/_helpers';
import { TooltipCard } from './walkthrough/TooltipCard';

interface AppWalkthroughProps {
  onComplete: () => void;
}

export function AppWalkthrough({ onComplete }: AppWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const steps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS;
  const step = steps[currentStep];
  const pad = 10;

  // Find target, scroll, measure
  useEffect(() => {
    setReady(false);
    setRect(null);
    scrollToTarget(step.tourTarget);

    const t = setTimeout(() => {
      setRect(getRect(step.tourTarget));
      setReady(true);
    }, 450);
    return () => clearTimeout(t);
  }, [currentStep, step.tourTarget, isMobile]);

  // Re-measure on resize/scroll
  useEffect(() => {
    if (!ready) return;
    const update = () => setRect(getRect(step.tourTarget));
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [ready, step.tourTarget]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
    else onComplete();
  }, [currentStep, steps.length, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const isLastStep = currentStep === steps.length - 1;
  const hasSpotlight = !!rect;
  const tooltipStyle = computeTooltipStyle(rect, step, isMobile, pad);

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* SVG overlay with spotlight cutout(s) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="wt-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - pad}
                y={rect.top - pad}
                width={rect.width + pad * 2}
                height={rect.height + pad * 2}
                rx={isMobile ? 12 : 16}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(10,15,25,0.82)" mask="url(#wt-mask)" />
      </svg>

      {/* Block clicks */}
      <div className="absolute inset-0" />

      {/* Gold glow ring — brighter for small targets so the spotlight reads at a glance */}
      {hasSpotlight && ready && (
        <motion.div
          key={`ring-${step.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute pointer-events-none"
          style={{
            top: rect!.top - pad - 2,
            left: rect!.left - pad - 2,
            width: rect!.width + pad * 2 + 4,
            height: rect!.height + pad * 2 + 4,
            borderRadius: isMobile ? 14 : 18,
            border: '2px solid rgba(212,168,83,0.85)',
            boxShadow:
              '0 0 0 4px rgba(212,168,83,0.18), 0 0 24px rgba(212,168,83,0.45), 0 0 60px rgba(212,168,83,0.22)',
          }}
        />
      )}

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        {ready && (
          <motion.div
            key={`${step.id}-${isMobile ? 'm' : 'd'}`}
            initial={{ opacity: 0, y: step.tooltipSide === 'top' ? -16 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: step.tooltipSide === 'top' ? 10 : -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-10 flex"
            style={{
              ...tooltipStyle,
              width: isMobile ? 'calc(100vw - 32px)' : 'min(400px, calc(100vw - 32px))',
            }}
          >
            <TooltipCard
              step={step}
              steps={steps}
              currentStep={currentStep}
              isMobile={isMobile}
              isLastStep={isLastStep}
              onSkip={onComplete}
              onNext={handleNext}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
