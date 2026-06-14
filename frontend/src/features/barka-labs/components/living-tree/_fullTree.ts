/**
 * Full-tree (zoomed-out) compute + canvas paint pass.
 * Generates branches recursively, decorative canopy leaves, and twinkling stars.
 */

import { seeded } from './_seeded';

export interface TreeBranch {
  x1: number; y1: number;
  cx: number; cy: number;
  x2: number; y2: number;
  thickness: number;
  depth: number;
  progress: number; // 0 (trunk) to 1 (tip)
}

export function computeFullTree(w: number, h: number, count: number) {
  const branches: TreeBranch[] = [];
  const rand = seeded(13);
  const baseX = w / 2;
  const baseY = h - 20;
  const maxD = Math.min(4 + Math.floor(count / 3), 11);
  const trunkH = Math.min(120 + count * 10, h * 0.42);
  const trunkW = Math.min(10 + count * 0.5, 22);

  function build(x1: number, y1: number, ang: number, len: number, thick: number, d: number) {
    if (d > maxD || len < 4) return;
    const rad = (ang * Math.PI) / 180;
    const x2 = x1 + Math.sin(rad) * len;
    const y2 = y1 - Math.cos(rad) * len;
    const cx = (x1 + x2) / 2 + Math.sin(rad + Math.PI / 2) * len * 0.1;
    const cy = (y1 + y2) / 2;
    branches.push({ x1, y1, cx, cy, x2, y2, thickness: thick, depth: d, progress: d / maxD });

    const spread = 20 + d * 5;
    const kids = d < 2 ? 3 : rand() > 0.2 ? 2 : 3;
    for (let i = 0; i < kids; i++) {
      const a = ang + (i - (kids - 1) / 2) * spread + (rand() - 0.5) * 12;
      build(x2, y2, a, len * (0.55 + rand() * 0.2), thick * 0.58, d + 1);
    }
  }

  build(baseX, baseY, 0, trunkH, trunkW, 0);

  // Canopy leaves (purely decorative, no interaction)
  const leafRand = seeded(77);
  const canopyLeaves: { x: number; y: number; size: number; r: number; g: number; b: number; a: number }[] = [];
  const tipBranches = branches.filter(b => b.progress > 0.7);
  const leafCount = Math.min(count * 8 + 40, 350);
  for (let i = 0; i < leafCount; i++) {
    const tb = tipBranches[i % tipBranches.length];
    if (!tb) continue;
    const gold = leafRand();
    canopyLeaves.push({
      x: tb.x2 + (leafRand() - 0.5) * 55,
      y: tb.y2 + (leafRand() - 0.5) * 45 - 10,
      size: 2 + leafRand() * 4,
      r: Math.round(80 + gold * 135),
      g: Math.round(100 + gold * 81),
      b: Math.round(30 + gold * 76),
      a: 0.12 + leafRand() * 0.3,
    });
  }

  // Stars
  const starRand = seeded(42);
  const stars = Array.from({ length: 100 }, () => ({
    x: starRand() * w, y: starRand() * h * 0.6,
    size: 0.4 + starRand() * 1, phase: starRand() * 6.28,
  }));

  return { branches, canopyLeaves, stars };
}

export function renderFullTree(
  ctx: CanvasRenderingContext2D, w: number, h: number, time: number,
  data: ReturnType<typeof computeFullTree>,
) {
  ctx.clearRect(0, 0, w, h);

  // Stars — brighter, glowy twinkle
  for (const s of data.stars) {
    const twinkle = Math.sin(time * 1.5 + s.phase) * 0.5 + 0.5;
    const a = 0.15 + twinkle * 0.6;
    const glowSize = s.size * (2 + twinkle * 3);

    // Outer glow
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowSize);
    grad.addColorStop(0, `rgba(215,181,106,${a * 0.3})`);
    grad.addColorStop(0.4, `rgba(215,181,106,${a * 0.08})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(s.x - glowSize, s.y - glowSize, glowSize * 2, glowSize * 2);

    // Core
    ctx.beginPath(); ctx.arc(s.x, s.y, s.size * (0.8 + twinkle * 0.4), 0, 6.28);
    ctx.fillStyle = `rgba(255,245,220,${a})`;
    ctx.fill();
  }

  // Branches — no glow, just clean dark wood
  for (const b of data.branches) {
    const p = b.progress;
    const r = Math.round(45 + p * 120);
    const g = Math.round(30 + p * 95);
    const bv = Math.round(20 + p * 50);

    ctx.beginPath(); ctx.moveTo(b.x1, b.y1);
    ctx.quadraticCurveTo(b.cx, b.cy, b.x2, b.y2);
    ctx.strokeStyle = `rgba(${r},${g},${bv},${0.9 - p * 0.3})`;
    ctx.lineWidth = b.thickness; ctx.lineCap = 'round'; ctx.stroke();
  }

  // Canopy leaves
  for (let i = 0; i < data.canopyLeaves.length; i++) {
    const l = data.canopyLeaves[i];
    const sway = Math.sin(time * 0.15 + i * 0.3) * 0.8;
    ctx.save();
    ctx.translate(l.x + sway, l.y);
    ctx.beginPath();
    ctx.ellipse(0, 0, l.size, l.size * 0.5, (i % 3) * 0.5, 0, 6.28);
    ctx.fillStyle = `rgba(${l.r},${l.g},${l.b},${l.a})`;
    ctx.fill(); ctx.restore();
  }
}
