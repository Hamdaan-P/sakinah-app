/**
 * Authentication Service
 * Mirrors Flutter app's AuthServiceV2 from shared/services/auth_service_v2.dart
 * Handles Firebase Auth, Google/Facebook OAuth, user profile creation in Firestore
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signInAnonymously as firebaseSignInAnonymously,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  getAdditionalUserInfo,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

// On Capacitor native (Android/iOS), Google sign-in goes through the
// @capacitor-firebase/authentication plugin which uses the platform's native
// Google account picker. Then we feed the resulting idToken into the Firebase
// Web SDK with signInWithCredential so the rest of the app sees a normal
// firebase/auth User. signInWithPopup does not work inside the Capacitor
// WebView (the OAuth redirect can't return), so popup is web-only.
const isNativeFirebase = (): boolean => Capacitor.isNativePlatform();
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase.config';
import { BACKEND_URL, authGet, authPost } from '@/lib/api';

// Dev-only diagnostic logger. Stripped at build time in production so we don't
// leak auth flow details (or PII like email/uid) to user consoles.
const dlog: (...args: unknown[]) => void = import.meta.env.DEV
  ? console.log.bind(console, '[AuthService]')
  : () => {};
import type { AuthUser, AuthStatus } from '../types/auth.types';

// P2.6 — replaced storageService.ts (which used btoa() to "obfuscate"
// auth tokens in localStorage). Auth tokens now live exclusively in
// Firebase SDK's IndexedDB persistence + on-demand getIdToken().
// We keep only the two prefs we actually need:
const PREF_REMEMBER_ME = 'zaryah_remember_me';

function saveRememberMe(value: boolean): void {
  try {
    localStorage.setItem(PREF_REMEMBER_ME, JSON.stringify(value));
  } catch { /* localStorage disabled (private mode etc) — non-fatal */ }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(PREF_REMEMBER_ME);
    // Best-effort: clean up any legacy keys still hanging around from the
    // pre-P2.6 storageService for users with stale sessions.
    localStorage.removeItem('zaryah_auth_token');
    localStorage.removeItem('zaryah_user_data');
    localStorage.removeItem('zaryah_session_timestamp');
  } catch { /* non-fatal */ }
}

class AuthService {
  private _currentUser: AuthUser | null = null;
  private _status: AuthStatus = 'initial';
  private _authUnsubscribe: (() => void) | null = null;

  get currentUser(): AuthUser | null {
    return this._currentUser;
  }

  get status(): AuthStatus {
    return this._status;
  }

  get isAuthenticated(): boolean {
    return this._currentUser !== null && this._status === 'authenticated';
  }

  /**
   * Initialize and check for existing session
   * Sets up auth state listener
   */
  async initialize(): Promise<void> {
    try {
      this._status = 'loading';

      // Check current user immediately
      const user = auth.currentUser;
      if (user) {
        this._currentUser = this.mapFirebaseUser(user);
        this._status = 'authenticated';
        dlog('Existing session found');
      } else {
        this._status = 'unauthenticated';
        dlog('No existing session');
      }

      // Set up auth state listener
      this._authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          this._currentUser = this.mapFirebaseUser(user);
          this._status = 'authenticated';
          // Backfill any missing profile fields (e.g. referral_code for older accounts)
          this.ensureUserProfile(user, user.displayName || undefined, user.providerData?.[0]?.providerId || 'password', false).catch(() => {});
        } else {
          this._currentUser = null;
          this._status = 'unauthenticated';
        }
      });
    } catch (error) {
      console.error('AuthService: Initialization error:', error);
      this._status = 'unauthenticated';
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string, rememberMe = true): Promise<boolean> {
    try {
      this._status = 'loading';
      dlog('Signing in user');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        this._currentUser = this.mapFirebaseUser(userCredential.user);
        this._status = 'authenticated';

        // Save remember me preference
        if (rememberMe) {
          saveRememberMe(true);
        }

        // Ensure user profile exists with all required fields
        await this.ensureUserProfile(
          userCredential.user,
          userCredential.user.displayName || undefined,
          'password',
          false
        );

        dlog('Sign in successful');
        return true;
      }

      this._status = 'unauthenticated';
      return false;
    } catch (error: unknown) {
      this._status = 'unauthenticated';
      const firebaseError = error as { code?: string; message?: string };
      console.error('AuthService: Sign in error:', firebaseError.code, firebaseError.message);
      throw error;
    }
  }

  /**
   * Sign up new user
   */
  async signUp(email: string, password: string, name?: string, referralCode?: string): Promise<boolean> {
    try {
      this._status = 'loading';
      dlog('Signing up user');

      // Create auth user first (so we have auth context for Firestore queries)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        const user = userCredential.user;

        // Update display name if provided
        if (name && name.trim()) {
          await updateProfile(user, { displayName: name });
        }

        // Lookup referral code AFTER auth (so Firestore rules allow the query)
        const normalizedReferralCode = this.normalizeReferralCode(referralCode);
        let referredByUserId: string | null = null;
        if (normalizedReferralCode) {
          try {
            referredByUserId = await this.lookupUserIdByReferralCode(normalizedReferralCode);
          } catch (err) {
            console.warn('AuthService: Referral lookup failed (non-blocking):', err);
          }
        }

        // Create user profile in Firestore
        await this.createUserProfile(
          user,
          name,
          'password',
          false,
          normalizedReferralCode || undefined,
          referredByUserId || undefined,
        );

        this._currentUser = this.mapFirebaseUser(user);
        this._status = 'authenticated';

        try {
          await sendEmailVerification(user);
          dlog('Verification email sent');
        } catch (err) {
          console.warn('AuthService: sendEmailVerification failed (non-blocking):', err);
        }

        dlog('Sign up successful');
        return true;
      }

      this._status = 'unauthenticated';
      return false;
    } catch (error: unknown) {
      this._status = 'unauthenticated';
      const firebaseError = error as { code?: string; message?: string };
      console.error('AuthService: Sign up error:', firebaseError.code, firebaseError.message);
      throw error;
    }
  }

  /**
   * Sign in with Google. Web uses signInWithPopup; Capacitor native uses the
   * @capacitor-firebase/authentication plugin to get an idToken from the
   * native Google account picker, then feeds it into the Web SDK via
   * signInWithCredential so the rest of the app sees a normal firebase/auth
   * User (auth.currentUser, onAuthStateChanged, etc).
   */
  async signInWithGoogle(referralCode?: string): Promise<boolean> {
    try {
      this._status = 'loading';
      dlog('Starting Google sign-in (native=' + Capacitor.isNativePlatform() + ')');

      let userCredential: UserCredential;

      if (isNativeFirebase()) {
        const result = await FirebaseAuthentication.signInWithGoogle({
          scopes: ['email', 'profile'],
        });
        const idToken = result.credential?.idToken;
        if (!idToken) {
          throw new Error('Google sign-in returned no idToken');
        }
        const credential = GoogleAuthProvider.credential(idToken);
        userCredential = await signInWithCredential(auth, credential);
      } else {
        const googleProvider = new GoogleAuthProvider();
        googleProvider.addScope('email');
        googleProvider.addScope('profile');
        userCredential = await signInWithPopup(auth, googleProvider);
      }

      const user = userCredential.user;
      if (!user) {
        this._status = 'unauthenticated';
        return false;
      }

      // Lookup referral code AFTER auth (so Firestore rules allow the query)
      const normalizedReferralCode = this.normalizeReferralCode(referralCode);
      let referredByUserId: string | null = null;
      if (normalizedReferralCode) {
        try {
          referredByUserId = await this.lookupUserIdByReferralCode(normalizedReferralCode);
        } catch (err) {
          console.warn('AuthService: Referral lookup failed (non-blocking):', err);
        }
      }

      // Ensure user profile exists
      await this.ensureUserProfile(
        user,
        user.displayName || undefined,
        'google',
        true,
        normalizedReferralCode || undefined,
        referredByUserId || undefined,
      );

      this._currentUser = this.mapFirebaseUser(user);
      this._status = 'authenticated';

      saveRememberMe(true);

      const additionalInfo = getAdditionalUserInfo(userCredential);
      const isNewUser = additionalInfo?.isNewUser ?? false;
      dlog('Google sign-in successful (newUser=' + isNewUser + ')');
      return true;
    } catch (error: unknown) {
      this._status = 'unauthenticated';
      const firebaseError = error as { code?: string; message?: string };
      console.error('AuthService: Google sign-in error:', firebaseError.code);
      throw error;
    }
  }

  /**
   * Sign in with Facebook (web popup)
   */
  async signInWithFacebook(): Promise<boolean> {
    try {
      this._status = 'loading';
      dlog('Starting Facebook sign-in');

      const facebookProvider = new FacebookAuthProvider();
      facebookProvider.addScope('email');
      facebookProvider.addScope('public_profile');

      const userCredential = await signInWithPopup(auth, facebookProvider);

      const user = userCredential.user;
      if (!user) {
        this._status = 'unauthenticated';
        return false;
      }

      // Ensure user profile exists
      await this.ensureUserProfile(user, user.displayName || undefined, 'facebook', true);

      this._currentUser = this.mapFirebaseUser(user);
      this._status = 'authenticated';

      saveRememberMe(true);

      dlog('Facebook sign-in successful');
      return true;
    } catch (error: unknown) {
      this._status = 'unauthenticated';
      const firebaseError = error as { code?: string; message?: string };
      console.error('AuthService: Facebook sign-in error:', firebaseError.code);
      throw error;
    }
  }

  /**
   * Sign in anonymously (for demo/preview mode)
   * Creates a real Firebase user with isAnonymous=true
   */
  async signInAnonymously(): Promise<AuthUser | null> {
    try {
      this._status = 'loading';
      dlog('Starting anonymous sign-in');

      const userCredential = await firebaseSignInAnonymously(auth);
      const user = userCredential.user;
      if (!user) {
        this._status = 'unauthenticated';
        return null;
      }

      // Create minimal Firestore profile for the anonymous user
      await this.ensureUserProfile(user, undefined, 'anonymous', false);

      this._currentUser = this.mapFirebaseUser(user);
      this._status = 'authenticated';

      dlog('Anonymous sign-in successful');
      return this._currentUser;
    } catch (error: unknown) {
      this._status = 'unauthenticated';
      const firebaseError = error as { code?: string; message?: string };
      console.error('AuthService: Anonymous sign-in error:', firebaseError.code);
      throw error;
    }
  }

  /**
   * Link anonymous account with email/password credentials
   * Preserves the anonymous uid so all Firestore data carries over
   */
  async linkAnonymousWithEmail(
    email: string,
    password: string,
    name?: string,
    referralCode?: string,
  ): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user || !user.isAnonymous) return false;

      this._status = 'loading';
      dlog('Linking anonymous account with email');

      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(user, credential);

      if (name && name.trim()) {
        await updateProfile(result.user, { displayName: name });
      }

      // Lookup referral
      const normalizedReferralCode = this.normalizeReferralCode(referralCode);
      let referredByUserId: string | null = null;
      if (normalizedReferralCode) {
        try {
          referredByUserId = await this.lookupUserIdByReferralCode(normalizedReferralCode);
        } catch (err) {
          console.warn('AuthService: Referral lookup failed (non-blocking):', err);
        }
      }

      // Update Firestore profile — upgrades the anonymous doc in place
      const docRef = doc(db, 'users', result.user.uid);
      await setDoc(docRef, {
        email: result.user.email,
        full_name: name || '',
        name: name || '',
        auth_provider: 'password',
        auth_providers: ['password'],
        updated_at: serverTimestamp(),
        ...(normalizedReferralCode ? { referred_by_code: normalizedReferralCode } : {}),
        ...(referredByUserId ? {
          referred_by_user_id: referredByUserId,
          referral_status: 'pending_onboarding',
          referral_reward_granted: false,
        } : {}),
      }, { merge: true });

      this._currentUser = this.mapFirebaseUser(result.user);
      this._status = 'authenticated';

      dlog('Anonymous account linked successfully');
      return true;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error('AuthService: Link anonymous error:', firebaseError.code);

      // If email already in use, the anonymous data is orphaned — caller should handle
      if (firebaseError.code === 'auth/credential-already-in-use' || firebaseError.code === 'auth/email-already-in-use') {
        this._status = 'unauthenticated';
      }
      throw error;
    }
  }

  /**
   * Link anonymous account with Google (popup)
   * Preserves the anonymous uid so all Firestore data carries over
   */
  async linkAnonymousWithGoogle(referralCode?: string): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user || !user.isAnonymous) return false;

      this._status = 'loading';
      dlog('Linking anonymous account with Google (native=' + Capacitor.isNativePlatform() + ')');

      let result: UserCredential;
      if (isNativeFirebase()) {
        const native = await FirebaseAuthentication.signInWithGoogle({
          scopes: ['email', 'profile'],
        });
        const idToken = native.credential?.idToken;
        if (!idToken) {
          throw new Error('Google sign-in returned no idToken');
        }
        const credential = GoogleAuthProvider.credential(idToken);
        result = await linkWithCredential(user, credential);
      } else {
        const googleProvider = new GoogleAuthProvider();
        googleProvider.addScope('email');
        googleProvider.addScope('profile');
        result = await linkWithPopup(user, googleProvider);
      }

      // Lookup referral
      const normalizedReferralCode = this.normalizeReferralCode(referralCode);
      let referredByUserId: string | null = null;
      if (normalizedReferralCode) {
        try {
          referredByUserId = await this.lookupUserIdByReferralCode(normalizedReferralCode);
        } catch (err) {
          console.warn('AuthService: Referral lookup failed (non-blocking):', err);
        }
      }

      // Update Firestore profile
      const docRef = doc(db, 'users', result.user.uid);
      await setDoc(docRef, {
        email: result.user.email,
        full_name: result.user.displayName || '',
        name: result.user.displayName || '',
        photo_url: result.user.photoURL,
        photoUrl: result.user.photoURL,
        profile_image_url: result.user.photoURL,
        auth_provider: 'google',
        auth_providers: ['google'],
        updated_at: serverTimestamp(),
        ...(normalizedReferralCode ? { referred_by_code: normalizedReferralCode } : {}),
        ...(referredByUserId ? {
          referred_by_user_id: referredByUserId,
          referral_status: 'pending_onboarding',
          referral_reward_granted: false,
        } : {}),
      }, { merge: true });

      this._currentUser = this.mapFirebaseUser(result.user);
      this._status = 'authenticated';

      saveRememberMe(true);
      dlog('Anonymous account linked with Google');
      return true;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error('AuthService: Link anonymous with Google error:', firebaseError.code);

      if (firebaseError.code === 'auth/credential-already-in-use') {
        this._status = 'unauthenticated';
      }
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      dlog('Signing out user');

      // Clear local storage
      clearStorage();

      // Native plugin keeps its own session (Google account picker remembers
      // the last account); sign it out so next sign-in shows the picker.
      if (isNativeFirebase()) {
        try { await FirebaseAuthentication.signOut(); } catch { /* ignore */ }
      }

      await firebaseSignOut(auth);

      this._currentUser = null;
      this._status = 'unauthenticated';

      dlog('Sign out successful');
    } catch (error) {
      console.error('AuthService: Sign out error:', error);
    }
  }

  /**
   * Delete the current user account permanently
   */
  async deleteAccount(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      dlog('Requesting full server-side account purge');

      // Full DPDP right-to-erasure: the backend purges Firestore (the user
      // doc AND every subcollection), the Pinecone memory namespace, Storage
      // media, and the Firebase Auth account itself. This replaces the old
      // client-side delete, which only removed the root doc + login and left
      // all subcollections/memory orphaned. Legally-retained financial/AML
      // records are kept server-side (see /account/delete response).
      await authPost('/account/delete', { confirm: 'DELETE MY ACCOUNT' });

      // The Auth account is now gone server-side; tear down the local session.
      clearStorage();
      try {
        await auth.signOut();
      } catch {
        // Session may already be invalid after server-side deletion — fine.
      }

      this._currentUser = null;
      this._status = 'unauthenticated';

      dlog('Account deleted successfully');
      return true;
    } catch (error) {
      console.error('AuthService: Delete account error:', error);
      return false;
    }
  }

  /**
   * DPDP right-to-access: fetch everything the platform holds about the
   * signed-in user (profile, conversations, memories, blessings, logs, …).
   * Returns the JSON object; the caller handles presenting/downloading it.
   */
  async exportMyData(): Promise<unknown> {
    dlog('Requesting account data export');
    return authGet<unknown>('/account/export');
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<boolean> {
    try {
      dlog('Sending password reset email');

      await sendPasswordResetEmail(auth, email);

      dlog('Password reset email sent');
      return true;
    } catch (error) {
      console.error('AuthService: Reset password error:', error);
      throw error;
    }
  }

  /**
   * Update the current user's password
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) return false;

      dlog('Updating password');

      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await firebaseUpdatePassword(user, newPassword);

      dlog('Password updated successfully');
      return true;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error('AuthService: Update password error:', firebaseError.code, firebaseError.message);
      throw error;
    }
  }

  /**
   * Whether the signed-in account already has an email/password credential.
   * Social-login users (Google/Facebook) and freshly-linked anonymous users
   * may have an email but NO password provider — for them "change password"
   * is impossible and they must "set" one instead (see setPassword).
   */
  hasPasswordProvider(): boolean {
    const user = auth.currentUser;
    if (!user) return false;
    return user.providerData.some((p) => p.providerId === 'password');
  }

  /**
   * Set a password for an account that doesn't have one yet (e.g. a Google /
   * Facebook user). Links an email/password credential to the existing account
   * WITHOUT requiring a current password — there is none to re-auth against.
   *
   * If the session is too old, Firebase throws auth/requires-recent-login; we
   * transparently re-authenticate via the user's social provider and retry, so
   * the user never hits a dead end.
   */
  async setPassword(newPassword: string): Promise<boolean> {
    const user = auth.currentUser;
    if (!user || !user.email) return false;

    dlog('Setting password for password-less account');
    const credential = EmailAuthProvider.credential(user.email, newPassword);

    try {
      await linkWithCredential(user, credential);
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code === 'auth/requires-recent-login') {
        // Re-auth with whatever social provider this account uses, then retry.
        await this.reauthenticate();
        await linkWithCredential(user, credential);
      } else {
        console.error('AuthService: Set password error:', code);
        throw error;
      }
    }

    dlog('Password set (password provider linked)');
    return true;
  }

  /**
   * Re-authenticate the current user against their primary social provider.
   * Used before sensitive operations (e.g. setPassword) when the session is
   * stale. Currently supports Google; extend as more providers are added.
   */
  private async reauthenticate(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No signed-in user to re-authenticate');

    const providerId = user.providerData[0]?.providerId;

    if (providerId === 'google.com') {
      if (isNativeFirebase()) {
        const native = await FirebaseAuthentication.signInWithGoogle({ scopes: ['email', 'profile'] });
        const idToken = native.credential?.idToken;
        if (!idToken) throw new Error('Google re-auth returned no idToken');
        await reauthenticateWithCredential(user, GoogleAuthProvider.credential(idToken));
      } else {
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
      }
      return;
    }

    if (providerId === 'facebook.com') {
      await reauthenticateWithPopup(user, new FacebookAuthProvider());
      return;
    }

    // Fallback: nothing we can silently re-auth with — surface the original need.
    throw new Error('auth/requires-recent-login');
  }

  /**
   * Request an email change. Sends a verification link to the NEW address.
   * The account email only changes once the user clicks that link.
   * Requires the current password for re-authentication.
   */
  async updateEmail(currentPassword: string, newEmail: string): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) return false;

      dlog('Requesting email change');

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await verifyBeforeUpdateEmail(user, newEmail);

      dlog('Verification link sent to new email');
      return true;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error('AuthService: Update email error:', firebaseError.code, firebaseError.message);
      throw error;
    }
  }

  /**
   * Resend the email-verification link to the user's current address.
   */
  async resendVerificationEmail(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      await sendEmailVerification(user);
      dlog('Verification email re-sent');
      return true;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error('AuthService: Resend verification error:', firebaseError.code, firebaseError.message);
      throw error;
    }
  }

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      await user.reload();
      const refreshedUser = auth.currentUser;

      if (refreshedUser) {
        this._currentUser = this.mapFirebaseUser(refreshedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('AuthService: Refresh session error:', error);
      return false;
    }
  }

  /**
   * Get current Firebase user
   */
  getCurrentUser(): AuthUser | null {
    const user = auth.currentUser;
    if (!user) return null;
    return this.mapFirebaseUser(user);
  }

  /**
   * Create user profile in Firestore with complete networking fields
   * Mirrors Flutter's _createUserProfile exactly
   */
  private async createUserProfile(
    user: User,
    name: string | undefined,
    authProvider: string,
    _isSocialAuth: boolean,
    referralCode?: string,
    referredByUserId?: string | null,
  ): Promise<void> {
    try {
      const userName = name || user.displayName || '';
      const ownReferralCode = await this.generateUniqueReferralCode(user.uid);

      await setDoc(doc(db, 'users', user.uid), {
        // Basic auth fields
        id: user.uid,
        email: user.email,
        full_name: userName,
        name: userName,
        photo_url: user.photoURL,
        photoUrl: user.photoURL,
        profile_image_url: user.photoURL,
        email_verified: user.emailVerified,
        auth_provider: authProvider,
        auth_providers: [authProvider],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),

        // KYC fields (2-tier system)
        kyc_tier: 0,
        kyc_status: 'none',
        kyc_level: 'none',

        // Networking profile fields (required for ProfessionalProfile)
        title: 'New Member',
        bio: '',
        city: '',
        country: '',
        category: 'Business',
        tags: [],
        interests: [],
        level: 'Beginner',
        verified: false,
        online: true,
        lastSeen: serverTimestamp(),
        connectionsCount: 0,

        // Referral fields
        referral_code: ownReferralCode,
        referred_by_code: referralCode || null,
        referred_by_user_id: referredByUserId || null,
        referral_status: referredByUserId ? 'pending_onboarding' : 'none',
        referral_reward_granted: false,
        referrals_successful_count: 0,
        referrals_total_earned_dnz: 0,
      }, { merge: true });

      dlog('User profile created in Firestore with networking fields');
    } catch (error) {
      console.error('AuthService: Error creating user profile (attempt 1):', error);
      // Retry once — profile creation is critical for admin visibility
      try {
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          email: user.email,
          full_name: name || user.displayName || '',
          name: name || user.displayName || '',
          photo_url: user.photoURL,
          email_verified: user.emailVerified,
          auth_provider: authProvider,
          auth_providers: [authProvider],
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          kyc_tier: 0,
          kyc_status: 'none',
          online: true,
          referral_code: referralCode || null,
        }, { merge: true });
        dlog('User profile created on retry');
      } catch (retryError) {
        console.error('AuthService: Profile creation failed after retry:', retryError);
      }
    }
  }

  /**
   * Ensure user profile exists with all required fields
   * Updates existing profiles with missing fields
   */
  private async ensureUserProfile(
    user: User,
    name: string | undefined,
    authProvider: string,
    isSocialAuth: boolean,
    referralCode?: string,
    referredByUserId?: string | null,
  ): Promise<void> {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await this.createUserProfile(user, name, authProvider, isSocialAuth, referralCode, referredByUserId);
        return;
      }

      const data = docSnap.data() || {};
      const updates: Record<string, unknown> = {};

      // Backfill critical fields that may be missing
      if (!data.email && user.email) updates.email = user.email;
      if (!data.created_at) updates.created_at = serverTimestamp();
      if (!data.full_name && (name || user.displayName)) {
        updates.full_name = name || user.displayName;
        updates.name = name || user.displayName;
      }

      // Update auth provider if needed
      if (authProvider) {
        updates.auth_provider = authProvider;
        const existingProviders = (data.auth_providers as string[]) || [];
        if (!existingProviders.includes(authProvider)) {
          updates.auth_providers = [...existingProviders, authProvider];
        }
      }

      // Ensure KYC fields exist (2-tier system)
      if (data.kyc_tier === undefined) updates.kyc_tier = 0;
      if (!data.kyc_status || data.kyc_status === 'unverified') updates.kyc_status = 'none';
      if (!data.kyc_level || data.kyc_level === 'lite') updates.kyc_level = 'none';

      // Ensure a stable referral code exists for every user
      if (!data.referral_code || typeof data.referral_code !== 'string' || data.referral_code.trim().length < 4) {
        updates.referral_code = await this.generateUniqueReferralCode(user.uid);
      }

      // Allow applying referral only if not already set and valid
      const normalizedReferralCode = this.normalizeReferralCode(referralCode);
      if (
        normalizedReferralCode &&
        !data.referred_by_user_id &&
        referredByUserId &&
        referredByUserId !== user.uid
      ) {
        updates.referred_by_code = normalizedReferralCode;
        updates.referred_by_user_id = referredByUserId;
        updates.referral_status = 'pending_onboarding';
        updates.referral_reward_granted = false;
      }

      // Update if there are changes
      if (Object.keys(updates).length > 0) {
        updates.updated_at = serverTimestamp();
        await setDoc(docRef, updates, { merge: true });
      }
    } catch (error) {
      console.error('AuthService: Error ensuring user profile:', error);
    }
  }

  private normalizeReferralCode(referralCode?: string): string | null {
    if (!referralCode) return null;
    const cleaned = referralCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    return cleaned || null;
  }

  private async lookupUserIdByReferralCode(referralCode: string): Promise<string | null> {
    const code = this.normalizeReferralCode(referralCode);
    if (!code) return null;

    // Use backend Admin SDK to bypass Firestore rules that block cross-user queries
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return null;

      const res = await fetch(`${BACKEND_URL}/dnz/referral/lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ referral_code: code }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.found ? data.referrer_user_id : null;
    } catch (err) {
      console.warn('AuthService: Backend referral lookup failed, trying Firestore:', err);
      // Fallback to direct Firestore (works if rules allow it)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referral_code', '==', code), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return snap.docs[0].id;
    }
  }

  private async generateUniqueReferralCode(userId: string): Promise<string> {
    const usersRef = collection(db, 'users');
    const seed = userId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const prefix = (seed.slice(0, 4) || 'ZARY').padEnd(4, 'X');

    for (let attempt = 0; attempt < 8; attempt++) {
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const candidate = `${prefix}${suffix}`;
      const q = query(usersRef, where('referral_code', '==', candidate), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return candidate;
    }

    // Fallback to deterministic + timestamp fragment
    const ts = Date.now().toString(36).toUpperCase().slice(-6);
    return `${prefix}${ts}`;
  }

  /**
   * Map Firebase User to AuthUser
   */
  private mapFirebaseUser(user: User): AuthUser {
    return {
      id: user.uid,
      email: user.email || '',
      emailVerified: user.emailVerified,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      providerId: user.providerData[0]?.providerId,
      isAnonymous: user.isAnonymous,
    };
  }

  /**
   * Cleanup - unsubscribe from auth state changes
   */
  dispose(): void {
    if (this._authUnsubscribe) {
      this._authUnsubscribe();
      this._authUnsubscribe = null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
