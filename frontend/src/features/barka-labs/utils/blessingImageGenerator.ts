/**
 * blessingImageGenerator.ts
 * Instagram Story (1080x1920) with AI background.
 * Top: Logo + branding. Center: frosted card with blessing + reflection.
 * Bottom: Quran verse + stats + swipe-up arrow.
 */

import { generateShareImage } from '../services/barkaLabsService';
import logoUrl from '@/assets/zaryah-logo-full.png';

export interface BlessingShareData {
  text: string;
  depth: string;
  score: number;
  isOthers?: boolean;
}

const W = 1080;
const H = 1920;

const GOLD = '#D7B56A';
const CREAM = '#EBDCB8';

const FONT_D = '"Cormorant Garamond", Georgia, serif';
const FONT_B = '"Noto Sans", "Segoe UI", sans-serif';

// Curated Quran verses about gratitude
const QURAN_VERSES = [
  { text: 'If you are grateful, I will surely increase you.', ref: 'Quran 14:7' },
  { text: 'Remember Me, and I will remember you. Be grateful to Me.', ref: 'Quran 2:152' },
  { text: 'And He gave you from all you asked of Him.', ref: 'Quran 14:34' },
  { text: 'Which of the favours of your Lord will you deny?', ref: 'Quran 55:13' },
  { text: 'And in the earth are signs for those who have certainty.', ref: 'Quran 51:20' },
  { text: 'He it is who made the earth subservient to you.', ref: 'Quran 67:15' },
  { text: 'So verily, with hardship, there is ease.', ref: 'Quran 94:5' },
  { text: 'And few of My servants are grateful.', ref: 'Quran 34:13' },
];

function pickVerse() {
  return QURAN_VERSES[Math.floor(Math.random() * QURAN_VERSES.length)];
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.replace(/\n+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (lines.length >= maxLines) break;
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = t;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines) {
    const l = lines[maxLines - 1];
    if (l && !l.endsWith('...')) {
      lines[maxLines - 1] = ctx.measureText(l + '...').width > maxW
        ? l.split(' ').slice(0, -1).join(' ') + '...' : l + '...';
    }
  }
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawTextShadow(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number,
  blur = 24, color = 'rgba(0,0,0,0.8)',
) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = 3;
  ctx.fillText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.restore();
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r); ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
}

/** Draw a small upward chevron arrow */
function drawSwipeArrow(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Chevron
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy + 6);
  ctx.lineTo(cx, cy - 6);
  ctx.lineTo(cx + 14, cy + 6);
  ctx.stroke();
  ctx.restore();
}

export async function generateBlessingCard(data: BlessingShareData): Promise<Blob> {
  await document.fonts.ready;

  const [aiResult, logo] = await Promise.all([
    generateShareImage(data.text, data.depth, data.score),
    loadImage(logoUrl),
  ]);

  const reflectionPrompt = aiResult.reflection_prompt || '';
  const totalBlessings = aiResult.total_blessings || 0;
  const verse = pickVerse();

  const bgImg = await loadImage(`data:image/png;base64,${aiResult.image}`);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Draw AI background (cover fit) ──
  const imgRatio = bgImg.width / bgImg.height;
  const canvasRatio = W / H;
  let sx = 0, sy = 0, sw = bgImg.width, sh = bgImg.height;
  if (imgRatio > canvasRatio) {
    sw = bgImg.height * canvasRatio;
    sx = (bgImg.width - sw) / 2;
  } else {
    sh = bgImg.width / canvasRatio;
    sy = (bgImg.height - sh) / 2;
  }
  ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, W, H);

  // ── Overlay: dark top + bottom, lighter center ──
  const overlay = ctx.createLinearGradient(0, 0, 0, H);
  overlay.addColorStop(0, 'rgba(0,0,0,0.65)');
  overlay.addColorStop(0.18, 'rgba(0,0,0,0.25)');
  overlay.addColorStop(0.35, 'rgba(0,0,0,0.15)');
  overlay.addColorStop(0.65, 'rgba(0,0,0,0.15)');
  overlay.addColorStop(0.75, 'rgba(0,0,0,0.5)');
  overlay.addColorStop(0.88, 'rgba(0,0,0,0.7)');
  overlay.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  const pad = 48;

  // ══════════════════════════════════════
  //  TOP: Full Zaryah+ logo + tagline
  // ══════════════════════════════════════
  let topY = 60;
  const logoH = 480;
  const logoW = logoH * (logo.width / logo.height);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 32;
  ctx.drawImage(logo, (W - logoW) / 2, topY, logoW, logoH);
  ctx.restore();
  topY += logoH + 14;

  ctx.textAlign = 'center';
  ctx.font = `700 72px ${FONT_D}`;
  ctx.fillStyle = GOLD;
  drawTextShadow(ctx, 'Barakah Labs', W / 2, topY, 22, 'rgba(0,0,0,0.6)');
  topY += 62;

  ctx.font = `500 48px ${FONT_B}`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  drawTextShadow(ctx, 'What are you grateful for?', W / 2, topY, 16, 'rgba(0,0,0,0.5)');
  topY += 44;

  // ══════════════════════════════════════
  //  CENTER: Frosted card — everything inside
  //  All content measured first, then drawn centered
  // ══════════════════════════════════════
  const cardPadY = 80;
  const cardW = W - pad * 2; // wider card with pad=48
  const cardX = pad;
  const cardContentW = cardW - 80; // 40px padding each side inside card
  const cx = W / 2; // center x for all text

  // ── Measure all sections ──

  // 1. Blessing text
  ctx.font = `italic 700 48px ${FONT_D}`;
  const lines = wrapText(ctx, data.text, cardContentW, 7);
  const bLineH = 68;
  const blessingH = lines.length * bLineH;

  // 2. Attribution
  const attrH = data.isOthers ? 50 : 0;

  // 3. Reflection
  let refLines: string[] = [];
  if (reflectionPrompt) {
    ctx.font = `italic 500 28px ${FONT_B}`;
    refLines = wrapText(ctx, reflectionPrompt, cardContentW, 2);
  }
  const refSepH = refLines.length > 0 ? 30 : 0; // separator above
  const refTextH = refLines.length * 40;
  const refGapH = refLines.length > 0 ? 30 : 0;
  const reflectionTotalH = refSepH + refTextH + refGapH;

  // 4. Main separator
  const mainSepH = 44;

  // 5. Quran verse
  ctx.font = `italic 500 32px ${FONT_D}`;
  const vLines = wrapText(ctx, `"${verse.text}"`, cardContentW, 3);
  const vLineH = 44;
  const verseTextH = vLines.length * vLineH;
  const verseRefH = 40;
  const verseGapH = 16;
  const verseTotalH = verseTextH + verseRefH + verseGapH;

  // 6. Separator
  const sep2H = 44;

  // 7. Stat
  const statH = totalBlessings > 0 ? 46 : 0;

  // 8. Hashtags
  const hashH = 44;

  // 9. URL
  const urlH = 44;

  const cardInnerH = cardPadY
    + blessingH + 20
    + attrH
    + reflectionTotalH
    + mainSepH
    + verseTotalH
    + sep2H
    + statH
    + hashH
    + urlH
    + cardPadY;

  // Place card right after the top branding
  const cardAreaTop = topY + 20;
  const cardY = cardAreaTop;

  // Draw frosted card background
  roundedRect(ctx, cardX, cardY, cardW, cardInnerH, 28);
  ctx.fillStyle = 'rgba(13,19,35,0.65)';
  ctx.fill();
  roundedRect(ctx, cardX, cardY, cardW, cardInnerH, 28);
  ctx.fillStyle = 'rgba(30,41,58,0.3)';
  ctx.fill();
  roundedRect(ctx, cardX, cardY, cardW, cardInnerH, 28);
  ctx.strokeStyle = 'rgba(215,181,106,0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── Draw all content ──
  let y = cardY + cardPadY;
  ctx.textAlign = 'center';

  // 1. Blessing text
  ctx.font = `italic 700 48px ${FONT_D}`;
  ctx.fillStyle = CREAM;
  for (const line of lines) {
    drawTextShadow(ctx, line, cx, y, 16, 'rgba(0,0,0,0.4)');
    y += bLineH;
  }
  y += 20;

  // 2. Attribution
  if (data.isOthers) {
    ctx.font = `500 24px ${FONT_B}`;
    ctx.fillStyle = 'rgba(215,181,106,0.6)';
    ctx.fillText('— A grateful soul', cx, y);
    y += attrH;
  }

  // 3. Reflection prompt
  if (refLines.length > 0) {
    // Separator
    const rSep = ctx.createLinearGradient(cardX + 60, y, cardX + cardW - 60, y);
    rSep.addColorStop(0, 'rgba(215,181,106,0)');
    rSep.addColorStop(0.5, 'rgba(215,181,106,0.25)');
    rSep.addColorStop(1, 'rgba(215,181,106,0)');
    ctx.fillStyle = rSep;
    ctx.fillRect(cardX + 60, y, cardW - 120, 1);
    y += refSepH;

    ctx.font = `italic 500 28px ${FONT_B}`;
    ctx.fillStyle = 'rgba(215,181,106,0.85)';
    for (const rl of refLines) {
      ctx.fillText(rl, cx, y);
      y += 40;
    }
    y += refGapH;
  }

  // 4. Main separator
  const mSep = ctx.createLinearGradient(cardX + 60, y, cardX + cardW - 60, y);
  mSep.addColorStop(0, 'rgba(215,181,106,0)');
  mSep.addColorStop(0.5, 'rgba(215,181,106,0.35)');
  mSep.addColorStop(1, 'rgba(215,181,106,0)');
  ctx.fillStyle = mSep;
  ctx.fillRect(cardX + 60, y, cardW - 120, 1.5);
  y += mainSepH;

  // 5. Quran verse
  ctx.font = `italic 500 32px ${FONT_D}`;
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (const vl of vLines) {
    drawTextShadow(ctx, vl, cx, y, 10, 'rgba(0,0,0,0.3)');
    y += vLineH;
  }
  ctx.font = `700 24px ${FONT_B}`;
  ctx.fillStyle = GOLD + 'DD';
  ctx.fillText(`— ${verse.ref}`, cx, y);
  y += verseRefH + verseGapH;

  // 6. Separator
  const s2 = ctx.createLinearGradient(cardX + 60, y, cardX + cardW - 60, y);
  s2.addColorStop(0, 'rgba(215,181,106,0)');
  s2.addColorStop(0.5, 'rgba(215,181,106,0.2)');
  s2.addColorStop(1, 'rgba(215,181,106,0)');
  ctx.fillStyle = s2;
  ctx.fillRect(cardX + 60, y, cardW - 120, 1);
  y += sep2H;

  // 7. Stat
  if (totalBlessings > 0) {
    ctx.font = `500 24px ${FONT_B}`;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(`Join ${totalBlessings.toLocaleString()}+ blessings logged by the community`, cx, y);
    y += statH;
  }

  // 8. Hashtags
  ctx.font = `500 22px ${FONT_B}`;
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText('#Gratitude  #BarakahLabs  #Alhamdulillah', cx, y);
  y += hashH;

  // 9. URL
  ctx.font = `700 26px ${FONT_B}`;
  ctx.fillStyle = GOLD + 'CC';
  ctx.fillText('zaryahplus.com', cx, y);

  // ── Swipe up — pinned to very bottom ──
  const swipeY = H - 70;
  drawSwipeArrow(ctx, cx, swipeY - 22);
  ctx.font = `500 16px ${FONT_B}`;
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('Swipe up to start your journey', cx, swipeY + 6);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Failed to generate image')),
      'image/png', 1.0,
    );
  });
}
