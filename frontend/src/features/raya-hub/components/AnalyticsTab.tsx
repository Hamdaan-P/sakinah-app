/**
 * AnalyticsTab — usage at a glance.
 *
 *   • Headline tiles: total messages / actions / reminders / memories.
 *   • Messages over time (area).
 *   • Tool-usage breakdown (horizontal bars).
 *   • Busiest hours (bar).
 *
 * All from one `/raya/dashboard/analytics` call + the memories count.
 */

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  BellRinging, Brain, ChatCircleDots, Lightning,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { useAnalytics, useMemories } from '../hooks/useDashboard';
import { Card, EmptyState, GOLD, SectionTitle, SkeletonRows } from './ui';

const AXIS = '#C9C0A8';
const GRID = 'rgba(212,168,83,0.08)';

function StatTile({ icon: I, label, value }: { icon: Icon; label: string; value: number | string }) {
  return (
    <Card className="p-4">
      <I size={20} weight="duotone" style={{ color: GOLD }} />
      <p className="text-[#F5E8C7] text-2xl font-bold mt-2 leading-none">{value}</p>
      <p className="text-[#C9C0A8]/60 text-[11px] mt-1">{label}</p>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4 mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4A853]/60 mb-3">{title}</p>
      {children}
    </Card>
  );
}

const tooltipStyle = {
  backgroundColor: '#10151F',
  border: '1px solid rgba(212,168,83,0.25)',
  borderRadius: 12,
  color: '#F5E8C7',
  fontSize: 12,
};

function fmtDay(d: string): string {
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export function AnalyticsTab() {
  const { data, isLoading } = useAnalytics();
  const { data: mem } = useMemories();

  if (isLoading) return <SkeletonRows rows={5} />;
  if (!data) {
    return <EmptyState icon={<Lightning size={28} />} title="No analytics yet" hint="Chat with Raya on WhatsApp and your stats will build up here." />;
  }

  const hasMessages = data.messages_by_day.length > 0;
  const hasTools = data.tool_breakdown.length > 0;
  const hasHours = data.busiest_hours.some((h) => h.count > 0);
  const empty = !hasMessages && !hasTools && !hasHours && data.totals.actions === 0;

  if (empty) {
    return <EmptyState icon={<Lightning size={28} />} title="No activity yet" hint="Once you start messaging Raya, your usage charts appear here." />;
  }

  const hours = data.busiest_hours.map((h) => ({
    ...h,
    label: h.hour === 0 ? '12a' : h.hour === 12 ? '12p' : h.hour > 12 ? `${h.hour - 12}p` : `${h.hour}a`,
  }));

  return (
    <div>
      <SectionTitle hint="Your Raya usage on WhatsApp">Overview</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatTile icon={ChatCircleDots} label="Messages" value={data.totals.messages + (data.messages_capped ? '+' : '')} />
        <StatTile icon={Lightning} label="Actions" value={data.totals.actions} />
        <StatTile icon={BellRinging} label="Reminders" value={data.totals.reminders} />
        <StatTile icon={Brain} label="Memories" value={mem?.count ?? 0} />
      </div>

      {hasMessages && (
        <ChartCard title="Messages over time">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.messages_by_day} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="date" tickFormatter={fmtDay} tick={{ fill: AXIS, fontSize: 10 }} stroke={GRID} />
              <YAxis allowDecimals={false} tick={{ fill: AXIS, fontSize: 10 }} stroke={GRID} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(d) => fmtDay(String(d))} />
              <Area type="monotone" dataKey="count" name="Messages" stroke={GOLD} strokeWidth={2} fill="url(#msgGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {hasTools && (
        <ChartCard title="What Raya did most">
          <ResponsiveContainer width="100%" height={Math.max(120, data.tool_breakdown.length * 28)}>
            <BarChart data={data.tool_breakdown} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS, fontSize: 10 }} stroke={GRID} />
              <YAxis type="category" dataKey="label" width={120} tick={{ fill: AXIS, fontSize: 10 }} stroke={GRID} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(212,168,83,0.06)' }} />
              <Bar dataKey="count" name="Times" radius={[0, 6, 6, 0]} fill={GOLD} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {hasHours && (
        <ChartCard title="Busiest hours">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={hours} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" interval={2} tick={{ fill: AXIS, fontSize: 9 }} stroke={GRID} />
              <YAxis allowDecimals={false} tick={{ fill: AXIS, fontSize: 10 }} stroke={GRID} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(212,168,83,0.06)' }} />
              <Bar dataKey="count" name="Messages" radius={[4, 4, 0, 0]} barSize={10}>
                {hours.map((h) => (
                  <Cell key={h.hour} fill={h.count > 0 ? GOLD : 'rgba(212,168,83,0.15)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

export default AnalyticsTab;
