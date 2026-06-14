/**
 * Auth Feature - Barrel Export
 */

// Types
export * from './types/auth.types';

// Services
export { authService } from './services/authService';
// storageService.ts was deleted in P2.6 — its dangerous btoa() token
// caching is gone and the safe prefs (rememberMe) inlined into authService.

// Utils
export * from './utils/passwordValidator';

// Pages (lazy loaded)
export { default as LoginPage } from './pages/LoginPage';
export { default as SignupPage } from './pages/SignupPage';

// Components
export { AuthGuard } from './components/AuthGuard';
export { ForgotPasswordModal } from './components/ForgotPasswordModal';
export { PasswordRequirements } from './components/PasswordRequirements';
