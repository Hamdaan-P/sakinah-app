/**
 * StockInsightCard
 * Full stock insight card: symbol, price, change, chart, period selector, metrics
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { StockChartData } from '../types/chatbot.types';
import { StockLineChart } from './StockLineChart';
import { HalalComplianceBadge } from './HalalComplianceBadge';

const PERIODS = ['1D', '1W', '1M', '3M', '6M', '1Y'] as const;

interface StockInsightCardProps {
  data: StockChartData;
  onPeriodChange?: (symbol: string, period: string) => void;
}

export function StockInsightCard({ data, onPeriodChange }: StockInsightCardProps) {
  const [activePeriod, setActivePeriod] = useState(data.period || '1M');
  const positive = data.change >= 0;

  const handlePeriodClick = (period: string) => {
    setActivePeriod(period);
    onPeriodChange?.(data.symbol, period);
  };

  return (
    <div className="mt-3 bg-[#0F141F]/60 border border-[#D4A853]/20 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-4 pt-3 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Symbol badge */}
          <span className="px-2 py-0.5 rounded-md bg-[#D4A853]/20 text-[#D4A853] text-xs font-bold shrink-0">
            {data.symbol}
          </span>
          <p className="text-sm text-white font-medium truncate">{data.companyName}</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-sm text-white font-bold">${data.price.toFixed(2)}</p>
          <p className={cn('text-xs font-medium', positive ? 'text-emerald-400' : 'text-red-400')}>
            {positive ? '+' : ''}{data.change.toFixed(2)} ({positive ? '+' : ''}{data.changePercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* Halal badge */}
      {data.isHalal != null && (
        <div className="px-3 sm:px-4 pb-1">
          <HalalComplianceBadge isHalal={data.isHalal} />
        </div>
      )}

      {/* Chart */}
      <div className="px-1 sm:px-2">
        <StockLineChart series={data.series} positive={positive} />
      </div>

      {/* Period selector */}
      <div className="px-2 sm:px-3 py-2 flex items-center justify-center gap-1 sm:gap-1.5">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodClick(p)}
            className={cn(
              'px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors',
              activePeriod === p
                ? 'bg-[#D4A853]/20 text-[#D4A853] border border-[#D4A853]/30'
                : 'text-white/40 hover:text-white/60 border border-transparent'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Metrics grid */}
      {data.metrics.length > 0 && (
        <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {data.metrics.map((m) => (
            <div
              key={m.label}
              className="px-2.5 py-1.5 rounded-lg bg-[#0F141F] border border-[rgba(212,168,83,0.15)]"
            >
              <p className="text-[9px] text-white/40">{m.label}</p>
              <p className="text-[11px] text-white font-medium truncate">{m.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
