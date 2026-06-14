/**
 * AuthGuard + GuestGuard redirect tests.
 *
 * Strategy: render under MemoryRouter with mocked auth + kyc stores.
 * Use `useNavigate` as the assertion target (it's the side effect we
 * actually care about).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Spy on navigate so we can assert calls. The actual navigation behavior
// (URL change, history) is exercised by react-router's own tests; we just
// want to verify our guards trigger the right call with the right arg.
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual: any = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/config/firebase.config', () => ({
  auth: { currentUser: null },
  db: {},
}));

// Auth store mock — controllable via mockAuthState.
const mockAuthState: any = {
  state: { type: 'unauthenticated' },
  isInitialized: true,
  user: null,
};
vi.mock('@/core/stores/auth.store', () => ({
  useAuthStore: (selector?: (s: typeof mockAuthState) => unknown) =>
    selector ? selector(mockAuthState) : mockAuthState,
}));

// KYC store mock — controllable via mockKycState.
const mockKycState: any = {
  kycTier: 0,
  initialized: true,
  initialize: vi.fn(),
};
vi.mock('@/features/kyc/stores/kyc.store', () => ({
  useKycStore: () => mockKycState,
}));

import { AuthGuard, GuestGuard } from '@/features/auth/components/AuthGuard';

const Protected = () => <div data-testid="protected">Secret</div>;

describe('AuthGuard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockAuthState.state = { type: 'unauthenticated' };
    mockAuthState.isInitialized = true;
    mockAuthState.user = null;
    mockKycState.kycTier = 0;
    mockKycState.initialized = true;
  });

  it('redirects unauthenticated user to /login', () => {
    render(
      <MemoryRouter initialEntries={['/wallet']}>
        <Routes>
          <Route
            path="/wallet"
            element={<AuthGuard><Protected /></AuthGuard>}
          />
        </Routes>
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('respects custom redirectTo', () => {
    render(
      <MemoryRouter>
        <AuthGuard redirectTo="/custom-login"><Protected /></AuthGuard>
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/custom-login', { replace: true });
  });

  it('renders children when authenticated + KYC tier ≥ 1', () => {
    mockAuthState.state = { type: 'authenticated' };
    mockAuthState.user = { id: 'u', email: 'a@b.c', emailVerified: true, isAnonymous: false };
    mockKycState.kycTier = 1;

    render(
      <MemoryRouter initialEntries={['/wallet']}>
        <Routes>
          <Route path="/wallet" element={<AuthGuard><Protected /></AuthGuard>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects authed user with KYC tier 0 to /quick-kyc', () => {
    mockAuthState.state = { type: 'authenticated' };
    mockAuthState.user = { id: 'u', email: 'a@b.c', emailVerified: true, isAnonymous: false };
    mockKycState.kycTier = 0;

    render(
      <MemoryRouter initialEntries={['/wallet']}>
        <Routes>
          <Route path="/wallet" element={<AuthGuard><Protected /></AuthGuard>} />
        </Routes>
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/quick-kyc', { replace: true });
  });

  it('does NOT redirect to quick-kyc when on /quick-kyc itself (no infinite loop)', () => {
    mockAuthState.state = { type: 'authenticated' };
    mockAuthState.user = { id: 'u', email: 'a@b.c', emailVerified: true, isAnonymous: false };
    mockKycState.kycTier = 0;

    render(
      <MemoryRouter initialEntries={['/quick-kyc']}>
        <Routes>
          <Route path="/quick-kyc" element={<AuthGuard><Protected /></AuthGuard>} />
        </Routes>
      </MemoryRouter>
    );
    // Either rendered children or no /quick-kyc redirect
    expect(mockNavigate).not.toHaveBeenCalledWith('/quick-kyc', expect.anything());
  });

  it('skipKycCheck=true bypasses tier check', () => {
    mockAuthState.state = { type: 'authenticated' };
    mockAuthState.user = { id: 'u', email: 'a@b.c', emailVerified: true, isAnonymous: false };
    mockKycState.kycTier = 0;

    render(
      <MemoryRouter>
        <AuthGuard skipKycCheck><Protected /></AuthGuard>
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalledWith('/quick-kyc', expect.anything());
  });

  it('does NOT redirect while auth is uninitialized', () => {
    mockAuthState.isInitialized = false;
    mockAuthState.state = { type: 'loading' };

    render(
      <MemoryRouter>
        <AuthGuard><Protected /></AuthGuard>
      </MemoryRouter>
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});


describe('GuestGuard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockAuthState.state = { type: 'unauthenticated' };
    mockAuthState.isInitialized = true;
    mockAuthState.user = null;
  });

  it('lets guests through', () => {
    render(
      <MemoryRouter>
        <GuestGuard><Protected /></GuestGuard>
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects authenticated non-anonymous user to /', () => {
    mockAuthState.state = { type: 'authenticated' };
    mockAuthState.user = { id: 'u', email: 'a@b.c', emailVerified: true, isAnonymous: false };

    render(
      <MemoryRouter>
        <GuestGuard><Protected /></GuestGuard>
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('respects custom redirectTo', () => {
    mockAuthState.state = { type: 'authenticated' };
    mockAuthState.user = { id: 'u', email: 'a@b.c', emailVerified: true, isAnonymous: false };

    render(
      <MemoryRouter>
        <GuestGuard redirectTo="/dashboard"><Protected /></GuestGuard>
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('lets anonymous users see signup/login (anonymous → real upgrade)', () => {
    mockAuthState.state = { type: 'authenticated' };
    mockAuthState.user = { id: 'u', email: '', emailVerified: false, isAnonymous: true };

    render(
      <MemoryRouter>
        <GuestGuard><Protected /></GuestGuard>
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows the loader while auth state is uninitialized', () => {
    mockAuthState.isInitialized = false;
    mockAuthState.state = { type: 'loading' };

    const { container } = render(
      <MemoryRouter>
        <GuestGuard><Protected /></GuestGuard>
      </MemoryRouter>
    );
    // Children NOT rendered (loader shown).
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
    // Loader has the spinning class.
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Coverage push: showLoginPrompt branch + LoginPromptWidget rendering +
// guestPlaceholder branch + AuthGuard loading-spinner branch.
// Goal: take AuthGuard.tsx coverage from ~83% to 100% (plan target).
// ---------------------------------------------------------------------------

describe('AuthGuard — showLoginPrompt + LoginPromptWidget', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockAuthState.state = { type: 'unauthenticated' };
    mockAuthState.isInitialized = true;
    mockAuthState.user = null;
    mockKycState.kycTier = 0;
    mockKycState.initialized = true;
  });

  it('renders LoginPromptWidget instead of redirecting when showLoginPrompt=true', () => {
    render(
      <MemoryRouter>
        <AuthGuard showLoginPrompt><Protected /></AuthGuard>
      </MemoryRouter>
    );
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
    // LoginPromptWidget header
    expect(screen.getByText(/sign in required/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalledWith('/login', expect.anything());
  });

  it('LoginPromptWidget Sign In button navigates to /login', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    render(
      <MemoryRouter>
        <AuthGuard showLoginPrompt><Protected /></AuthGuard>
      </MemoryRouter>
    );
    const signInBtn = screen.getByRole('button', { name: /sign in \/ sign up/i });
    await userEvent.setup().click(signInBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('LoginPromptWidget Continue-as-Guest button calls navigate(-1)', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    render(
      <MemoryRouter>
        <AuthGuard showLoginPrompt><Protected /></AuthGuard>
      </MemoryRouter>
    );
    const guestBtn = screen.getByRole('button', { name: /continue as guest/i });
    await userEvent.setup().click(guestBtn);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});

describe('AuthGuard — guestPlaceholder branch', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockAuthState.state = { type: 'unauthenticated' };
    mockAuthState.isInitialized = true;
    mockAuthState.user = null;
  });

  it('renders guestPlaceholder when provided + user is unauth', () => {
    render(
      <MemoryRouter>
        <AuthGuard guestPlaceholder={<div data-testid="placeholder">Guest!</div>}>
          <Protected />
        </AuthGuard>
      </MemoryRouter>
    );
    expect(screen.getByTestId('placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
    // Did NOT redirect since placeholder is the explicit fallback
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('AuthGuard — loader during auth+kyc loading', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockAuthState.state = { type: 'authenticated' };
    mockAuthState.user = { id: 'u', email: 'a@b.c', emailVerified: true, isAnonymous: false };
    mockAuthState.isInitialized = true;
  });

  it('shows the loader when authed but KYC not yet initialized', () => {
    mockKycState.kycTier = 0;
    mockKycState.initialized = false;

    const { container } = render(
      <MemoryRouter>
        <AuthGuard><Protected /></AuthGuard>
      </MemoryRouter>
    );
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('skipKycCheck=true still renders children even if kyc not initialized', () => {
    mockKycState.kycTier = 0;
    mockKycState.initialized = false;

    render(
      <MemoryRouter>
        <AuthGuard skipKycCheck><Protected /></AuthGuard>
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });

  it('initKyc fires once when authed user has kycInitialized=false', () => {
    mockKycState.initialized = false;
    mockKycState.initialize = vi.fn();

    render(
      <MemoryRouter>
        <AuthGuard><Protected /></AuthGuard>
      </MemoryRouter>
    );
    expect(mockKycState.initialize).toHaveBeenCalled();
  });
});
