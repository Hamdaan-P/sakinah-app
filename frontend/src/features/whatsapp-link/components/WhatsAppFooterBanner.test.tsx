/**
 * WhatsAppFooterBanner — verifies the banner shows/hides correctly based on
 * link status and the dismiss flag.
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../hooks/useWhatsAppLink', async () => {
  const actual = await vi.importActual<typeof import('../hooks/useWhatsAppLink')>(
    '../hooks/useWhatsAppLink',
  );
  return {
    ...actual,
    useLinkStatus: vi.fn(),
  };
});

import { useLinkStatus } from '../hooks/useWhatsAppLink';
import { WhatsAppFooterBanner } from './WhatsAppFooterBanner';

const mockUseLinkStatus = useLinkStatus as unknown as ReturnType<typeof vi.fn>;

function renderBanner() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <WhatsAppFooterBanner />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('WhatsAppFooterBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows banner when not linked', () => {
    mockUseLinkStatus.mockReturnValue({
      isLoading: false,
      data: { linked: false, phone: null, linked_at: null },
    } as unknown as ReturnType<typeof useLinkStatus>);

    renderBanner();
    expect(screen.getByTestId('whatsapp-footer-banner')).toBeInTheDocument();
    expect(
      screen.getByText('Chat with Raya on WhatsApp'),
    ).toBeInTheDocument();
  });

  it('hides banner when linked', () => {
    mockUseLinkStatus.mockReturnValue({
      isLoading: false,
      data: { linked: true, phone: '+918765432100', linked_at: '2026-05-16T10:00:00Z' },
    } as unknown as ReturnType<typeof useLinkStatus>);

    renderBanner();
    expect(screen.queryByTestId('whatsapp-footer-banner')).not.toBeInTheDocument();
  });

  it('hides banner while loading', () => {
    mockUseLinkStatus.mockReturnValue({
      isLoading: true,
      data: undefined,
    } as unknown as ReturnType<typeof useLinkStatus>);

    renderBanner();
    expect(screen.queryByTestId('whatsapp-footer-banner')).not.toBeInTheDocument();
  });

  it('dismiss button persists across renders', () => {
    mockUseLinkStatus.mockReturnValue({
      isLoading: false,
      data: { linked: false, phone: null, linked_at: null },
    } as unknown as ReturnType<typeof useLinkStatus>);

    const { unmount } = renderBanner();
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByTestId('whatsapp-footer-banner')).not.toBeInTheDocument();

    // Remount — dismiss flag should still hide the banner.
    unmount();
    renderBanner();
    expect(screen.queryByTestId('whatsapp-footer-banner')).not.toBeInTheDocument();
  });
});
