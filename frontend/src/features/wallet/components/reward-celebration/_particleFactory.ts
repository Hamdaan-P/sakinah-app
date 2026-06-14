/**
 * Particle factory + type for RewardCelebration's CoinParticles layer.
 */

export interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  drift: number;
}

export function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1.2 + Math.random() * 0.8,
    size: 6 + Math.random() * 10,
    rotation: Math.random() * 360,
    drift: (Math.random() - 0.5) * 120,
  }));
}
