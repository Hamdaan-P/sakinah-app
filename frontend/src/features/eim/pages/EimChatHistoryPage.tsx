/**
 * Saved persona chats — grouped by persona, newest first.
 *
 * Reads from `GET /api/eim/conversations` (auth-required Firestore). Each
 * row links to `/eim/analysis?conversation_id=…` which lazy-loads the
 * full message history.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CaretLeft, CaretRight, ChatCircleDots, ClockCounterClockwise } from '@phosphor-icons/react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { FetchError } from '../components/FetchError';
import { PersonaAvatar, PersonaTypeBadge } from '../components/PersonaAvatar';
import { getPersonaAccent } from '../components/persona-helpers';
import { eimService } from '../services/eim.service';
import type { EimConversation, Persona } from '../types/eim.types';

interface PersonaGroup {
  persona: Persona | null;
  personaId: string;
  conversations: EimConversation[];
}

export function EimChatHistoryPage() {
  const navigate = useNavigate();

  const conversationsQ = useQuery({
    queryKey: ['eim', 'conversations'],
    queryFn: () => eimService.listConversations({ limit: 100 }),
  });

  const personasQ = useQuery({
    queryKey: ['eim', 'personas'],
    queryFn: eimService.getPersonas,
  });

  const groups: PersonaGroup[] = useMemo(() => {
    const items = conversationsQ.data?.conversations ?? [];
    const personas = personasQ.data ?? [];
    const personaById = new Map(personas.map((p) => [p.id, p]));

    const buckets = new Map<string, PersonaGroup>();
    for (const conv of items) {
      const existing = buckets.get(conv.persona_id);
      if (existing) {
        existing.conversations.push(conv);
      } else {
        buckets.set(conv.persona_id, {
          persona: personaById.get(conv.persona_id) ?? null,
          personaId: conv.persona_id,
          conversations: [conv],
        });
      }
    }
    // Sort each group's conversations newest-first by last_message_at (fallback created_at)
    for (const group of buckets.values()) {
      group.conversations.sort((a, b) =>
        sortKey(b).localeCompare(sortKey(a)),
      );
    }
    // Sort groups by their newest conversation
    return Array.from(buckets.values()).sort((a, b) =>
      sortKey(b.conversations[0]).localeCompare(sortKey(a.conversations[0])),
    );
  }, [conversationsQ.data, personasQ.data]);

  const totalConversations = conversationsQ.data?.conversations.length ?? 0;
  const isLoading = conversationsQ.isLoading || personasQ.isLoading;

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-3xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim')}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
            aria-label="Back to EIM home"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
              EIM · Saved chats
            </div>
            <h1 className="text-[20px] font-bold text-[#F5E8C7]">Past Mentor Conversations</h1>
          </div>
          {totalConversations > 0 && (
            <span className="text-[11px] text-[#7A7363] bg-[#101a2a] border border-[rgba(212,168,83,0.18)] px-2.5 py-1 rounded-full">
              {totalConversations}
            </span>
          )}
        </header>

        <DisclaimerBanner />

        <div className="px-3 mt-4 space-y-3">
          {conversationsQ.error && (
            <FetchError
              error={conversationsQ.error}
              retry={() => void conversationsQ.refetch()}
              context="conversation list"
            />
          )}

          {isLoading && (
            <div className="rounded-2xl border border-[rgba(212,168,83,0.14)] bg-[#101a2a] p-5 text-[12px] text-[#7A7363] italic">
              Loading saved chats…
            </div>
          )}

          {!isLoading && !conversationsQ.error && groups.length === 0 && (
            <EmptyState onStart={() => navigate('/eim/mentor')} />
          )}

          {groups.map((group) => (
            <PersonaGroupCard
              key={group.personaId}
              group={group}
              onOpen={(convId) =>
                navigate(`/eim/analysis?conversation_id=${encodeURIComponent(convId)}`)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default EimChatHistoryPage;


function PersonaGroupCard({
  group,
  onOpen,
}: {
  group: PersonaGroup;
  onOpen: (convId: string) => void;
}) {
  const { persona, personaId, conversations } = group;
  const accent = persona ? getPersonaAccent(persona) : '#D4A853';
  const headerLabel = persona?.name ?? personaId;

  return (
    <div
      className="rounded-2xl bg-[#101a2a] overflow-hidden"
      style={{ border: `1px solid ${accent}33` }}
    >
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: `${accent}10`, borderBottom: `1px solid ${accent}22` }}
      >
        {persona ? (
          <PersonaAvatar persona={persona} size={32} selected />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold"
            style={{ background: `${accent}26`, color: accent }}
          >
            {personaId.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-bold text-[#F5E8C7] truncate">{headerLabel}</span>
            {persona && <PersonaTypeBadge persona={persona} />}
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: accent }}>
            {conversations.length} chat{conversations.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>
      <ul>
        {conversations.map((conv) => (
          <li key={conv.id}>
            <ConversationRow conv={conv} accent={accent} onOpen={() => onOpen(conv.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}


function ConversationRow({
  conv,
  accent,
  onOpen,
}: {
  conv: EimConversation;
  accent: string;
  onOpen: () => void;
}) {
  const ts = conv.last_message_at ?? conv.created_at;
  return (
    <button
      onClick={onOpen}
      className="w-full text-left px-4 py-3 flex items-center gap-3 border-t border-[rgba(212,168,83,0.06)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
    >
      <ChatCircleDots size={14} weight="bold" style={{ color: accent }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-[#F5E8C7] font-medium truncate">{conv.title}</div>
        <div className="flex items-center gap-2 text-[10.5px] text-[#5C5749] mt-0.5">
          <ClockCounterClockwise size={10} weight="bold" />
          <span>{formatRelative(ts)}</span>
          <span aria-hidden>·</span>
          <span>
            {conv.message_count} message{conv.message_count === 1 ? '' : 's'}
          </span>
        </div>
      </div>
      <CaretRight size={14} weight="bold" className="text-[#5C5749] shrink-0" />
    </button>
  );
}


function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-8 text-center">
      <ChatCircleDots size={32} weight="duotone" className="text-[#D4A853] mx-auto mb-3" />
      <div className="text-[14px] text-[#F5E8C7] font-semibold mb-1">No saved chats yet</div>
      <p className="text-[12px] text-[#7A7363] leading-relaxed mb-4">
        Run an analysis with one of the featured mentors, then ask a follow-up question — the
        conversation will be saved automatically so you can return to it any time.
      </p>
      <button
        onClick={onStart}
        className="px-4 py-2 rounded-lg text-[12px] font-bold text-[#0A0E16]"
        style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
      >
        Start a chat →
      </button>
    </div>
  );
}


function sortKey(conv: EimConversation | undefined): string {
  if (!conv) return '';
  return conv.last_message_at ?? conv.created_at ?? '';
}


function formatRelative(iso: string | null | undefined): string {
  if (!iso) return 'just now';
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 'just now';
  const diffMs = Date.now() - t;
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWk = Math.round(diffDay / 7);
  if (diffWk < 5) return `${diffWk}w ago`;
  return new Date(iso).toLocaleDateString();
}
