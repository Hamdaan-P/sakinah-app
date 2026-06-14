/**
 * Helpers for measuring/positioning the walkthrough tooltip.
 */

import type { WalkthroughStep } from './_steps';

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function getRect(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function scrollToTarget(target: string) {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
}

export function computeTooltipStyle(
  rect: Rect | null,
  step: WalkthroughStep,
  isMobile: boolean,
  pad: number,
): React.CSSProperties {
  const margin = 16;
  const cardW = isMobile ? window.innerWidth - 32 : 400;
  const gap = 14;

  if (!rect) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxHeight: `calc(100vh - ${margin * 2}px)`,
    };
  }

  // Horizontal clamp shared by top/bottom placements
  let left = rect.left + rect.width / 2 - cardW / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - cardW - margin));

  if (step.tooltipSide === 'top') {
    const bottom = window.innerHeight - rect.top + gap + pad;
    const maxHeight = Math.max(160, window.innerHeight - bottom - margin);
    return { bottom, left, maxHeight };
  }

  if (step.tooltipSide === 'right') {
    const top = Math.max(margin, rect.top - 10);
    const leftPos = Math.min(
      rect.left + rect.width + gap + pad,
      window.innerWidth - cardW - margin,
    );
    const maxHeight = Math.max(160, window.innerHeight - top - margin);
    return { top, left: leftPos, maxHeight };
  }

  // bottom (default) — flip above when there's not enough room below
  const topBelow = rect.top + rect.height + gap + pad;
  const spaceBelow = window.innerHeight - topBelow - margin;
  const spaceAbove = rect.top - gap - pad - margin;

  if (spaceBelow >= 240 || spaceBelow >= spaceAbove) {
    return { top: topBelow, left, maxHeight: Math.max(160, spaceBelow) };
  }
  const bottom = window.innerHeight - rect.top + gap + pad;
  return { bottom, left, maxHeight: Math.max(160, spaceAbove) };
}
