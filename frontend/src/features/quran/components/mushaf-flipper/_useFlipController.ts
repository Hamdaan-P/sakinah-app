/**
 * useFlipController — encapsulates the drag/animate state for MushafPageFlipper:
 * x motion value, derived rotateY/shadow/peek opacities, commitFlip/animateX
 * helpers, and onDragEnd resolver.
 */

import { useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { haptic, playPageFlipSound } from '@/lib/haptics';

const MIN_PAGE = 1;
const MAX_PAGE = 604;
const FLIP_DISTANCE_RATIO = 0.28;
const FLIP_VELOCITY = 480;

interface Args {
  width: number;
  pageNumber: number;
  soundEnabled: boolean;
  onPageChange: (next: number) => void;
  /** Last page of the current edition (defaults to the 604 Madani layout). */
  maxPage?: number;
}

export function useFlipController({ width, pageNumber, soundEnabled, onPageChange, maxPage = MAX_PAGE }: Args) {
  const x = useMotionValue(0);

  const rotateY = useTransform(x, (v) => {
    if (!width) return 0;
    const ratio = Math.max(-1, Math.min(1, v / width));
    return ratio * -65;
  });
  const shadowOpacity = useTransform(x, (v) => {
    if (!width) return 0;
    return Math.min(0.5, (Math.abs(v) / width) * 0.6);
  });
  const prevOpacity = useTransform(x, (v) => (v < 0 && width ? Math.min(1, -v / width) : 0));
  const nextOpacity = useTransform(x, (v) => (v > 0 && width ? Math.min(1, v / width) : 0));

  const animateX = (target: number, duration = 240): Promise<void> => {
    return new Promise((resolve) => {
      const start = performance.now();
      const from = x.get();
      const tick = (t: number) => {
        const k = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - k, 3);
        x.set(from + (target - from) * eased);
        if (k < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  };

  const commitFlip = async (delta: 1 | -1) => {
    void haptic.light();
    if (soundEnabled) playPageFlipSound();
    const target = delta === 1 ? width : -width;
    await animateX(target);
    onPageChange(pageNumber + delta);
    // Snap back to centre — the new page is now mounted at the same coords.
    x.set(0);
  };

  const onDragEnd = (_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (!width) {
      x.set(0);
      return;
    }
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const goNext = (offset > width * FLIP_DISTANCE_RATIO || velocity > FLIP_VELOCITY) && pageNumber < maxPage;
    const goPrev = (offset < -width * FLIP_DISTANCE_RATIO || velocity < -FLIP_VELOCITY) && pageNumber > MIN_PAGE;
    if (goNext) {
      void commitFlip(1);
    } else if (goPrev) {
      void commitFlip(-1);
    } else {
      void animateX(0, 220);
    }
  };

  return { x, rotateY, shadowOpacity, prevOpacity, nextOpacity, onDragEnd };
}

export { MIN_PAGE, MAX_PAGE };
