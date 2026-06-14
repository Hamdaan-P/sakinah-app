/**
 * Renders the Lanyard card face — name, avatar, QR — into an off-screen
 * canvas that is then uploaded to a Three.js CanvasTexture.
 *
 * Verbatim from Lanyard.tsx — no behavior changes.
 */

export function drawCardFace(
  userName: string,
  avatarInitial: string,
  qrImage: HTMLImageElement | null,
): HTMLCanvasElement {
  // Card face aspect matches the collider (1.6 × 2.25 → ~5:7). High-res for crisp rendering.
  const W = 1440;
  const H = 2024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Navy gradient background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0A0E16');
  bg.addColorStop(0.5, '#0F141F');
  bg.addColorStop(1, '#10151F');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Gold corner glow
  const glow = ctx.createRadialGradient(W, 0, 0, W, 0, W * 0.6);
  glow.addColorStop(0, 'rgba(212,168,83,0.22)');
  glow.addColorStop(1, 'rgba(212,168,83,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Gold border frame
  ctx.strokeStyle = 'rgba(212,168,83,0.4)';
  ctx.lineWidth = 8;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Avatar circle (gold) — top of card
  const avX = W / 2;
  const avY = 220;
  const avR = 112;
  const avGrad = ctx.createLinearGradient(avX - avR, avY - avR, avX + avR, avY + avR);
  avGrad.addColorStop(0, '#E8C97A');
  avGrad.addColorStop(1, '#B8943E');
  ctx.fillStyle = avGrad;
  ctx.beginPath();
  ctx.arc(avX, avY, avR, 0, Math.PI * 2);
  ctx.fill();

  // Avatar initial
  ctx.fillStyle = '#0A0E16';
  ctx.font = "bold 128px 'Cormorant Garamond', Georgia, serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(avatarInitial || 'Z', avX, avY + 4);

  // Name
  ctx.fillStyle = '#F5E8C7';
  ctx.font = "600 88px 'Cormorant Garamond', Georgia, serif";
  ctx.fillText(userName || 'ZaryahPlus', avX, 430);

  // QR code — BIG, crisp, centered. Use pixel-exact drawing (no smoothing)
  const qrSize = 960;
  const qrX = (W - qrSize) / 2;
  const qrY = 560;
  const pad = 40;
  ctx.fillStyle = '#ffffff';
  const r = 40;
  const bx = qrX - pad;
  const by = qrY - pad;
  const bw = qrSize + pad * 2;
  const bh = qrSize + pad * 2;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
  ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
  ctx.arcTo(bx, by + bh, bx, by, r);
  ctx.arcTo(bx, by, bx + bw, by, r);
  ctx.closePath();
  ctx.fill();
  if (qrImage) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    ctx.imageSmoothingEnabled = true;
  }

  // "Scan to view profile" hint
  ctx.fillStyle = '#7A7363';
  ctx.font = "500 40px 'DM Sans', Arial, sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('Scan to view profile', avX, H - 140);

  // Footer label
  ctx.fillStyle = '#D4A853';
  ctx.font = "700 46px 'DM Sans', Arial, sans-serif";
  ctx.fillText('zaryahplus.com', avX, H - 72);

  return canvas;
}
