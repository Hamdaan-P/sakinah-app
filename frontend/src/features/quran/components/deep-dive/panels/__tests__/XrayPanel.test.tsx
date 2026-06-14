import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../../services/xrayService', () => ({
  fetchSurahXray: vi.fn(),
}));

import { XrayPanel } from '../XrayPanel';
import * as svc from '../../../../services/xrayService';

const fixture = {
  surah_id: 1,
  name_simple: 'Al-Fatiha',
  name_arabic: 'الفاتحة',
  name_english: 'The Opening',
  revelation_period: 'late-makkan',
  revelation_year_hijri: null,
  revelation_year_ce: 610,
  location: 'Makkah',
  verses_count: 7,
  key_stats: [
    { label: 'Revelation order', value: '5' },
    { label: 'Total verses', value: '7' },
    { label: 'Themes', value: 'tawhid, du‘a' },
    { label: 'Phase', value: 'Late Makkan' },
  ],
  themes: ['tawhid', 'mercy', 'guidance'],
  timeline_events: [],
  connected_revelations: [],
  sources: [
    { kind: 'book' as const, book: "Ma'ariful Qur'an", author: 'Mufti Muhammad Shafi' },
  ],
};

function renderInRouter(verseKey: string) {
  return render(
    <MemoryRouter>
      <XrayPanel verseKey={verseKey} />
    </MemoryRouter>,
  );
}

describe('XrayPanel', () => {
  beforeEach(() => {
    vi.mocked(svc.fetchSurahXray).mockReset();
  });

  it('fetches by surah id derived from verseKey and renders the 4-stat grid + themes + citations', async () => {
    vi.mocked(svc.fetchSurahXray).mockResolvedValue(fixture);
    renderInRouter('1:1');
    await waitFor(() => expect(svc.fetchSurahXray).toHaveBeenCalledWith(1));
    expect(await screen.findByText('Al-Fatiha')).toBeInTheDocument();
    // 4 key stats
    expect(screen.getByText('Revelation order')).toBeInTheDocument();
    expect(screen.getByText('Total verses')).toBeInTheDocument();
    // Theme chips
    expect(screen.getByText('tawhid')).toBeInTheDocument();
    expect(screen.getByText('mercy')).toBeInTheDocument();
    // Citation chip
    expect(screen.getByText(/Ma'ariful Qur'an/)).toBeInTheDocument();
  });

  it('renders empty state when service returns null', async () => {
    vi.mocked(svc.fetchSurahXray).mockResolvedValue(null);
    renderInRouter('99:1');
    expect(await screen.findByText(/Surah X-Ray is currently piloting on/i)).toBeInTheDocument();
  });
});
