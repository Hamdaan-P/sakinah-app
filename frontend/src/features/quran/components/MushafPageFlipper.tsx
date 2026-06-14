/**
 * MushafPageFlipper
 *
 * Owns the cinematic 3D page-turn between Mushaf pages. Three layers are
 * always rendered (previous · current · next) so a flip never reveals an
 * empty page — and rendering the neighbours also warms the browser image
 * cache so the next/prev scan is ready. The current page is draggable; on
 * release we either snap back or commit the flip.
 *
 * Mushaf direction (RTL): swipe RIGHT advances to the next page, swipe
 * LEFT goes back. This matches how a reader physically flips a printed
 * Mushaf (page corner lifts from the right side).
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent } from 'framer-motion';
import { MushafImagePage } from './MushafImagePage';
import type { MushafTokens } from '../hooks/useMushafTheme';
import { mushafScriptMeta, type MushafScript } from '../data/mushafScripts';
import { useFlipController, MIN_PAGE } from './mushaf-flipper/_useFlipController';

interface Props {
  pageNumber: number;
  /** Which printed-Mushaf scan set to render. */
  script: MushafScript;
  tokens: MushafTokens;
  soundEnabled: boolean;
  onPageChange: (next: number) => void;
}

export function MushafPageFlipper({
  pageNumber,
  script,
  tokens,
  soundEnabled,
  onPageChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setWidth(containerRef.current.clientWidth);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxPage = mushafScriptMeta(script).pages;
  const { x, rotateY, shadowOpacity, prevOpacity, nextOpacity, onDragEnd } = useFlipController({
    width,
    pageNumber,
    soundEnabled,
    onPageChange,
    maxPage,
  });

  // The page is a flat, fully-resolved image at rest, and only becomes a
  // promoted 3D layer while it's actually being flipped. This matters for
  // sharpness: a layer kept under `will-change: transform` / `preserve-3d` is
  // rasterised once to a CSS-pixel texture and upscaled on high-DPR phones,
  // which softens the scan. Dropping the promotion at rest lets the browser
  // repaint the image at the device's full pixel density.
  const [flipping, setFlipping] = useState(false);
  useMotionValueEvent(x, 'change', (v) => {
    const moving = Math.abs(v) > 0.5;
    setFlipping((prev) => (prev === moving ? prev : moving));
  });

  const hasPrev = pageNumber > MIN_PAGE;
  const hasNext = pageNumber < maxPage;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ perspective: 1600, perspectiveOrigin: 'center', minHeight: 620 }}
    >
      {/* Previous page (revealed on left swipe) */}
      {hasPrev && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1, opacity: prevOpacity }}
        >
          <MushafImagePage pageNumber={pageNumber - 1} script={script} tokens={tokens} />
        </motion.div>
      )}

      {/* Next page (revealed on right swipe) */}
      {hasNext && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1, opacity: nextOpacity }}
        >
          <MushafImagePage pageNumber={pageNumber + 1} script={script} tokens={tokens} />
        </motion.div>
      )}

      {/* Current page (draggable, tilts) */}
      <motion.div
        className="relative w-full touch-pan-y"
        style={{
          zIndex: 2,
          x,
          rotateY,
          transformStyle: flipping ? 'preserve-3d' : 'flat',
          transformOrigin: 'center center',
          willChange: flipping ? 'transform' : 'auto',
        }}
        drag="x"
        dragConstraints={{ left: -width, right: width }}
        dragElastic={0.28}
        dragMomentum={false}
        onDragEnd={onDragEnd}
      >
        <MushafImagePage pageNumber={pageNumber} script={script} tokens={tokens} />

        {/* Drag shadow gradient overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)',
            opacity: shadowOpacity,
            mixBlendMode: 'multiply',
          }}
        />
      </motion.div>
    </div>
  );
}
