/**
 * Read-only / not-advice disclaimer for the Halal Trading terminal (T1).
 * Distinct from EIM's "educational simulation" banner: this is the real-markets
 * product surface, but in v1 it is READ-ONLY (no orders) and shows ILLUSTRATIVE
 * sample data — both facts must be unmistakable.
 */

import { Info } from '@phosphor-icons/react';

export function TradingDisclaimer() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-2.5 mx-3 mt-3 rounded-xl bg-[rgba(212,168,83,0.06)] border border-[rgba(212,168,83,0.18)]">
      <Info size={16} weight="bold" className="text-[#D4A853] shrink-0 mt-0.5" />
      <p className="text-[11px] leading-relaxed text-[#7A7363]">
        <span className="text-[#D4A853] font-semibold">Read-only preview.</span>{' '}
        No orders yet. Prices and screening shown are <span className="text-[#7A7363] font-semibold">illustrative sample data</span> — not live quotes and not certified Shariah rulings. Compliance is screened to AAOIFI / DJIM / TASIS criteria, not an official index certification. Not investment advice.
      </p>
    </div>
  );
}
