/**
 * Single stock row in the Shariah Screener list.
 */

import { motion } from 'framer-motion';
import {
  ShieldCheck, ShieldWarning, TrendDown, TrendUp,
} from '@phosphor-icons/react';
import type { LiveStockData } from './_cache';

interface LiveStockRowProps {
  stock: LiveStockData;
  index: number;
  onClick: () => void;
}

export function LiveStockRow({ stock, index, onClick }: LiveStockRowProps) {
  const isCompliant = stock.backendScreen?.is_compliant ?? false;
  const screen = stock.backendScreen;

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0F141F] border border-[#3A4D65]/50 text-left hover:border-emerald-500/30 transition-colors cursor-pointer"
    >
      {/* Symbol badge */}
      <div className="w-10 h-10 rounded-lg bg-[#0A0E16] flex items-center justify-center shrink-0">
        <span className="text-[#D4A853] text-[10px] font-bold">{stock.symbol.slice(0, 4)}</span>
      </div>

      {/* Name + compliance */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[#F5E8C7] font-semibold text-sm">{stock.symbol}</h3>
          {isCompliant
            ? <ShieldCheck size={14} weight="fill" className="text-emerald-400" />
            : <ShieldWarning size={14} weight="fill" className="text-red-400" />
          }
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${isCompliant ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {isCompliant ? 'Halal' : 'Haram'}
          </span>
        </div>
        <p className="text-[#7B8DA0] text-xs truncate">{stock.name}</p>
        {screen && !isCompliant && screen.issues.length > 0 && (
          <p className="text-red-400/80 text-[10px] truncate mt-0.5">{screen.issues[0]}</p>
        )}
        {screen && (
          <div className="flex gap-2 mt-1">
            <span className={`text-[9px] font-mono ${screen.debt_ratio.passed ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
              D: {screen.debt_ratio.percent_str}
            </span>
            <span className={`text-[9px] font-mono ${screen.interest_ratio.passed ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
              I: {screen.interest_ratio.percent_str}
            </span>
            <span className={`text-[9px] font-mono ${screen.receivables_ratio.passed ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
              R: {screen.receivables_ratio.percent_str}
            </span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <p className="text-[#F5E8C7] font-semibold text-sm">${stock.price.toFixed(2)}</p>
        <p className={`text-xs flex items-center justify-end gap-0.5 ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {stock.change >= 0 ? <TrendUp size={12} /> : <TrendDown size={12} />}
          {stock.change >= 0 ? '+' : ''}{stock.changePct.toFixed(2)}%
        </p>
      </div>
    </motion.button>
  );
}
