import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the firebase config — pure side-effect import, must not run real init.
vi.mock('@/config/firebase.config', () => ({
  auth: { currentUser: null },
}));

// Mock the auth store hook — supply a controllable factory.
const mockState: any = {
  user: null,
  resendVerificationEmail: vi.fn().mockResolvedValue(true),
};

vi.mock('@/core/stores/auth.store', () => ({
  useAuthStore: (selector: (s: typeof mockState) => unknown) => selector(mockState),
}));

import { EmailVerificationPill } from '@/components/EmailVerificationPill';

describe('EmailVerificationPill', () => {
  beforeEach(() => {
    mockState.user = null;
    mockState.resendVerificationEmail = vi.fn().mockResolvedValue(true);
  });

  it('renders nothing when there is no user', () => {
    const { container } = render(<EmailVerificationPill />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when the user is anonymous', () => {
    mockState.user = { id: 'u', email: '', emailVerified: false, isAnonymous: true };
    const { container } = render(<EmailVerificationPill />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the green Verified pill when emailVerified=true', () => {
    mockState.user = {
      id: 'u', email: 'omar@example.com', emailVerified: true, isAnonymous: false,
    };
    render(<EmailVerificationPill />);
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });

  it('renders the "Verify now" button when emailVerified=false', () => {
    mockState.user = {
      id: 'u', email: 'omar@example.com', emailVerified: false, isAnonymous: false,
    };
    render(<EmailVerificationPill />);
    expect(screen.getByRole('button', { name: /verify now/i })).toBeInTheDocument();
  });

  it('clicking "Verify now" calls resendVerificationEmail', async () => {
    mockState.user = {
      id: 'u', email: 'omar@example.com', emailVerified: false, isAnonymous: false,
    };
    render(<EmailVerificationPill />);
    await userEvent.click(screen.getByRole('button', { name: /verify now/i }));
    expect(mockState.resendVerificationEmail).toHaveBeenCalledTimes(1);
  });
});
