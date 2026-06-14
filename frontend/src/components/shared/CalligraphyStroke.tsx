/**
 * CalligraphyStroke
 *
 * Wraps a string of text (typically Arabic in a calligraphy font) with a
 * stroke-then-fill animation: the text outlines draw in over ~1.4s,
 * then the fill fades in. Visually mimics traditional Arabic
 * calligraphy being inked.
 *
 * Implementation: SVG <text> with stroke-dasharray + stroke-dashoffset
 * animated to 0, followed by a fill colour transition. Pure CSS, no JS
 * timer. Honours prefers-reduced-motion (skips animation).
 */

import { useEffect, useId, useState } from 'react';

interface Props {
  text: string;
  color?: string;
  /** Total height of the SVG box in px. The font size is derived from this. */
  size?: number;
  /** BCP-47 lang attribute on the text node. Default "ar". */
  lang?: string;
  /** Tailwind/CSS classes on the wrapping span */
  className?: string;
  /** Stroke duration in seconds, default 1.4 */
  durationSec?: number;
}

export function CalligraphyStroke({
  text,
  color = '#D4A853',
  size = 64,
  lang = 'ar',
  className,
  durationSec = 1.4,
}: Props) {
  const id = useId().replace(/:/g, '');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Width = text length * size * 0.6 (rough heuristic for Arabic)
  const width = Math.max(120, text.length * size * 0.55);

  return (
    <span className={className} style={{ display: 'inline-block', lineHeight: 0 }}>
      <svg
        width={width}
        height={size + 12}
        viewBox={`0 0 ${width} ${size + 12}`}
        aria-label={text}
        role="img"
      >
        <defs>
          <style>{`
            .zp-cs-${id}-stroke {
              fill: transparent;
              stroke: ${color};
              stroke-width: 1.1;
              ${reducedMotion
                ? `fill: ${color}; stroke: transparent;`
                : `stroke-dasharray: 600; stroke-dashoffset: 600; animation: zp-cs-${id}-draw ${durationSec}s ease-out forwards, zp-cs-${id}-fill 0.6s ease-in ${durationSec}s forwards;`}
            }
            @keyframes zp-cs-${id}-draw {
              to { stroke-dashoffset: 0; }
            }
            @keyframes zp-cs-${id}-fill {
              to { fill: ${color}; stroke: transparent; }
            }
          `}</style>
        </defs>
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          lang={lang}
          style={{ direction: 'rtl' }}
          fontFamily="'Amiri Quran', 'Amiri', serif"
          fontSize={size}
          className={`zp-cs-${id}-stroke`}
        >
          {text}
        </text>
      </svg>
    </span>
  );
}
