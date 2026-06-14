/**
 * Triple-Shariah compliance rings (AAOIFI / IFSB / TASIS) — Mizan-style.
 * Visualises that compliance is not a single binary verdict but a triple-screen.
 */

import type { TripleShariah } from '../types/eim.types';

function Ring({ score, label }: { score: number; label: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(212,168,83,0.15)" strokeWidth="4" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="url(#shariah-grad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
          />
          <defs>
            <linearGradient id="shariah-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2A9D6F" />
              <stop offset="100%" stopColor="#D4A853" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[14px] font-bold text-[#F5E8C7]">{score}</span>
        </div>
      </div>
      <div className="text-[10px] font-semibold text-[#7A7363] mt-1.5">{label}</div>
      <div className="text-[9px] text-[#5C5749]">Compliant</div>
    </div>
  );
}

export function TripleShariahRings({ data }: { data: TripleShariah }) {
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] p-4 bg-[rgba(212,168,83,0.04)]">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] uppercase tracking-widest text-[#D4A853] font-semibold">
          🛡 Triple-Standard Shariah
        </div>
        <div className="text-[11px] text-[#7A7363]">
          Composite{' '}
          <span className="text-[#D4A853] font-bold">{data.composite}</span>
        </div>
      </div>
      <div className="flex items-center justify-around">
        <Ring score={data.aaoifi} label="AAOIFI" />
        <Ring score={data.ifsb} label="DJIM" />
        <Ring score={data.tasis} label="TASIS" />
      </div>
    </div>
  );
}
