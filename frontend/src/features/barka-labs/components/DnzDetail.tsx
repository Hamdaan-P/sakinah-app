/**
 * DNZ Token Detail Screen
 * Full breakdown of DinarZ balance, earnings, and data ownership.
 */

import { ArrowLeft } from '@phosphor-icons/react';
import { C, cardStyle, DNZ_EARNINGS } from '../barka-labs.constants';
import type { BarkaLabsStats } from '../types/barka-labs.types';
import type { BarkaLabsScreen } from '../pages/BarkaLabsPage';
import { dnzToUsd } from '@/lib/dnz';

interface DnzDetailProps {
  stats: BarkaLabsStats;
  go: (s: BarkaLabsScreen) => void;
}

export function DnzDetail({ stats, go }: DnzDetailProps) {
  const balance = stats.total_score;
  const usd = dnzToUsd(balance).toFixed(2);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => go('home')}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={cardStyle}
        >
          <ArrowLeft size={18} className="text-[#EBDCB8]" />
        </button>
        <div className="text-lg font-bold" style={{ fontFamily: 'Cormorant Garamond, serif', color: C.t1 }}>
          Dinarz (DNZ)
        </div>
      </div>

      {/* Hero */}
      <div className="text-center px-5 pb-5">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-extrabold mx-auto mb-2.5"
          style={{
            background: `linear-gradient(135deg, ${C.dnz}, ${C.goldD})`,
            color: C.bg,
            boxShadow: `0 2px 8px rgba(245,200,66,0.3)`,
          }}
        >
          D
        </div>
        <div className="text-[42px] font-extrabold leading-none" style={{ fontFamily: 'Cormorant Garamond, serif', color: C.dnz }}>
          {balance.toLocaleString()}
        </div>
        <div className="text-[13px] mt-1" style={{ color: C.t2 }}>
          ≈ ${usd} USD · Ethical Digital Token
        </div>
      </div>

      {/* How You Earn */}
      <div className=" mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.t3 }}>
        How You Earn DNZ
      </div>
      <div className=" mb-4">
        <div className="rounded-[14px] overflow-hidden" style={{ background: C.card, border: `1px solid ${C.cardB}` }}>
          {DNZ_EARNINGS.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3.5 py-3 text-[11px]"
              style={{ borderBottom: i < DNZ_EARNINGS.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
            >
              <span style={{ color: C.t2 }}>{item.action}</span>
              <span className="font-semibold" style={{ color: C.dnz }}>+{item.amount} DNZ</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Ownership */}
      <div className=" mb-4">
        <div
          className="rounded-[14px] p-3.5 text-[11px] leading-relaxed"
          style={{
            background: 'rgba(245,200,66,0.06)',
            border: '1px solid rgba(245,200,66,0.12)',
            color: C.dnz,
          }}
        >
          💡 <strong>Your data, your value.</strong> Every gratitude you log helps train ethical AI through Raya. DNZ tokenizes your contribution — you own a piece of the dataset you're building. The more creative and deep your entries, the more valuable your data, the more you earn.
        </div>
      </div>

      {/* Back */}
      <div className=" pb-5">
        <button
          onClick={() => go('home')}
          className="w-full py-3.5 rounded-xl text-sm font-bold"
          style={{ background: `linear-gradient(135deg, ${C.em}, ${C.emD})`, color: C.t1 }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
