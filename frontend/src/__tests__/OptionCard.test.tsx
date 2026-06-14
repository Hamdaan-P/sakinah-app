import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OptionCard } from '@/features/kyc/components/OptionCard';

describe('OptionCard', () => {
  it('renders the label', () => {
    render(<OptionCard label="Single" selected={false} onClick={() => {}} />);
    expect(screen.getByText('Single')).toBeInTheDocument();
  });

  it('shows description when provided', () => {
    render(
      <OptionCard
        label="Married"
        description="With one or more children"
        selected={false}
        onClick={() => {}}
      />
    );
    expect(screen.getByText('With one or more children')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    const { container } = render(
      <OptionCard label="Single" selected={false} onClick={() => {}} />
    );
    expect(container.querySelectorAll('p').length).toBe(0);
  });

  it('shows the selected check icon only when selected=true', () => {
    const { rerender, container } = render(
      <OptionCard label="A" selected={false} onClick={() => {}} />
    );
    // Check icon = svg child inside the gold-bg circle. Easier proxy: count svgs.
    const svgsWhenUnselected = container.querySelectorAll('svg').length;

    rerender(<OptionCard label="A" selected={true} onClick={() => {}} />);
    const svgsWhenSelected = container.querySelectorAll('svg').length;
    expect(svgsWhenSelected).toBeGreaterThan(svgsWhenUnselected);
  });

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<OptionCard label="Pick me" selected={false} onClick={onClick} />);
    await userEvent.click(screen.getByText('Pick me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders as a button (so keyboard activation works for free)', () => {
    render(<OptionCard label="x" selected={false} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
