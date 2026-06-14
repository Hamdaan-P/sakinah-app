/**
 * StockLineChart
 * Area chart for stock price history using Recharts
 */

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { HistoricalDataPoint } from '../types/chatbot.types';

interface StockLineChartProps {
  series: HistoricalDataPoint[];
  positive: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: HistoricalDataPoint }> }) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#0F141F] border border-[#D4A853]/30 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-[#C9A85C] mb-1">{formatDate(data.date)}</p>
      <p className="text-white font-medium">${data.close.toFixed(2)}</p>
      {data.volume > 0 && (
        <p className="text-white/50 mt-0.5">Vol: {(data.volume / 1e6).toFixed(1)}M</p>
      )}
    </div>
  );
}

export function StockLineChart({ series, positive }: StockLineChartProps) {
  const color = positive ? '#10B981' : '#EF4444';
  const gradientId = positive ? 'greenGradient' : 'redGradient';

  if (series.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-white/30 text-sm">
        No chart data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={series} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,83,0.15)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: '#C9A85C', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(212,168,83,0.15)' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fill: '#C9A85C', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(212,168,83,0.15)' }}
          tickLine={false}
          tickFormatter={(v: number) => `$${v.toFixed(0)}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: '#0F141F', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
