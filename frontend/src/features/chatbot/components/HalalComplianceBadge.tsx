/**
 * HalalComplianceBadge
 * Shows halal/haram compliance status for a stock
 */

import { Check, X, Question } from '@phosphor-icons/react';

interface HalalComplianceBadgeProps {
  isHalal?: boolean;
}

export function HalalComplianceBadge({ isHalal }: HalalComplianceBadgeProps) {
  if (isHalal === true) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
        <Check size={12} />
        Halal
      </span>
    );
  }

  if (isHalal === false) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-red-500/30 text-red-400 bg-red-500/10">
        <X size={12} />
        Not Shariah Compliant
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-white/20 text-white/40 bg-white/5">
      <Question size={12} />
      Compliance Unknown
    </span>
  );
}
