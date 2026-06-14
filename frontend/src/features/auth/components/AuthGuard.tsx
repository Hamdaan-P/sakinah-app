/**
 * Auth Guard Component
 * Mirrors Flutter's core/widgets/auth_guard.dart
 * Protects routes requiring authentication
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/stores/auth.store';
import { useKycStore } from '@/features/kyc/stores/kyc.store';
import { FiLock, FiLoader } from 'react-icons/fi';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Optional placeholder for guests */
  guestPlaceholder?: React.ReactNode;
  /** Show full-page login prompt instead of redirecting */
  showLoginPrompt?: boolean;
  /** Redirect path for unauthenticated users (default: /login) */
  redirectTo?: string;
  /** Skip KYC tier check (for /quick-kyc and /deep-kyc routes) */
  skipKycCheck?: boolean;
}

export function AuthGuard({
  children,
  guestPlaceholder,
  showLoginPrompt = false,
  redirectTo = '/login',
  skipKycCheck = false,
}: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useAuthStore((s) => s.state);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const { kycTier, initialized: kycInitialized, initialize: initKyc } = useKycStore();

  const isAuthenticated = state.type === 'authenticated';
  const isLoading = state.type === 'loading' || !isInitialized;

  // Initialize KYC store when authenticated
  useEffect(() => {
    if (isAuthenticated && !kycInitialized) {
      initKyc();
    }
  }, [isAuthenticated, kycInitialized, initKyc]);

  useEffect(() => {
    // If not authenticated and not showing login prompt, redirect
    if (isInitialized && !isAuthenticated && !showLoginPrompt && !guestPlaceholder) {
      navigate(redirectTo, { replace: true });
    }
  }, [isInitialized, isAuthenticated, showLoginPrompt, guestPlaceholder, navigate, redirectTo]);

  // Redirect to Quick KYC if Tier 0 (skip for KYC pages themselves)
  useEffect(() => {
    if (
      isAuthenticated &&
      kycInitialized &&
      !skipKycCheck &&
      kycTier === 0 &&
      location.pathname !== '/quick-kyc' &&
      location.pathname !== '/deep-kyc'
    ) {
      navigate('/quick-kyc', { replace: true });
    }
  }, [isAuthenticated, kycInitialized, kycTier, skipKycCheck, location.pathname, navigate]);

  // Show loading while checking auth state or KYC state
  if (isLoading || (isAuthenticated && !kycInitialized && !skipKycCheck)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <FiLoader className="w-8 h-8 text-[#D4A853] animate-spin" />
      </div>
    );
  }

  // User is authenticated - show protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show guest placeholder if provided
  if (guestPlaceholder) {
    return <>{guestPlaceholder}</>;
  }

  // Show full-page login prompt if requested
  if (showLoginPrompt) {
    return <LoginPromptWidget />;
  }

  // Default: return null (redirect will happen in useEffect)
  return null;
}

/**
 * Full-page login prompt widget
 * Mirrors Flutter's _LoginPromptWidget
 */
function LoginPromptWidget() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-950 to-black">
      <div className="max-w-md w-full mx-4 text-center">
        {/* Lock Icon */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-[#D4A853]/10 flex items-center justify-center">
          <FiLock className="w-12 h-12 text-[#D4A853]" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#D4A853] mb-4">
          Sign In Required
        </h1>

        {/* Description */}
        <p className="text-gray-400 mb-12">
          Please sign in to access this feature and unlock the full ZaryahPlus experience.
        </p>

        {/* Sign In Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full py-4 bg-[#D4A853] hover:bg-amber-400 text-black font-bold rounded-xl transition-colors mb-4"
        >
          Sign In / Sign Up
        </button>

        {/* Continue as Guest Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-[#D4A853]/70 hover:text-[#D4A853] transition-colors"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}

/**
 * Guest Guard - Redirects authenticated users away
 * Useful for login/signup pages
 */
interface GuestGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function GuestGuard({ children, redirectTo = '/' }: GuestGuardProps) {
  const navigate = useNavigate();
  const state = useAuthStore((s) => s.state);
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const isAuthenticated = state.type === 'authenticated';
  const isAnonymous = user?.isAnonymous === true;
  const isLoading = state.type === 'loading' || !isInitialized;

  useEffect(() => {
    // Allow anonymous users through (they're upgrading from demo → real account)
    if (isInitialized && isAuthenticated && !isAnonymous) {
      navigate(redirectTo, { replace: true });
    }
  }, [isInitialized, isAuthenticated, isAnonymous, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <FiLoader className="w-8 h-8 text-[#D4A853] animate-spin" />
      </div>
    );
  }

  // Allow anonymous users to see signup/login pages
  if (isAuthenticated && !isAnonymous) {
    return null;
  }

  return <>{children}</>;
}
