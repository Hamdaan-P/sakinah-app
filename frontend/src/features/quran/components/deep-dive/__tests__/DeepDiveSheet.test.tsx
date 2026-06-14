import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Stub the 6 lazy panels with sentinel-text components so we can assert
// which one mounted without exercising their real network/data deps.
vi.mock('../panels/AskPanel', () => ({
  AskPanel: ({ initialPrompt }: { initialPrompt?: string }) => (
    <div data-testid="panel-ask">ask:{initialPrompt ?? ''}</div>
  ),
}));
vi.mock('../panels/XrayPanel', () => ({
  XrayPanel: () => <div data-testid="panel-xray">xray</div>,
}));
vi.mock('../panels/TafsirPanel', () => ({
  TafsirPanel: () => <div data-testid="panel-tafsir">tafsir</div>,
}));
vi.mock('../panels/HadithPanel', () => ({
  HadithPanel: () => <div data-testid="panel-hadith">hadith</div>,
}));
vi.mock('../panels/ScholarsPanel', () => ({
  ScholarsPanel: () => <div data-testid="panel-scholars">scholars</div>,
}));
vi.mock('../panels/ApplyPanel', () => ({
  ApplyPanel: () => <div data-testid="panel-apply">apply</div>,
}));

import { DeepDiveSheet } from '../DeepDiveSheet';

function wrap(ui: React.ReactNode) {
  return <BrowserRouter>{ui}</BrowserRouter>;
}

describe('DeepDiveSheet', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      wrap(
        <DeepDiveSheet
          open={false}
          onClose={() => {}}
          verseKey="1:1"
          context={null}
        />,
      ),
    );
    expect(container.firstChild).toBeNull();
  });

  it('mounts the Ask panel by default', async () => {
    render(
      wrap(
        <DeepDiveSheet
          open={true}
          onClose={() => {}}
          verseKey="1:1"
          context={{ verseKey: '1:1', surahName: 'Al-Fatihah' }}
        />,
      ),
    );
    expect(await screen.findByTestId('panel-ask')).toBeInTheDocument();
  });

  it('forwards initialPrompt into the Ask panel (Depth FAQ pre-seed path)', async () => {
    render(
      wrap(
        <DeepDiveSheet
          open={true}
          onClose={() => {}}
          verseKey="1:1"
          context={{ verseKey: '1:1' }}
          initialTab="ask"
          initialPrompt="What does Al-Fatihah teach about guidance?"
        />,
      ),
    );
    const panel = await screen.findByTestId('panel-ask');
    expect(panel).toHaveTextContent(
      'ask:What does Al-Fatihah teach about guidance?',
    );
  });

  it('switches tab when the user clicks a tab', async () => {
    render(
      wrap(
        <DeepDiveSheet
          open={true}
          onClose={() => {}}
          verseKey="1:1"
          context={{ verseKey: '1:1' }}
        />,
      ),
    );
    await screen.findByTestId('panel-ask');
    // Pilot surah 1 so cross-tab gating doesn't block.
    await userEvent.click(screen.getByRole('tab', { name: /tafsir/i }));
    await waitFor(() =>
      expect(screen.getByTestId('panel-tafsir')).toBeInTheDocument(),
    );
  });

  it('honours initialTab prop', async () => {
    render(
      wrap(
        <DeepDiveSheet
          open={true}
          onClose={() => {}}
          verseKey="1:1"
          context={{ verseKey: '1:1' }}
          initialTab="xray"
        />,
      ),
    );
    expect(await screen.findByTestId('panel-xray')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      wrap(
        <DeepDiveSheet
          open={true}
          onClose={onClose}
          verseKey="1:1"
          context={null}
        />,
      ),
    );
    await screen.findByTestId('panel-ask');
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the pilot-scope notice on non-pilot surahs for non-Ask tabs', async () => {
    render(
      wrap(
        <DeepDiveSheet
          open={true}
          onClose={() => {}}
          verseKey="50:1"
          context={{ verseKey: '50:1' }}
          initialTab="xray"
        />,
      ),
    );
    await screen.findByTestId('panel-xray');
    expect(screen.getByRole('note')).toHaveTextContent(/piloting on/i);
  });
});
