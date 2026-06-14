/**
 * Pure SVG geometry helpers for SpeedoGauge — describes arcs, computes
 * zone segments, tick marks, and number labels. No React, no DOM.
 */

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Utility: SVG arc path from angle a1→a2 at given radius */
export function describeArc(cx: number, cy: number, r: number, a1: number, a2: number): string {
  const start = { x: cx + r * Math.cos(toRad(a1)), y: cy + r * Math.sin(toRad(a1)) };
  const end = { x: cx + r * Math.cos(toRad(a2)), y: cy + r * Math.sin(toRad(a2)) };
  const largeArc = a2 - a1 > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export { toRad };

interface Geometry {
  cx: number;
  cy: number;
  outerR: number;
  innerR: number;
  SA: number;
  SW: number;
}

export interface Zone {
  from: number;
  to: number;
  color: string;
  label: string;
  path: string;
  innerPath: string;
}

export function computeZones({ cx, cy, outerR, innerR, SA, SW }: Geometry): Zone[] {
  const colors = [
    { from: 0, to: 0.2, color: '#2A9D6F', label: '' },
    { from: 0.2, to: 0.4, color: '#4AAF7F', label: '' },
    { from: 0.4, to: 0.6, color: '#D7B56A', label: '' },
    { from: 0.6, to: 0.8, color: '#E8A94A', label: '' },
    { from: 0.8, to: 1.0, color: '#FF6B35', label: '' },
  ];
  return colors.map((z) => {
    const a1 = SA + SW * z.from;
    const a2 = SA + SW * z.to;
    const mid = outerR + 2;
    return {
      ...z,
      path: describeArc(cx, cy, mid, a1, a2),
      innerPath: describeArc(cx, cy, innerR - 2, a1, a2),
    };
  });
}

export interface Tick {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  major: boolean;
  label: string;
}

export function computeTicks({ cx, cy, outerR, innerR, SA, SW }: Geometry, maxValue: number): Tick[] {
  const marks: Tick[] = [];
  const majorCount = 10;
  const minorPer = 4;
  for (let i = 0; i <= majorCount; i++) {
    const pct = i / majorCount;
    const angle = SA + SW * pct;
    const rad = toRad(angle);
    // Major tick
    marks.push({
      x1: cx + (innerR - 18) * Math.cos(rad),
      y1: cy + (innerR - 18) * Math.sin(rad),
      x2: cx + (outerR + 6) * Math.cos(rad),
      y2: cy + (outerR + 6) * Math.sin(rad),
      major: true,
      label: String(Math.round(maxValue * pct)),
    });
    // Minor ticks between majors
    if (i < majorCount) {
      for (let j = 1; j < minorPer; j++) {
        const subPct = pct + j / (majorCount * minorPer);
        const subAngle = SA + SW * subPct;
        const subRad = toRad(subAngle);
        marks.push({
          x1: cx + (innerR - 6) * Math.cos(subRad),
          y1: cy + (innerR - 6) * Math.sin(subRad),
          x2: cx + (outerR + 2) * Math.cos(subRad),
          y2: cy + (outerR + 2) * Math.sin(subRad),
          major: false,
          label: '',
        });
      }
    }
  }
  return marks;
}

export function computeLabels({ cx, cy, innerR, SA, SW }: Omit<Geometry, 'outerR'>, maxValue: number) {
  const items: { x: number; y: number; text: string }[] = [];
  const count = 10;
  for (let i = 0; i <= count; i++) {
    const pct = i / count;
    const angle = SA + SW * pct;
    const rad = toRad(angle);
    const labelR = innerR - 32;
    items.push({
      x: cx + labelR * Math.cos(rad),
      y: cy + labelR * Math.sin(rad),
      text: String(Math.round(maxValue * pct)),
    });
  }
  return items;
}
