/**
 * AI Mentor — persona picker + analysis trigger.
 * Receives ?portfolio=<id> from the portfolio page CTA.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  CaretLeft,
  CheckCircle,
  CircleNotch,
  ClockCounterClockwise,
  GraduationCap,
  Sparkle,
} from '@phosphor-icons/react';
import { eimTrack } from '../analytics';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { FeatureIntro } from '../components/FeatureIntro';
import { FetchError } from '../components/FetchError';
import { PersonaAvatar, PersonaTypeBadge } from '../components/PersonaAvatar';
import { getPersonaAccent } from '../components/persona-helpers';
import { useEimDinarz } from '../hooks/useEimDinarz';
import { useEimStreakHeartbeat } from '../hooks/useEimStreakHeartbeat';
import { eimService } from '../services/eim.service';
import { useEimStore } from '../stores/eim.store';
import type { Persona, RecommendedLesson } from '../types/eim.types';

type StreamStage = 'idle' | 'starting' | 'context' | 'writing' | 'done';

export function EimMentorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portfolios = useEimStore((s) => s.portfolios);
  const setLastReport = useEimStore((s) => s.setLastReport);
  useEimStreakHeartbeat();

  const initialPortfolioId = searchParams.get('portfolio') ?? portfolios[0]?.id ?? '';
  const [portfolioId, setPortfolioId] = useState(initialPortfolioId);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [stage, setStage] = useState<StreamStage>('idle');
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Abort the SSE stream if the user navigates away mid-analysis.
  const abortRef = useRef<AbortController | null>(null);
  const running = stage !== 'idle' && stage !== 'done';

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const personasQ = useQuery({
    queryKey: ['eim', 'personas'],
    queryFn: eimService.getPersonas,
  });
  const personas = personasQ.data;

  const portfolio = useMemo(
    () => portfolios.find((p) => p.id === portfolioId) ?? null,
    [portfolios, portfolioId],
  );

  const { claim: claimDinarz } = useEimDinarz();

  const run = async () => {
    if (!portfolio || !selectedPersona) return;
    setError(null);
    setStreamText('');
    setStage('starting');
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      for await (const event of eimService.runAnalysisStream(
        portfolio,
        selectedPersona.id,
        controller.signal,
      )) {
        if (event.type === 'context_ready') {
          setStage('context');
        } else if (event.type === 'chunk') {
          setStage('writing');
          setStreamText((prev) => prev + event.text);
        } else if (event.type === 'complete') {
          setStage('done');
          setLastReport(event.report);
          void claimDinarz('first_analysis');
          eimTrack('eim_mentor_analysis_run');
          navigate('/eim/analysis');
          return;
        } else if (event.type === 'error') {
          throw new Error(event.message);
        }
      }
      // Stream ended without a 'complete' event — treat as failure.
      throw new Error('Analysis ended unexpectedly.');
    } catch (e) {
      if (controller.signal.aborted) return; // user navigated away — silent
      setError(e instanceof Error ? e.message : 'Analysis failed.');
      setStage('idle');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-3xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim')}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853]"
            aria-label="Back to EIM home"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
              EIM · Majlis
            </div>
            <h1 className="text-[20px] font-bold text-[#F5E8C7]">AI Mentor — Analysis</h1>
          </div>
          <button
            onClick={() => navigate('/eim/history')}
            className="h-9 px-2.5 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] text-[#7A7363] hover:text-[#D4A853] text-[11px] font-semibold inline-flex items-center gap-1.5"
            aria-label="View past chats"
          >
            <ClockCounterClockwise size={13} weight="bold" />
            Past chats
          </button>
          <FeatureIntro featureId="mentor" />
        </header>

        <DisclaimerBanner context="mentor" />

        {personasQ.error && (
          <FetchError
            error={personasQ.error}
            retry={() => void personasQ.refetch()}
            context="persona list"
          />
        )}

        <div className="px-3 mt-4 space-y-3">
          {/* Lessons for you — driven by topic_tags from saved chats (Phase 6) */}
          <LessonsForYouStrip onOpen={(id) => navigate(`/eim/lesson/${id}`)} />

          {/* Portfolio picker */}
          <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold mb-2">
              1. Pick a portfolio
            </div>
            {portfolios.length === 0 ? (
              <button
                onClick={() => navigate('/eim/simulator')}
                className="w-full text-left text-[12px] text-[#7A7363] underline hover:text-[#F5E8C7]"
              >
                You have no portfolios yet — create one first.
              </button>
            ) : (
              <select
                value={portfolioId}
                onChange={(e) => setPortfolioId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.20)] text-[13px] text-[#F5E8C7] focus:outline-none focus:border-[rgba(212,168,83,0.50)]"
              >
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.positions.length} position{p.positions.length === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Persona picker — featured trio + other lenses */}
          <PersonaPicker
            personas={personas ?? []}
            selectedPersona={selectedPersona}
            onSelect={setSelectedPersona}
          />

          {error && (
            <div className="rounded-xl border border-[rgba(232,67,147,0.30)] bg-[rgba(232,67,147,0.08)] p-3 text-[12px] text-[#E84393]">
              {error}
            </div>
          )}

          {running && (
            <StreamProgressPanel
              stage={stage}
              text={streamText}
              personaId={selectedPersona?.id ?? ''}
              personaName={selectedPersona?.name ?? 'The mentor'}
            />
          )}

          <button
            onClick={run}
            disabled={!portfolio || !selectedPersona || running}
            className="w-full h-12 rounded-xl text-[13px] font-bold text-[#0A0E16] flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'linear-gradient(90deg, #2A9D6F, #7BB39A)' }}
          >
            <Sparkle size={16} weight="bold" />
            {running ? streamButtonLabel(stage) : 'Run analysis →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function streamButtonLabel(stage: StreamStage): string {
  switch (stage) {
    case 'starting':
      return 'Preparing context…';
    case 'context':
      return 'Calling the mentor…';
    case 'writing':
      return 'Writing your analysis…';
    case 'done':
      return 'Finalising…';
    default:
      return 'Running analysis…';
  }
}

interface StreamProgressPanelProps {
  stage: StreamStage;
  text: string;
  personaId: string;
  personaName: string;
}

/** Per-lens explainer that surfaces during streaming so users understand
 *  what they're about to get — and what perspectives the lens will offer. */
const LENS_EXPLAINERS: Record<
  string,
  { headline: string; perspectives: string[] }
> = {
  islamic_finance: {
    headline:
      'The Islamic Finance lens reads your portfolio through AAOIFI Shariah Standards, applying both the modern multi-opinion approach and the classical Hanafi spine.',
    perspectives: [
      'AAOIFI compliance check on every position (SS 21 stocks · SS 17 sukuk · SS 57 gold)',
      'Multi-opinion framing on contested instruments (crypto, DeFi, stablecoins)',
      'Purification math where the position has impure income',
      'The legitimate scholarly spectrum — Malaysia/SAC · GCC/AAOIFI · Traditional/Conservative · Modern Western',
    ],
  },
  conventional_investor: {
    headline:
      'The Conventional Investor lens analyses your portfolio through seven secular schools — and names which one is reading each position.',
    perspectives: [
      'Through a moat lens (Buffett tradition) — durable competitive advantage',
      'Through an indexing lens (Bogle tradition) — costs, breadth, fees',
      'Through a scuttlebutt lens (Lynch tradition) — what does the consumer see?',
      'Through a risk-parity lens (Dalio tradition) — regime balance',
      'Plus defensive value, latticework mental models, and Indian-bazaar conviction where they apply',
    ],
  },
  compass: {
    headline:
      'Compass is your personal counsel. It will anchor every observation in your actual holdings and close with one thing to reflect on — not a to-do list.',
    perspectives: [
      'The one or two things in this portfolio that most deserve your attention right now',
      'Tensions between your likely goals and what the portfolio actually does',
      'Where a deeper framework (Conventional Investor or Islamic Finance) would help',
      'A single reflection question to sit with',
    ],
  },
};

/** Heuristic: pull out the at_a_glance string the moment it appears in the
 *  partial JSON stream. The LLM writes JSON top-down, so at_a_glance is the
 *  first field that completes — surfacing it gives the user real content
 *  in ~3-8 seconds instead of waiting for the full report. Returns "" if
 *  the field hasn't been written yet or is still mid-string. */
function extractPartialAtAGlance(streamText: string): string {
  const match = streamText.match(/"at_a_glance"\s*:\s*"((?:[^"\\]|\\.)*)/);
  if (!match) return '';
  // Decode minimal escape sequences (\\n, \\", \\\\) so display reads cleanly.
  return match[1]
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function StreamProgressPanel({ stage, text, personaId, personaName }: StreamProgressPanelProps) {
  const explainer = LENS_EXPLAINERS[personaId] ?? LENS_EXPLAINERS.conventional_investor;
  const partialAtAGlance = stage === 'writing' ? extractPartialAtAGlance(text) : '';
  // Rough token estimate for the live counter — 1 token ≈ 4 chars.
  const approxTokens = Math.floor(text.length / 4);

  return (
    <div
      className="rounded-2xl border border-[rgba(123,158,137,0.30)] overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(42,157,111,0.08) 0%, rgba(212,168,83,0.04) 100%)',
      }}
    >
      {/* Header — pulsing dot + stage */}
      <div className="px-3.5 sm:px-4 pt-3.5 sm:pt-4 pb-3 border-b border-[rgba(123,158,137,0.18)]">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="relative w-2.5 h-2.5">
            <span className="absolute inset-0 rounded-full bg-[#7BB39A] animate-ping opacity-60" />
            <span className="absolute inset-0.5 rounded-full bg-[#7BB39A]" />
          </div>
          <div className="text-[10.5px] uppercase tracking-widest font-bold text-[#7BB39A] truncate">
            {personaName} · live analysis
          </div>
        </div>
        <div className="text-[12.5px] sm:text-[13px] text-[#D1D9E5] leading-snug">
          {explainer.headline}
        </div>
      </div>

      {/* Stage steps with check / spinner */}
      <div className="px-3.5 sm:px-4 py-3 space-y-2 border-b border-[rgba(123,158,137,0.18)]">
        <StageRow
          label="Gathering live prices & portfolio performance"
          state={stage === 'starting' ? 'active' : 'done'}
        />
        <StageRow
          label="Reading your portfolio context"
          state={
            stage === 'starting'
              ? 'pending'
              : stage === 'context'
                ? 'active'
                : 'done'
          }
        />
        <StageRow
          label={`Writing your analysis${
            approxTokens > 0 ? ` · ~${approxTokens} tokens` : ''
          }`}
          state={
            stage === 'writing'
              ? 'active'
              : stage === 'done'
                ? 'done'
                : 'pending'
          }
        />
      </div>

      {/* Live "at a glance" preview — appears the moment the JSON field
          completes (~3-8s in). Much higher signal than raw JSON chunks. */}
      {partialAtAGlance && (
        <div className="px-3.5 sm:px-4 py-3 border-b border-[rgba(123,158,137,0.18)]">
          <div className="text-[9.5px] uppercase tracking-widest text-[#D4A853] font-bold mb-1.5">
            At a Glance · arriving now
          </div>
          <div className="text-[13px] sm:text-[13.5px] text-[#F5E8C7] leading-relaxed">
            {partialAtAGlance}
            <span className="inline-block w-[2px] h-3.5 ml-0.5 bg-[#7BB39A] align-middle animate-pulse" />
          </div>
        </div>
      )}

      {/* What's coming — perspectives the lens will surface.
          Long explainers (5 items for Conventional Investor) bloat the
          mobile screen, so cap the visible list to 3 on mobile and show
          all 5 on sm+. Hidden ones are still in the DOM for accessibility
          but visually clipped via `hidden sm:list-item`. */}
      <div className="px-3.5 sm:px-4 py-3">
        <div className="text-[9.5px] uppercase tracking-widest text-[#5C5749] font-semibold mb-2">
          What you'll see in the report
        </div>
        <ul className="space-y-1.5">
          {explainer.perspectives.map((p, i) => (
            <li
              key={p}
              className={
                'flex items-start gap-2 text-[11.5px] text-[#7A7363] leading-snug ' +
                (i >= 3 ? 'hidden sm:list-item' : '')
              }
            >
              <span className="text-[#D4A853] mt-0.5">·</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
        {explainer.perspectives.length > 3 && (
          <div className="sm:hidden mt-1.5 text-[10px] text-[#5C5749] italic">
            + {explainer.perspectives.length - 3} more in the full report
          </div>
        )}
      </div>
    </div>
  );
}

function StageRow({
  label,
  state,
}: {
  label: string;
  state: 'pending' | 'active' | 'done';
}) {
  const icon =
    state === 'done' ? (
      <CheckCircle size={14} weight="fill" className="text-[#7BB39A]" />
    ) : state === 'active' ? (
      <CircleNotch size={14} weight="bold" className="text-[#D4A853] animate-spin" />
    ) : (
      <div className="w-[14px] h-[14px] rounded-full border border-[rgba(122,115,99,0.40)]" />
    );
  const textClass =
    state === 'done'
      ? 'text-[#7BB39A]'
      : state === 'active'
        ? 'text-[#F5E8C7]'
        : 'text-[#5C5749]';
  return (
    <div className="flex items-center gap-2.5">
      <span className="shrink-0 w-[14px] h-[14px] flex items-center justify-center">{icon}</span>
      <span className={`text-[12px] ${textClass}`}>{label}</span>
    </div>
  );
}

export default EimMentorPage;

// ── PersonaPicker ────────────────────────────────────────────────────────


interface PersonaPickerProps {
  personas: Persona[];
  selectedPersona: Persona | null;
  onSelect: (p: Persona) => void;
}

function PersonaPicker({ personas, selectedPersona, onSelect }: PersonaPickerProps) {
  const featured = personas.filter((p) => p.featured);
  const others = personas.filter((p) => !p.featured);

  return (
    <div className="space-y-3">
      {featured.length > 0 && (
        <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-3.5 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold">
              {/* Trimmed on mobile so the label doesn't wrap. */}
              <span className="sm:hidden">2. Pick a lens</span>
              <span className="hidden sm:inline">2. Pick a lens — Featured Mentors</span>
            </div>
            <Sparkle size={12} weight="fill" className="text-[#D4A853]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {featured.map((p) => (
              <FeaturedPersonaCard
                key={p.id}
                persona={p}
                selected={selectedPersona?.id === p.id}
                onSelect={() => onSelect(p)}
              />
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#5C5749] font-semibold mb-2">
            Other lenses
          </div>
          <div className="space-y-2">
            {others.map((p) => (
              <CompactPersonaCard
                key={p.id}
                persona={p}
                selected={selectedPersona?.id === p.id}
                onSelect={() => onSelect(p)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


interface CardProps {
  persona: Persona;
  selected: boolean;
  onSelect: () => void;
}

function FeaturedPersonaCard({ persona, selected, onSelect }: CardProps) {
  const accent = getPersonaAccent(persona);
  return (
    <button
      onClick={onSelect}
      // Tighter padding + gap on mobile so 3 stacked cards don't dominate
      // the screen. min-h ensures a comfortable 60px+ touch target.
      className="text-left rounded-xl p-3 sm:p-3.5 transition-all flex flex-col gap-2 sm:gap-2.5 min-h-[60px]"
      style={{
        border: `1px solid ${selected ? accent : `${accent}33`}`,
        background: selected ? `${accent}14` : '#0F1724',
      }}
      aria-pressed={selected}
    >
      <div className="flex items-center justify-between gap-2">
        <PersonaAvatar persona={persona} size={44} selected={selected} />
        <PersonaTypeBadge persona={persona} />
      </div>
      <div className="text-[14px] sm:text-[13.5px] font-bold text-[#F5E8C7] leading-tight">
        {persona.name}
      </div>
      <div className="text-[10.5px] line-clamp-2" style={{ color: accent }}>
        {persona.framework}
      </div>
      {/* Philosophy clamped to 2 lines on mobile (where 3 cards stack and
          the page can otherwise become a wall of italic text); 3 lines on
          sm+ where each card has plenty of horizontal room. */}
      <div className="text-[11.5px] text-[#7A7363] italic leading-snug line-clamp-2 sm:line-clamp-3">
        &ldquo;{persona.philosophy}&rdquo;
      </div>
    </button>
  );
}

function CompactPersonaCard({ persona, selected, onSelect }: CardProps) {
  const accent = getPersonaAccent(persona);
  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-xl p-3 transition-all"
      style={{
        border: `1px solid ${selected ? accent : 'rgba(212,168,83,0.14)'}`,
        background: selected ? `${accent}10` : 'transparent',
      }}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <PersonaAvatar persona={persona} size={36} selected={selected} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-[#F5E8C7]">{persona.name}</span>
            <PersonaTypeBadge persona={persona} />
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: accent }}>
            {persona.framework}
          </div>
          <div className="text-[11px] text-[#7A7363] mt-1 italic line-clamp-2">
            &ldquo;{persona.philosophy}&rdquo;
          </div>
        </div>
      </div>
    </button>
  );
}


// ── Lessons-for-you strip (Phase 6) ──────────────────────────────────────


interface LessonsForYouStripProps {
  onOpen: (lessonId: string) => void;
}

function LessonsForYouStrip({ onOpen }: LessonsForYouStripProps) {
  // Auth-required endpoint. Render nothing while loading; show empty-state
  // copy if the user has chats but no useful tag hits; hide entirely on
  // error (401/403/network) so the mentor page never breaks for users
  // who aren't logged in or aren't using saved chats yet.
  const recommendationsQ = useQuery({
    queryKey: ['eim', 'recommended-lessons'],
    queryFn: () => eimService.getRecommendedLessons({ since_days: 30, limit: 5 }),
    retry: false,
    // Stale-while-revalidate so navigating back from /eim/analysis after a
    // fresh chat shows the freshly-tagged lessons quickly.
    staleTime: 60_000,
  });

  if (recommendationsQ.isLoading) return null;
  if (recommendationsQ.error) return null;

  const lessons = recommendationsQ.data?.lessons ?? [];
  if (lessons.length === 0) {
    return <EmptyLessonsStrip />;
  }

  return (
    <div className="rounded-2xl border border-[rgba(168,85,247,0.30)] bg-[rgba(168,85,247,0.05)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap size={14} weight="duotone" color="#D8B4FE" />
        <div className="text-[10px] uppercase tracking-widest text-[#D8B4FE] font-semibold">
          Continue your learning
        </div>
        <span className="text-[10px] text-[#5C5749] ml-auto">based on your conversations</span>
      </div>
      <div
        className="flex gap-2.5 overflow-x-auto -mx-1 px-1 pb-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        {lessons.map((lesson) => (
          <RecommendedLessonCard
            key={lesson.id}
            lesson={lesson}
            onOpen={() => onOpen(lesson.id)}
          />
        ))}
      </div>
    </div>
  );
}


function RecommendedLessonCard({
  lesson,
  onOpen,
}: {
  lesson: RecommendedLesson;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="text-left rounded-xl border border-[rgba(168,85,247,0.25)] bg-[#0F1724] hover:border-[rgba(168,85,247,0.55)] transition-colors p-3 shrink-0 flex flex-col gap-1.5"
      style={{ width: 220 }}
    >
      <div className="flex items-center gap-1.5">
        <BookOpen size={11} weight="bold" className="text-[#D8B4FE] shrink-0" />
        {lesson.level && (
          <span className="text-[9px] uppercase tracking-widest text-[#D8B4FE] font-bold">
            {lesson.level}
          </span>
        )}
        {lesson.minutes > 0 && (
          <span className="text-[9.5px] text-[#5C5749] ml-auto">{lesson.minutes} min</span>
        )}
      </div>
      <div className="text-[12.5px] font-bold text-[#F5E8C7] leading-snug line-clamp-2">
        {lesson.title}
      </div>
      {lesson.match_reason && (
        <div className="text-[10px] text-[#7A7363] italic line-clamp-2 mt-auto">
          {lesson.match_reason}
        </div>
      )}
    </button>
  );
}


function EmptyLessonsStrip() {
  return (
    <div className="rounded-2xl border border-[rgba(168,85,247,0.20)] bg-[rgba(168,85,247,0.04)] px-4 py-3 flex items-start gap-2.5">
      <GraduationCap size={14} weight="duotone" className="text-[#D8B4FE] shrink-0 mt-0.5" />
      <p className="text-[11.5px] text-[#7A7363] leading-snug">
        <span className="text-[#D8B4FE] font-semibold">Lessons for you</span> — have a few chats
        with your mentors and we&rsquo;ll suggest lessons here based on what you discussed.
      </p>
    </div>
  );
}
