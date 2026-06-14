/**
 * Auth Store - Global authentication state management
 * Mirrors Flutter's features/auth/presentation/cubit/auth_cubit.dart
 * Uses Zustand for state management (replaces BLoC/Cubit)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { z } from 'zod';
import { auth, isFirebaseStubbed } from '@/config/firebase.config';
import { authService } from '@/features/auth/services/authService';
import type { AuthUser, AuthState } from '@/features/auth/types/auth.types';
import { getAuthErrorMessage } from '@/features/auth/types/auth.types';
import { ensureOwnPublicProfile } from '@/features/public-profile/services/publicProfileService';

// Phase 5 — what we're allowed to write to localStorage. Identity fields
// (id, email, emailVerified, providerId, isAnonymous) come from Firebase
// Auth's own IndexedDB on rehydrate via onAuthStateChanged() — persisting
// them here would be a tampering vector (a page extension could rewrite
// the localStorage entry and convince the UI it's a different user).
// Display fields are safe: they're already on-screen, the worst a
// tamper can do is show the wrong name/avatar for ~50ms before Firebase
// reconciles.
const persistedV1Schema = z.object({
  user: z
    .object({
      displayName: z.string().optional(),
      photoURL: z.string().optional(),
    })
    .nullable()
    .optional(),
});
type PersistedV1 = z.infer<typeof persistedV1Schema>;

interface AuthStore {
  // State
  user: AuthUser | null;
  state: AuthState;
  isInitialized: boolean;

  // Computed getters
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  error: () => string | null;

  // Actions - mirrors AuthCubit methods
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName?: string, referralCode?: string) => Promise<boolean>;
  signInAnonymously: () => Promise<boolean>;
  linkAnonymousWithEmail: (email: string, password: string, fullName?: string, referralCode?: string) => Promise<boolean>;
  linkAnonymousWithGoogle: (referralCode?: string) => Promise<boolean>;
  signInWithGoogle: (referralCode?: string) => Promise<boolean>;
  signInWithFacebook: () => Promise<boolean>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  changeEmail: (currentPassword: string, newEmail: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      state: { type: 'initial' },
      isInitialized: false,

      // Computed getters
      isAuthenticated: () => get().state.type === 'authenticated',
      isLoading: () => get().state.type === 'loading',
      error: () => {
        const state = get().state;
        return state.type === 'error' ? state.message : null;
      },

      // Initialize - sets up Firebase auth listener
      // Mirrors AuthCubit._initAuthListener and _checkExistingSession
      initialize: async () => {
        // Dev-only bypass: when Firebase is unconfigured (stubbed) in dev,
        // sign in a synthetic "dev" user so AuthGuard lets the UI mount.
        // Lets you browse backend-only features (Quran reader, Deep Dive,
        // X-Ray, Depth FAQs) without real Firebase credentials.
        if (isFirebaseStubbed && import.meta.env.DEV) {
          const devUser: AuthUser = {
            id: 'dev-stub-user',
            email: 'dev@local',
            emailVerified: true,
            displayName: 'Dev User',
            isAnonymous: false,
          };
          set({ user: devUser, state: { type: 'authenticated' }, isInitialized: true });
          console.warn('[AuthStore] Firebase stub mode — signed in as synthetic dev user.');
          return;
        }
        try {
          set({ state: { type: 'loading' } });

          // Set up auth state listener
          onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
              const user: AuthUser = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                emailVerified: firebaseUser.emailVerified,
                displayName: firebaseUser.displayName || undefined,
                photoURL: firebaseUser.photoURL || undefined,
                providerId: firebaseUser.providerData[0]?.providerId,
                isAnonymous: firebaseUser.isAnonymous,
              };
              set({ user, state: { type: 'authenticated' }, isInitialized: true });
              console.log('AuthStore: Valid session found:', user.email);
              // Fire-and-forget: materialize public_profiles mirror so this user
              // shows up in other people's Discover tab.
              ensureOwnPublicProfile(user.id);
            } else {
              set({ user: null, state: { type: 'unauthenticated' }, isInitialized: true });
              console.log('AuthStore: No valid session');
            }
          });

          // Initialize auth service
          await authService.initialize();
        } catch (error) {
          console.error('AuthStore: Initialization error:', error);
          set({ state: { type: 'unauthenticated' }, isInitialized: true });
        }
      },

      // Sign in with email/password
      // Mirrors AuthCubit.signIn
      signIn: async (email: string, password: string) => {
        try {
          set({ state: { type: 'loading' } });
          console.log('AuthStore: Attempting to sign in with email:', email);

          const success = await authService.signIn(email, password, true);

          if (success) {
            console.log('AuthStore: Login successful for:', email);
            set({ state: { type: 'authenticated' } });
            return true;
          } else {
            set({ state: { type: 'error', message: 'Invalid email or password. Please try again.' } });
            return false;
          }
        } catch (error: unknown) {
          console.error('AuthStore: Login error:', error);
          const firebaseError = error as { code?: string };
          let errorMessage = 'Sign in failed';

          // Parse Firebase Auth error messages - mirrors AuthCubit error handling
          const errorCode = firebaseError.code || '';
          if (errorCode.includes('invalid-credential') ||
              errorCode.includes('wrong-password') ||
              errorCode.includes('user-not-found')) {
            errorMessage = 'Invalid email or password';
          } else if (errorCode.includes('user-disabled')) {
            errorMessage = 'This account has been disabled';
          } else if (errorCode.includes('too-many-requests')) {
            errorMessage = 'Too many failed attempts. Please try again later';
          } else {
            errorMessage = getAuthErrorMessage(errorCode);
          }

          set({ state: { type: 'error', message: errorMessage } });
          return false;
        }
      },

      // Sign up
      // Mirrors AuthCubit.signUp
      signUp: async (email: string, password: string, fullName?: string, referralCode?: string) => {
        try {
          set({ state: { type: 'loading' } });
          console.log('AuthStore: Attempting to sign up with email:', email);

          const success = await authService.signUp(email, password, fullName, referralCode);

          if (success) {
            console.log('AuthStore: Signup successful:', email);
            set({ state: { type: 'authenticated' } });
            return true;
          } else {
            set({ state: { type: 'error', message: 'Sign up failed. Please try again.' } });
            return false;
          }
        } catch (error: unknown) {
          console.error('AuthStore: Signup error:', error);
          const firebaseError = error as { code?: string };
          const errorMessage = getAuthErrorMessage(firebaseError.code || '');
          set({ state: { type: 'error', message: errorMessage } });
          return false;
        }
      },

      // Anonymous sign in (for demo/preview)
      signInAnonymously: async () => {
        try {
          set({ state: { type: 'loading' } });
          const user = await authService.signInAnonymously();
          if (user) {
            set({ user, state: { type: 'authenticated' } });
            return true;
          }
          set({ state: { type: 'error', message: 'Anonymous sign-in failed.' } });
          return false;
        } catch (error: unknown) {
          console.error('AuthStore: Anonymous sign-in error:', error);
          const firebaseError = error as { code?: string };
          set({ state: { type: 'error', message: getAuthErrorMessage(firebaseError.code || '') } });
          return false;
        }
      },

      // Link anonymous account with email/password
      linkAnonymousWithEmail: async (email: string, password: string, fullName?: string, referralCode?: string) => {
        try {
          set({ state: { type: 'loading' } });
          const success = await authService.linkAnonymousWithEmail(email, password, fullName, referralCode);
          if (success) {
            set({ state: { type: 'authenticated' } });
            return true;
          }
          set({ state: { type: 'error', message: 'Failed to create account.' } });
          return false;
        } catch (error: unknown) {
          console.error('AuthStore: Link anonymous error:', error);
          const firebaseError = error as { code?: string };
          const errorMessage = getAuthErrorMessage(firebaseError.code || '');
          set({ state: { type: 'error', message: errorMessage } });
          return false;
        }
      },

      // Link anonymous account with Google
      linkAnonymousWithGoogle: async (referralCode?: string) => {
        try {
          set({ state: { type: 'loading' } });
          const success = await authService.linkAnonymousWithGoogle(referralCode);
          if (success) {
            set({ state: { type: 'authenticated' } });
            return true;
          }
          set({ state: { type: 'error', message: 'Google sign-in was cancelled.' } });
          return false;
        } catch (error: unknown) {
          console.error('AuthStore: Link anonymous with Google error:', error);
          const firebaseError = error as { code?: string };
          const errorMessage = getAuthErrorMessage(firebaseError.code || '');
          set({ state: { type: 'error', message: errorMessage } });
          return false;
        }
      },

      // Google sign in
      // Mirrors AuthCubit.signInWithGoogle
      signInWithGoogle: async (referralCode?: string) => {
        try {
          set({ state: { type: 'loading' } });
          console.log('AuthStore: Attempting Google sign-in');

          const success = await authService.signInWithGoogle(referralCode);

          if (success) {
            set({ state: { type: 'authenticated' } });
            return true;
          } else {
            set({ state: { type: 'error', message: 'Google sign-in was cancelled.' } });
            return false;
          }
        } catch (error: unknown) {
          console.error('AuthStore: Google sign-in error:', error);
          const firebaseError = error as { code?: string };
          const errorCode = (firebaseError.code || '').toLowerCase();
          let errorMessage = 'Google sign-in failed';

          // Detailed error handling - mirrors AuthCubit
          if (errorCode.includes('account-exists-with-different-credential')) {
            errorMessage = 'Account exists with a different sign-in method. Try email/password.';
          } else if (errorCode.includes('popup-closed') || errorCode.includes('cancel')) {
            errorMessage = 'Google sign-in was cancelled.';
          } else if (errorCode.includes('popup-blocked')) {
            errorMessage = 'Sign-in popup was blocked. Please allow popups.';
          } else if (errorCode.includes('invalid-referral-code')) {
            errorMessage = 'Invalid referral code. Please check and try again.';
          } else if (errorCode.includes('network')) {
            errorMessage = 'Network error. Please check your connection.';
          } else {
            errorMessage = getAuthErrorMessage(firebaseError.code || '');
          }

          set({ state: { type: 'error', message: errorMessage } });
          return false;
        }
      },

      // Facebook sign in
      // Mirrors AuthCubit.signInWithFacebook
      signInWithFacebook: async () => {
        try {
          set({ state: { type: 'loading' } });
          console.log('AuthStore: Attempting Facebook sign-in');

          const success = await authService.signInWithFacebook();

          if (success) {
            set({ state: { type: 'authenticated' } });
            return true;
          } else {
            set({ state: { type: 'error', message: 'Facebook sign-in was cancelled.' } });
            return false;
          }
        } catch (error: unknown) {
          console.error('AuthStore: Facebook sign-in error:', error);
          const firebaseError = error as { code?: string };
          const errorCode = (firebaseError.code || '').toLowerCase();
          let errorMessage = 'Facebook sign-in failed';

          if (errorCode.includes('account-exists-with-different-credential')) {
            errorMessage = 'Account exists with a different sign-in method. Try email/password.';
          } else if (errorCode.includes('cancel')) {
            errorMessage = 'Facebook sign-in was cancelled.';
          } else if (errorCode.includes('network')) {
            errorMessage = 'Network error. Please check your connection.';
          } else {
            errorMessage = getAuthErrorMessage(firebaseError.code || '');
          }

          set({ state: { type: 'error', message: errorMessage } });
          return false;
        }
      },

      // Sign out
      // Mirrors AuthCubit.signOut
      signOut: async () => {
        try {
          set({ state: { type: 'loading' } });
          await authService.signOut();
          set({ user: null, state: { type: 'unauthenticated' } });
          console.log('AuthStore: User signed out successfully');
        } catch (error) {
          console.error('AuthStore: Sign out error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
          set({ state: { type: 'error', message: errorMessage } });
        }
      },

      // Delete account
      // Mirrors AuthCubit.deleteAccount
      deleteAccount: async () => {
        try {
          set({ state: { type: 'loading' } });
          console.log('AuthStore: Attempting to delete user account');

          const success = await authService.deleteAccount();

          if (success) {
            console.log('AuthStore: Account deleted successfully');
            set({ user: null, state: { type: 'unauthenticated' } });
            return true;
          } else {
            set({ state: { type: 'error', message: 'Failed to delete account. Please try again.' } });
            return false;
          }
        } catch (error: unknown) {
          console.error('AuthStore: Delete account error:', error);
          const firebaseError = error as { code?: string };
          let errorMessage = 'Failed to delete account';

          if (firebaseError.code?.includes('auth')) {
            errorMessage = 'Authentication error during deletion';
          } else if (firebaseError.code?.includes('network')) {
            errorMessage = 'Network error. Please check your connection.';
          }

          set({ state: { type: 'error', message: errorMessage } });
          return false;
        }
      },

      // Reset password
      // Mirrors AuthCubit.resetPassword
      resetPassword: async (email: string) => {
        try {
          set({ state: { type: 'loading' } });

          const success = await authService.resetPassword(email);

          if (success) {
            set({ state: { type: 'passwordResetSent' } });
            return true;
          } else {
            set({ state: { type: 'error', message: 'Failed to send password reset email' } });
            return false;
          }
        } catch (error: unknown) {
          const firebaseError = error as { code?: string };
          const errorMessage = getAuthErrorMessage(firebaseError.code || '');
          set({ state: { type: 'error', message: errorMessage } });
          return false;
        }
      },

      // Change password
      // Mirrors AuthCubit.changePassword
      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          set({ state: { type: 'loading' } });
          console.log('AuthStore: Attempting to change password');

          const success = await authService.updatePassword(currentPassword, newPassword);

          if (success) {
            console.log('AuthStore: Password changed successfully');
            set({ state: { type: 'passwordChangeSuccess' } });
            return true;
          } else {
            set({ state: { type: 'error', message: 'Failed to change password. Please check your current password.' } });
            return false;
          }
        } catch (error: unknown) {
          console.error('AuthStore: Change password error:', error);
          const firebaseError = error as { code?: string };
          let errorMessage = 'Failed to change password';

          if (firebaseError.code?.includes('password')) {
            errorMessage = 'Invalid current password';
          } else if (firebaseError.code?.includes('network')) {
            errorMessage = 'Network error. Please check your connection.';
          } else {
            errorMessage = getAuthErrorMessage(firebaseError.code || '');
          }

          set({ state: { type: 'error', message: errorMessage } });
          return false;
        }
      },

      // Change email — sends a verification link to the new address.
      // Email only flips on Firebase once the user clicks that link.
      changeEmail: async (currentPassword: string, newEmail: string) => {
        try {
          set({ state: { type: 'loading' } });
          const success = await authService.updateEmail(currentPassword, newEmail);
          if (success) {
            set({ state: { type: 'emailChangeRequested' } });
            return true;
          }
          set({ state: { type: 'error', message: 'Failed to request email change. Please check your current password.' } });
          return false;
        } catch (error: unknown) {
          const firebaseError = error as { code?: string };
          const errorMessage = getAuthErrorMessage(firebaseError.code || '');
          set({ state: { type: 'error', message: errorMessage } });
          return false;
        }
      },

      // Resend the verification email to the user's current address.
      resendVerificationEmail: async () => {
        try {
          const success = await authService.resendVerificationEmail();
          if (success) {
            set({ state: { type: 'verificationEmailSent' } });
            return true;
          }
          return false;
        } catch (error: unknown) {
          const firebaseError = error as { code?: string };
          const errorMessage = getAuthErrorMessage(firebaseError.code || '');
          set({ state: { type: 'error', message: errorMessage } });
          return false;
        }
      },

      // Check auth status manually
      // Mirrors AuthCubit.checkAuthStatus
      checkAuthStatus: async () => {
        const user = auth.currentUser;
        if (user) {
          const authUser: AuthUser = {
            id: user.uid,
            email: user.email || '',
            emailVerified: user.emailVerified,
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
            isAnonymous: user.isAnonymous,
          };
          set({ user: authUser, state: { type: 'authenticated' } });
        } else {
          set({ user: null, state: { type: 'unauthenticated' } });
        }
      },

      // Clear error state.
      // A transient error (network blip, token-expired retry) shouldn't
      // sign-out a logged-in user — recover to authenticated when a user
      // is present, otherwise drop to unauthenticated.
      clearError: () => {
        const { state, user } = get();
        if (state.type !== 'error') return;
        set({ state: user ? { type: 'authenticated' } : { type: 'unauthenticated' } });
      },
    }),
    {
      name: 'zaryah-auth',
      version: 1,
      // Persist ONLY display fields. Identity (id, email, etc.) flows
      // from Firebase Auth's IndexedDB via onAuthStateChanged() on mount
      // — that's the actual source of truth. See the schema comment above.
      partialize: (state) => ({
        user: state.user
          ? {
              displayName: state.user.displayName,
              photoURL: state.user.photoURL,
            }
          : null,
      }),
      migrate: (persisted, version) => {
        // v0 (pre-versioning) wrote the entire AuthUser. Narrow it to v1
        // by dropping every field except displayName + photoURL. This
        // runs once on first load after upgrading the user's browser.
        if (version < 1 && persisted && typeof persisted === 'object') {
          const u = (persisted as { user?: Partial<AuthUser> | null }).user;
          return {
            user: u && typeof u === 'object'
              ? {
                  displayName: typeof u.displayName === 'string' ? u.displayName : undefined,
                  photoURL: typeof u.photoURL === 'string' ? u.photoURL : undefined,
                }
              : null,
          } satisfies PersistedV1;
        }
        return persisted;
      },
      merge: (persisted, current) => {
        // Zod-validate the persisted shape. If it's malformed (older
        // browser, manual tampering, etc.) drop it and start from a
        // clean unauthenticated state — onAuthStateChanged() will then
        // sign the user back in within a tick if Firebase Auth has them.
        const parsed = persistedV1Schema.safeParse(persisted);
        if (!parsed.success) {
          if (typeof console !== 'undefined') {
            console.warn('AuthStore: persisted state failed validation, discarding', parsed.error.issues);
          }
          return current;
        }
        const display = parsed.data.user;
        if (!display) return current;
        // Seed a placeholder `user` with empty identity fields so the
        // UI can render the cached avatar/name immediately. Consumers
        // that need a real id/email MUST gate on `isInitialized` — that
        // flag stays false until onAuthStateChanged() replaces this
        // placeholder with the real AuthUser from Firebase.
        return {
          ...current,
          user: {
            id: '',
            email: '',
            emailVerified: false,
            displayName: display.displayName,
            photoURL: display.photoURL,
          } satisfies AuthUser,
        };
      },
    }
  )
);

// Selectors for common use cases
export const selectIsAuthenticated = (state: AuthStore) => state.state.type === 'authenticated';
export const selectIsLoading = (state: AuthStore) => state.state.type === 'loading';
export const selectUser = (state: AuthStore) => state.user;
export const selectError = (state: AuthStore) => state.state.type === 'error' ? state.state.message : null;
