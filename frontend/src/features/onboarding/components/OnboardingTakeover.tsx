/**
 * Full-screen takeover that hosts Stages B/C/D once Stage A's CTA has
 * flipped the onboarding stage. Renders above MainLayout (incl. its
 * BottomNavBar/sidebar) on a fixed z-index. Returns null for any stage
 * that is not part of the takeover, so DashboardPage underneath stays
 * visible the rest of the time.
 */

import { Starfield } from './Starfield';
import { StageBRayaWelcome } from './StageBRayaWelcome';
import { StageCShukrInvite } from './StageCShukrInvite';
import { StageDRayaNames } from './StageDRayaNames';
import { shouldShowTakeover, useOnboardingStore } from '../stores/onboarding.store';

export function OnboardingTakeover() {
  const stage = useOnboardingStore((s) => s.stage);

  if (!shouldShowTakeover(stage)) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to ZaryahPlus"
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{ backgroundColor: '#06080D' }}
    >
      <Starfield />
      {stage === 'b' && <StageBRayaWelcome />}
      {stage === 'c' && <StageCShukrInvite />}
      {stage === 'd' && <StageDRayaNames />}
    </div>
  );
}
