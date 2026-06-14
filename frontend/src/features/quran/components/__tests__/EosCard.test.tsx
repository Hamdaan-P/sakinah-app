import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EosCard } from '../EosCard';
import type { Surah } from '../../types/quran.types';

const fatihah: Surah = {
  id: 1,
  nameSimple: 'Al-Fatihah',
  nameArabic: 'الفاتحة',
  nameEnglish: 'The Opening',
  versesCount: 7,
  revelationType: 'Meccan',
};

const baqarah: Surah = {
  id: 2,
  nameSimple: 'Al-Baqarah',
  nameArabic: 'البقرة',
  nameEnglish: 'The Cow',
  versesCount: 286,
  revelationType: 'Medinan',
};

const nas: Surah = {
  id: 114,
  nameSimple: 'An-Nas',
  nameArabic: 'الناس',
  nameEnglish: 'Mankind',
  versesCount: 6,
  revelationType: 'Meccan',
};

function wrap(ui: React.ReactNode) {
  return <BrowserRouter>{ui}</BrowserRouter>;
}

describe('EosCard', () => {
  it('renders the end-of-surah headline with the surah name', () => {
    render(wrap(<EosCard surah={fatihah} />));
    expect(screen.getByText(/You've finished Surah Al-Fatihah/)).toBeInTheDocument();
  });

  it('links Reflect deeper to the surah Depth FAQs page', () => {
    render(wrap(<EosCard surah={fatihah} />));
    const link = screen.getByRole('link', { name: /reflect deeper/i });
    expect(link).toHaveAttribute('href', '/quran/surah/1/depth-faqs');
  });

  it('links See the X-Ray to the surah X-Ray page', () => {
    render(wrap(<EosCard surah={fatihah} />));
    const link = screen.getByRole('link', { name: /see the x-ray/i });
    expect(link).toHaveAttribute('href', '/quran/surah/1/xray');
  });

  it('shows the Continue CTA when a next surah exists', () => {
    render(wrap(<EosCard surah={fatihah} nextSurah={baqarah} />));
    const link = screen.getByRole('link', { name: /continue to surah al-baqarah/i });
    expect(link).toHaveAttribute('href', '/quran/read?surah=2');
  });

  it('omits the Continue CTA on the final surah (no next)', () => {
    render(wrap(<EosCard surah={nas} nextSurah={null} />));
    expect(screen.queryByRole('link', { name: /continue to/i })).toBeNull();
  });

  it('softens the Reflect copy for non-pilot surahs', () => {
    // Pilot surahs are 1 + 2; surah 50 is outside the pilot.
    const surah50: Surah = { ...fatihah, id: 50, nameSimple: 'Qaf' };
    render(wrap(<EosCard surah={surah50} />));
    expect(screen.getByText(/curated FAQs coming for this surah/i)).toBeInTheDocument();
  });
});
