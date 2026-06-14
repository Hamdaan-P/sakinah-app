import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SimulationModePill } from '../SimulationModePill';

/**
 * Build-spec P2-3.a threat-model row 1 + decision D-B: the pill must always
 * advertise the virtual-money distinction independent of the A7 surface label.
 * These assertions are the regression guard against the copy/testid being
 * dropped or weakened on any sim surface.
 */
describe('SimulationModePill', () => {
  it('renders the SIMULATION label', () => {
    render(<SimulationModePill />);
    expect(screen.getByText('SIMULATION')).toBeInTheDocument();
  });

  it('states virtual capital with no real money', () => {
    render(<SimulationModePill />);
    expect(
      screen.getByText(/Virtual capital · No real money/i),
    ).toBeInTheDocument();
  });

  it('exposes a stable test hook for sim-page presence checks', () => {
    render(<SimulationModePill />);
    expect(screen.getByTestId('simulation-mode-pill')).toBeInTheDocument();
  });
});
