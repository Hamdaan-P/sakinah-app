/**
 * ThinkingPanel
 * Multi-step processing panel matching the Flutter app design.
 * Shows animated progress steps while Raya processes a request.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkle, Scales, BookOpen, Star, UserCircle,
  ChartLineUp, ShieldCheck, ChartBar, Brain,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ProcessingStep {
  label: string;
  tag: string;
  tagColor: string;
  icon: React.ReactNode;
}

const KNOWLEDGE_STEPS: ProcessingStep[] = [
  {
    label: 'Analyzing Islamic jurisprudence from 4 major schools',
    tag: 'Fiqh Matrix',
    tagColor: 'bg-[#D4A853]/90 text-black',
    icon: <Scales size={16} weight="fill" className="text-[#D4A853]" />,
  },
  {
    label: 'Processing Quran and authoritative Hadith references',
    tag: 'Quran + Hadith Index',
    tagColor: 'bg-emerald-600/80 text-white',
    icon: <BookOpen size={16} weight="fill" className="text-emerald-400" />,
  },
  {
    label: "Consulting contemporary Islamic scholars' insights",
    tag: 'Scholar Network',
    tagColor: 'bg-[#D4A853]/90 text-black',
    icon: <Star size={16} weight="fill" className="text-purple-400" />,
  },
  {
    label: 'Personalizing guidance based on your context',
    tag: 'Context Engine',
    tagColor: 'bg-blue-600/80 text-white',
    icon: <UserCircle size={16} weight="fill" className="text-blue-400" />,
  },
];

const STOCK_STEPS: ProcessingStep[] = [
  {
    label: 'Fetching real-time market data',
    tag: 'Market Data',
    tagColor: 'bg-blue-600/80 text-white',
    icon: <ChartLineUp size={16} weight="fill" className="text-blue-400" />,
  },
  {
    label: 'Running Shariah compliance screening',
    tag: 'Halal Screener',
    tagColor: 'bg-emerald-600/80 text-white',
    icon: <ShieldCheck size={16} weight="fill" className="text-emerald-400" />,
  },
  {
    label: 'Analyzing fundamentals and technicals',
    tag: 'Analysis Engine',
    tagColor: 'bg-[#D4A853]/90 text-black',
    icon: <ChartBar size={16} weight="fill" className="text-[#D4A853]" />,
  },
  {
    label: 'Generating personalized insights',
    tag: 'AI Insights',
    tagColor: 'bg-purple-600/80 text-white',
    icon: <Brain size={16} weight="fill" className="text-purple-400" />,
  },
];

interface ThinkingPanelProps {
  content: string;
  isStreaming?: boolean;
}

/** Check if thinking content has real tool execution steps (not a placeholder) */
// eslint-disable-next-line react-refresh/only-export-components -- small colocated helper kept with its component for cohesion; pulling it out adds a one-line module without any reuse benefit
export function hasToolSteps(content: string): boolean {
  return content.includes('⏳') || content.includes('✅');
}

export function ThinkingPanel({ content, isStreaming }: ThinkingPanelProps) {
  const isStock = content === 'Analyzing your query...' || hasToolSteps(content);
  const steps = isStock ? STOCK_STEPS : KNOWLEDGE_STEPS;

  const [activeStep, setActiveStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  // Animate through steps while streaming
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((s) => (s < steps.length - 1 ? s + 1 : s));
          return 0;
        }
        return prev + 3;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isStreaming, steps.length]);

  // If real tool events come in, map them to step progression
  useEffect(() => {
    if (!hasToolSteps(content)) return;
    const doneCount = (content.match(/✅/g) || []).length;
    if (doneCount > 0) {
      setActiveStep(Math.min(doneCount, steps.length - 1));
      setStepProgress(0);
    }
  }, [content, steps.length]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-[#D4A853]/20 bg-[#1a2535] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
          <Sparkle size={18} weight="fill" className="text-[#D4A853]" />
          <span className="text-sm font-bold text-white">Processing your request...</span>
        </div>

        {/* Steps */}
        <div className="px-3 pb-3 space-y-1">
          {steps.map((step, i) => {
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            const pct = isActive ? stepProgress : isDone ? 100 : 0;

            return (
              <div
                key={i}
                className={cn(
                  'rounded-lg px-3 py-2.5 transition-colors duration-300',
                  isActive ? 'bg-[#0F141F]/80' : 'bg-transparent',
                )}
              >
                <div className="flex items-start gap-2.5">
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                      isActive || isDone ? 'bg-[#10151F]' : 'bg-[#0F141F]/60',
                    )}
                  >
                    {step.icon}
                  </div>

                  {/* Label + tag */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-xs leading-snug transition-colors',
                        isActive || isDone ? 'text-white/80' : 'text-white/35',
                      )}
                    >
                      {step.label}
                    </p>
                    <span
                      className={cn(
                        'inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold',
                        step.tagColor,
                      )}
                    >
                      {step.tag}
                    </span>
                  </div>

                  {/* Percentage */}
                  <span
                    className={cn(
                      'text-xs font-semibold shrink-0 mt-0.5 tabular-nums',
                      isActive ? 'text-[#D4A853]' : isDone ? 'text-emerald-400' : 'text-white/25',
                    )}
                  >
                    {Math.round(pct)}%
                  </span>
                </div>

                {/* Progress bar (active step only) */}
                {isActive && (
                  <div className="mt-2 h-1 rounded-full bg-[#10151F] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#38BDF8]"
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.25, ease: 'linear' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
