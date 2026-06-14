/**
 * DeepKycGuard tests — gates Tier-2 features behind Quick KYC completion.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/config/firebase.config', () => ({
  auth: { currentUser: null },
  db: {},
}));

const mockKyc: any = { kycTier: 0, initialized: true };
vi.mock('@/features/kyc/stores/kyc.store', () => ({
  useKycStore: (selector?: (s: typeof mockKyc) => unknown) =>
    selector ? selector(mockKyc) : mockKyc,
}));

// DeepKycModal is dialog-heavy; stub it for isolation.
vi.mock('@/features/kyc/components/DeepKycModal', () => ({
  DeepKycModal: ({ open, featureName }: { open: boolean; featureName: string }) =>
    open ? <div data-testid="deep-kyc-modal">Modal: {featureName}</div> : null,
}));

import { DeepKycGuard } from '@/features/kyc/components/DeepKycGuard';

const Protected = () => <div data-testid="protected">Tier-2 content</div>;

describe('DeepKycGuard', () => {
  beforeEach(() => {
    mockKyc.kycTier = 0;
    mockKyc.initialized = true;
  });

  it('renders children at tier 2', () => {
    mockKyc.kycTier = 2;
    render(
      <MemoryRouter>
        <DeepKycGuard><Protected /></DeepKycGuard>
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected')).toBeInTheDocument();
    expect(screen.queryByTestId('deep-kyc-modal')).not.toBeInTheDocument();
  });

  it('renders children at tier 3+ (future-proofs against tier inflation)', () => {
    mockKyc.kycTier = 3;
    render(
      <MemoryRouter>
        <DeepKycGuard><Protected /></DeepKycGuard>
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });

  it('shows DeepKycModal at tier 0', () => {
    mockKyc.kycTier = 0;
    render(
      <MemoryRouter>
        <DeepKycGuard featureName="Premium chat"><Protected /></DeepKycGuard>
      </MemoryRouter>
    );
    expect(screen.getByTestId('deep-kyc-modal')).toBeInTheDocument();
    expect(screen.getByText(/Premium chat/)).toBeInTheDocument();
    // Children NOT rendered while modal up
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
  });

  it('shows DeepKycModal at tier 1 (Quick KYC done but not full KYC)', () => {
    mockKyc.kycTier = 1;
    render(
      <MemoryRouter>
        <DeepKycGuard><Protected /></DeepKycGuard>
      </MemoryRouter>
    );
    expect(screen.getByTestId('deep-kyc-modal')).toBeInTheDocument();
  });

  it('renders children when KYC store is uninitialized (no flicker)', () => {
    // While loading, don't pop the modal — let AuthGuard's spinner own
    // the loading state. Children render so the page mounts behind it.
    mockKyc.kycTier = 0;
    mockKyc.initialized = false;
    render(
      <MemoryRouter>
        <DeepKycGuard><Protected /></DeepKycGuard>
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });

  it('default feature name appears when not provided', () => {
    mockKyc.kycTier = 0;
    render(
      <MemoryRouter initialEntries={['/some-random-route']}>
        <DeepKycGuard><Protected /></DeepKycGuard>
      </MemoryRouter>
    );
    expect(screen.getByTestId('deep-kyc-modal')).toBeInTheDocument();
    // Falls back to "this feature" when route isn't in GATED_FEATURE_NAMES
    expect(screen.getByText(/this feature/i)).toBeInTheDocument();
  });

  it('renders children after dismiss (modal closed)', async () => {
    // Need a non-stub of DeepKycModal so onClose can fire. Use a simple
    // fake that exposes a button to call onClose.
    vi.doMock('@/features/kyc/components/DeepKycModal', () => ({
      DeepKycModal: ({
        open, onClose, featureName,
      }: { open: boolean; onClose?: () => void; featureName: string }) =>
        open ? (
          <div data-testid="deep-kyc-modal">
            Modal: {featureName}
            <button data-testid="close-modal" onClick={onClose}>close</button>
          </div>
        ) : null,
    }));
    vi.resetModules();
    const userEvent = (await import('@testing-library/user-event')).default;
    const { DeepKycGuard: ReloadedGuard } = await import(
      '@/features/kyc/components/DeepKycGuard'
    );
    mockKyc.kycTier = 0;
    mockKyc.initialized = true;
    render(
      <MemoryRouter>
        <ReloadedGuard><Protected /></ReloadedGuard>
      </MemoryRouter>
    );
    const close = screen.getByTestId('close-modal');
    await userEvent.setup().click(close);
    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });

  it('uses GATED_FEATURE_NAMES route mapping when no featureName prop', async () => {
    // Stub the gated map so we know what to assert.
    vi.doMock('@/features/kyc/types/kyc.types', async () => {
      const actual = await vi.importActual('@/features/kyc/types/kyc.types');
      return {
        ...actual,
        GATED_FEATURE_NAMES: { '/wallet': 'Wallet' },
      };
    });
    vi.resetModules();
    const { DeepKycGuard: ReloadedGuard } = await import(
      '@/features/kyc/components/DeepKycGuard'
    );
    mockKyc.kycTier = 1;
    mockKyc.initialized = true;
    render(
      <MemoryRouter initialEntries={['/wallet']}>
        <ReloadedGuard><Protected /></ReloadedGuard>
      </MemoryRouter>
    );
    expect(screen.getByText(/Wallet/)).toBeInTheDocument();
  });
});
