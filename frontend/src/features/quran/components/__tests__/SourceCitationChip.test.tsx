import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SourceCitationChip } from '../governance/SourceCitationChip';

describe('SourceCitationChip', () => {
  it('renders a Quran citation label', () => {
    render(
      <SourceCitationChip
        citation={{ kind: 'quran', verse_key: '2:255', surah_name: 'Al-Baqarah' }}
      />
    );
    expect(screen.getByText(/Quran 2:255/)).toBeInTheDocument();
    expect(screen.getByText(/Al-Baqarah/)).toBeInTheDocument();
  });

  it('renders a hadith citation with grade', () => {
    render(
      <SourceCitationChip
        citation={{ kind: 'hadith', collection: 'Sahih al-Bukhari', number: '6035', grade: 'Sahih' }}
      />
    );
    expect(screen.getByText(/Sahih al-Bukhari/)).toBeInTheDocument();
    expect(screen.getByText(/#6035/)).toBeInTheDocument();
    expect(screen.getByText(/Sahih/)).toBeInTheDocument();
  });

  it('expands the snippet when clicked and snippet is provided', async () => {
    render(
      <SourceCitationChip
        citation={{ kind: 'quran', verse_key: '2:255', surah_name: 'Al-Baqarah' }}
        snippet={{ english: 'Allah — there is no deity except Him' }}
      />
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/Allah — there is no deity except Him/)).not.toBeInTheDocument();
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Allah — there is no deity except Him/)).toBeInTheDocument();
  });

  it('renders book citations with author when provided', () => {
    render(
      <SourceCitationChip
        citation={{ kind: 'book', book: 'Tafsir Ibn Kathir', author: 'Ibn Kathir' }}
      />
    );
    expect(screen.getByText(/Tafsir Ibn Kathir/)).toBeInTheDocument();
    expect(screen.getByText(/Ibn Kathir/)).toBeInTheDocument();
  });
});
