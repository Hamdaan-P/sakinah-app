/**
 * Persistent "SIMULATION" pill — rendered at the top of every EIM sim surface
 * (Portfolio, Simulator/Time Machine, Strategy Comparator, Scenario Lab,
 * Projection).
 *
 * Resolves build-spec P2-3.a threat-model row 1 + decision D-B
 * (build-spec-2026-05.md): the A7 amendment swaps the visible "Simulator" /
 * "Portfolio" labels between surfaces, so the label alone can't be trusted to
 * signal "this isn't real money." This pill is independent of the surface
 * label and always says the same thing, so there is no user-perceptible risk
 * of confusing the sim with real capital regardless of the A7 swap.
 *
 * Distinct from <DisclaimerBanner /> (which carries the §9 non-advice notice
 * on ALL EIM pages); this pill carries only the virtual-money distinction and
 * appears on sim surfaces only.
 */

import { Flask } from '@phosphor-icons/react';

export function SimulationModePill() {
  return (
    <div className="px-3 pt-3" data-testid="simulation-mode-pill">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(232,201,122,0.10)] border border-[rgba(212,168,83,0.35)]">
        <Flask size={14} weight="fill" className="text-[#E8C97A] shrink-0" />
        <span className="text-[11px] font-bold tracking-wide text-[#E8C97A]">
          SIMULATION
        </span>
        <span className="text-[11px] text-[#7A7363]">
          · Virtual capital · No real money
        </span>
      </div>
    </div>
  );
}
