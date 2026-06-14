/**
 * Branch geometry — builds the trunk + tangled branches + twig layout for the
 * BranchView visualisation. Pure math, no React.
 */

import { sr, cubicPt } from './_helpers';

export interface Twig {
  x1: number; y1: number; x2: number; y2: number;
  tipX: number; tipY: number; leafAngle: number;
}

export interface BranchData {
  trunk: { x0: number; y0: number; cx1: number; cy1: number; cx2: number; cy2: number; x3: number; y3: number };
  branchA: { x0: number; y0: number; cx1: number; cy1: number; cx2: number; cy2: number; x3: number; y3: number };
  branchB: { x0: number; y0: number; cx1: number; cy1: number; cx2: number; cy2: number; x3: number; y3: number };
  branchC: { x0: number; y0: number; cx1: number; cy1: number; x3: number; y3: number };
  tipA: { x0: number; y0: number; cx: number; cy: number; x1: number; y1: number };
  tipB: { x0: number; y0: number; cx: number; cy: number; x1: number; y1: number };
  twigs: Twig[];
  decoLeaves: never[];
}

export function buildBranchData(count: number, svgW: number, svgH: number): BranchData {
  const rand = sr(17);

  // Main trunk: lower-left to upper-right, ~20° angle
  const trunk = {
    x0: 0, y0: svgH * 0.72,
    cx1: svgW * 0.12, cy1: svgH * 0.65,
    cx2: svgW * 0.28, cy2: svgH * 0.52,
    x3: svgW * 0.42, y3: svgH * 0.46,
  };

  // After trunk, it splits into 2-3 tangled branches
  const branchA = {
    x0: trunk.x3, y0: trunk.y3,
    cx1: svgW * 0.52, cy1: svgH * 0.38,
    cx2: svgW * 0.68, cy2: svgH * 0.32,
    x3: svgW * 0.85, y3: svgH * 0.25,
  };

  const branchB = {
    x0: trunk.x3, y0: trunk.y3,
    cx1: svgW * 0.50, cy1: svgH * 0.50,
    cx2: svgW * 0.65, cy2: svgH * 0.48,
    x3: svgW * 0.82, y3: svgH * 0.42,
  };

  const branchC = {
    x0: svgW * 0.55, y0: svgH * 0.40,
    cx1: svgW * 0.65, cy1: svgH * 0.28,
    x3: svgW * 0.78, y3: svgH * 0.20,
  };

  // Extending tips
  const tipA = {
    x0: branchA.x3, y0: branchA.y3,
    cx: svgW * 0.92, cy: svgH * 0.20,
    x1: svgW * 0.98, y1: svgH * 0.18,
  };

  const tipB = {
    x0: branchB.x3, y0: branchB.y3,
    cx: svgW * 0.90, cy: svgH * 0.45,
    x1: svgW * 0.97, y1: svgH * 0.38,
  };

  // Sub-twigs that hold blessings
  const twigs: Twig[] = [];

  // All blessings go along ONE continuous path: trunk → branchA, left to right
  const trunkSlots = Math.ceil(count * 0.4);
  const branchSlots = count - trunkSlots;

  // Build a unified path: sample points along trunk then branchA
  const pathPoints: { x: number; y: number }[] = [];

  for (let i = 0; i < trunkSlots; i++) {
    const t = 0.25 + (i / Math.max(trunkSlots - 1, 1)) * 0.7;
    pathPoints.push({
      x: cubicPt(trunk.x0, trunk.cx1, trunk.cx2, trunk.x3, t),
      y: cubicPt(trunk.y0, trunk.cy1, trunk.cy2, trunk.y3, t),
    });
  }
  for (let i = 0; i < branchSlots; i++) {
    const t = 0.05 + (i / Math.max(branchSlots - 1, 1)) * 0.9;
    pathPoints.push({
      x: cubicPt(branchA.x0, branchA.cx1, branchA.cx2, branchA.x3, t),
      y: cubicPt(branchA.y0, branchA.cy1, branchA.cy2, branchA.y3, t),
    });
  }

  // Create a twig for each blessing, alternating up/down, left to right
  for (let i = 0; i < count; i++) {
    const pt = pathPoints[i];
    if (!pt) continue;

    const goUp = i % 2 === 0;
    const twigLen = 100 + rand() * 55;
    const twigAngle = goUp ? -(50 + rand() * 25) : (50 + rand() * 25);
    const rad = (twigAngle * Math.PI) / 180;

    const tx = pt.x + Math.cos(rad) * twigLen;
    const ty = pt.y + Math.sin(rad) * twigLen;
    const leafAngle = twigAngle + (rand() - 0.5) * 30;

    twigs.push({ x1: pt.x, y1: pt.y, x2: tx, y2: ty, tipX: tx, tipY: ty, leafAngle });
  }

  const decoLeaves: never[] = [];

  // ── Step 1: Force alternating sides FIRST ──
  const pad = 100;
  const minTwigLen = 100;

  for (let i = 0; i < twigs.length; i++) {
    const shouldBeAbove = i % 2 === 0;
    const isAbove = twigs[i].tipY < twigs[i].y1;
    if (shouldBeAbove && !isAbove) {
      twigs[i].tipY = twigs[i].y1 - Math.abs(twigs[i].tipY - twigs[i].y1);
    } else if (!shouldBeAbove && isAbove) {
      twigs[i].tipY = twigs[i].y1 + Math.abs(twigs[i].tipY - twigs[i].y1);
    }
    twigs[i].y2 = twigs[i].tipY;
  }

  // ── Step 2: Enforce minimum twig length ──
  for (const tw of twigs) {
    const dx = tw.tipX - tw.x1;
    const dy = tw.tipY - tw.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < minTwigLen && len > 0) {
      const scale = minTwigLen / len;
      tw.tipX = tw.x1 + dx * scale;
      tw.tipY = tw.y1 + dy * scale;
    }
  }

  // ── Step 3: Collision resolution — only push HORIZONTALLY ──
  const minDistX = 160;

  for (let pass = 0; pass < 20; pass++) {
    let moved = false;
    for (let i = 0; i < twigs.length; i++) {
      for (let j = i + 1; j < twigs.length; j++) {
        const dx = twigs[j].tipX - twigs[i].tipX;
        const dy = twigs[j].tipY - twigs[i].tipY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistX && dist > 0) {
          const pushX = (minDistX - Math.abs(dx)) / 2 + 10;
          if (twigs[j].tipX >= twigs[i].tipX) {
            twigs[i].tipX -= pushX;
            twigs[j].tipX += pushX;
          } else {
            twigs[i].tipX += pushX;
            twigs[j].tipX -= pushX;
          }
          twigs[i].x2 = twigs[i].tipX;
          twigs[j].x2 = twigs[j].tipX;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  // ── Step 4: Clamp inside SVG bounds ──
  for (const tw of twigs) {
    tw.tipX = Math.max(250, Math.min(svgW - pad, tw.tipX));
    tw.tipY = Math.max(60, Math.min(svgH - 60, tw.tipY));
    tw.x2 = tw.tipX;
    tw.y2 = tw.tipY;
  }

  return { trunk, branchA, branchB, branchC, tipA, tipB, twigs, decoLeaves };
}
