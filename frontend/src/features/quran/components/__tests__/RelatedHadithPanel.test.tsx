import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../services/relatedHadithService', () => ({
  fetchRelatedHadith: vi.fn(),
  clearRelatedHadithCache: vi.fn(),
}));

import { RelatedHadithPanel } from '../RelatedHadithPanel';
import * as svc from '../../services/relatedHadithService';

describe('RelatedHadithPanel', () => {
  beforeEach(() => {
    vi.mocked(svc.fetchRelatedHadith).mockReset();
    vi.mocked(svc.clearRelatedHadithCache).mockReset();
  });

  it('renders collapsed by default and does not fetch until expanded', () => {
    render(<RelatedHadithPanel verseKey="2:255" />);
    expect(svc.fetchRelatedHadith).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /related hadith/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('fetches and renders items on expand', async () => {
    vi.mocked(svc.fetchRelatedHadith).mockResolvedValue([
      {
        collection: 'Sahih al-Bukhari',
        collection_slug: 'bukhari',
        number: '6035',
        narrator: 'Abu Hurairah',
        arabic: 'AR text',
        english: 'EN text',
        grade: 'Sahih',
        relevance_score: 0.7,
      },
    ]);

    render(<RelatedHadithPanel verseKey="2:255" />);
    await userEvent.click(screen.getByRole('button', { name: /related hadith/i }));

    await waitFor(() => expect(svc.fetchRelatedHadith).toHaveBeenCalledWith('2:255', 5));
    expect(await screen.findByText(/EN text/)).toBeInTheDocument();
    expect(screen.getByText(/Abu Hurairah/)).toBeInTheDocument();
    // Citation chip
    expect(screen.getByText(/Sahih al-Bukhari/)).toBeInTheDocument();
  });

  it('renders empty state when service returns []', async () => {
    vi.mocked(svc.fetchRelatedHadith).mockResolvedValue([]);
    render(<RelatedHadithPanel verseKey="2:255" />);
    await userEvent.click(screen.getByRole('button', { name: /related hadith/i }));
    expect(await screen.findByText(/No verified hadith linked/i)).toBeInTheDocument();
  });

  it('shows a retry button on error', async () => {
    vi.mocked(svc.fetchRelatedHadith).mockRejectedValue(new Error('boom'));
    render(<RelatedHadithPanel verseKey="2:255" />);
    await userEvent.click(screen.getByRole('button', { name: /related hadith/i }));
    expect(await screen.findByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
