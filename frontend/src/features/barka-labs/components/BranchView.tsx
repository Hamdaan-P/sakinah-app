/**
 * BranchView — SVG organic branch with leaves as blessings.
 *
 * Single branch from lower-left to upper-right, two-tone bark, tapered
 * strokes, tangled overlapping sub-branches, leaf shapes with veins,
 * horizontally scrollable. Each leaf = a blessing. Click to decompose.
 *
 * Geometry math and the SVG paint pass live in `./branch/`; this file
 * orchestrates state, drag-to-pan, and layout.
 */

import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from '@phosphor-icons/react';
import type { Blessing } from '../types/barka-labs.types';
import { buildBranchData } from './branch/_geometry';
import { BranchSvg } from './branch/BranchSvg';

interface BranchViewProps {
  blessings: Blessing[];
  onLeafClick: (blessingId: string) => void;
  onBack: () => void;
  selectedId: string | null;
}

export function BranchView({ blessings: blessingsRaw, onLeafClick, onBack, selectedId }: BranchViewProps) {
  // Reverse so oldest is on the left, newest on the right
  const blessings = useMemo(() => [...blessingsRaw].reverse(), [blessingsRaw]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId] = useState<string | null>(null);
  const activeId = selectedId || hoveredId;

  // Click-and-drag panning
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
    el.style.cursor = 'grabbing';
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
    scrollRef.current.scrollTop = dragStart.current.scrollTop - dy;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // Canvas dimensions — enough room but not too spread out
  const svgW = Math.max(1400, 350 + blessings.length * 180);
  const svgH = 800;

  // Build the branch structure
  const bd = useMemo(
    () => buildBranchData(blessings.length, svgW, svgH),
    [blessings.length, svgW, svgH],
  );

  return (
    <div className="absolute inset-0 flex flex-col" style={{ backgroundColor: '#080C16' }}>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="absolute top-20 left-4 z-20 flex items-center gap-2 px-4 py-2 rounded-xl"
        style={{ backgroundColor: 'rgba(15,23,36,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(215,181,106,0.15)', color: '#A7B1C0' }}
      >
        <ArrowLeft size={14} /><span className="text-xs">Full Tree</span>
      </motion.button>

      {/* Drag-to-pan SVG container */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-auto"
        style={{ paddingTop: 70, cursor: 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <BranchSvg
          svgW={svgW}
          svgH={svgH}
          bd={bd}
          blessings={blessings}
          activeId={activeId}
          onLeafClick={onLeafClick}
        />
      </div>

      {/* Scroll hint */}
      {svgW > 1400 && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 3, repeat: 2 }}
            className="text-[10px] text-[#7F8A9A]"
          >
            ← Scroll to explore →
          </motion.p>
        </div>
      )}
    </div>
  );
}
