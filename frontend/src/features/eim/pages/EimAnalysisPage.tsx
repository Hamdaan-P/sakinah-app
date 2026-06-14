/**
 * Analysis report viewer + saved persona chat.
 *
 * Two modes:
 *   1. **Live analysis** — `lastReport` in the EIM store. Renders the full
 *      §5.3 8-section report PLUS a chat panel. On the first follow-up,
 *      lazily creates a saved conversation, pushes `?conversation_id=…`
 *      into the URL, and from then on persists every turn server-side.
 *   2. **Saved chat** — page loaded with `?conversation_id=…` (typically
 *      from the chat-history page) and no `lastReport`. Hydrates the chat
 *      from the persisted messages, shows a "from your saved chats" banner,
 *      and either keeps the conversation continuable (if the original
 *      portfolio is still in the local store) or renders it read-only.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  CaretLeft,
  ChatCircleDots,
  ClockCounterClockwise,
  Info,
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import { eimTrack } from '../analytics';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { Markdownish } from '../components/Markdownish';
import { PersonaAvatar, PersonaTypeBadge } from '../components/PersonaAvatar';
import { getPersonaAccent } from '../components/persona-helpers';
import { eimService } from '../services/eim.service';
import { useEimStore } from '../stores/eim.store';
import type { ConcentrationSlice, FollowupResponse } from '../types/eim.types';

interface ChatTurn {
  question: string;
  response: FollowupResponse | null;
  loading: boolean;
  error: string | null;
}

export function EimAnalysisPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const urlConvId = searchParams.get('conversation_id');

  const report = useEimStore((s) => s.lastReport);
  const portfolios = useEimStore((s) => s.portfolios);

  // Tracks the conversation id for THIS page session. May arrive from the
  // URL (saved-chat mode) or be lazily created on the first follow-up
  // (live-analysis mode).
  const [convId, setConvId] = useState<string | null>(urlConvId);
  // Keep in sync if the URL changes underneath us (e.g. back-nav).
  useEffect(() => {
    setConvId(urlConvId);
  }, [urlConvId]);

  const conversationQ = useQuery({
    queryKey: ['eim', 'conversation', convId],
    queryFn: () => eimService.getConversation(convId as string),
    enabled: !!convId,
  });

  const { data: personas } = useQuery({
    queryKey: ['eim', 'personas'],
    queryFn: eimService.getPersonas,
    enabled: !!report || !!convId,
  });

  // Resolve the persona_id from whichever source we have.
  const personaId =
    report?.persona_id ?? conversationQ.data?.conversation.persona_id ?? null;
  const persona = personaId ? personas?.find((p) => p.id === personaId) : undefined;

  // Resolve the portfolio — preferred from the live report, falls back to
  // looking up the conversation's portfolio_id in the local zustand store.
  const portfolio = useMemo(() => {
    if (report) return portfolios.find((p) => p.id === report.portfolio_id) ?? null;
    const portId = conversationQ.data?.conversation.portfolio_id;
    return portId ? (portfolios.find((p) => p.id === portId) ?? null) : null;
  }, [portfolios, report, conversationQ.data]);

  const priorAtAGlance = report?.at_a_glance ?? '';

  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  // Hydrate turns from the saved conversation the first time it arrives. We
  // map (user, assistant) pairs into ChatTurn shape; out-of-order or
  // unbalanced messages are tolerated — orphan user turns get a null response.
  const [hydratedConvId, setHydratedConvId] = useState<string | null>(null);
  useEffect(() => {
    const msgs = conversationQ.data?.messages;
    if (!conversationQ.data || hydratedConvId === conversationQ.data.conversation.id) {
      return;
    }
    const hydrated: ChatTurn[] = [];
    let pendingQuestion: string | null = null;
    for (const m of msgs ?? []) {
      if (m.role === 'user') {
        if (pendingQuestion !== null) {
          hydrated.push({ question: pendingQuestion, response: null, loading: false, error: null });
        }
        pendingQuestion = m.content;
      } else {
        const response: FollowupResponse = {
          answer: m.content,
          lesson_refs: m.citation_refs ?? [],
          scholar_refs: [],
          topic_tags: m.topic_tags ?? [],
          fallback: false,
        };
        hydrated.push({
          question: pendingQuestion ?? '(continued)',
          response,
          loading: false,
          error: null,
        });
        pendingQuestion = null;
      }
    }
    if (pendingQuestion !== null) {
      hydrated.push({ question: pendingQuestion, response: null, loading: false, error: null });
    }
    setTurns(hydrated);
    setHydratedConvId(conversationQ.data.conversation.id);
  }, [conversationQ.data, hydratedConvId]);

  // ── Empty state — no live analysis AND no conversation id in URL ─────────
  if (!report && !urlConvId) {
    return (
      <div className="min-h-screen bg-[#0F1724] flex flex-col items-center justify-center text-[#5C5749] text-[13px] px-6 text-center gap-3">
        No analysis to display.
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <button
            onClick={() => navigate('/eim/mentor')}
            className="px-4 py-2 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.20)] text-[#D4A853] text-[12px]"
          >
            Run an analysis
          </button>
          <button
            onClick={() => navigate('/eim/history')}
            className="px-4 py-2 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.10)] text-[#7A7363] text-[12px] flex items-center justify-center gap-1.5"
          >
            <ClockCounterClockwise size={12} weight="bold" />
            View past chats
          </button>
        </div>
      </div>
    );
  }

  const inputEnabled = !!portfolio && !!personaId;
  const inputDisabledReason = !personaId
    ? 'Loading persona…'
    : !portfolio
      ? 'Original portfolio is no longer in your portfolios.'
      : null;

  const askFollowup = async () => {
    const q = question.trim();
    if (!q || !portfolio || !personaId) return;
    const idx = turns.length;
    setTurns((prev) => [...prev, { question: q, response: null, loading: true, error: null }]);
    setQuestion('');
    eimTrack('eim_mentor_followup_asked');
    try {
      // Lazy-create a conversation on the first follow-up of a live session.
      let activeConvId = convId;
      if (!activeConvId) {
        const conv = await eimService.createConversation({
          persona_id: personaId,
          portfolio_id: portfolio.id,
          portfolio_name: portfolio.name,
        });
        activeConvId = conv.id;
        setConvId(conv.id);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('conversation_id', conv.id);
        setSearchParams(nextParams, { replace: true });
        // Invalidate the conversations list so the history page reflects the
        // new thread when the user navigates there.
        queryClient.invalidateQueries({ queryKey: ['eim', 'conversations'] });
      }

      const resp = await eimService.sendConversationMessage(activeConvId, {
        portfolio,
        user_question: q,
        prior_at_a_glance: priorAtAGlance,
      });
      const response: FollowupResponse = {
        answer: resp.answer,
        lesson_refs: resp.lesson_refs,
        scholar_refs: resp.scholar_refs,
        topic_tags: resp.topic_tags,
        fallback: resp.fallback,
      };
      setTurns((prev) =>
        prev.map((t, i) => (i === idx ? { ...t, response, loading: false } : t)),
      );
      // Keep both the conversation cache and the conversation-list cache in sync.
      queryClient.invalidateQueries({ queryKey: ['eim', 'conversation', activeConvId] });
      queryClient.invalidateQueries({ queryKey: ['eim', 'conversations'] });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Follow-up failed.';
      setTurns((prev) =>
        prev.map((t, i) => (i === idx ? { ...t, error: msg, loading: false } : t)),
      );
    }
  };

  const savedChat = !!urlConvId && !report;

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-3xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim/mentor')}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853]"
            aria-label="Back to mentor"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          {persona ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <PersonaAvatar persona={persona} size={42} selected />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
                  {savedChat
                    ? `Saved chat${
                        conversationQ.data?.conversation.last_message_at
                          ? ' · ' +
                            new Date(
                              conversationQ.data.conversation.last_message_at,
                            ).toLocaleString()
                          : ''
                      }`
                    : `Analysis Report · ${report ? new Date(report.generated_at).toLocaleString() : ''}`}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[18px] font-bold text-[#F5E8C7] truncate">
                    {persona.name}
                  </h1>
                  <PersonaTypeBadge persona={persona} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
                {savedChat
                  ? 'Saved chat'
                  : `Analysis Report${report ? ' · ' + new Date(report.generated_at).toLocaleString() : ''}`}
              </div>
              <h1 className="text-[20px] font-bold text-[#F5E8C7]">
                {conversationQ.isLoading ? 'Loading…' : 'Lens analysis'}
              </h1>
            </div>
          )}
          <button
            onClick={() => navigate('/eim/history')}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#7A7363] hover:text-[#D4A853] shrink-0"
            aria-label="View past chats"
            title="Past chats"
          >
            <ClockCounterClockwise size={16} weight="bold" />
          </button>
        </header>

        <ArchetypeDisclaimer />

        <DisclaimerBanner context="mentor" />

        <div className="px-3 mt-4 space-y-3">
          {savedChat && (
            <div className="rounded-xl border border-[rgba(168,85,247,0.30)] bg-[rgba(168,85,247,0.06)] px-3.5 py-2.5 flex items-start gap-2">
              <ClockCounterClockwise size={13} weight="bold" className="text-[#D8B4FE] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#D8B4FE] leading-snug">
                You&rsquo;re viewing a saved chat. The original analysis report isn&rsquo;t shown
                here — open Portfolio to run a fresh analysis for the same portfolio if you
                want the full §5.3 breakdown again.
              </p>
            </div>
          )}

          {report && (
            <>
              {/* At-a-glance */}
              <div
                className="rounded-2xl border border-[rgba(212,168,83,0.25)] p-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,168,83,0.10), rgba(42,157,111,0.04))',
                }}
              >
                <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold mb-1.5">
                  At a Glance
                </div>
                <p className="text-[13px] text-[#F5E8C7] leading-relaxed">{report.at_a_glance}</p>
              </div>

              {/* Asset-class concentration figure — server-computed,
                  always agrees with the portfolio data even if the LLM
                  prose drifts. */}
              {report.concentration && report.concentration.length > 0 && (
                <ConcentrationBar slices={report.concentration} />
              )}

              {report.sections.map((sec, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[rgba(212,168,83,0.14)] bg-[#101a2a] p-4"
                >
                  <div className="text-[11px] uppercase tracking-widest text-[#D4A853] font-semibold mb-2">
                    {sec.heading}
                  </div>
                  {sec.body && (
                    <div className="text-[12px] text-[#C9D4E0] leading-relaxed mb-2">
                      <Markdownish text={sec.body} />
                    </div>
                  )}
                  {sec.items.length > 0 && (
                    <ul className="space-y-1.5 text-[12px] text-[#C9D4E0]">
                      {sec.items.map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-[#D4A853] shrink-0">·</span>
                          <span className="leading-relaxed">
                            <Markdownish text={item} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Follow-up chat panel */}
          <div className="rounded-2xl border border-[rgba(168,85,247,0.30)] bg-[rgba(168,85,247,0.04)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <ChatCircleDots size={16} weight="fill" color="#A855F7" />
              <div className="text-[11px] uppercase tracking-widest font-bold text-[#D8B4FE]">
                Ask {persona?.name ?? 'the Mentor'} a follow-up
              </div>
            </div>

            {turns.length === 0 && (
              <div className="text-[12px] text-[#7A7363] mb-3 italic">
                Continue the conversation. Examples: &ldquo;What does purification look like for this
                portfolio?&rdquo; · &ldquo;Why is the Tesla position flagged?&rdquo; · &ldquo;Which lesson
                explains the debt ratio rule?&rdquo;
              </div>
            )}

            {turns.map((t, i) => (
              <div key={i} className="mb-3">
                <div className="rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.10)] px-3 py-2 mb-2">
                  <div className="text-[10px] uppercase tracking-widest text-[#5C5749] font-semibold mb-0.5">
                    You asked
                  </div>
                  <div className="text-[13px] text-[#F5E8C7] leading-relaxed">{t.question}</div>
                </div>
                <div
                  className="rounded-lg px-3 py-2.5"
                  style={{
                    background: persona ? `${getPersonaAccent(persona)}10` : 'rgba(168,85,247,0.06)',
                    border: `1px solid ${persona ? `${getPersonaAccent(persona)}33` : 'rgba(168,85,247,0.18)'}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {persona && <PersonaAvatar persona={persona} size={18} selected />}
                    <span
                      className="text-[10px] uppercase tracking-widest font-semibold"
                      style={{ color: persona ? getPersonaAccent(persona) : '#D8B4FE' }}
                    >
                      {persona?.name ?? 'Mentor'} responds
                    </span>
                  </div>
                  {t.loading ? (
                    <div className="text-[12px] text-[#7A7363] italic">Thinking…</div>
                  ) : t.error ? (
                    <div className="text-[12px] text-[#FCA5A5]">{t.error}</div>
                  ) : t.response ? (
                    <>
                      <div className="text-[13px] text-[#D1D9E5] leading-relaxed whitespace-pre-line">
                        <Markdownish text={t.response.answer} />
                      </div>
                      {t.response.lesson_refs.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {t.response.lesson_refs.map((id) => (
                            <button
                              key={id}
                              onClick={() => navigate(`/eim/lesson/${id}`)}
                              className="inline-flex items-center gap-1 text-[10.5px] px-2 py-1 rounded-md bg-[rgba(212,168,83,0.10)] border border-[rgba(212,168,83,0.25)] text-[#D4A853] hover:bg-[rgba(212,168,83,0.18)]"
                            >
                              <BookOpen size={11} weight="bold" />
                              {id.replace(/_/g, ' ')}
                            </button>
                          ))}
                        </div>
                      )}
                      {t.response.fallback && (
                        <div className="mt-1.5 text-[10px] text-[#5C5749] italic">
                          (templated response — LLM was offline)
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    askFollowup();
                  }
                }}
                placeholder={
                  inputEnabled
                    ? 'Type your follow-up question…'
                    : (inputDisabledReason ?? 'Loading…')
                }
                maxLength={600}
                disabled={!inputEnabled}
                className="flex-1 h-11 px-3 rounded-xl bg-[#0F1724] border border-[rgba(168,85,247,0.30)] text-[13px] text-[#F5E8C7] placeholder-[#5C5749] focus:outline-none focus:border-[rgba(168,85,247,0.50)] disabled:opacity-50"
              />
              <button
                onClick={askFollowup}
                disabled={!question.trim() || !inputEnabled}
                className="h-11 px-4 rounded-xl text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-40"
                style={{ background: 'linear-gradient(90deg, #A855F7, #9333EA)' }}
              >
                <PaperPlaneTilt size={14} weight="fill" />
                Ask
              </button>
            </div>
            {!inputEnabled && inputDisabledReason && (
              <div className="mt-2 text-[10.5px] text-[#5C5749] italic">
                {inputDisabledReason}
              </div>
            )}
          </div>

          {report && (
            <div className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-[rgba(212,168,83,0.04)] p-3.5 flex items-start gap-2.5">
              <Info size={14} weight="bold" className="text-[#D4A853] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#7A7363] leading-relaxed italic">
                {report.disclaimer}
              </p>
            </div>
          )}

          {/* Editorial-commentary footer — only relevant for the
              Conventional Investor lens, which names secular traditions
              (moat / Lynch / Bogle / etc.) inside the report prose. */}
          {report && report.persona_id === 'conventional_investor' && (
            <div className="text-[11px] text-[#5C5749] leading-snug italic px-1.5">
              References to investing traditions (Buffett, Graham, Lynch, Bogle, Dalio,
              Munger and others) are commentary on publicly documented strategies. The
              named investors have not reviewed or endorsed this analysis.
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/eim/mentor')}
              className="flex-1 h-11 rounded-xl bg-[#101a2a] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363]"
            >
              Run another lens
            </button>
            <button
              onClick={() => navigate('/eim/ulama')}
              className="flex-1 h-11 rounded-xl text-[12px] font-bold text-[#0A0E16]"
              style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
            >
              See Ulama Screening →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EimAnalysisPage;

/** Asset-class concentration figure shown at the top of every analysis
 *  report. Server-computed (slices arrive in the AnalysisReport payload)
 *  so the bar is always consistent with the underlying portfolio data
 *  even if the LLM's prose drifts.
 *
 *  Renders as a single horizontal stacked bar with a legend below — the
 *  most compact way to convey "how is the portfolio balanced" at-a-glance. */
function ConcentrationBar({ slices }: { slices: ConcentrationSlice[] }) {
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-3.5 sm:p-4">
      <div className="text-[11px] uppercase tracking-widest text-[#D4A853] font-semibold mb-3">
        Asset-Class Concentration
      </div>
      {/* Bar — h-4 (16px) chosen so segments stay legible on mobile and
          small slices still register visually. */}
      <div
        className="flex w-full h-4 rounded-full overflow-hidden border border-[rgba(212,168,83,0.20)]"
        role="img"
        aria-label={
          'Concentration: ' +
          slices.map((s) => `${s.label} ${s.pct.toFixed(1)}%`).join(', ')
        }
      >
        {slices.map((s) => (
          <div
            key={s.label}
            title={`${s.label} · ${s.pct.toFixed(1)}%`}
            style={{ width: `${s.pct}%`, background: s.color }}
          />
        ))}
      </div>
      {/* Legend — flex-wrap so it never overflows on narrow screens;
          gap-x-3 (was gap-x-4) tightens horizontal rhythm on mobile. */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {slices.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-1.5 text-[11.5px] text-[#C9D4E0] whitespace-nowrap"
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: s.color }}
            />
            <span className="font-semibold">{s.label}</span>
            <span className="text-[#7A7363]">{s.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}


/** Persistent identity-archetype disclaimer.
 *
 * Renders directly under the persona header on every chat. Reinforces in the
 * UI what the backend `IDENTITY_GUARDRAIL` prompt-block reinforces server-
 * side: every persona is a framework lens, not a real person. This is the
 * belt-and-braces visible counterpart to the system prompt.
 */
function ArchetypeDisclaimer() {
  return (
    <div className="px-5 mt-1 text-[10.5px] text-[#5C5749] leading-snug italic">
      Educational archetype — not affiliated with or endorsed by any real person.
      Frameworks are summarised from public scholarly and investment literature.
    </div>
  );
}
