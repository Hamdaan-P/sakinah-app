import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AiDisclaimerBanner } from '../governance/AiDisclaimerBanner';

describe('AiDisclaimerBanner', () => {
  it('renders the full disclaimer by default', () => {
    render(<AiDisclaimerBanner />);
    const note = screen.getByRole('note');
    expect(note).toHaveTextContent(/AI-assisted/i);
    expect(note).toHaveTextContent(/verified scholarly sources/i);
    expect(note).toHaveTextContent(/qualified scholar/i);
  });

  it('renders compact copy when compact=true', () => {
    render(<AiDisclaimerBanner compact />);
    const note = screen.getByRole('note');
    expect(note).toHaveTextContent(/cited from verified sources/i);
  });

  it('uses an accessible note role with aria-label', () => {
    render(<AiDisclaimerBanner />);
    expect(screen.getByLabelText(/AI governance notice/i)).toBeInTheDocument();
  });
});
