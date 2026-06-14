/**
 * StockRow — compact watchlist/explore row: symbol · name | LTP | change% +
 * a compact compliance badge. Tabular-nums so ticking prices don't shift layout.
 */

import { useNavigate } from 'react-router-dom';
import type { Stock } from '../types/trading.types';
import { ComplianceBadge } from './ComplianceBadge';

export function StockRow({ stock }: { stock: Stock }) {
  const navigate = useNavigate();
  const up = stock.changePct >= 0;

  return (
    <button
      onClick={() => navigate(`/trading/stock/${stock.symbol}`)}
      className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[rgba(212,168,83,0.14)] bg-[#101a2a] hover:border-[rgba(212,168,83,0.32)] transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[#F5E8C7]">{stock.symbol}</span>
          <ComplianceBadge stock={stock} />
        </div>
        <div className="text-[11px] text-[#7A7363] truncate">{stock.name}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[13px] font-semibold text-[#F5E8C7] tabular-nums">
          ₹{stock.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div
          className="text-[11px] font-semibold tabular-nums"
          style={{ color: up ? '#7BB39A' : '#E84393' }}
        >
          {up ? '+' : ''}
          {stock.changePct.toFixed(2)}%
        </div>
      </div>
    </button>
  );
}
