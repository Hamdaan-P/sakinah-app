import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('../../../../services/tafsirService', () => ({
  fetchTafsirs: vi.fn(),
}));

import { TafsirPanel } from '../TafsirPanel';
import * as svc from '../../../../services/tafsirService';

describe('TafsirPanel', () => {
  beforeEach(() => {
    vi.mocked(svc.fetchTafsirs).mockReset();
  });

  it('renders stacked tafsir cards with citation chips on success', async () => {
    vi.mocked(svc.fetchTafsirs).mockResolvedValue([
      {
        source: 'ibn_kathir',
        author: 'Ibn Kathir',
        title: 'Tafsir Ibn Kathir',
        text: 'A sufficient passage for the test.',
      },
      {
        source: 'tabari',
        author: 'At-Tabari',
        title: 'Jami‘ al-Bayan',
        text: 'Another sufficient passage.',
      },
    ]);

    render(<TafsirPanel verseKey="1:1" />);

    await waitFor(() => expect(svc.fetchTafsirs).toHaveBeenCalledWith('1:1'));
    // Both tafsir headings render
    expect(await screen.findByRole('heading', { name: 'Tafsir Ibn Kathir' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Jami‘ al-Bayan' })).toBeInTheDocument();
    // Citation chips render the source attribution (using accessible aria-label)
    expect(
      screen.getByRole('button', { name: /Tafsir Ibn Kathir.*Ibn Kathir/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Jami.*At-Tabari/i }),
    ).toBeInTheDocument();
  });

  it('renders empty state when no tafsir is curated', async () => {
    vi.mocked(svc.fetchTafsirs).mockResolvedValue([]);
    render(<TafsirPanel verseKey="99:1" />);
    expect(
      await screen.findByText(/Curated tafsir is currently piloting on/i),
    ).toBeInTheDocument();
  });

  it('renders graceful error state', async () => {
    vi.mocked(svc.fetchTafsirs).mockRejectedValue(new Error('boom'));
    render(<TafsirPanel verseKey="1:1" />);
    expect(
      await screen.findByText(/Could not load tafsir/i),
    ).toBeInTheDocument();
  });

  it('truncates long entries and expands on Read more', async () => {
    const longText = 'x'.repeat(500);
    vi.mocked(svc.fetchTafsirs).mockResolvedValue([
      {
        source: 'ibn_kathir',
        author: 'Ibn Kathir',
        title: 'Tafsir Ibn Kathir',
        text: longText,
      },
    ]);
    render(<TafsirPanel verseKey="1:1" />);
    const readMore = await screen.findByRole('button', { name: /read more/i });
    expect(readMore).toBeInTheDocument();
  });
});
