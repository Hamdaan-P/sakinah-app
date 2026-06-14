/**
 * Authentication Types
 * Mirrors Flutter app's auth models from auth_service_v2.dart and auth_state.dart
 */

// Auth status - matches Flutter's AuthStatus enum
export type AuthStatus =
  | 'initial'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

// Auth state - matches Flutter's AuthState freezed union
export type AuthState =
  | { type: 'initial' }
  | { type: 'loading' }
  | { type: 'authenticated' }
  | { type: 'unauthenticated' }
  | { type: 'error'; message: string }
  | { type: 'passwordResetSent' }
  | { type: 'passwordChangeSuccess' }
  | { type: 'emailChangeRequested' }
  | { type: 'verificationEmailSent' };

// Auth user - matches Flutter's AuthUser class
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
  providerId?: string;  // 'password' | 'google' | 'facebook'
  isAnonymous?: boolean;
}

// User profile in Firestore - matches Flutter's _createUserProfile
export interface UserProfile {
  // Basic auth fields
  id: string;
  email: string;
  full_name: string;
  name: string;
  photo_url?: string;
  photoUrl?: string;
  profile_image_url?: string;
  email_verified: boolean;
  auth_provider?: string;
  auth_providers: string[];
  created_at: Date;
  updated_at: Date;

  // KYC fields (2-tier system)
  kyc_tier: 0 | 1 | 2;
  kyc_status: 'none' | 'tier1_complete' | 'tier2_complete' | 'unverified' | 'pending' | 'verified';
  kyc_level: 'none' | 'basic' | 'full' | 'lite' | 'standard';
  tier1_completed_at?: Date;
  deep_kyc_completed_at?: Date;

  // Networking profile fields
  title: string;
  bio: string;
  city: string;
  country: string;
  category: string;
  tags: string[];
  interests: string[];
  level: 'Beginner' | 'Intermediate' | 'Expert';
  verified: boolean;
  online: boolean;
  lastSeen: Date;
  connectionsCount: number;
}

// Sign up data
export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  phoneNumber?: string;
  subscribeToNewsletter?: boolean;
}

// Sign in data
export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Password requirements check result
export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

// Password strength levels (0-4)
export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

// Auth error codes mapped to user-friendly messages
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Invalid email address',
  'auth/user-disabled': 'This account has been disabled',
  'auth/user-not-found': 'No account found with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/invalid-credential': 'Invalid email or password',
  'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
  'auth/credential-already-in-use': 'This account is already linked to another user. Please sign in instead.',
  'auth/provider-already-linked': 'This sign-in method is already linked to your account.',
  'auth/weak-password': 'Password should be at least 6 characters',
  'auth/too-many-requests': 'Too many attempts. Please try again later',
  'auth/network-request-failed': 'Network error. Check your connection',
  'auth/requires-recent-login': 'Please log in again to perform this action',
  'auth/popup-closed-by-user': 'Sign-in popup was closed',
  'auth/account-exists-with-different-credential': 'Account exists with a different sign-in method',
  'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups.',
  'auth/invalid-referral-code': 'Invalid referral code. Please check and try again.',
};

// Get user-friendly error message from Firebase error code
export function getAuthErrorMessage(code: string): string {
  return AUTH_ERROR_MESSAGES[code] || 'An error occurred. Please try again';
}
