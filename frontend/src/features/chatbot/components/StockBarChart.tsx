/**
 * StockBarChart
 * Bar chart for comparative financial data
 */

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StockBarChartProps {
  data: Array<{ label: string; value: number }>;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; value: number } }> }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0F141F] border border-[#D4A853]/30 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-white font-medium">{d.label}</p>
      <p className="text-[#C9A85C]">{d.value.toLocaleString()}</p>
    </div>
  );
}

export function StockBarChart({ data }: StockBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-white/30 text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,83,0.15)" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#C9A85C', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(212,168,83,0.15)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#C9A85C', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(212,168,83,0.15)' }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="value"
          fill="#D4A853"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
