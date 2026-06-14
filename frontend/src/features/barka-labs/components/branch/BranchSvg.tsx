/**
 * BranchSvg — pure-SVG rendering of trunk + branches + twigs + blessing leaves.
 * Geometry is precomputed in `_geometry.ts`; this just paints it.
 */

import type { Blessing } from '../../types/barka-labs.types';
import type { BranchData } from './_geometry';
import { Leaf } from './Leaf';

interface BranchSvgProps {
  svgW: number;
  svgH: number;
  bd: BranchData;
  blessings: Blessing[];
  activeId: string | null;
  onLeafClick: (id: string) => void;
}

export function BranchSvg({ svgW, svgH, bd, blessings, activeId, onLeafClick }: BranchSvgProps) {
  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="block">
      <defs>
        <filter id="leafGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="branchGlow">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* ── Branch glow layers ── */}
      <path d={`M${bd.trunk.x0},${bd.trunk.y0} C${bd.trunk.cx1},${bd.trunk.cy1} ${bd.trunk.cx2},${bd.trunk.cy2} ${bd.trunk.x3},${bd.trunk.y3}`}
        stroke="rgba(215,181,106,0.05)" strokeWidth={35} fill="none" strokeLinecap="round" filter="url(#branchGlow)" />

      {/* ── Main trunk (dark) ── */}
      <path d={`M${bd.trunk.x0},${bd.trunk.y0} C${bd.trunk.cx1},${bd.trunk.cy1} ${bd.trunk.cx2},${bd.trunk.cy2} ${bd.trunk.x3},${bd.trunk.y3}`}
        stroke="#5C3A1E" strokeWidth={14} fill="none" strokeLinecap="round" />
      {/* Trunk highlight */}
      <path d={`M${bd.trunk.x0},${bd.trunk.y0 - 2} C${bd.trunk.cx1},${bd.trunk.cy1 - 3} ${bd.trunk.cx2},${bd.trunk.cy2 - 3} ${bd.trunk.x3},${bd.trunk.y3 - 2}`}
        stroke="#C49A50" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.5} />

      {/* ── Branch A (dark + highlight) ── */}
      <path d={`M${bd.branchA.x0},${bd.branchA.y0} C${bd.branchA.cx1},${bd.branchA.cy1} ${bd.branchA.cx2},${bd.branchA.cy2} ${bd.branchA.x3},${bd.branchA.y3}`}
        stroke="#5C3A1E" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M${bd.branchA.x0},${bd.branchA.y0 - 1.5} C${bd.branchA.cx1},${bd.branchA.cy1 - 2} ${bd.branchA.cx2},${bd.branchA.cy2 - 2} ${bd.branchA.x3},${bd.branchA.y3 - 1.5}`}
        stroke="#C49A50" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.45} />

      {/* ── Branch B (tangled, overlapping A) ── */}
      <path d={`M${bd.branchB.x0},${bd.branchB.y0} C${bd.branchB.cx1},${bd.branchB.cy1} ${bd.branchB.cx2},${bd.branchB.cy2} ${bd.branchB.x3},${bd.branchB.y3}`}
        stroke="#5C3A1E" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={`M${bd.branchB.x0},${bd.branchB.y0 - 1} C${bd.branchB.cx1},${bd.branchB.cy1 - 2} ${bd.branchB.cx2},${bd.branchB.cy2 - 2} ${bd.branchB.x3},${bd.branchB.y3 - 1}`}
        stroke="#C49A50" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.4} />

      {/* branch C removed */}

      {/* ── Extending tips ── */}
      <path d={`M${bd.tipA.x0},${bd.tipA.y0} Q${bd.tipA.cx},${bd.tipA.cy} ${bd.tipA.x1},${bd.tipA.y1}`}
        stroke="#5C3A1E" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <path d={`M${bd.tipB.x0},${bd.tipB.y0} Q${bd.tipB.cx},${bd.tipB.cy} ${bd.tipB.x1},${bd.tipB.y1}`}
        stroke="#5C3A1E" strokeWidth={3} fill="none" strokeLinecap="round" />

      {/* ── Sub-twigs (thicker, two-tone like real branches) ── */}
      {bd.twigs.map((tw, i) => {
        const mx = (tw.x1 + tw.x2) / 2;
        const my = (tw.y1 + tw.y2) / 2;
        const dx = tw.x2 - tw.x1;
        const dy = tw.y2 - tw.y1;
        const cx = mx + dy * 0.12;
        const cy = my - dx * 0.12;
        return (
          <g key={`tw-${i}`}>
            <path d={`M${tw.x1},${tw.y1} Q${cx},${cy} ${tw.x2},${tw.y2}`}
              stroke="#5C3A1E" strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d={`M${tw.x1},${tw.y1 - 0.8} Q${cx},${cy - 1} ${tw.x2},${tw.y2 - 0.8}`}
              stroke="#C49A50" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.3} />
          </g>
        );
      })}

      {/* decorative leaves removed — only blessing leaves shown */}

      {/* ── Blessing leaves ── */}
      {blessings.map((blessing, i) => {
        const twig = bd.twigs[i];
        if (!twig) return null;

        return (
          <Leaf
            key={blessing.id}
            x={twig.tipX}
            y={twig.tipY}
            angle={twig.leafAngle}
            depth={blessing.depth}
            blessing={blessing}
            isSelected={activeId === blessing.id}
            onClick={() => onLeafClick(blessing.id)}
            index={i}
          />
        );
      })}
    </svg>
  );
}
