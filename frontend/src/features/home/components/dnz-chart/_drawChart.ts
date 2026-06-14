/**
 * Canvas drawing routine for the DNZ price chart.
 */

import { CONFIG, C, fmt, catmullRomPoint } from './_config';
import type { Pt } from './_config';

export function drawChart(
  canvas: HTMLCanvasElement,
  data: Pt[],
  bullish: boolean,
  hoverIdx: number | null,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx || data.length < 2) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const pad = { top: 20, right: 52, bottom: 28, left: 8 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const prices = data.map((d) => d.price);
  const minP = CONFIG.minPrice - 0.1;
  const maxP = CONFIG.maxPrice + 0.1;
  const range = maxP - minP;

  const toX = (i: number) => pad.left + (i / (data.length - 1)) * cw;
  const toY = (p: number) => pad.top + (1 - (p - minP) / range) * ch;

  ctx.clearRect(0, 0, w, h);

  // ── Grid ───────────────────────────────────────────────
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const y = pad.top + (i / steps) * ch;
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();

    const val = maxP - (i / steps) * range;
    ctx.fillStyle = C.textMuted;
    ctx.font = '300 9px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(fmt(val, 2), w - pad.right + 6, y + 3);
  }

  // X labels
  ctx.textAlign = 'center';
  const interval = Math.max(1, Math.floor(data.length / 5));
  for (let i = 0; i < data.length; i += interval) {
    ctx.fillStyle = C.textMuted;
    ctx.font = '300 9px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      data[i].time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toX(i),
      h - pad.bottom + 14,
    );
  }

  // ── Build smooth spline path ───────────────────────────
  const segments = 8;
  const splinePoints: { x: number; y: number }[] = [];

  for (let i = 0; i < prices.length - 1; i++) {
    const p0 = prices[Math.max(0, i - 1)];
    const p1 = prices[i];
    const p2 = prices[Math.min(prices.length - 1, i + 1)];
    const p3 = prices[Math.min(prices.length - 1, i + 2)];

    for (let s = 0; s < segments; s++) {
      const t = s / segments;
      const idx = i + t;
      const py = catmullRomPoint(p0, p1, p2, p3, t);
      splinePoints.push({ x: toX(idx), y: toY(py) });
    }
  }
  splinePoints.push({ x: toX(prices.length - 1), y: toY(prices[prices.length - 1]) });

  const lineColor = bullish ? C.green : C.red;

  // ── Gradient fill ──────────────────────────────────────
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
  if (bullish) {
    grad.addColorStop(0, 'rgba(74,222,128, 0.30)');
    grad.addColorStop(0.4, 'rgba(74,222,128, 0.10)');
    grad.addColorStop(1, 'rgba(74,222,128, 0)');
  } else {
    grad.addColorStop(0, 'rgba(248,113,113, 0.30)');
    grad.addColorStop(0.4, 'rgba(248,113,113, 0.10)');
    grad.addColorStop(1, 'rgba(248,113,113, 0)');
  }

  ctx.beginPath();
  ctx.moveTo(splinePoints[0].x, splinePoints[0].y);
  for (let i = 1; i < splinePoints.length; i++) {
    ctx.lineTo(splinePoints[i].x, splinePoints[i].y);
  }
  ctx.lineTo(splinePoints[splinePoints.length - 1].x, pad.top + ch);
  ctx.lineTo(splinePoints[0].x, pad.top + ch);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Glow layer
  ctx.save();
  ctx.shadowColor = lineColor;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(splinePoints[0].x, splinePoints[0].y);
  for (let i = 1; i < splinePoints.length; i++) {
    ctx.lineTo(splinePoints[i].x, splinePoints[i].y);
  }
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Crisp line
  ctx.beginPath();
  ctx.moveTo(splinePoints[0].x, splinePoints[0].y);
  for (let i = 1; i < splinePoints.length; i++) {
    ctx.lineTo(splinePoints[i].x, splinePoints[i].y);
  }
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── Hover crosshair + tooltip ──────────────────────────
  if (hoverIdx !== null && hoverIdx >= 0 && hoverIdx < data.length) {
    const hx = toX(hoverIdx);
    const hy = toY(prices[hoverIdx]);

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(212,168,83, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx, pad.top);
    ctx.lineTo(hx, pad.top + ch);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(212,168,83, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, hy);
    ctx.lineTo(w - pad.right, hy);
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(hx, hy, 5, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx, hy, 8, 0, Math.PI * 2);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    const label = fmt(prices[hoverIdx]);
    const timeLabel = data[hoverIdx].time.toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const tooltipText = `${label}  ${timeLabel}`;
    ctx.font = '500 11px system-ui, -apple-system, sans-serif';
    const tw = ctx.measureText(tooltipText).width + 20;
    const th = 28;
    let tx = hx - tw / 2;
    if (tx < pad.left) tx = pad.left;
    if (tx + tw > w - pad.right) tx = w - pad.right - tw;
    const ty = hy - th - 14;

    ctx.fillStyle = 'rgba(10,14,22, 0.95)';
    ctx.beginPath();
    ctx.roundRect(tx, ty, tw, th, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(212,168,83, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = C.goldLight;
    ctx.textAlign = 'center';
    ctx.fillText(tooltipText, tx + tw / 2, ty + th / 2 + 4);
  } else {
    const lastPt = splinePoints[splinePoints.length - 1];

    ctx.beginPath();
    ctx.arc(lastPt.x, lastPt.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = bullish ? 'rgba(74,222,128, 0.15)' : 'rgba(248,113,113, 0.15)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(lastPt.x, lastPt.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = bullish ? 'rgba(74,222,128, 0.3)' : 'rgba(248,113,113, 0.3)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(lastPt.x, lastPt.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();

    ctx.save();
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = bullish ? 'rgba(74,222,128, 0.25)' : 'rgba(248,113,113, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lastPt.x + 12, lastPt.y);
    ctx.lineTo(w - pad.right, lastPt.y);
    ctx.stroke();
    ctx.restore();
  }
}
