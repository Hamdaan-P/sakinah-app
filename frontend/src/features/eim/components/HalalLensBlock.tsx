/**
 * Halal Lens block — the Islamic-principle commentary attached to a lesson step.
 * Bridges the Western concept (Mr Market, P/E, diversification) to Islamic principles
 * (sabr, tawakkul, risk-sharing).
 */

import type { HalalLensBlock as HalalLensType } from '../types/eim.types';

export function HalalLensBlock({ lens }: { lens: HalalLensType }) {
  return (
    <div className="rounded-xl border border-[rgba(123,158,137,0.25)] p-4 mt-3 bg-[rgba(42,157,111,0.06)]">
      <div className="text-[10px] uppercase tracking-widest text-[#7BB39A] font-semibold mb-2">
        🌿 {lens.title}
      </div>
      <p className="text-[13px] leading-relaxed text-[#C9D4E0]">{lens.body}</p>
    </div>
  );
}
