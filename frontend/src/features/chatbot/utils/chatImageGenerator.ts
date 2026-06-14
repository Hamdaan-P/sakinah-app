/**
 * chatImageGenerator.ts
 * Generates branded 1080x1350 PNG cards from Q&A conversations using Canvas 2D.
 * Zero external dependencies — pure browser APIs.
 */

export interface ShareCardData {
  userQuestion: string;
  aiResponse: string;
  companionName: string;
  companionIcon: string;
  date?: Date;
}

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

// Theme colors
const NAVY_TOP = '#06080D';
const NAVY_MID = '#0A0E16';
const NAVY_BOT = '#0F141F';
const GOLD = '#D4A853';
const GOLD_LIGHT = '#E8C97A';
const CREAM = '#F5E8C7';
const TEXT_SECONDARY = '#7A7363';
const BORDER_GOLD = 'rgba(212,168,83,0.35)';

// Fonts
const FONT_DISPLAY = '"Cormorant Garamond", Georgia, serif';
const FONT_BODY = '"DM Sans", "Segoe UI", sans-serif';

/**
 * Wraps text to fit within maxWidth, returning an array of lines.
 * Truncates with ellipsis after maxLines.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  // Clean markdown artifacts for the image
  const cleaned = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/```[\s\S]*?```/g, '[code block]')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{2,}/g, '\n')
    .trim();

  const paragraphs = cleaned.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (lines.length >= maxLines) break;

    const words = paragraph.split(' ');
    let currentLine = '';

    for (const word of words) {
      if (lines.length >= maxLines) break;

      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }

    // Add empty line between paragraphs (if space)
    if (lines.length < maxLines - 1 && paragraphs.indexOf(paragraph) < paragraphs.length - 1) {
      lines.push('');
    }
  }

  // Add ellipsis if truncated
  if (lines.length === maxLines) {
    const lastLine = lines[maxLines - 1];
    if (lastLine) {
      const metrics = ctx.measureText(lastLine + '...');
      if (metrics.width > maxWidth) {
        const words = lastLine.split(' ');
        words.pop();
        lines[maxLines - 1] = words.join(' ') + '...';
      } else {
        lines[maxLines - 1] = lastLine + '...';
      }
    }
  }

  return lines;
}

/** Draw a rounded rectangle path */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** Draw subtle gold particle dots for visual depth */
function drawParticles(ctx: CanvasRenderingContext2D) {
  // Deterministic "random" particles for consistent output
  const seeds = [
    [87, 120], [234, 89], [456, 210], [789, 340], [123, 560],
    [567, 780], [890, 900], [345, 1050], [678, 1200], [910, 150],
    [200, 400], [500, 650], [750, 890], [100, 1100], [400, 300],
    [600, 500], [850, 700], [300, 950], [700, 1150], [950, 450],
    [150, 750], [450, 1000], [800, 250], [50, 600], [1000, 800],
  ];

  for (const [x, y] of seeds) {
    const size = 1 + (x % 3);
    const alpha = 0.08 + (y % 5) * 0.02;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212,168,83,${alpha})`;
    ctx.fill();
  }
}

/**
 * Generates a branded PNG card as a Blob.
 * Awaits font loading before drawing to ensure correct rendering.
 */
export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  // Wait for fonts to be ready
  await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // ── Background gradient ──
  const bgGrad = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  bgGrad.addColorStop(0, NAVY_TOP);
  bgGrad.addColorStop(0.4, NAVY_MID);
  bgGrad.addColorStop(1, NAVY_BOT);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // ── Subtle particles ──
  drawParticles(ctx);

  // ── Gold border ──
  const borderInset = 24;
  roundedRect(
    ctx,
    borderInset,
    borderInset,
    CARD_WIDTH - borderInset * 2,
    CARD_HEIGHT - borderInset * 2,
    24
  );
  ctx.strokeStyle = BORDER_GOLD;
  ctx.lineWidth = 2;
  ctx.stroke();

  const pad = 72;
  let y = 85;

  // ── Top: ZaryahPlus branding ──
  ctx.font = `700 42px ${FONT_DISPLAY}`;
  ctx.fillStyle = GOLD;
  ctx.textAlign = 'center';
  ctx.fillText('ZaryahPlus', CARD_WIDTH / 2, y);
  y += 36;

  // Subtle tagline
  ctx.font = `400 16px ${FONT_BODY}`;
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.fillText('AI-Powered Islamic Finance & Knowledge', CARD_WIDTH / 2, y);
  y += 36;

  // ── Companion badge ──
  ctx.font = `400 20px ${FONT_BODY}`;
  ctx.fillStyle = GOLD_LIGHT;
  ctx.fillText(`${data.companionIcon}  ${data.companionName}`, CARD_WIDTH / 2, y);
  y += 32;

  // ── Gold separator ──
  const sepWidth = 200;
  const sepGrad = ctx.createLinearGradient(
    CARD_WIDTH / 2 - sepWidth / 2, y,
    CARD_WIDTH / 2 + sepWidth / 2, y
  );
  sepGrad.addColorStop(0, 'rgba(212,168,83,0)');
  sepGrad.addColorStop(0.5, 'rgba(212,168,83,0.6)');
  sepGrad.addColorStop(1, 'rgba(212,168,83,0)');
  ctx.fillStyle = sepGrad;
  ctx.fillRect(CARD_WIDTH / 2 - sepWidth / 2, y, sepWidth, 1.5);
  y += 32;

  // ── "You asked:" section ──
  ctx.textAlign = 'left';
  ctx.font = `600 16px ${FONT_BODY}`;
  ctx.fillStyle = GOLD;
  ctx.fillText('You asked:', pad, y);
  y += 28;

  const contentWidth = CARD_WIDTH - pad * 2;

  ctx.font = `500 22px ${FONT_BODY}`;
  ctx.fillStyle = CREAM;
  const questionLines = wrapText(ctx, data.userQuestion, contentWidth, 4);
  for (const line of questionLines) {
    if (line === '') {
      y += 12;
      continue;
    }
    ctx.fillText(line, pad, y);
    y += 32;
  }
  y += 16;

  // ── Gold separator ──
  const sep2Grad = ctx.createLinearGradient(pad, y, CARD_WIDTH - pad, y);
  sep2Grad.addColorStop(0, 'rgba(212,168,83,0.4)');
  sep2Grad.addColorStop(1, 'rgba(212,168,83,0)');
  ctx.fillStyle = sep2Grad;
  ctx.fillRect(pad, y, contentWidth, 1.5);
  y += 28;

  // ── Response section ──
  ctx.font = `600 16px ${FONT_BODY}`;
  ctx.fillStyle = GOLD;
  ctx.fillText(`${data.companionName} says:`, pad, y);
  y += 28;

  // Calculate remaining space for response — footer sits 60px below last line
  const footerReserve = 80;
  const maxContentBottom = CARD_HEIGHT - footerReserve;
  const lineHeight = 28;
  const maxResponseLines = Math.floor((maxContentBottom - y) / lineHeight);

  ctx.font = `400 19px ${FONT_BODY}`;
  ctx.fillStyle = '#C9C0A8';
  const responseLines = wrapText(ctx, data.aiResponse, contentWidth, maxResponseLines);
  for (const line of responseLines) {
    if (line === '') {
      y += 14;
      continue;
    }
    ctx.fillText(line, pad, y);
    y += lineHeight;
  }

  // ── Footer — positioned relative to content, clamped to bottom zone ──
  const footerY = Math.max(y + 40, CARD_HEIGHT - 60);

  // Watermark
  ctx.textAlign = 'center';
  ctx.font = `400 15px ${FONT_BODY}`;
  ctx.fillStyle = 'rgba(122,115,99,0.5)';
  ctx.fillText('Powered by ZaryahPlus AI', CARD_WIDTH / 2, footerY);

  // Date
  const dateStr = (data.date ?? new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.font = `400 13px ${FONT_BODY}`;
  ctx.fillStyle = 'rgba(122,115,99,0.35)';
  ctx.fillText(dateStr, CARD_WIDTH / 2, footerY + 22);

  // Convert canvas to blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate image'));
      },
      'image/png',
      1.0
    );
  });
}
