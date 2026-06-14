/**
 * Living Tree v4 — Dual-zoom: Full tree → Stem close-up.
 *
 * ZOOMED OUT: Majestic full tree with thick canopy, golden light, misty ground.
 *   Click anywhere or "Explore" to zoom into a stem.
 *
 * ZOOMED IN: Single branch fills the screen horizontally (BranchView).
 *
 * Geometry + canvas paint passes live in `./living-tree/`; this file
 * orchestrates the canvas, animation loop, and zoom state transitions.
 */

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassPlus } from '@phosphor-icons/react';
import { BranchView } from './BranchView';
import type { Blessing } from '../types/barka-labs.types';
import { computeFullTree, renderFullTree } from './living-tree/_fullTree';
import { computeStemLayout, _renderStemView as _renderStemViewImpl } from './living-tree/_stemLayout';
import { _BlessingLeaf as _BlessingLeafImpl } from './living-tree/_BlessingLeaf';

// Re-exported unused helpers (kept on the public surface to satisfy
// noUnusedLocals across callers / future toggle path).
// eslint-disable-next-line react-refresh/only-export-components -- non-component re-export collocated with the LivingTree component
export const _renderStemView = _renderStemViewImpl;
// eslint-disable-next-line react-refresh/only-export-components -- non-component re-export collocated with the LivingTree component
export const _BlessingLeaf = _BlessingLeafImpl;

interface LivingTreeProps {
  blessings: Blessing[];
  onNodeClick: (blessingId: string) => void;
  selectedId: string | null;
}

export function LivingTree({ blessings, onNodeClick, selectedId }: LivingTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<'tree' | 'transitioning' | 'stem'>('tree');
  const animRef = useRef(0);
  const timeRef = useRef(0);

  // Resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((e) => {
      const { width, height } = e[0].contentRect;
      setDims({ w: width, h: height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Full tree data (static)
  const treeData = useMemo(() => {
    if (dims.w === 0) return null;
    return computeFullTree(dims.w, dims.h, blessings.length);
  }, [dims.w, dims.h, blessings.length]);

  // Stem data (static)
  const stemData = useMemo(() => {
    if (dims.w === 0) return null;
    return computeStemLayout(dims.w, dims.h, blessings.length);
  }, [dims.w, dims.h, blessings.length]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    ctx.scale(dpr, dpr);

    const animate = () => {
      timeRef.current += 0.016;
      if ((view === 'tree' || view === 'transitioning') && treeData) {
        renderFullTree(ctx, dims.w, dims.h, timeRef.current, treeData);
      } else if (view === 'stem') {
        ctx.clearRect(0, 0, dims.w, dims.h);
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [dims, view, treeData, stemData, blessings.length]);

  const handleZoomIn = useCallback(() => {
    setView('transitioning');
    setTimeout(() => setView('stem'), 1200);
  }, []);
  const handleZoomOut = useCallback(() => setView('tree'), []);

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ backgroundColor: '#080C16' }}>

      {/* ── Zoom transition overlay ── */}
      <AnimatePresence>
        {view === 'transitioning' && (
          <motion.div
            className="absolute inset-0 z-30 pointer-events-none"
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              scale: [1, 2.5, 4],
              opacity: [1, 0.8, 0],
              filter: ['blur(0px)', 'blur(4px)', 'blur(20px)'],
            }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Snapshot of the tree — fakes the zoom by scaling the canvas up */}
            <div className="w-full h-full" style={{ transformOrigin: '50% 40%' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Golden flash at peak of zoom */}
      <AnimatePresence>
        {view === 'transitioning' && (
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.15, 0] }}
            transition={{ duration: 1.2, times: [0, 0.5, 0.7, 1] }}
            style={{ backgroundColor: '#D7B56A' }}
          />
        )}
      </AnimatePresence>

      {/* Canvas blur + scale during transition */}
      <motion.div
        className="absolute inset-0"
        animate={
          view === 'transitioning'
            ? { scale: 3, filter: 'blur(12px)', opacity: 0 }
            : view === 'stem'
              ? { scale: 1, filter: 'blur(0px)', opacity: 1 }
              : { scale: 1, filter: 'blur(0px)', opacity: 1 }
        }
        transition={{ duration: view === 'transitioning' ? 1.2 : 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformOrigin: '50% 40%' }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
        />
      </motion.div>

      {/* ── Tree view: "Explore" button ── */}
      <AnimatePresence>
        {(view === 'tree') && blessings.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleZoomIn}
            className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-2.5 rounded-xl"
            style={{
              bottom: '35%',
              backgroundColor: 'rgba(15,23,36,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(215,181,106,0.2)',
              color: '#D7B56A',
            }}
          >
            <MagnifyingGlassPlus size={16} weight="duotone" />
            <span className="text-sm font-medium">Explore your blessings</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Branch view (stem zoom) ── */}
      <AnimatePresence>
        {view === 'stem' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <BranchView
              blessings={blessings}
              onLeafClick={onNodeClick}
              onBack={handleZoomOut}
              selectedId={selectedId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
