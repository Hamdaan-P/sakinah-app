/**
 * KYC Progress Bar
 * Gold gradient progress bar with step dots
 */

import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full px-4 py-3">
      {/* Step counter */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#7A7363] text-xs">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-[#D4A853] text-xs font-medium">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-1.5 rounded-full bg-[#10151F] overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= currentStep
                ? 'bg-[#D4A853]'
                : 'bg-[#10151F]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
