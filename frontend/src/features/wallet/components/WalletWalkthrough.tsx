/**
 * Wallet Walkthrough — First-visit guided tour for the Wallet page
 * Explains DNZ currency, earning methods, daily caps, and referrals.
 * Emerald/gold accent theme to match the wallet's financial vibe.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  STEPS,
  getRect,
  scrollToTarget,
  type Rect,
} from './wallet-walkthrough/_walkthroughData';
import { WalkthroughCard } from './wallet-walkthrough/WalkthroughCard';

interface WalletWalkthroughProps {
  onComplete: () => void;
}

export function WalletWalkthrough({ onComplete }: WalletWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);
  const [isMobile] = useState(() => window.innerWidth < 768);

  const step = STEPS[currentStep];
  const pad = 10;

  useEffect(() => {
    setReady(false);
    setRect(null);
    scrollToTarget(step.tourTarget);

    const t = setTimeout(() => {
      setRect(getRect(step.tourTarget));
      setReady(true);
    }, 450);
    return () => clearTimeout(t);
  }, [currentStep, step.tourTarget]);

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
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
    else onComplete();
  }, [currentStep, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const isLastStep = currentStep === STEPS.length - 1;

  const getTooltipStyle = (): React.CSSProperties => {
    if (!rect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    const cardW = isMobile ? window.innerWidth - 32 : 400;
    const gap = 14;

    if (step.tooltipSide === 'top') {
      let left = rect.left + rect.width / 2 - cardW / 2;
      left = Math.max(16, Math.min(left, window.innerWidth - cardW - 16));
      return { bottom: window.innerHeight - rect.top + gap + pad, left };
    }
    let left = rect.left + rect.width / 2 - cardW / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - cardW - 16));
    return { top: rect.top + rect.height + gap + pad, left };
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="wallet-wt-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - pad}
                y={rect.top - pad}
                width={rect.width + pad * 2}
                height={rect.height + pad * 2}
                rx={14}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(10,15,25,0.82)"
          mask="url(#wallet-wt-mask)"
        />
      </svg>

      <div className="absolute inset-0" />

      {/* Emerald/gold glow ring */}
      {rect && ready && (
        <motion.div
          key={`ring-${step.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute pointer-events-none"
          style={{
            top: rect.top - pad - 2,
            left: rect.left - pad - 2,
            width: rect.width + pad * 2 + 4,
            height: rect.height + pad * 2 + 4,
            borderRadius: 16,
            border: '2px solid rgba(107,175,141,0.25)',
            boxShadow: '0 0 16px rgba(107,175,141,0.08), 0 0 40px rgba(212,168,83,0.04)',
          }}
        />
      )}

      {/* Tooltip card — emerald + dark glass theme */}
      <AnimatePresence mode="wait">
        {ready && (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: step.tooltipSide === 'top' ? -16 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: step.tooltipSide === 'top' ? 10 : -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-10"
            style={{
              ...getTooltipStyle(),
              width: isMobile ? 'calc(100vw - 32px)' : 'min(400px, calc(100vw - 32px))',
            }}
          >
            <WalkthroughCard
              step={step}
              currentStep={currentStep}
              totalSteps={STEPS.length}
              isMobile={isMobile}
              isLastStep={isLastStep}
              onBack={handleBack}
              onNext={handleNext}
              onSkip={onComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
