/**
 * Shared starfield background for Stages A/B/C/D and desktop Stage E.
 *
 * Pure CSS — no canvas, no JS animation loop. Soft gold radial glow on top
 * of the deep ink bg, plus a faint emerald accent in the lower-left so the
 * surface doesn't feel flat. Cheap, accessible, respects prefers-reduced-motion.
 */

import { memo } from 'react';

export const Starfield = memo(function Starfield() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-0"
      style={{
        backgroundColor: '#06080D',
        backgroundImage: [
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,168,83,0.10), transparent 60%)',
          'radial-gradient(ellipse 60% 50% at 0% 100%, rgba(42,157,111,0.06), transparent 60%)',
          'radial-gradient(ellipse 70% 60% at 100% 100%, rgba(212,168,83,0.04), transparent 60%)',
        ].join(', '),
      }}
    />
  );
});
