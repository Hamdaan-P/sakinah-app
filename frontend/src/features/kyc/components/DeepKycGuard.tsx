/**
 * Deep KYC Guard
 * Wraps gated routes — shows DeepKycModal if kyc_tier < 2
 */

import { useState } from 'react';
import { useKycStore } from '../stores/kyc.store';
import { DeepKycModal } from './DeepKycModal';
import { useLocation } from 'react-router-dom';
import { GATED_FEATURE_NAMES } from '../types/kyc.types';

interface DeepKycGuardProps {
  children: React.ReactNode;
  featureName?: string;
}

export function DeepKycGuard({ children, featureName }: DeepKycGuardProps) {
  const kycTier = useKycStore((s) => s.kycTier);
  const initialized = useKycStore((s) => s.initialized);
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);

  // While KYC store is loading, show the children (they'll be behind AuthGuard's loader anyway)
  if (!initialized) return <>{children}</>;

  // Tier 2 users pass through
  if (kycTier >= 2) return <>{children}</>;

  // Determine feature name from route if not provided
  const name = featureName || GATED_FEATURE_NAMES[location.pathname] || 'this feature';

  // If dismissed, show modal still as a floating overlay on top of children
  if (dismissed) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Show a blurred/dimmed background with the modal */}
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E16]">
        <DeepKycModal
          open={!dismissed}
          onClose={() => setDismissed(true)}
          featureName={name}
        />
      </div>
    </>
  );
}
