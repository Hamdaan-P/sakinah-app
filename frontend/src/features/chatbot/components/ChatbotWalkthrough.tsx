/**
 * Chatbot Walkthrough — First-visit guided tour for the AI chat page
 * Highlights companion selector, chat input, insights, and explains
 * Raya + the 11 Sahaba/Sahabiyat/Imam companions.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkle,
  UsersThree,
  PaperPlaneRight,
  Brain,
  ArrowRight,
  ArrowLeft,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

interface WalkthroughStep {
  id: string;
  tourTarget: string;
  /** Mobile-specific target override */
  tourTargetMobile?: string;
  icon: Icon;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  description: string;
  tooltipSide: 'bottom' | 'top' | 'right';
}

const STEPS: WalkthroughStep[] = [
  {
    id: 'welcome-chat',
    tourTarget: 'chat-empty-state',
    icon: Sparkle,
    iconColor: '#4FB892',
    iconBg: 'rgba(79,184,146,0.15)',
    title: 'This is Raya',
    subtitle: 'Your Islamic soul companion',
    description:
      "Raya is more than a chatbot. Raya remembers your past conversations, picks up on how you're feeling, and responds with wisdom grounded in the Quran and Sunnah. Ask anything — about life, faith, finances, relationships, or just talk. Raya is here for you.",
    tooltipSide: 'bottom',
  },
  {
    id: 'companions',
    tourTarget: 'chat-companion-desktop',
    tourTargetMobile: 'chat-companion',
    icon: UsersThree,
    iconColor: '#D4A853',
    iconBg: 'rgba(212,168,83,0.15)',
    title: 'Switch Companions',
    subtitle: '12 voices, one Ummah',
    description:
      "Tap here to switch between 12 AI companions. The Sahaba — Abu Bakr, Umar, Uthman, Ali. The Sahabiyat — Khadijah, Aisha, Fatimah, Asma. And the four great Imams — Abu Hanifa, Malik, Shafi'i, and Ahmad ibn Hanbal. Each one speaks in their own voice and draws from their own legacy.",
    tooltipSide: 'bottom',
  },
  {
    id: 'input',
    tourTarget: 'chat-input',
    icon: PaperPlaneRight,
    iconColor: '#E8C97A',
    iconBg: 'rgba(232,201,122,0.15)',
    title: 'Start a Conversation',
    subtitle: 'Ask anything',
    description:
      "Type your message here — or tap one of the quick suggestions above. You can ask about Islamic rulings, get emotional support, discuss your finances, or just have a conversation. Raya and the companions respond in real-time with streaming text, so it feels natural.",
    tooltipSide: 'top',
  },
  {
    id: 'insights',
    tourTarget: 'chat-insights',
    icon: Brain,
    iconColor: '#A78BFA',
    iconBg: 'rgba(167,139,250,0.15)',
    title: 'Your Insights',
    subtitle: 'Learns as you talk',
    description:
      "Over time, Raya tracks your mood patterns, identifies recurring thoughts, and builds a picture of your emotional journey. Tap here to see your insights — mood trends, self-talk patterns, relationship dynamics, and growth areas. It's like having a soul mirror.",
    tooltipSide: 'bottom',
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getRect(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function scrollToTarget(target: string) {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
}

interface ChatbotWalkthroughProps {
  onComplete: () => void;
}

export function ChatbotWalkthrough({ onComplete }: ChatbotWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1280);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1280);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const step = STEPS[currentStep];
  const target = (isMobile && step.tourTargetMobile) || step.tourTarget;
  const pad = 10;

  useEffect(() => {
    setReady(false);
    setRect(null);
    scrollToTarget(target);

    const t = setTimeout(() => {
      setRect(getRect(target));
      setReady(true);
    }, 400);
    return () => clearTimeout(t);
  }, [currentStep, target]);

  useEffect(() => {
    if (!ready) return;
    const update = () => setRect(getRect(target));
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [ready, target]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
    else onComplete();
  }, [currentStep, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const isLastStep = currentStep === STEPS.length - 1;
  const StepIcon = step.icon;
  const hasSpotlight = !!rect;

  const getTooltipStyle = (): React.CSSProperties => {
    if (!rect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    const cardW = isMobile ? window.innerWidth - 32 : 380;
    const gap = 14;

    if (step.tooltipSide === 'top') {
      let left = rect.left + rect.width / 2 - cardW / 2;
      left = Math.max(16, Math.min(left, window.innerWidth - cardW - 16));
      return { bottom: window.innerHeight - rect.top + gap + pad, left };
    }
    if (step.tooltipSide === 'right' && !isMobile) {
      return {
        top: Math.max(16, rect.top - 10),
        left: Math.min(rect.left + rect.width + gap + pad, window.innerWidth - cardW - 16),
      };
    }
    // bottom (default + mobile fallback for 'right')
    let left = rect.left + rect.width / 2 - cardW / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - cardW - 16));
    return { top: rect.top + rect.height + gap + pad, left };
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* SVG overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="chat-wt-mask">
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
        <rect
          width="100%"
          height="100%"
          fill="rgba(10,15,25,0.82)"
          mask="url(#chat-wt-mask)"
        />
      </svg>

      <div className="absolute inset-0" />

      {/* Gold glow ring */}
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
            border: '2px solid rgba(79,184,146,0.45)',
            boxShadow: '0 0 24px rgba(79,184,146,0.2), 0 0 60px rgba(79,184,146,0.08)',
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
            className="absolute z-10"
            style={{
              ...getTooltipStyle(),
              ...(isMobile ? { left: 16, right: 16, width: 'auto' } : { width: 'min(380px, calc(100vw - 32px))' }),
            }}
          >
            <div
              className="relative rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(10,14,22,0.92), rgba(15,23,36,0.95))',
                border: '1px solid rgba(79,184,146,0.2)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(79,184,146,0.1)',
              }}
            >
              {/* Accent glow line */}
              <div
                className="h-[2px] w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${step.iconColor}, transparent)`,
                }}
              />

              <div className={isMobile ? 'p-4' : 'p-5'}>
                {/* Skip */}
                <button
                  onClick={onComplete}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-medium text-[#7A7363] hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                  Skip tour
                </button>

                {/* Icon + step counter row */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${step.iconBg}, transparent)`,
                      border: `1px solid ${step.iconColor}30`,
                    }}
                  >
                    <StepIcon size={22} weight="duotone" style={{ color: step.iconColor }} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-white leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-[#4FB892]">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3" />

                <p className="text-[13px] text-[#C0CAD8] leading-relaxed mb-5">
                  {step.description}
                </p>

                <div className="flex items-center justify-between">
                  {/* Step dots — teal themed */}
                  <div className="flex items-center gap-2">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className="transition-all duration-300"
                        style={{
                          width: i === currentStep ? 20 : 8,
                          height: 4,
                          borderRadius: 2,
                          background:
                            i === currentStep
                              ? '#4FB892'
                              : i < currentStep
                                ? 'rgba(79,184,146,0.4)'
                                : 'rgba(255,255,255,0.08)',
                        }}
                      />
                    ))}
                    <span className="text-[10px] text-white/30 ml-1">
                      {currentStep + 1}/{STEPS.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentStep > 0 && (
                      <button
                        onClick={handleBack}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#7A7363] hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      >
                        <ArrowLeft size={11} weight="bold" />
                        Back
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        background: isLastStep
                          ? 'linear-gradient(135deg, #4FB892, #4A9FD9)'
                          : 'rgba(79,184,146,0.12)',
                        color: isLastStep ? '#fff' : '#4FB892',
                        border: isLastStep ? 'none' : '1px solid rgba(79,184,146,0.2)',
                        boxShadow: isLastStep ? '0 4px 16px rgba(79,184,146,0.3)' : 'none',
                      }}
                    >
                      {isLastStep ? 'Start Chatting' : 'Next'}
                      <ArrowRight size={13} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
