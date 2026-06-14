/**
 * ProfileCompletionCard — progress bar + CTA for finishing a profile.
 */

import { motion } from 'framer-motion';
import { CaretRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ProfileCompletionCardProps {
  percentage: number;
  statusMessage: string;
  onComplete?: () => void;
}

export function ProfileCompletionCard({
  percentage,
  statusMessage,
  onComplete,
}: ProfileCompletionCardProps) {
  const getColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-[#D4A853]';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#1a2f3a] to-[#0d1f29] rounded-xl border border-[#D4A853]/20 p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#D4A853]/15 flex items-center justify-center">
          <CaretRight size={20} className="text-[#D4A853]" />
        </div>
        <div className="flex-1">
          <p className="text-white font-medium">Profile Completion</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#D4A853]/20 to-[#E8C97A]/10 border border-[#D4A853]/30">
          <span className="text-[#D4A853] font-bold">{percentage}%</span>
        </div>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
        <motion.div
          className={cn('h-full rounded-full', getColor())}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      <p className="text-white/60 text-sm mb-4">{statusMessage}</p>

      {percentage < 100 && onComplete && (
        <button
          onClick={onComplete}
          className="w-full min-h-[54px] px-[22px] py-[14px] rounded-lg bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] font-semibold text-sm hover:from-[#D4A853] hover:to-[#E8C97A] transition-all"
        >
          Complete Profile
        </button>
      )}
    </motion.div>
  );
}
