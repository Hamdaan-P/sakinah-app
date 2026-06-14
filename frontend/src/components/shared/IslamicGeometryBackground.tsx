/**
 * IslamicGeometryBackground
 *
 * Slowly rotating 8-point-star tessellation watermark. Designed to live
 * inside a `position: relative` parent — fills the parent absolutely with
 * very low opacity. Honours `prefers-reduced-motion`.
 */

import { useEffect, useState } from 'react';

interface Props {
  /** Override the default opacity (default 0.05). */
  opacity?: number;
  /** Tint colour for the strokes (default gold). */
  color?: string;
  /** Set to `false` to render statically. */
  animate?: boolean;
}

const PATTERN_ID = 'zp-islamic-stars';

export function IslamicGeometryBackground({ opacity = 0.05, color = '#D4A853', animate = true }: Props) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const shouldAnimate = animate && !reducedMotion;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity }}
    >
      <svg
        width="100%"
        height="100%"
        className={shouldAnimate ? 'zp-geom-rotate' : ''}
        style={{ minWidth: '140%', minHeight: '140%', transformOrigin: '50% 50%' }}
      >
        <defs>
          <pattern id={PATTERN_ID} width="80" height="80" patternUnits="userSpaceOnUse">
            <g stroke={color} strokeWidth="0.6" fill="none">
              {/* Two overlapping rotated squares form an 8-point star. */}
              <rect x="20" y="20" width="40" height="40" />
              <rect x="20" y="20" width="40" height="40" transform="rotate(45 40 40)" />
              {/* Inner accent circle */}
              <circle cx="40" cy="40" r="6" />
              {/* Mid-edge dots */}
              <circle cx="40" cy="0" r="1" fill={color} />
              <circle cx="40" cy="80" r="1" fill={color} />
              <circle cx="0" cy="40" r="1" fill={color} />
              <circle cx="80" cy="40" r="1" fill={color} />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${PATTERN_ID})`} />
      </svg>
    </div>
  );
}
