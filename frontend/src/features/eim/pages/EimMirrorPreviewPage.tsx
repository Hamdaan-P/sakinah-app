/**
 * Mizan Mirror — free-tier sim preview (EIM Phase F1.d).
 *
 * Runs the full pipeline against virtual trades synthesised from the
 * user's simulator portfolios — no upload, no PDPA exposure. The server
 * returns a teaser shape (`MirrorTeaserReport`) with ≤2 unlocked biases;
 * the locked ones surface as upgrade CTAs that point to the full-audit
 * upload path.
 *
 * The slicer is the API boundary — the frontend literally cannot render
 * unsliced bias data because it was never sent.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowSquareOut,
  BookOpen,
  CaretLeft,
  ChartBar,
  Lock,
  Quotes,
  Scales,
  Warning,
} from '@phosphor-icons/react';

import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { eimService } from '../services/eim.service';
import { useEimStore } from '../stores/eim.store';
import type {
  MirrorAttributionEntry,
  MirrorBehaviouralStatePoint,
  MirrorBiasBand,
  MirrorBiasId,
  MirrorBiasScore,
  MirrorTeaserReport,
} from '../types/eim.types';

const BAND_COLOR: Record<MirrorBiasBand, string> = {
  low: '#7BB39A',
  moderate: '#E8C97A',
  high: '#EF5350',
};

const BIAS_LABEL: Record<MirrorBiasId, string> = {
  loss_aversion: 'Loss aversion',
  disposition_effect: 'Disposition effect',
  revenge_trading: 'Revenge trading',
  early_exit: 'Early exit',
  emotional_state: 'Emotional state',
  fomo: 'FOMO',
  herding: 'Herding',
  recency: 'Recency',
  confirmation: 'Confirmation',
  anchoring: 'Anchoring',
};

const STATE_COLOR: Record<MirrorBehaviouralStatePoint['state'], string> = {
  calm: '#7BB39A',
  anxious: '#E8C97A',
  euphoric: '#EF5350',
};

export function EimMirrorPreviewPage() {
  const navigate = useNavigate();
  const portfolios = useEimStore((s) => s.portfolios);
  const totalPositions = useMemo(
    () => portfolios.reduce((acc, p) => acc + p.positions.length, 0),
    [portfolios],
  );

  const runPreview = useMutation({
    mutationFn: () => eimService.previewMirror(portfolios),
  });

  // Kick off automatically on mount when there's something to analyse — the
  // preview is instant from the user's perspective (no upload). React-query
  // dedupes the call across remounts.
  useMemo(() => {
    if (totalPositions > 0 && !runPreview.isPending && !runPreview.data && !runPreview.isError) {
      runPreview.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPositions]);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6EAF0] pb-24">
      <div className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/eim/mirror')}
          className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center"
          aria-label="Back"
        >
          <CaretLeft size={18} weight="bold" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">Mirror preview</h1>
          <p className="text-[12px] text-[#7A7363]">
            From your portfolios
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[rgba(111,207,151,0.15)] border border-[rgba(111,207,151,0.3)] text-[10px] font-semibold text-[#6FCF97] uppercase tracking-wider">
          Free
        </span>
      </div>

      <DisclaimerBanner />

      <div className="px-4 mt-6 space-y-5">
        {totalPositions === 0 && <EmptyPortfoliosState navigate={navigate} />}

        {totalPositions > 0 && runPreview.isPending && (
          <LoadingPanel positions={totalPositions} />
        )}

        {runPreview.isError && (
          <div className="rounded-2xl border border-[rgba(239,83,80,0.3)] bg-[rgba(239,83,80,0.06)] p-3 flex items-start gap-2.5">
            <Warning size={16} weight="bold" className="text-[#EF5350] shrink-0 mt-0.5" />
            <div className="text-[12.5px] text-[#E6EAF0]">
              {(runPreview.error as Error)?.message ?? 'Preview failed.'}
            </div>
          </div>
        )}

        {runPreview.data && <TeaserBody report={runPreview.data} navigate={navigate} />}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function EmptyPortfoliosState({
  navigate,
}: {
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.2)] bg-[rgba(212,168,83,0.04)] p-5 text-center">
      <Scales size={28} weight="duotone" className="text-[#D4A853] mx-auto" />
      <p className="text-[14px] font-semibold mt-3">Nothing to preview yet</p>
      <p className="text-[12px] text-[#7A7363] leading-relaxed mt-1.5">
        The preview reads from your portfolios. Add at least one
        position there first, then come back.
      </p>
      <button
        onClick={() => navigate('/eim/simulator')}
        className="mt-3 px-4 py-2 rounded-lg bg-[#D4A853] text-[#0B0F14] text-[12px] font-semibold"
      >
        Open Portfolio
      </button>
    </div>
  );
}

function LoadingPanel({ positions }: { positions: number }) {
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.2)] bg-[rgba(212,168,83,0.04)] p-5 text-center">
      <Scales size={28} weight="duotone" className="text-[#D4A853] mx-auto" />
      <p className="text-[14px] font-semibold mt-3">Running Mirror…</p>
      <p className="text-[12px] text-[#7A7363] leading-relaxed mt-1.5">
        Synthesising round-trips from {positions}{' '}
        {positions === 1 ? 'position' : 'positions'}, then running detectors +
        muhasaba framing.
      </p>
    </div>
  );
}

function TeaserBody({
  report,
  navigate,
}: {
  report: MirrorTeaserReport;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const stateCounts = report.behavioural_state_timeline.reduce<Record<string, number>>(
    (acc, pt) => {
      acc[pt.state] = (acc[pt.state] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const totalLots = report.behavioural_state_timeline.length || 1;

  return (
    <>
      <div className="rounded-2xl border border-dashed border-[rgba(212,168,83,0.3)] bg-[rgba(212,168,83,0.03)] p-3 flex items-start gap-2.5">
        <Scales size={14} weight="duotone" className="text-[#D4A853] shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-[#7A7363] leading-relaxed">
          {report.preview_note}
        </p>
      </div>

      {report.muhasaba_narrative && (
        <div className="rounded-2xl border border-[rgba(212,168,83,0.3)] bg-gradient-to-br from-[rgba(212,168,83,0.08)] to-[rgba(168,85,247,0.04)] p-4">
          <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-wider text-[#D4A853] mb-2 font-semibold">
            <Scales size={12} weight="bold" />
            Muhasaba reading
          </div>
          <p className="text-[13px] text-[#E6EAF0] leading-relaxed">
            {report.muhasaba_narrative}
          </p>
        </div>
      )}

      {report.archetype && (
        <div className="rounded-2xl border border-[rgba(79,184,146,0.3)] bg-[rgba(79,184,146,0.06)] p-4">
          <div className="text-[10.5px] uppercase tracking-wider text-[#7A8595] mb-1">
            Trading archetype
          </div>
          <div className="text-[15px] font-semibold text-[#4FB892]">
            {report.archetype.label}
          </div>
          <p className="text-[11.5px] text-[#7A7363] mt-1.5 leading-relaxed">
            {report.archetype.description}
          </p>
        </div>
      )}

      {report.behavioural_state_timeline.length > 0 && (
        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#7A8595] mb-3">
            <ChartBar size={12} weight="bold" />
            Behavioural state · {report.behavioural_state_timeline.length} synthesised lots
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.04)] flex">
            {(['calm', 'anxious', 'euphoric'] as const).map((state) => {
              const pct = ((stateCounts[state] ?? 0) / totalLots) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={state}
                  style={{ width: `${pct}%`, backgroundColor: STATE_COLOR[state] }}
                  title={`${state} · ${stateCounts[state] ?? 0} lots`}
                />
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-[11px]">
            {(['calm', 'anxious', 'euphoric'] as const).map((state) => (
              <div key={state} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: STATE_COLOR[state] }}
                />
                <span className="text-[#7A7363] capitalize">{state}</span>
                <span className="text-[#7A8595]">{stateCounts[state] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-[13px] font-semibold mb-2">
          What Mirror sees ({report.unlocked_biases.length}{' '}
          {report.unlocked_biases.length === 1 ? 'pattern' : 'patterns'} unlocked)
        </h2>
        <div className="space-y-2">
          {report.unlocked_biases.map((bias) => (
            <TeaserBiasCard
              key={bias.bias_id}
              bias={bias}
              attribution={report.unlocked_attribution[bias.bias_id]}
              onLessonClick={(id) => navigate(`/eim/lesson/${id}`)}
            />
          ))}
        </div>
      </div>

      {report.locked_biases.length > 0 && (
        <LockedBiasesPanel
          locked={report.locked_biases}
          onUpgrade={() => navigate('/eim/mirror/upload')}
        />
      )}

      <p className="text-[11px] text-[#7A8595] text-center pt-4">
        {report.disclaimer}
      </p>
    </>
  );
}

function TeaserBiasCard({
  bias,
  attribution,
  onLessonClick,
}: {
  bias: MirrorBiasScore;
  attribution?: MirrorAttributionEntry;
  onLessonClick: (lessonId: string) => void;
}) {
  const accent = BAND_COLOR[bias.band];
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-semibold text-[#E6EAF0]">
            {BIAS_LABEL[bias.bias_id]}
          </span>
          {attribution?.concept && (
            <span className="text-[10px] uppercase tracking-wider text-[#D4A853] bg-[rgba(212,168,83,0.10)] px-1.5 py-0.5 rounded">
              {attribution.concept}
              {attribution.concept_ar ? ` · ${attribution.concept_ar}` : ''}
            </span>
          )}
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ backgroundColor: `${accent}1F`, color: accent }}
        >
          {bias.band}
        </span>
      </div>

      {attribution?.muhasaba_framing && (
        <p className="text-[12.5px] text-[#E6EAF0] leading-relaxed">
          {attribution.muhasaba_framing}
        </p>
      )}

      {(attribution?.verse_translation || attribution?.verse_citation) && (
        <div className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(212,168,83,0.18)] p-2.5">
          <div className="flex items-start gap-2">
            <Quotes size={12} weight="bold" className="text-[#D4A853] shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              {attribution.verse_arabic && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-[14px] text-[#F5E8C7] leading-relaxed mb-1 font-medium"
                >
                  {attribution.verse_arabic}
                </p>
              )}
              {attribution.verse_translation && (
                <p className="text-[11.5px] text-[#7A7363] leading-relaxed">
                  {attribution.verse_translation}
                </p>
              )}
              {attribution.verse_citation && (
                <p className="text-[10px] text-[#7A8595] mt-1">
                  {attribution.verse_citation}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {attribution?.recommended_lesson_id && (
        <button
          onClick={() => onLessonClick(attribution.recommended_lesson_id!)}
          className="w-full flex items-center justify-between text-left text-[11.5px] text-[#D4A853] hover:text-[#E8C97A] transition-colors px-2.5 py-2 rounded-lg bg-[rgba(212,168,83,0.04)] border border-[rgba(212,168,83,0.15)]"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen size={12} weight="bold" />
            Open recommended lesson
          </span>
          <span className="text-[10.5px] text-[#7A8595]">
            {attribution.recommended_lesson_id}
          </span>
        </button>
      )}
    </div>
  );
}

function LockedBiasesPanel({
  locked,
  onUpgrade,
}: {
  locked: { bias_id: MirrorBiasId; band: MirrorBiasBand }[];
  onUpgrade: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.25)] bg-gradient-to-br from-[rgba(212,168,83,0.04)] to-[rgba(168,85,247,0.04)] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Lock size={14} weight="bold" className="text-[#D4A853]" />
        <span className="text-[13px] font-semibold text-[#E6EAF0]">
          {locked.length} more {locked.length === 1 ? 'pattern' : 'patterns'} in
          the full audit
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {locked.map((l) => (
          <div
            key={l.bias_id}
            className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]"
          >
            <span className="text-[#7A7363]">{BIAS_LABEL[l.bias_id]}</span>
            <span
              className="text-[9px] uppercase tracking-wider font-semibold"
              style={{ color: BAND_COLOR[l.band] }}
            >
              {l.band}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11.5px] text-[#7A7363] leading-relaxed">
        Upload your real broker tradebook for the full audit — every bias, full
        muhasaba framing, evidence trades, and the lessons that cultivate the
        counter-virtues.
      </p>
      <button
        onClick={onUpgrade}
        className="w-full rounded-xl bg-[#D4A853] text-[#0B0F14] font-semibold py-2.5 text-[13px] flex items-center justify-center gap-2 hover:bg-[#E0C07A] transition-colors"
      >
        Upload tradebook
        <ArrowSquareOut size={13} weight="bold" />
      </button>
    </div>
  );
}
