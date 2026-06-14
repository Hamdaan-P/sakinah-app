/**
 * StockComparisonCard
 * Overlay chart (normalized % change) + side-by-side metrics table for comparing stocks
 */

import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { ShieldCheck, ShieldSlash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { ComparisonData, ComparisonStockData } from '../types/chatbot.types';

const PERIODS = ['1D', '1W', '1M', '3M', '6M', '1Y'] as const;

const STOCK_COLORS = ['#D4A853', '#38BDF8', '#A78BFA'];

interface StockComparisonCardProps {
  data: ComparisonData;
  onPeriodChange?: (symbols: string[], period: string) => void;
}

interface MergedDataPoint {
  date: string;
  [key: string]: number | string; // pct_0, pct_1, pct_2, price_0, price_1, price_2
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Merge normalized series from multiple stocks by date */
function mergeSeries(stocks: ComparisonStockData[]): MergedDataPoint[] {
  const dateMap = new Map<string, MergedDataPoint>();

  stocks.forEach((stock, idx) => {
    for (const point of stock.normalizedSeries) {
      let entry = dateMap.get(point.date);
      if (!entry) {
        entry = { date: point.date };
        dateMap.set(point.date, entry);
      }
      entry[`pct_${idx}`] = point.percentChange;
      entry[`price_${idx}`] = point.close;
    }
  });

  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(2);
}

function ComparisonTooltip({
  active,
  payload,
  stocks,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; payload: MergedDataPoint }>;
  stocks: ComparisonStockData[];
}) {
  if (!active || !payload?.length) return null;
  const dataPoint = payload[0].payload;
  return (
    <div className="bg-[#0F141F] border border-[#D4A853]/30 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-[#C9A85C] mb-1.5">{formatDate(dataPoint.date)}</p>
      {stocks.map((stock, idx) => {
        const pct = dataPoint[`pct_${idx}`] as number | undefined;
        const price = dataPoint[`price_${idx}`] as number | undefined;
        if (pct == null) return null;
        return (
          <div key={stock.symbol} className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STOCK_COLORS[idx] }} />
            <span className="text-white font-medium">{stock.symbol}</span>
            <span className="text-white/70">{formatPrice(price ?? 0)}</span>
            <span className={cn('font-medium', pct >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StockComparisonCard({ data, onPeriodChange }: StockComparisonCardProps) {
  const [activePeriod, setActivePeriod] = useState(data.period || '1M');
  const mergedData = useMemo(() => mergeSeries(data.stocks), [data.stocks]);

  const handlePeriodClick = (period: string) => {
    setActivePeriod(period);
    onPeriodChange?.(data.stocks.map((s) => s.symbol), period);
  };

  return (
    <div className="mt-3 bg-[#0F141F]/60 border border-[#D4A853]/20 rounded-xl overflow-hidden">
      {/* Header — stock pills */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-3 flex-wrap">
        {data.stocks.map((stock, idx) => (
          <div key={stock.symbol} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STOCK_COLORS[idx] }} />
            <span className="px-2 py-0.5 rounded-md bg-[#D4A853]/10 text-xs font-bold" style={{ color: STOCK_COLORS[idx] }}>
              {stock.symbol}
            </span>
            <span className="text-xs text-white/60 hidden sm:inline">{stock.companyName}</span>
          </div>
        ))}
      </div>

      {/* Overlay chart */}
      <div className="px-2">
        {mergedData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-white/30 text-sm">
            No chart data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mergedData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <defs>
                {data.stocks.map((_, idx) => (
                  <linearGradient key={idx} id={`compGrad_${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={STOCK_COLORS[idx]} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={STOCK_COLORS[idx]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,83,0.1)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: '#C9A85C', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(212,168,83,0.15)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#C9A85C', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(212,168,83,0.15)' }}
                tickLine={false}
                tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`}
              />
              <ReferenceLine y={0} stroke="rgba(212,168,83,0.3)" strokeDasharray="3 3" />
              <Tooltip content={<ComparisonTooltip stocks={data.stocks} />} />
              {data.stocks.map((_, idx) => (
                <Area
                  key={idx}
                  type="monotone"
                  dataKey={`pct_${idx}`}
                  stroke={STOCK_COLORS[idx]}
                  strokeWidth={2}
                  fill={`url(#compGrad_${idx})`}
                  dot={false}
                  activeDot={{ r: 4, fill: STOCK_COLORS[idx], stroke: '#0F141F', strokeWidth: 2 }}
                  connectNulls
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Period selector */}
      <div className="px-3 py-2 flex items-center gap-1.5">
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

      {/* Side-by-side metrics table */}
      <div className="px-3 pb-3">
        <div className="bg-[#0A0E16]/60 rounded-xl border border-[#3A4D65]/50 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#3A4D65]/50">
                <th className="text-left px-3 py-2 text-white/40 font-medium">Metric</th>
                {data.stocks.map((stock, idx) => (
                  <th key={stock.symbol} className="text-right px-3 py-2 font-bold" style={{ color: STOCK_COLORS[idx] }}>
                    {stock.symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price */}
              <MetricRow label="Price" values={data.stocks.map((s) => formatPrice(s.price))} />
              {/* Change */}
              <MetricRow
                label="Change"
                values={data.stocks.map((s) => `${s.changePercent >= 0 ? '+' : ''}${s.changePercent.toFixed(2)}%`)}
                colorize={data.stocks.map((s) => s.changePercent)}
              />
              {/* Shariah */}
              <tr className="border-b border-[#3A4D65]/30">
                <td className="px-3 py-2 text-white/50">Shariah</td>
                {data.stocks.map((stock) => (
                  <td key={stock.symbol} className="text-right px-3 py-2">
                    {stock.shariahCompliant != null ? (
                      <span className={cn('inline-flex items-center gap-1', stock.shariahCompliant ? 'text-emerald-400' : 'text-red-400')}>
                        {stock.shariahCompliant ? <ShieldCheck size={14} weight="fill" /> : <ShieldSlash size={14} weight="fill" />}
                        {stock.shariahCompliant ? 'Compliant' : 'Non-Compliant'}
                      </span>
                    ) : (
                      <span className="text-white/30">N/A</span>
                    )}
                  </td>
                ))}
              </tr>
              {/* P/E Ratio */}
              <MetricRow
                label="P/E Ratio"
                values={data.stocks.map((s) => s.trailingPE != null ? s.trailingPE.toFixed(1) : 'N/A')}
                highlight={findBetter(data.stocks.map((s) => s.trailingPE), 'lower')}
              />
              {/* ROE */}
              <MetricRow
                label="ROE"
                values={data.stocks.map((s) => s.roe != null ? `${s.roe.toFixed(1)}%` : 'N/A')}
                highlight={findBetter(data.stocks.map((s) => s.roe), 'higher')}
              />
              {/* Verdict */}
              <tr>
                <td className="px-3 py-2 text-white/50">Verdict</td>
                {data.stocks.map((stock) => (
                  <td key={stock.symbol} className="text-right px-3 py-2">
                    {stock.overallVerdict ? (
                      <VerdictBadge verdict={stock.overallVerdict} />
                    ) : (
                      <span className="text-white/30">N/A</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== Table Helpers ====================

function MetricRow({
  label,
  values,
  colorize,
  highlight,
}: {
  label: string;
  values: string[];
  colorize?: number[];
  highlight?: number;
}) {
  return (
    <tr className="border-b border-[#3A4D65]/30">
      <td className="px-3 py-2 text-white/50">{label}</td>
      {values.map((val, idx) => (
        <td
          key={idx}
          className={cn(
            'text-right px-3 py-2 font-medium',
            colorize
              ? colorize[idx] >= 0 ? 'text-emerald-400' : 'text-red-400'
              : highlight === idx ? 'text-[#D4A853]' : 'text-white/80'
          )}
        >
          {val}
        </td>
      ))}
    </tr>
  );
}

/** Find the index of the "better" value (lower or higher) */
function findBetter(values: (number | undefined)[], direction: 'lower' | 'higher'): number {
  let bestIdx = -1;
  let bestVal: number | undefined;
  values.forEach((v, idx) => {
    if (v == null) return;
    if (bestVal == null || (direction === 'higher' ? v > bestVal : v < bestVal)) {
      bestVal = v;
      bestIdx = idx;
    }
  });
  return bestIdx;
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const lower = verdict.toLowerCase();
  const isPositive = lower.includes('buy') || lower.includes('strong') || lower.includes('bullish');
  const isNegative = lower.includes('sell') || lower.includes('avoid') || lower.includes('bearish');
  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold',
        isPositive && 'bg-emerald-500/20 text-emerald-400',
        isNegative && 'bg-red-500/20 text-red-400',
        !isPositive && !isNegative && 'bg-[#D4A853]/20 text-[#D4A853]'
      )}
    >
      {verdict}
    </span>
  );
}
