/**
 * Particle types, factory, and animation step for PremiumIslamicBackground.
 * Pure logic — no React, no DOM beyond the supplied 2D context.
 */

export interface Particle {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  speed: number;
  /** Horizontal drift amplitude (pixels) */
  driftAmplitude: number;
  /** Horizontal drift frequency multiplier */
  driftFrequency: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  /** true = gold (#D4A853), false = white */
  isGold: boolean;
  /** Whether this particle is a larger "star" that twinkles prominently */
  isStar: boolean;
}

/** Gold colour channels (0xD7, 0xB5, 0x6A) */
const GOLD_R = 215;
const GOLD_G = 181;
const GOLD_B = 106;

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function createParticle(canvasWidth: number, canvasHeight: number): Particle {
  const isGold = Math.random() > 0.15; // ~85 % gold, 15 % white
  const isStar = Math.random() < 0.18; // ~18 % are larger twinkle-stars
  const size = isStar ? randomBetween(2, 3.2) : randomBetween(0.8, 1.8);

  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size,
    baseOpacity: randomBetween(0.2, 0.8),
    opacity: 0, // computed each frame
    speed: randomBetween(0.08, 0.35), // upward drift speed (px / frame)
    driftAmplitude: randomBetween(0.3, 1.2),
    driftFrequency: randomBetween(0.0005, 0.002),
    twinkleSpeed: isStar ? randomBetween(0.015, 0.04) : randomBetween(0.005, 0.015),
    twinkleOffset: Math.random() * Math.PI * 2,
    isGold,
    isStar,
  };
}

export function stepAndDrawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number,
  t: number,
): void {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    // --- Movement ---
    // Upward drift
    p.y -= p.speed;
    // Subtle horizontal sine drift
    p.x += Math.sin(t * p.driftFrequency + p.twinkleOffset) * p.driftAmplitude;

    // Wrap around: if particle drifts off top, respawn at bottom
    if (p.y < -p.size) {
      p.y = height + p.size;
      p.x = Math.random() * width;
    }
    // Horizontal wrapping
    if (p.x < -p.size) p.x = width + p.size;
    if (p.x > width + p.size) p.x = -p.size;

    // --- Twinkle (opacity oscillation) ---
    const twinkle = Math.sin(t * p.twinkleSpeed + p.twinkleOffset);
    // Map sin [-1,1] to [0,1] then modulate around base opacity
    const twinkleFactor = (twinkle + 1) / 2; // 0..1
    if (p.isStar) {
      // Stars have more dramatic twinkle: swing between 20% and 100% of base
      p.opacity = p.baseOpacity * (0.2 + 0.8 * twinkleFactor);
    } else {
      // Normal particles have gentle pulse: swing between 60% and 100% of base
      p.opacity = p.baseOpacity * (0.6 + 0.4 * twinkleFactor);
    }

    // --- Draw ---
    const r = p.isGold ? GOLD_R : 255;
    const g = p.isGold ? GOLD_G : 255;
    const b = p.isGold ? GOLD_B : 255;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`;
    ctx.fill();

    // Stars get a soft glow halo
    if (p.isStar && p.opacity > 0.35) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity * 0.15})`;
      ctx.fill();
    }
  }
}
