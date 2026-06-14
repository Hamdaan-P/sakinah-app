/**
 * Confetti burst animation drawn onto an overlay canvas when the blessing
 * count goes up. Extracted from BarkaLabsPage's useEffect — kept verbatim.
 */

export function fireConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;

  const COLORS = ['#D7B56A', '#E7CF8C', '#B8893A', '#2A9D6F', '#3ABFAD', '#8B7EC8', '#F5C842', '#EBDCB8'];
  const pieces: { x: number; y: number; vx: number; vy: number; w: number; h: number; color: string; rot: number; rv: number; opacity: number }[] = [];

  for (let i = 0; i < 80; i++) {
    pieces.push({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3,
      y: H * 0.25,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 10 - 3,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI * 2,
      rv: (Math.random() - 0.5) * 0.3,
      opacity: 1,
    });
  }

  let frame = 0;
  const maxFrames = 120;

  function animate() {
    if (frame >= maxFrames) {
      ctx!.clearRect(0, 0, W, H);
      return;
    }
    ctx!.clearRect(0, 0, W, H);
    const progress = frame / maxFrames;

    for (const p of pieces) {
      p.x += p.vx;
      p.vy += 0.25;
      p.y += p.vy;
      p.rot += p.rv;
      p.opacity = Math.max(0, 1 - progress * 1.2);

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.globalAlpha = p.opacity;
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx!.restore();
    }

    frame++;
    requestAnimationFrame(animate);
  }

  animate();
}
