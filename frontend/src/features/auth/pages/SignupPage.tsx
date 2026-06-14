/**
 * Signup Page
 * Mirrors Flutter's features/auth/presentation/pages/signup_modern.dart
 * Responsive desktop/mobile layouts with password requirements
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/core/stores/auth.store';
import { GuestGuard } from '../components/AuthGuard';
import { getInviteCode } from '../components/InviteGate';
import { SignupBrandPanel } from './components/SignupBrandPanel';
import { SignupForm, type SignupFormValues } from './components/SignupForm';

function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { signUp, signInWithGoogle, linkAnonymousWithEmail, linkAnonymousWithGoogle, state, clearError, user } = useAuthStore();
  const isLoading = state.type === 'loading';
  const error = state.type === 'error' ? state.message : null;

  // Navigate on successful auth → home (GuestGuard handles redirect for already-authenticated users)
  // For anonymous users upgrading from demo: after linking, they become non-anonymous,
  // and GuestGuard redirects them to '/'
  useEffect(() => {
    if (state.type === 'authenticated' && !user?.isAnonymous) {
      navigate('/');
    }
  }, [state.type, user?.isAnonymous, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const initialReferralCode = (() => {
    const fromLink = searchParams.get('ref') || searchParams.get('referral') || searchParams.get('invite') || getInviteCode();
    return fromLink ? fromLink.trim().toUpperCase() : null;
  })();

  const onSubmit = async (data: SignupFormValues) => {
    // If user is anonymous (from demo), link instead of creating new account
    if (user?.isAnonymous) {
      await linkAnonymousWithEmail(data.email, data.password, data.fullName, data.referralCode);
    } else {
      await signUp(data.email, data.password, data.fullName, data.referralCode);
    }
  };

  const handleGoogleSignUp = async (referralCode: string | undefined) => {
    // If user is anonymous (from demo), link instead of creating new account
    if (user?.isAnonymous) {
      await linkAnonymousWithGoogle(referralCode);
    } else {
      await signInWithGoogle(referralCode);
    }
  };

  return (
    <GuestGuard>
      <div className="min-h-screen bg-gray-950 flex">
        <SignupBrandPanel />
        <SignupForm
          isLoading={isLoading}
          error={error}
          initialReferralCode={initialReferralCode}
          onSubmit={onSubmit}
          onGoogleSignUp={handleGoogleSignUp}
        />
      </div>
    </GuestGuard>
  );
}

export default SignupPage;
