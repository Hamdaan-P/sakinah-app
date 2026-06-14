/**
 * Percentile Gauge — animated semicircle showing user's ranking
 * "Your gratitude awareness is deeper than 94% of users"
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Users } from '@phosphor-icons/react';
import type { PercentileData } from '../types/barka-labs.types';

interface PercentileGaugeProps {
  data: PercentileData | null;
  onRefresh: () => void;
}

function getPercentileColor(pct: number): string {
  if (pct >= 90) return '#D7B56A';  // Gold — top 10%
  if (pct >= 70) return '#4A9EFF';  // Blue
  if (pct >= 50) return '#22C55E';  // Green
  return '#A7B1C0';                  // Grey
}

function getPercentileLabel(pct: number): string {
  if (pct >= 95) return 'Extraordinary Awareness';
  if (pct >= 90) return 'Rare Depth';
  if (pct >= 75) return 'Deep Gratitude';
  if (pct >= 50) return 'Growing Awareness';
  return 'Beginning the Journey';
}

export function PercentileGauge({ data, onRefresh }: PercentileGaugeProps) {
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    if (!data?.percentile) return;
    // Animate from 0 to target
    const target = data.percentile;
    const duration = 1500;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedPct(Math.round(eased * target * 10) / 10);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [data?.percentile]);

  if (!data || data.percentile === null) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl p-4 text-center"
        style={{
          backgroundColor: 'rgba(36,50,70,0.4)',
          border: '1px solid rgba(215,181,106,0.1)',
        }}
      >
        <p className="text-sm text-[#7F8A9A]">
          {data?.message || 'Log at least 3 blessings to unlock your ranking'}
        </p>
      </motion.div>
    );
  }

  const pct = data.percentile;
  const color = getPercentileColor(pct);
  const label = getPercentileLabel(pct);

  // SVG semicircle arc
  const radius = 70;
  const circumference = Math.PI * radius;
  const fillLength = (animatedPct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'rgba(36,50,70,0.5)',
        border: `1px solid ${pct >= 90 ? 'rgba(215,181,106,0.3)' : 'rgba(215,181,106,0.1)'}`,
      }}
    >
      <div className="flex flex-col items-center">
        {/* SVG Gauge */}
        <div className="relative w-44 h-24 mb-2">
          <svg viewBox="0 0 160 85" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 10 80 A 70 70 0 0 1 150 80"
              fill="none"
              stroke="rgba(167,177,192,0.15)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Filled arc */}
            <motion.path
              d="M 10 80 A 70 70 0 0 1 150 80"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - fillLength}
              style={{
                filter: pct >= 90 ? `drop-shadow(0 0 6px ${color})` : undefined,
              }}
            />
          </svg>

          {/* Center number */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{
                color,
                fontFamily: 'Cormorant Garamond, serif',
                textShadow: pct >= 90 ? `0 0 10px ${color}40` : undefined,
              }}
            >
              {animatedPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Label */}
        <div className="text-center space-y-1">
          <div className="flex items-center gap-1.5 justify-center">
            {pct >= 90 && <Crown size={14} weight="fill" className="text-[#D7B56A]" />}
            <span className="text-xs font-medium" style={{ color }}>
              {label}
            </span>
          </div>
          <p className="text-[11px] text-[#A7B1C0]">
            Deeper than <span style={{ color }} className="font-semibold">{pct}%</span> of users
          </p>
          <div className="flex items-center gap-1 justify-center text-[10px] text-[#7F8A9A]">
            <Users size={10} />
            <span>{data.total_users} users ranked</span>
          </div>
        </div>
      </div>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        className="mt-3 w-full text-center text-[10px] text-[#7F8A9A] hover:text-[#A7B1C0] transition-colors"
      >
        Refresh ranking
      </button>
    </motion.div>
  );
}
