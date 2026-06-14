/**
 * Compact compliance badge for stock cards/rows. Shows the STRICTEST standard
 * a stock passes (passing the strictest implies passing the looser ones), or a
 * muted "Not compliant" pill. The full per-standard breakdown lives in
 * <CompliancePanel /> on the detail page.
 */

import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { passedStandards, type Stock } from '../types/trading.types';

export function ComplianceBadge({ stock }: { stock: Stock }) {
  const passed = passedStandards(stock);

  if (passed.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold bg-[rgba(232,67,147,0.10)] text-[#E84393] border border-[rgba(232,67,147,0.25)]">
        <XCircle size={11} weight="bold" />
        Not compliant
      </span>
    );
  }

  const strictest = passed[passed.length - 1];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold bg-[rgba(123,179,154,0.12)] text-[#7BB39A] border border-[rgba(123,179,154,0.30)]">
      <CheckCircle size={11} weight="bold" />
      {strictest}
    </span>
  );
}
