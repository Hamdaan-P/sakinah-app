/**
 * MoodChart
 * Recharts AreaChart showing sentiment (-1 to 1) over time.
 * Uses navy/gold theme consistent with stock charts.
 * RAYA EVOLUTION: Phase 5
 */

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { MoodLogEntry } from '../types/chatbot.types';
import { cn } from '@/lib/utils';

interface MoodChartProps {
  data: MoodLogEntry[];
}

type Period = '7d' | '30d' | '90d';

function filterByPeriod(data: MoodLogEntry[], period: Period): MoodLogEntry[] {
  const now = Date.now();
  const msMap: Record<Period, number> = {
    '7d': 7 * 86400000,
    '30d': 30 * 86400000,
    '90d': 90 * 86400000,
  };
  const cutoff = now - msMap[period];
  return data.filter((d) => new Date(d.timestamp).getTime() >= cutoff);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

export function MoodChart({ data }: MoodChartProps) {
  const [period, setPeriod] = useState<Period>('30d');

  const chartData = useMemo(() => {
    const filtered = filterByPeriod(data, period);
    // Sort ascending by date and map to chart format
    return [...filtered]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((entry) => ({
        date: formatDate(new Date(entry.timestamp)),
        sentiment: Number(entry.sentiment.toFixed(2)),
        emotion: entry.primaryEmotion,
      }));
  }, [data, period]);

  if (data.length === 0) {
    return (
      <div className="text-center py-6 text-[#7B8DA0] text-xs">
        No mood data yet. Chat with Raya to start tracking.
      </div>
    );
  }

  const periods: Period[] = ['7d', '30d', '90d'];

  return (
    <div>
      {/* Period selector */}
      <div className="flex gap-1.5 mb-3">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors',
              period === p
                ? 'bg-[#D4A853]/20 text-[#D4A853] border border-[#D4A853]/30'
                : 'bg-[#0A0E16] text-[#7B8DA0] border border-transparent hover:border-[#3A4D65]',
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="text-center py-4 text-[#7B8DA0] text-xs">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4A853" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4A853" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: '#7B8DA0' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[-1, 1]}
              tick={{ fontSize: 9, fill: '#7B8DA0' }}
              axisLine={false}
              tickLine={false}
              ticks={[-1, 0, 1]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0E16',
                border: '1px solid #3A4D65',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#F5E8C7',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, _name: any, props: any) => [
                `${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(2)} (${props?.payload?.emotion ?? ''})`,
                'Sentiment',
              ]}
            />
            <ReferenceLine y={0} stroke="#3A4D65" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke="#D4A853"
              fill="url(#sentimentGrad)"
              strokeWidth={2}
              dot={{ r: 2, fill: '#D4A853', strokeWidth: 0 }}
              activeDot={{ r: 4, fill: '#D4A853', stroke: '#E8C97A', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
