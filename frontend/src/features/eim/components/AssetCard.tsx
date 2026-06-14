/**
 * Asset card — compact summary used in the asset picker + portfolio rows.
 */

import { Warning } from '@phosphor-icons/react';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import type { Asset } from '../types/eim.types';

const CLASS_LABEL: Record<string, string> = {
  stock: 'Equity',
  etf: 'ETF',
  fund: 'Fund',
  gold: 'Gold',
  silver: 'Silver',
  reit: 'REIT',
  sukuk: 'Sukuk',
  crypto: 'Crypto',
};

const CLASS_COLOR: Record<string, string> = {
  stock: '#4FB892',
  etf: '#4FB892',
  fund: '#6AA9D8',
  gold: '#D4A853',
  silver: '#C0C0C0',
  reit: '#7BB39A',
  sukuk: '#7BB39A',
  crypto: '#A855F7',
};

interface Props {
  asset: Asset;
  onClick?: () => void;
  showShariah?: boolean;
}

export function AssetCard({ asset, onClick, showShariah = true }: Props) {
  // Curated EIM assets are seeded in USD; render in the chosen display currency.
  const { format } = useCurrencyFormat();
  const isCrypto = asset.asset_class === 'crypto';
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-[rgba(212,168,83,0.14)] bg-[#101a2a] hover:border-[rgba(212,168,83,0.30)] transition-all p-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold"
              style={{
                color: CLASS_COLOR[asset.asset_class],
                background: `${CLASS_COLOR[asset.asset_class]}15`,
              }}
            >
              {CLASS_LABEL[asset.asset_class] ?? asset.asset_class}
            </span>
            <span className="text-[13px] font-bold text-[#F5E8C7]">{asset.ticker}</span>
          </div>
          <div className="text-[12px] text-[#C9D4E0] truncate">{asset.name}</div>
          <div className="text-[10px] text-[#5C5749] mt-0.5 truncate">{asset.sector}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[14px] font-bold text-[#F5E8C7]">
            {format(asset.price, 'USD', { maxDecimals: 2 })}
          </div>
          <div
            className={`text-[10px] ${
              asset.day_change_pct >= 0 ? 'text-[#22C55E]' : 'text-[#E84393]'
            }`}
          >
            {asset.day_change_pct >= 0 ? '▲' : '▼'} {Math.abs(asset.day_change_pct).toFixed(2)}%
          </div>
        </div>
      </div>
      {showShariah && asset.triple_shariah && (
        <div className="mt-2.5 pt-2.5 border-t border-[rgba(212,168,83,0.08)] flex items-center justify-between text-[10px]">
          <span className="text-[#5C5749]">Shariah composite</span>
          <span className="text-[#D4A853] font-bold">{asset.triple_shariah.composite}/100</span>
        </div>
      )}
      {isCrypto && (
        <div className="mt-2.5 pt-2.5 border-t border-[rgba(212,168,83,0.08)] flex items-start gap-1.5 text-[10px] text-[#A855F7]">
          <Warning size={12} weight="bold" className="shrink-0 mt-0.5" />
          <span className="italic">Scholarly disagreement — open Ulama Screening</span>
        </div>
      )}
    </button>
  );
}
