/**
 * Reusable primitives for the Admin Dashboard tabs (Card, StatCard, charts, chat panel).
 *
 * Extracted from AdminPage.tsx.
 */

import { useState, useEffect } from 'react';
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Spinner, ChatCircleDots, CaretDown, TrendUp } from '@phosphor-icons/react';
import { useAdminStore } from '../stores/admin.store';
import type { NameCount, Conversation } from '../types/admin.types';
import { fmtDateTime, pct } from './helpers';
import {
  BG, SURFACE, SURFACE_2, GOLD, WHITE, TEXT_1, TEXT_2, TEXT_3, BORDER, CHART_COLORS,
} from './constants';

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border p-6 ${className}`} style={{ background: SURFACE, borderColor: BORDER }}>
      {children}
    </div>
  );
}

// ── Big stat card ─────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string; icon: typeof TrendUp; accent?: string;
}) {
  const color = accent || GOLD;
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide" style={{ color: TEXT_2 }}>{label}</p>
          <p className="text-4xl font-extrabold mt-2 tracking-tight" style={{ color: WHITE }}>{value}</p>
          {sub && <p className="text-sm mt-2" style={{ color: TEXT_3 }}>{sub}</p>}
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={24} weight="bold" style={{ color }} />
        </div>
      </div>
    </Card>
  );
}

// ── Horizontal bar chart ──────────────────────────────────────
export function HBarChart({ data, title }: { data: NameCount[]; title: string }) {
  if (!data.length) return null;
  return (
    <Card>
      <h3 className="text-lg font-bold mb-4" style={{ color: WHITE }}>{title}</h3>
      <ResponsiveContainer width="100%" height={Math.max(140, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={140} tick={{ fill: TEXT_1, fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 12, color: WHITE, fontSize: 14 }}
            cursor={{ fill: 'rgba(212,168,83,0.06)' }}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]} fill={GOLD} barSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ── Donut chart ───────────────────────────────────────────────
export function DonutChart({ data, title }: { data: NameCount[]; title: string }) {
  if (!data.length) return null;
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <Card>
      <h3 className="text-lg font-bold mb-4" style={{ color: WHITE }}>{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 12, color: WHITE, fontSize: 14 }}
            formatter={(value, name) => [`${value} (${pct(Number(value), total)})`, String(name)]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-3">
        {data.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: TEXT_1 }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
            {d.name} <span style={{ color: TEXT_3 }}>({d.count})</span>
          </span>
        ))}
      </div>
    </Card>
  );
}

// ── Chat History Panel ───────────────────────────────────────
export function ChatHistoryPanel({ userId }: { userId: string }) {
  const { chatHistory, chatHistoryLoading, fetchChatHistory } = useAdminStore();
  const [expandedConv, setExpandedConv] = useState<string | null>(null);

  useEffect(() => {
    fetchChatHistory(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchChatHistory is a stable zustand action; only re-run on userId change
  }, [userId]);

  if (chatHistoryLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size={24} className="animate-spin" style={{ color: GOLD }} />
        <span className="ml-3 text-sm font-medium" style={{ color: TEXT_2 }}>Loading chat history...</span>
      </div>
    );
  }

  if (!chatHistory || chatHistory.conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <ChatCircleDots size={40} weight="duotone" style={{ color: TEXT_3 }} className="mx-auto mb-3" />
        <p className="text-sm font-medium" style={{ color: TEXT_3 }}>No conversations found</p>
      </div>
    );
  }

  const toggleConv = (id: string) => {
    setExpandedConv(expandedConv === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {chatHistory.conversations.map((conv: Conversation) => (
        <div key={conv.id} className="rounded-xl border overflow-hidden" style={{ borderColor: BORDER, background: BG }}>
          {/* Conversation header */}
          <button
            onClick={() => toggleConv(conv.id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <ChatCircleDots size={18} weight="bold" style={{ color: GOLD }} />
              <div className="text-left min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: WHITE }}>
                  {conv.title || 'Untitled Conversation'}
                </p>
                <p className="text-xs font-medium" style={{ color: TEXT_3 }}>
                  {conv.message_count} messages {conv.updated_at ? `· ${fmtDateTime(conv.updated_at)}` : ''}
                </p>
              </div>
            </div>
            <CaretDown
              size={16}
              weight="bold"
              style={{ color: TEXT_3, transform: expandedConv === conv.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </button>

          {/* Messages */}
          {expandedConv === conv.id && (
            <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: BORDER }}>
              <div className="pt-3" />
              {conv.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-3"
                    style={{
                      background: msg.role === 'user' ? `${GOLD}20` : SURFACE_2,
                      borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                      borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 16,
                    }}
                  >
                    <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: msg.role === 'user' ? GOLD : '#94A3B8' }}>
                      {msg.role === 'user' ? 'User' : 'Raya'}
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: TEXT_1 }}>
                      {msg.content}
                    </p>
                    {msg.timestamp && (
                      <p className="text-[10px] mt-1.5 font-medium" style={{ color: TEXT_3 }}>
                        {fmtDateTime(msg.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {conv.messages.length === 0 && (
                <p className="text-sm text-center py-4 font-medium" style={{ color: TEXT_3 }}>No messages in this conversation</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
