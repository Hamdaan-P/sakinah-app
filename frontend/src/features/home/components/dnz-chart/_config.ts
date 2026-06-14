/**
 * Shared config, colors, and helpers for the DNZ price chart simulation.
 */

export const CONFIG = {
  minPrice: 0.45,
  maxPrice: 0.95,
  startPrice: 0.7,
  volatility: 0.008,
  updateInterval: 2000,
  chartPoints: 60,
};

export const C = {
  gold: '#D4A853',
  goldLight: '#E8C97A',
  goldDark: '#B8893A',
  green: '#4ade80',
  greenDark: '#22C55E',
  red: '#f87171',
  redDark: '#EF4444',
  textMuted: '#7A7363',
};

export interface Pt {
  time: Date;
  price: number;
}

export function simulatePrice(price: number): number {
  const mid = (CONFIG.minPrice + CONFIG.maxPrice) / 2;
  const revert = (mid - price) * 0.02;
  const rand = (Math.random() - 0.5) * CONFIG.volatility * price;
  let p = price + revert + rand;
  if (p < CONFIG.minPrice) p = CONFIG.minPrice + Math.random() * 0.05;
  if (p > CONFIG.maxPrice) p = CONFIG.maxPrice - Math.random() * 0.05;
  return Math.round(p * 10000) / 10000;
}

export function fmt(v: number, d = 4) {
  return '₹' + v.toFixed(d);
}

/* Catmull-Rom spline for buttery-smooth curves */
export function catmullRomPoint(
  p0: number, p1: number, p2: number, p3: number, t: number,
): number {
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
  );
}
