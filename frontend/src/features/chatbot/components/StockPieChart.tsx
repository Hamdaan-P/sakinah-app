/**
 * StockPieChart
 * Donut chart for portfolio allocation / sector breakdown
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PieChartSlice } from '../types/chatbot.types';

const DEFAULT_PALETTE = ['#D4A853', '#E8C97A', '#B76E79', '#10B981', '#3B82F6', '#C9A85C'];

interface StockPieChartProps {
  slices: PieChartSlice[];
  title?: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.[0]) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="bg-[#0F141F] border border-[#D4A853]/30 rounded-lg px-3 py-2 text-xs shadow-lg">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
        <span className="text-white">{name}</span>
      </div>
      <p className="text-[#C9A85C] mt-0.5">{value.toFixed(1)}%</p>
    </div>
  );
}

export function StockPieChart({ slices, title }: StockPieChartProps) {
  const data = slices.map((s, i) => ({
    ...s,
    color: s.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
  }));

  return (
    <div>
      {title && (
        <p className="text-xs text-[#C9A85C] font-medium mb-2 text-center">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-[10px] text-white/70">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
