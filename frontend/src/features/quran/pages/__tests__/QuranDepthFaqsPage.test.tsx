import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../../services/depthFaqsService', () => ({
  fetchDepthFaqs: vi.fn(),
}));
vi.mock('../../services/workspaceService', () => ({
  createItem: vi.fn(),
}));

// Stub the heavy DeepDiveSheet — we only care that the page opens it with
// the right pre-seeded prompt.
let lastSheetProps: Record<string, unknown> | null = null;
vi.mock('../../components/deep-dive/DeepDiveSheet', () => ({
  DeepDiveSheet: (props: Record<string, unknown>) => {
    lastSheetProps = props;
    return props.open ? (
      <div data-testid="deep-dive-sheet">
        open:{String(props.initialTab)}:{String(props.initialPrompt ?? '')}
      </div>
    ) : null;
  },
}));

import { QuranDepthFaqsPage } from '../QuranDepthFaqsPage';
import * as svc from '../../services/depthFaqsService';
import type { DepthFaqItem } from '../../services/depthFaqsService';

const sampleItems: DepthFaqItem[] = [
  {
    id: 'surah1-q1',
    question: 'Why does Al-Fatihah open every salah?',
    prompt_for_raya:
      'Explain why Surah Al-Fatihah is read in every unit of salah using verified scholarly sources.',
    reflection_seed: 'Sit with the weight of asking guidance seventeen times a day.',
    intro: 'Seven verses, the opener of the Book.',
  },
  {
    id: 'surah1-q2',
    question: 'What does "Maliki yawm-id-deen" mean?',
    prompt_for_raya: 'Unpack the meaning of "Maliki yawm-id-deen" in Al-Fatihah 1:4.',
    reflection_seed: 'Reflect on the Day of Recompense.',
  },
];

function renderAt(surahId: number) {
  return render(
    <MemoryRouter initialEntries={[`/quran/surah/${surahId}/depth-faqs`]}>
      <Routes>
        <Route path="/quran/surah/:id/depth-faqs" element={<QuranDepthFaqsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('QuranDepthFaqsPage', () => {
  beforeEach(() => {
    lastSheetProps = null;
    vi.mocked(svc.fetchDepthFaqs).mockReset();
  });

  it('renders the AI disclaimer banner', async () => {
    vi.mocked(svc.fetchDepthFaqs).mockResolvedValue(sampleItems);
    renderAt(1);
    expect(await screen.findByLabelText(/AI governance notice/i)).toBeInTheDocument();
  });

  it('lists FAQs returned from the service', async () => {
    vi.mocked(svc.fetchDepthFaqs).mockResolvedValue(sampleItems);
    renderAt(1);
    expect(
      await screen.findByText(/Why does Al-Fatihah open every salah/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/What does "Maliki yawm-id-deen" mean/i),
    ).toBeInTheDocument();
  });

  it('renders the empty-state for surahs not yet curated', async () => {
    vi.mocked(svc.fetchDepthFaqs).mockResolvedValue([]);
    renderAt(42);
    expect(await screen.findByText(/Not yet curated/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ask raya about this surah/i }),
    ).toBeInTheDocument();
  });

  it('empty-state Ask Raya button opens DeepDiveSheet with a surah-level prompt', async () => {
    vi.mocked(svc.fetchDepthFaqs).mockResolvedValue([]);
    renderAt(42);
    await screen.findByText(/Not yet curated/i);
    await userEvent.click(
      screen.getByRole('button', { name: /ask raya about this surah/i }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('deep-dive-sheet')).toBeInTheDocument(),
    );
    expect(String(lastSheetProps?.initialPrompt)).toMatch(/Surah 42/);
  });

  it('opens the DeepDiveSheet on the Ask tab with the FAQ prompt pre-seeded', async () => {
    vi.mocked(svc.fetchDepthFaqs).mockResolvedValue(sampleItems);
    renderAt(1);

    // Expand first FAQ
    const firstFaq = await screen.findByText(/Why does Al-Fatihah open every salah/i);
    await userEvent.click(firstFaq);

    // Tap Ask Raya
    await userEvent.click(screen.getByRole('button', { name: /^ask raya$/i }));

    await waitFor(() =>
      expect(screen.getByTestId('deep-dive-sheet')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('deep-dive-sheet')).toHaveTextContent(
      /open:ask:Explain why Surah Al-Fatihah is read/,
    );
    expect(lastSheetProps?.initialTab).toBe('ask');
    expect(lastSheetProps?.initialPrompt).toMatch(/Explain why Surah Al-Fatihah/);
  });
});
