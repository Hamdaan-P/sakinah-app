import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../services/researchService', () => ({
  searchResearch: vi.fn(),
}));

import { QuranResearchPage } from '../QuranResearchPage';
import * as svc from '../../services/researchService';
import type { ResearchResponse } from '../../types/quran.types';

function makeResponse(overrides: Partial<ResearchResponse> = {}): ResearchResponse {
  return {
    query: 'patience',
    sources: ['quran', 'hadith', 'tafsir'],
    category: 'general',
    confidence: 0.7,
    meets_threshold: true,
    total: 2,
    buckets: {
      quran: [
        {
          bucket: 'quran',
          relevance_score: 0.7,
          excerpt: 'Be patient with patience.',
          citation: { kind: 'quran', verse_key: '2:153', surah_name: 'Al-Baqarah' },
        },
      ],
      hadith: [
        {
          bucket: 'hadith',
          relevance_score: 0.6,
          excerpt: 'Patience at the first strike.',
          citation: { kind: 'hadith', collection: 'Sahih al-Bukhari', number: '1283', grade: 'Sahih' },
        },
      ],
      tafsir: [],
    },
    ...overrides,
  };
}

describe('QuranResearchPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(svc.searchResearch).mockReset();
  });

  it('renders the AI disclaimer banner', () => {
    render(<QuranResearchPage />);
    expect(screen.getByLabelText(/AI governance notice/i)).toBeInTheDocument();
  });

  it('runs a search and renders bucketed results with citations', async () => {
    vi.mocked(svc.searchResearch).mockResolvedValue(makeResponse());
    render(<QuranResearchPage />);
    await userEvent.type(screen.getByLabelText(/research search input/i), 'patience');
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => expect(svc.searchResearch).toHaveBeenCalled());
    expect(await screen.findByText(/Be patient with patience\./)).toBeInTheDocument();
    expect(screen.getByText(/Patience at the first strike\./)).toBeInTheDocument();
    // Citation chips
    expect(screen.getByText(/Quran 2:153/)).toBeInTheDocument();
    expect(screen.getByText(/Sahih al-Bukhari/)).toBeInTheDocument();
  });

  it('renders LowConfidenceNotice when threshold not met and no results', async () => {
    vi.mocked(svc.searchResearch).mockResolvedValue(
      makeResponse({
        meets_threshold: false,
        total: 0,
        buckets: { quran: [], hadith: [], tafsir: [] },
      }),
    );
    render(<QuranResearchPage />);
    await userEvent.type(screen.getByLabelText(/research search input/i), 'patience');
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }));
    expect(await screen.findByText(/No verified source matched/i)).toBeInTheDocument();
  });

  it('filters by bucket tab', async () => {
    vi.mocked(svc.searchResearch).mockResolvedValue(makeResponse());
    render(<QuranResearchPage />);
    await userEvent.type(screen.getByLabelText(/research search input/i), 'patience');
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }));
    await screen.findByText(/Be patient with patience\./);

    await userEvent.click(screen.getByRole('tab', { name: /^hadith/i }));
    expect(screen.queryByText(/Be patient with patience\./)).not.toBeInTheDocument();
    expect(screen.getByText(/Patience at the first strike\./)).toBeInTheDocument();
  });
});
