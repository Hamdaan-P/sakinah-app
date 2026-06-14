import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CONFIG, simulatePrice } from './dnz-chart/_config';
import type { Pt } from './dnz-chart/_config';
import { drawChart } from './dnz-chart/_drawChart';
import { DnzChartHeader } from './dnz-chart/DnzChartHeader';

export function DnzPriceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = useState<Pt[]>([]);
  const [price, setPrice] = useState(CONFIG.startPrice);
  const [prevPrice, setPrevPrice] = useState(CONFIG.startPrice);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Track stats
  const [high24, setHigh24] = useState(CONFIG.startPrice);
  const [low24, setLow24] = useState(CONFIG.startPrice);
  const [openPrice] = useState(CONFIG.startPrice);

  // Init
  useEffect(() => {
    let p = CONFIG.startPrice;
    const hist: Pt[] = [];
    let hi = p, lo = p;
    for (let i = 0; i < CONFIG.chartPoints; i++) {
      p = simulatePrice(p);
      hi = Math.max(hi, p);
      lo = Math.min(lo, p);
      hist.push({ time: new Date(Date.now() - (CONFIG.chartPoints - i) * 60000), price: p });
    }
    setHistory(hist);
    setPrice(p);
    setPrevPrice(p);
    setHigh24(hi);
    setLow24(lo);
  }, []);

  // Tick
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPrice((prev) => {
        const next = simulatePrice(prev);
        setPrevPrice(prev);
        setHigh24((h) => Math.max(h, next));
        setLow24((l) => Math.min(l, next));
        setHistory((hist) => [...hist.slice(1), { time: new Date(), price: next }]);
        return next;
      });
    }, CONFIG.updateInterval);
    return () => clearInterval(intervalRef.current);
  }, []);

  const bullish = price >= prevPrice;
  const change = price - openPrice;
  const changePct = (change / openPrice) * 100;

  // Mouse hover → nearest data index
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || history.length < 2) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pad = { left: 8, right: 52 };
      const cw = rect.width - pad.left - pad.right;
      const ratio = (x - pad.left) / cw;
      const idx = Math.round(ratio * (history.length - 1));
      setHoverIdx(Math.max(0, Math.min(history.length - 1, idx)));
    },
    [history],
  );

  const handleMouseLeave = useCallback(() => setHoverIdx(null), []);

  // Draw
  const draw = useCallback(() => {
    if (canvasRef.current && history.length > 1) {
      drawChart(canvasRef.current, history, bullish, hoverIdx);
    }
  }, [history, bullish, hoverIdx]);

  useEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  // Volume simulation (cosmetic)
  const volume = (Math.abs(change) * 12847 + 5200).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-gradient-to-br from-[#0F141F]/95 to-[#0A0E16]/95',
        'backdrop-blur-xl border border-[#D4A853]/30',
        'shadow-[0_8px_32px_rgba(212,168,83,0.12),0_0_24px_rgba(43,111,107,0.15),0_4px_16px_rgba(0,0,0,0.4)]',
      )}
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A853] to-transparent" />

      <DnzChartHeader
        price={price}
        change={change}
        changePct={changePct}
        high24={high24}
        low24={low24}
        openPrice={openPrice}
        volume={volume}
      />

      {/* Canvas */}
      <div className="px-2 pb-3">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair"
          style={{ height: 240 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </motion.div>
  );
}
