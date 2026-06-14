/**
 * Shared constants and helpers for the Blessing Galaxy 3D scene.
 */

import type { BlessingDepth } from '../../types/barka-labs.types';

export const DEPTH_CONFIG: Record<BlessingDepth, { color: string; emissive: string; size: number; intensity: number }> = {
  profound: { color: '#D7B56A', emissive: '#D7B56A', size: 0.35, intensity: 2.5 },
  thoughtful: { color: '#4A9EFF', emissive: '#4A9EFF', size: 0.22, intensity: 1.5 },
  common: { color: '#A7B1C0', emissive: '#8899AA', size: 0.12, intensity: 0.6 },
};

/* Generate stable 3D positions from blessing IDs using Fibonacci sphere distribution */
export function hashPosition(id: string, index: number, total: number): [number, number, number] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / Math.max(total - 1, 1)) * 2; // -1 to 1
  const radius = Math.sqrt(1 - y * y);
  const theta = goldenAngle * index;

  // Add some hash-based jitter for organic feel
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  const jitter = (hash % 100) / 100;
  const spread = 6 + total * 0.15; // Galaxy grows as you add more

  return [
    Math.cos(theta) * radius * spread + jitter * 0.5,
    y * spread * 0.6 + jitter * 0.3,
    Math.sin(theta) * radius * spread + jitter * 0.5,
  ];
}
