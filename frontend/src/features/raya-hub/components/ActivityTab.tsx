/**
 * ActivityTab — "what has Raya done for me".
 *
 * Four stacked sections, each independently best-effort:
 *   1. Actions   — the audit_log tool/action timeline.
 *   2. Reminders — upcoming + past, with delivery status.
 *   3. Chats     — WhatsApp thread(s) → tap to open a decrypted transcript.
 *   4. Memories  — what Raya remembers, grouped by category.
 */

import { useState } from 'react';
import {
  BellRinging, Brain, ChatCircleDots, CheckCircle, Lightning, Sparkle, X,
} from '@phosphor-icons/react';
import {
  useActivity, useChatMessages, useChats, useMemories, useReminders,
} from '../hooks/useDashboard';
import type { ChatThread, ReminderStatus } from '../types';
import { Card, Collapsible, EmptyState, GOLD, SectionTitle, SkeletonRows } from './ui';
import { fmtWhen } from './format';

const STATUS_STYLE: Record<ReminderStatus, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'text-amber-300 border-amber-300/30 bg-amber-300/5' },
  delivered: { label: 'Delivered', cls: 'text-emerald-300 border-emerald-300/30 bg-emerald-300/5' },
  skipped: { label: 'Skipped', cls: 'text-[#C9C0A8]/60 border-[#C9C0A8]/20 bg-[#C9C0A8]/5' },
};

function ActionsSection() {
  const { data, isLoading } = useActivity();
  const items = data?.items ?? [];
  return (
    <section className="mb-8">
      <SectionTitle hint="Every tool Raya ran for you">Actions</SectionTitle>
      {isLoading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState icon={<Lightning size={28} />} title="No actions yet" hint="When Raya looks something up or does a task for you, it shows here." />
      ) : (
        <Collapsible
          items={items}
          initial={5}
          render={(a) => (
            <Card key={a.id} className="p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D4A853]/10 flex items-center justify-center shrink-0">
                <Lightning size={16} weight="duotone" style={{ color: GOLD }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F5E8C7] text-sm font-medium truncate">
                  {a.summary}
                  {a.when && <span className="text-[#C9C0A8]/70 font-normal"> · {fmtWhen(a.when)}</span>}
                </p>
                <p className="text-[#C9C0A8]/55 text-[11px] mt-0.5 flex items-center gap-1.5">
                  {fmtWhen(a.created_at)}
                  {a.confirmed && (
                    <span className="inline-flex items-center gap-0.5 text-emerald-400">
                      <CheckCircle size={11} weight="fill" /> confirmed
                    </span>
                  )}
                  {a.channel && a.channel !== 'whatsapp' && (
                    <span className="text-[#C9C0A8]/40">· {a.channel}</span>
                  )}
                </p>
              </div>
            </Card>
          )}
        />
      )}
    </section>
  );
}

function RemindersSection() {
  const { data, isLoading } = useReminders();
  const items = data?.items ?? [];
  return (
    <section className="mb-8">
      <SectionTitle hint="Things you asked Raya to remind you about">Reminders</SectionTitle>
      {isLoading ? (
        <SkeletonRows rows={3} />
      ) : items.length === 0 ? (
        <EmptyState icon={<BellRinging size={28} />} title="No reminders" hint='Say "remind me to…" on WhatsApp and it lands here.' />
      ) : (
        <Collapsible
          items={items}
          initial={5}
          render={(r) => {
            const s = STATUS_STYLE[r.status];
            return (
              <Card key={r.id} className="p-3.5 flex items-center gap-3">
                <BellRinging size={18} weight="duotone" style={{ color: GOLD }} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5E8C7] text-sm truncate">{r.message}</p>
                  <p className="text-[#C9C0A8]/55 text-[11px] mt-0.5">{fmtWhen(r.due_at)}</p>
                </div>
                <span className={`text-[10px] font-semibold rounded-full border px-2 py-0.5 whitespace-nowrap ${s.cls}`}>
                  {s.label}
                </span>
              </Card>
            );
          }}
        />
      )}
    </section>
  );
}

function TranscriptDrawer({ thread, onClose }: { thread: ChatThread; onClose: () => void }) {
  const { data, isLoading } = useChatMessages(thread.session_id);
  const messages = data?.messages ?? [];
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close transcript" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-gradient-to-b from-[#0F141F] to-[#0A0E16] border-l border-[#D4A853]/20 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#D4A853]/10">
          <p className="text-[#F5E8C7] text-sm font-semibold">WhatsApp transcript</p>
          <button onClick={onClose} aria-label="Close" className="text-[#C9C0A8]/60 hover:text-[#F5E8C7]">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {isLoading ? (
            <SkeletonRows rows={6} />
          ) : messages.length === 0 ? (
            <p className="text-[#C9C0A8]/55 text-sm text-center mt-8">No messages.</p>
          ) : (
            messages.map((m) => {
              const mine = m.role === 'user';
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      mine
                        ? 'bg-[#D4A853]/15 text-[#F5E8C7] rounded-br-sm'
                        : 'bg-[#10151F] border border-[#D4A853]/10 text-[#C9C0A8] rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                    <span className="block text-[9px] text-[#C9C0A8]/40 mt-1">{fmtWhen(m.timestamp)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function ChatsSection() {
  const { data, isLoading } = useChats();
  const threads = data?.threads ?? [];
  const [open, setOpen] = useState<ChatThread | null>(null);
  return (
    <section className="mb-8">
      <SectionTitle hint="Your conversations with Raya on WhatsApp">Chats</SectionTitle>
      {isLoading ? (
        <SkeletonRows rows={2} />
      ) : threads.length === 0 ? (
        <EmptyState icon={<ChatCircleDots size={28} />} title="No WhatsApp chats yet" hint="Link WhatsApp and message Raya — your transcript appears here." />
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <Card key={t.session_id} className="p-3.5">
              <button onClick={() => setOpen(t)} className="w-full flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-full bg-[#25D366]/15 border border-[#25D366]/25 flex items-center justify-center shrink-0">
                  <ChatCircleDots size={18} weight="duotone" className="text-[#25D366]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5E8C7] text-sm truncate">{t.lastUserMessage || 'WhatsApp conversation'}</p>
                  <p className="text-[#C9C0A8]/55 text-[11px] mt-0.5">
                    {t.messageCount} messages · {fmtWhen(t.updatedAt)}
                  </p>
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}
      {open && <TranscriptDrawer thread={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

function MemoriesSection() {
  const { data, isLoading } = useMemories();
  const memories = data?.memories ?? [];
  return (
    <section className="mb-4">
      <SectionTitle hint="What Raya remembers about you">Memories</SectionTitle>
      {isLoading ? (
        <SkeletonRows rows={2} />
      ) : memories.length === 0 ? (
        <EmptyState icon={<Brain size={28} />} title="Nothing remembered yet" hint='Tell Raya "remember that…" and it shows here.' />
      ) : (
        <Collapsible
          items={memories}
          initial={5}
          render={(m) => (
            <Card key={m.id} className="p-3.5 flex items-start gap-3">
              <Sparkle size={16} weight="duotone" style={{ color: GOLD }} className="shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[#F5E8C7] text-sm leading-snug">{m.content}</p>
                <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider text-[#D4A853]/60 border border-[#D4A853]/25 rounded-full px-2 py-0.5">
                  {m.category}
                </span>
              </div>
            </Card>
          )}
        />
      )}
    </section>
  );
}

export function ActivityTab() {
  return (
    <div>
      <ActionsSection />
      <RemindersSection />
      <ChatsSection />
      <MemoriesSection />
    </div>
  );
}

export default ActivityTab;
