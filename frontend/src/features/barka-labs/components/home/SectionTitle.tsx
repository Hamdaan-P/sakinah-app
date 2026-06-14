/**
 * SectionTitle — gold heading used between BarkaLabsHome sections.
 */

import { getDemoDisplayFont } from '@/i18n';

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg md:text-xl font-bold tracking-wide mb-3 md:mb-5" style={{ fontFamily: getDemoDisplayFont(), color: '#D7B56A', letterSpacing: '0.02em' }}>
      {children}
    </h3>
  );
}
