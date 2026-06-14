/**
 * Stem-view (zoomed-in close-up) geometry: organic main branch + secondary
 * branch + sub-branches + decorative leaves. Pure math.
 */

import { seeded } from './_seeded';

export interface StemBranch {
  x1: number; y1: number;
  cx: number; cy: number;
  x2: number; y2: number;
  thickness: number;
  tipX: number; tipY: number;
  goUp: boolean;
}

export function computeStemLayout(w: number, h: number, count: number) {
  const rand = seeded(31);
  const branches: StemBranch[] = [];

  // Main branch: enters from bottom-left, curves up and to the right
  const mainPts = {
    x0: -30, y0: h * 0.62,
    cx1: w * 0.15, cy1: h * 0.48,
    cx2: w * 0.45, cy2: h * 0.42,
    x3: w * 0.75, y3: h * 0.38,
  };

  // Secondary branch continues from main
  const secPts = {
    x0: w * 0.75, y0: h * 0.38,
    cx1: w * 0.85, cy1: h * 0.34,
    x3: w * 1.05, y3: h * 0.28,
  };

  // Sample points along main bezier for sub-branch attachment
  function sampleBezier(t: number) {
    const p = mainPts;
    const mt = 1 - t;
    const x = mt * mt * mt * p.x0 + 3 * mt * mt * t * p.cx1 + 3 * mt * t * t * p.cx2 + t * t * t * p.x3;
    const y = mt * mt * mt * p.y0 + 3 * mt * mt * t * p.cy1 + 3 * mt * t * t * p.cy2 + t * t * t * p.y3;
    const dx = -3 * mt * mt * p.x0 + 3 * (mt * mt - 2 * mt * t) * p.cx1 + 3 * (2 * mt * t - t * t) * p.cx2 + 3 * t * t * p.x3;
    const dy = -3 * mt * mt * p.y0 + 3 * (mt * mt - 2 * mt * t) * p.cy1 + 3 * (2 * mt * t - t * t) * p.cy2 + 3 * t * t * p.y3;
    return { x, y, angle: Math.atan2(dy, dx) };
  }

  function sampleSec(t: number) {
    const p = secPts;
    const mt = 1 - t;
    const x = mt * mt * p.x0 + 2 * mt * t * p.cx1 + t * t * p.x3;
    const y = mt * mt * p.y0 + 2 * mt * t * p.cy1 + t * t * p.y3;
    return { x, y };
  }

  // Distribute blessings along the branches
  const totalSlots = count;
  const mainSlots = Math.ceil(totalSlots * 0.7);
  const secSlots = totalSlots - mainSlots;

  for (let i = 0; i < mainSlots; i++) {
    const t = 0.15 + (i / Math.max(mainSlots - 1, 1)) * 0.8;
    const pt = sampleBezier(t);
    const goUp = (i % 2 === 0);

    const len = 60 + rand() * 50;
    const perpAngle = pt.angle + Math.PI / 2 * (goUp ? -1 : 1);

    const endX = pt.x + Math.cos(perpAngle) * len + (rand() - 0.5) * 30;
    const endY = pt.y + Math.sin(perpAngle) * len;
    const cx = (pt.x + endX) / 2 + (rand() - 0.5) * 20;
    const cy = (pt.y + endY) / 2 + (goUp ? -15 : 15) * rand();

    branches.push({
      x1: pt.x, y1: pt.y, cx, cy, x2: endX, y2: endY,
      thickness: 2.5 - (i / mainSlots) * 0.8,
      tipX: endX, tipY: endY, goUp,
    });
  }

  for (let i = 0; i < secSlots; i++) {
    const t = 0.2 + (i / Math.max(secSlots - 1, 1)) * 0.6;
    const pt = sampleSec(t);
    const goUp = (i % 2 === 0);
    const len = 50 + rand() * 40;
    const angle = goUp ? -Math.PI * 0.35 - rand() * 0.3 : Math.PI * 0.3 + rand() * 0.3;

    const endX = pt.x + Math.cos(angle) * len;
    const endY = pt.y + Math.sin(angle) * len;
    const cx = (pt.x + endX) / 2 + (rand() - 0.5) * 15;
    const cy = (pt.y + endY) / 2;

    branches.push({
      x1: pt.x, y1: pt.y, cx, cy, x2: endX, y2: endY,
      thickness: 1.8, tipX: endX, tipY: endY, goUp,
    });
  }

  // Decorative small leaves on branches (no blessing attached)
  const decoLeaves: { x: number; y: number; size: number; rot: number; color: string }[] = [];
  const leafRand = seeded(88);
  for (const b of branches) {
    const n = 2 + Math.floor(leafRand() * 3);
    for (let j = 0; j < n; j++) {
      const t = 0.3 + leafRand() * 0.6;
      const lx = b.x1 + (b.x2 - b.x1) * t + (leafRand() - 0.5) * 8;
      const ly = b.y1 + (b.y2 - b.y1) * t + (leafRand() - 0.5) * 8;
      const gold = leafRand();
      decoLeaves.push({
        x: lx, y: ly,
        size: 3 + leafRand() * 5,
        rot: leafRand() * Math.PI,
        color: `rgba(${Math.round(80 + gold * 135)},${Math.round(110 + gold * 71)},${Math.round(40 + gold * 66)},${0.2 + leafRand() * 0.3})`,
      });
    }
  }

  return { mainPts, secPts, branches, decoLeaves };
}

/** Currently unused alternate canvas render path for the stem view. */
export function _renderStemView(
  ctx: CanvasRenderingContext2D, w: number, h: number, time: number,
  stemData: ReturnType<typeof computeStemLayout>,
) {
  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = '#080C16';
  ctx.fillRect(0, 0, w, h);

  // Bokeh
  const bokRand = seeded(55);
  for (let i = 0; i < 18; i++) {
    const x = bokRand() * w;
    const y = bokRand() * h;
    const r = 25 + bokRand() * 70;
    const a = 0.008 + bokRand() * 0.02;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(215,181,106,${a})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  const mp = stemData.mainPts;
  const sp = stemData.secPts;

  // Main branch — thick, organic
  ctx.beginPath();
  ctx.moveTo(mp.x0, mp.y0);
  ctx.bezierCurveTo(mp.cx1, mp.cy1, mp.cx2, mp.cy2, mp.x3, mp.y3);
  ctx.strokeStyle = 'rgba(120,85,40,0.95)';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round'; ctx.stroke();

  // Main branch highlight (lighter inner line)
  ctx.beginPath();
  ctx.moveTo(mp.x0, mp.y0);
  ctx.bezierCurveTo(mp.cx1, mp.cy1 - 1, mp.cx2, mp.cy2 - 1, mp.x3, mp.y3 - 1);
  ctx.strokeStyle = 'rgba(180,140,70,0.3)';
  ctx.lineWidth = 4; ctx.stroke();

  // Main branch glow
  ctx.beginPath();
  ctx.moveTo(mp.x0, mp.y0);
  ctx.bezierCurveTo(mp.cx1, mp.cy1, mp.cx2, mp.cy2, mp.x3, mp.y3);
  ctx.strokeStyle = 'rgba(215,181,106,0.04)';
  ctx.lineWidth = 30; ctx.stroke();

  // Secondary branch
  ctx.beginPath();
  ctx.moveTo(sp.x0, sp.y0);
  ctx.quadraticCurveTo(sp.cx1, sp.cy1, sp.x3, sp.y3);
  ctx.strokeStyle = 'rgba(120,85,40,0.8)';
  ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();

  // Secondary highlight
  ctx.beginPath();
  ctx.moveTo(sp.x0, sp.y0);
  ctx.quadraticCurveTo(sp.cx1, sp.cy1 - 1, sp.x3, sp.y3 - 1);
  ctx.strokeStyle = 'rgba(180,140,70,0.2)';
  ctx.lineWidth = 2.5; ctx.stroke();

  // Sub-branches
  for (const b of stemData.branches) {
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.quadraticCurveTo(b.cx, b.cy, b.x2, b.y2);
    ctx.strokeStyle = `rgba(110,80,40,${0.5 + b.thickness * 0.1})`;
    ctx.lineWidth = b.thickness;
    ctx.lineCap = 'round'; ctx.stroke();
  }

  // Decorative leaves
  for (let i = 0; i < stemData.decoLeaves.length; i++) {
    const l = stemData.decoLeaves[i];
    const sway = Math.sin(time * 0.15 + i * 0.7) * 0.8;
    ctx.save();
    ctx.translate(l.x + sway, l.y);
    ctx.rotate(l.rot + Math.sin(time * 0.1 + i) * 0.03);
    ctx.beginPath();
    // Leaf shape — pointed ellipse
    ctx.moveTo(0, -l.size * 0.5);
    ctx.quadraticCurveTo(l.size * 0.5, 0, 0, l.size * 0.5);
    ctx.quadraticCurveTo(-l.size * 0.5, 0, 0, -l.size * 0.5);
    ctx.fillStyle = l.color;
    ctx.fill(); ctx.restore();
  }

  // Floating motes
  for (let i = 0; i < 15; i++) {
    const ph = i * 2.1;
    const x = w * 0.1 + (Math.sin(time * 0.06 + ph) * 0.5 + 0.5) * w * 0.8;
    const y = h * 0.1 + (Math.cos(time * 0.04 + ph) * 0.5 + 0.5) * h * 0.8;
    const a = (Math.sin(time * 0.3 + i) * 0.5 + 0.5) * 0.1;
    ctx.beginPath(); ctx.arc(x, y, 1, 0, 6.28);
    ctx.fillStyle = `rgba(215,181,106,${a})`; ctx.fill();
  }
}
