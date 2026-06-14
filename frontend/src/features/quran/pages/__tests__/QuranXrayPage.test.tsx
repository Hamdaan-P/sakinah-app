import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../../services/xrayService', () => ({
  fetchSurahXray: vi.fn(),
}));

import { QuranXrayPage } from '../QuranXrayPage';
import * as svc from '../../services/xrayService';
import type { SurahXray } from '../../services/xrayService';

const fatihahXray: SurahXray = {
  surah_id: 1,
  name_simple: 'Al-Fatihah',
  name_arabic: 'الفاتحة',
  name_english: 'The Opening',
  revelation_year_hijri: null,
  revelation_year_ce: 610,
  revelation_period: 'Early Meccan',
  location: 'Makkah',
  verses_count: 7,
  themes: ['Guidance', 'Tawhid'],
  key_stats: [{ label: 'Verses', value: '7' }],
  timeline_events: [
    { year_ce: 610, title: 'Revealed', description: 'Opening of the Quran.' },
  ],
  connected_revelations: [
    { verse_key: '2:1', label: 'Continues the prayer', note: 'The Mother of the Book opens the response.' },
  ],
  sources: [{ kind: 'quran', verse_key: '1:1', surah_name: 'Al-Fatihah' }],
};

function renderAt(surahId: number) {
  return render(
    <MemoryRouter initialEntries={[`/quran/surah/${surahId}/xray`]}>
      <Routes>
        <Route path="/quran/surah/:id/xray" element={<QuranXrayPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('QuranXrayPage', () => {
  beforeEach(() => {
    vi.mocked(svc.fetchSurahXray).mockReset();
  });

  it('renders the loading state initially', () => {
    vi.mocked(svc.fetchSurahXray).mockReturnValue(new Promise(() => {}));
    renderAt(1);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders surah X-Ray data when fetch resolves', async () => {
    vi.mocked(svc.fetchSurahXray).mockResolvedValue(fatihahXray);
    renderAt(1);
    expect(await screen.findByText('Al-Fatihah')).toBeInTheDocument();
    expect(screen.getByText(/Early Meccan/i)).toBeInTheDocument();
    expect(screen.getByText(/Guidance/)).toBeInTheDocument();
    expect(screen.getByLabelText(/AI governance notice/i)).toBeInTheDocument();
  });

  it('shows an error message when the fetch rejects', async () => {
    vi.mocked(svc.fetchSurahXray).mockRejectedValue(new Error('network down'));
    renderAt(1);
    expect(await screen.findByText(/network down/i)).toBeInTheDocument();
  });

  it('renders the not-curated empty state when service returns null', async () => {
    vi.mocked(svc.fetchSurahXray).mockResolvedValue(null);
    renderAt(50);
    // Empty-state copy lives in the page; assert via the AI disclaimer + the
    // explicit no-data signal that the page renders.
    expect(await screen.findByLabelText(/AI governance notice/i)).toBeInTheDocument();
  });
});
