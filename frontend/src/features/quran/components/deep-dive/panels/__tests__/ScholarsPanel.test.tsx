import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Provide a deterministic data fixture for the panel. The panel reads from
// data/scholarCommentary.json at import time; mocking that module isolates
// the test from real curation drift.
vi.mock('../../../../data/scholarCommentary.json', () => ({
  default: {
    '1:1': [
      {
        scholar: 'Imam An-Nawawi',
        affiliation: 'Damascus',
        era: 'classical',
        text: 'A brief commentary for the test.',
        source: {
          kind: 'book',
          book: 'Riyad as-Salihin',
          author: 'Imam An-Nawawi',
        },
      },
    ],
  },
}));

import { ScholarsPanel } from '../ScholarsPanel';

describe('ScholarsPanel', () => {
  it('renders scholar name + affiliation + era + citation', () => {
    render(<ScholarsPanel verseKey="1:1" />);
    expect(screen.getByText('Imam An-Nawawi')).toBeInTheDocument();
    expect(screen.getByText(/Damascus/)).toBeInTheDocument();
    expect(screen.getByText(/classical/)).toBeInTheDocument();
    expect(screen.getByText(/A brief commentary/)).toBeInTheDocument();
    // Citation chip rendered with the book name
    expect(screen.getByText(/Riyad as-Salihin/)).toBeInTheDocument();
  });

  it('shows empty state when no entries exist for a verse', () => {
    render(<ScholarsPanel verseKey="99:1" />);
    expect(
      screen.getByText(/Scholar commentary is currently piloting on/i),
    ).toBeInTheDocument();
  });
});
