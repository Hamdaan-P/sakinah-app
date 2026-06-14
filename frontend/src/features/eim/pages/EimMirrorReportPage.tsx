/**
 * Mizan Mirror — report viewer (EIM Phase F1.a).
 *
 * Two entry shapes:
 *   - `?upload=<upload_id>` — fresh from the upload flow. Polls
 *     `GET /api/eim/mirror/uploads/{upload_id}/latest-report` until the
 *     analysis is ready (F1.a: FIFO only; F1.b/c will extend the same
 *     polling shape with bias detectors + LLM narrative).
 *   - `?report=<report_id>` — direct deep-link to a previously-generated
 *     report. Single fetch via `GET /api/eim/mirror/report/{id}`.
 *
 * F1.a renders summary + reconstructed lot list only. The placeholders
 * for biases / archetype / muhasaba narrative are intentional — they
 * tell the user *what's coming next* and prevent the page from looking
 * unfinished when F1.b/c haven't shipped yet.
 */

import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CaretLeft,
  ChartBar,
  Quotes,
  Scales,
  Warning,
} from '@phosphor-icons/react';

import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import { eimService } from '../services/eim.service';
import type {
  MirrorArchetype,
  MirrorAttributionEntry,
  MirrorBehaviouralStatePoint,
  MirrorBiasBand,
  MirrorBiasId,
  MirrorBiasScore,
  MirrorReconstructedLot,
  MirrorReport,
} from '../types/eim.types';

const POLL_INTERVAL_MS = 2_500;

function useInrMoney() {
  const { format } = useCurrencyFormat();
  return {
    // Signed P&L — preserves the leading +/- the original built.
    money: (value: number) =>
      `${value < 0 ? '-' : '+'}${format(Math.abs(value), 'INR', { maxDecimals: 2 })}`,
    // Unsigned price.
    price: (value: number) => format(value, 'INR', { maxDecimals: 2 }),
  };
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDays(value: number): string {
  if (value < 1) return `${(value * 24).toFixed(1)}h`;
  if (value < 30) return `${value.toFixed(1)}d`;
  return `${(value / 30).toFixed(1)}mo`;
}

export function EimMirrorReportPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const uploadId = params.get('upload');
  const reportId = params.get('report');

  // Direct-fetch path: ?report=<id>
  const reportByIdQ = useQuery({
    queryKey: ['eim', 'mirror', 'report', reportId],
    queryFn: () => eimService.getMirrorReport(reportId as string),
    enabled: !!reportId,
  });

  // Polling path: ?upload=<id>
  const pollQ = useQuery({
    queryKey: ['eim', 'mirror', 'latest', uploadId],
    queryFn: () => eimService.getMirrorLatestReport(uploadId as string),
    enabled: !!uploadId && !reportId,
    refetchInterval: (q) => {
      const data = q.state.data;
      return data?.status === 'ready' ? false : POLL_INTERVAL_MS;
    },
  });

  const report: MirrorReport | undefined =
    reportByIdQ.data ??
    (pollQ.data?.status === 'ready' ? pollQ.data.report : undefined);

  const isWaiting =
    !report &&
    (!!uploadId || reportByIdQ.isPending) &&
    !reportByIdQ.isError &&
    !pollQ.isError;

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6EAF0] pb-24">
      <div className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/eim/mirror')}
          className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center"
          aria-label="Back to Mirror home"
        >
          <CaretLeft size={18} weight="bold" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">Mirror report</h1>
          <p className="text-[12px] text-[#7A7363]">
            {report
              ? `Generated ${new Date(report.generated_at).toLocaleString()}`
              : isWaiting
                ? 'Reconstructing your trades…'
                : 'No report.'}
          </p>
        </div>
      </div>

      <DisclaimerBanner />

      {isWaiting && <WaitingPanel />}
      {reportByIdQ.isError && (
        <ErrorPanel message="Couldn't load that report. It may have been purged." />
      )}
      {pollQ.isError && !report && (
        <ErrorPanel
          message={
            (pollQ.error as Error)?.message ??
            "Couldn't reach the Mirror analysis. The upload may have expired — try uploading your tradebook again."
          }
        />
      )}
      {!isWaiting && !report && !reportByIdQ.isError && !pollQ.isError && (
        <ErrorPanel message="No upload or report id in the URL." />
      )}

      {report && <ReportBody report={report} />}
    </div>
  );
}

function WaitingPanel() {
  return (
    <div className="px-4 mt-6">
      <div className="rounded-2xl border border-[rgba(212,168,83,0.2)] bg-[rgba(212,168,83,0.04)] p-6 text-center">
        <Scales size={28} weight="duotone" className="text-[#D4A853] mx-auto" />
        <p className="text-[14px] font-semibold mt-3">
          Reconstructing realised lots…
        </p>
        <p className="text-[12px] text-[#7A7363] mt-1.5 leading-relaxed">
          FIFO matching every buy↔sell pair. This usually takes a few seconds.
          The page will update automatically.
        </p>
      </div>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="px-4 mt-6">
      <div className="rounded-2xl border border-[rgba(239,83,80,0.3)] bg-[rgba(239,83,80,0.06)] p-4">
        <p className="text-[13px] text-[#E6EAF0]">{message}</p>
      </div>
    </div>
  );
}

function ReportBody({ report }: { report: MirrorReport }) {
  const { money } = useInrMoney();
  const summary = report.summary;
  const totalPnl = summary.total_pnl ?? 0;
  const pnlColor = totalPnl >= 0 ? 'text-[#6FCF97]' : 'text-[#EF5350]';

  return (
    <div className="px-4 mt-6 space-y-5">
      {/* Summary card */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#7A8595] mb-3">
          <ChartBar size={12} weight="bold" />
          Summary
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SummaryStat label="Trades" value={String(summary.total_trades ?? 0)} />
          <SummaryStat
            label="Win rate"
            value={
              summary.win_rate !== undefined ? formatPercent(summary.win_rate) : '—'
            }
          />
          <SummaryStat
            label="Total P&L"
            value={money(totalPnl)}
            valueClass={pnlColor}
          />
          <SummaryStat
            label="Symbols"
            value={String(summary.symbols_traded ?? 0)}
          />
        </div>
      </div>

      {report.muhasaba_narrative && (
        <MuhasabaNarrativeCard narrative={report.muhasaba_narrative} />
      )}

      {report.archetype && <ArchetypeCard archetype={report.archetype} />}

      {report.behavioural_state_timeline.length > 0 && (
        <BehaviouralStateStrip timeline={report.behavioural_state_timeline} />
      )}

      {report.anomaly_trade_ids.length > 0 && (
        <AnomalyBanner ids={report.anomaly_trade_ids} lots={report.lots} />
      )}

      {report.biases.length > 0 && (
        <div>
          <h2 className="text-[13px] font-semibold mb-2">Behavioural biases</h2>
          <div className="space-y-2">
            {report.biases.map((bias) => (
              <BiasCard
                key={bias.bias_id}
                bias={bias}
                attribution={report.attribution[bias.bias_id]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lots */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[13px] font-semibold">Reconstructed lots</h2>
          <span className="text-[11px] text-[#7A8595]">
            {report.lots.length} realised
          </span>
        </div>
        {report.lots.length === 0 ? (
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 text-[12.5px] text-[#7A7363]">
            No realised lots in this tradebook — Mirror needs at least one
            full buy↔sell round trip to learn from.
          </div>
        ) : (
          <LotList lots={report.lots} />
        )}
      </div>

      <p className="text-[11px] text-[#7A8595] text-center pt-4">
        {report.disclaimer}
      </p>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  valueClass = '',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-[#7A8595]">
        {label}
      </div>
      <div className={`text-[16px] font-semibold mt-0.5 ${valueClass}`}>{value}</div>
    </div>
  );
}

// ── Muhasaba narrative ────────────────────────────────────────────────────

function MuhasabaNarrativeCard({ narrative }: { narrative: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.3)] bg-gradient-to-br from-[rgba(212,168,83,0.08)] to-[rgba(168,85,247,0.04)] p-4">
      <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-wider text-[#D4A853] mb-2 font-semibold">
        <Scales size={12} weight="bold" />
        Muhasaba reading
      </div>
      <p className="text-[13px] text-[#E6EAF0] leading-relaxed">{narrative}</p>
    </div>
  );
}

// ── Archetype ─────────────────────────────────────────────────────────────

const ARCHETYPE_ACCENT: Record<string, string> = {
  disciplined_steward: '#7BB39A',
  reactive_emotional: '#EF5350',
  aggressive_high_activity: '#E8C97A',
  balanced_tactical: '#4FB892',
};

function ArchetypeCard({ archetype }: { archetype: MirrorArchetype }) {
  const accent = ARCHETYPE_ACCENT[archetype.id] ?? '#D4A853';
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: `${accent}55`,
        background: `${accent}10`,
      }}
    >
      <div className="text-[10.5px] uppercase tracking-wider text-[#7A8595] mb-1">
        Trading archetype
      </div>
      <div className="text-[16px] font-semibold" style={{ color: accent }}>
        {archetype.label}
      </div>
      <div className="text-[12px] text-[#7A7363] mt-1.5 leading-relaxed">
        {archetype.description}
      </div>
    </div>
  );
}

// ── Behavioural state ─────────────────────────────────────────────────────

const STATE_COLOR: Record<MirrorBehaviouralStatePoint['state'], string> = {
  calm: '#7BB39A',
  anxious: '#E8C97A',
  euphoric: '#EF5350',
};

function BehaviouralStateStrip({ timeline }: { timeline: MirrorBehaviouralStatePoint[] }) {
  const counts = timeline.reduce<Record<string, number>>((acc, pt) => {
    acc[pt.state] = (acc[pt.state] ?? 0) + 1;
    return acc;
  }, {});
  const total = timeline.length || 1;
  // Per-lot color strip — each lot is a thin vertical bar coloured by its
  // state. Caps at ~120 segments so a multi-year trader still sees a useful
  // overview without the strip becoming a hairline grid. The summary
  // proportions card stays below for the long-tail counts.
  const stripPoints = useMemo(() => {
    if (timeline.length <= 120) return timeline;
    const stride = Math.ceil(timeline.length / 120);
    return timeline.filter((_, i) => i % stride === 0);
  }, [timeline]);

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#7A8595] mb-3">
        <div className="flex items-center gap-2">
          <ChartBar size={12} weight="bold" />
          Behavioural state
        </div>
        <span className="normal-case tracking-normal">
          {timeline.length} {timeline.length === 1 ? 'lot' : 'lots'}
        </span>
      </div>

      {/* Per-lot ribbon — time-ordered, each cell coloured by lot's state */}
      <div className="flex h-5 rounded-md overflow-hidden gap-px bg-[rgba(255,255,255,0.04)]">
        {stripPoints.map((pt, i) => (
          <div
            key={i}
            className="flex-1 min-w-0"
            style={{ backgroundColor: STATE_COLOR[pt.state] }}
            title={`${new Date(pt.timestamp).toLocaleDateString()} · ${pt.state}`}
          />
        ))}
      </div>

      {/* Proportions summary — survives the per-lot strip's stride sampling */}
      <div className="h-1.5 mt-2 rounded-full overflow-hidden bg-[rgba(255,255,255,0.04)] flex">
        {(['calm', 'anxious', 'euphoric'] as const).map((state) => {
          const pct = ((counts[state] ?? 0) / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={state}
              style={{ width: `${pct}%`, backgroundColor: STATE_COLOR[state] }}
              title={`${state} · ${counts[state] ?? 0} lots`}
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
            <span className="text-[#7A8595]">{counts[state] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Anomaly banner ────────────────────────────────────────────────────────

function AnomalyBanner({
  ids,
  lots,
}: {
  ids: string[];
  lots: MirrorReconstructedLot[];
}) {
  // Per-lot pip strip — each lot is a tiny dot, with the flagged ones
  // highlighted. Lets the user see WHERE in their trading history the
  // outsized trades cluster (early, late, scattered) without us having
  // to ship a full chart library for this one detail.
  const flaggedSet = useMemo(() => new Set(ids), [ids]);
  const pips = useMemo(() => {
    const sorted = [...lots].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
    if (sorted.length <= 120) return sorted;
    const stride = Math.ceil(sorted.length / 120);
    return sorted.filter((_, i) => i % stride === 0);
  }, [lots]);

  return (
    <div className="rounded-2xl border border-[rgba(232,201,122,0.35)] bg-[rgba(232,201,122,0.06)] p-4 space-y-3">
      <div className="flex items-start gap-2.5">
        <Warning size={16} weight="duotone" className="text-[#E8C97A] shrink-0 mt-0.5" />
        <div className="text-[12.5px] text-[#7A7363] leading-relaxed">
          <span className="text-[#E6EAF0] font-semibold">
            {ids.length} outsized {ids.length === 1 ? 'lot' : 'lots'}
          </span>{' '}
          flagged — position size more than 3σ above your rolling baseline.
          Worth a pause to check what was happening on those days.
        </div>
      </div>
      {/* Anomaly timeline pip strip */}
      <div className="flex items-center gap-px h-3">
        {pips.map((lot, i) => {
          const flagged = flaggedSet.has(lot.lot_id);
          return (
            <div
              key={`${lot.lot_id}-${i}`}
              className="flex-1 min-w-0 rounded-sm"
              style={{
                backgroundColor: flagged ? '#E8C97A' : 'rgba(255,255,255,0.08)',
                height: flagged ? '100%' : '40%',
                alignSelf: 'flex-end',
              }}
              title={
                flagged
                  ? `Outsized · ${new Date(lot.timestamp).toLocaleDateString()}`
                  : new Date(lot.timestamp).toLocaleDateString()
              }
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Bias card ─────────────────────────────────────────────────────────────

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

const BAND_COLOR: Record<MirrorBiasBand, string> = {
  low: '#7BB39A',
  moderate: '#E8C97A',
  high: '#EF5350',
};

function BiasCard({
  bias,
  attribution,
}: {
  bias: MirrorBiasScore;
  attribution?: MirrorAttributionEntry;
}) {
  const navigate = useNavigate();
  const accent = BAND_COLOR[bias.band];
  const concept = attribution?.concept;
  const conceptAr = attribution?.concept_ar;
  const framing = attribution?.muhasaba_framing;
  const verseTranslation = attribution?.verse_translation;
  const verseArabic = attribution?.verse_arabic;
  const verseCitation = attribution?.verse_citation;
  const lessonId = attribution?.recommended_lesson_id;

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#E6EAF0]">
            {BIAS_LABEL[bias.bias_id]}
          </span>
          {concept && (
            <span className="text-[10px] uppercase tracking-wider text-[#D4A853] bg-[rgba(212,168,83,0.10)] px-1.5 py-0.5 rounded">
              {concept}
              {conceptAr ? ` · ${conceptAr}` : ''}
            </span>
          )}
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            backgroundColor: `${accent}1F`,
            color: accent,
          }}
        >
          {bias.band}
        </span>
      </div>

      {framing && (
        <p className="text-[12.5px] text-[#E6EAF0] leading-relaxed">{framing}</p>
      )}

      {bias.notes && (
        <p className="text-[11px] text-[#7A8595] leading-relaxed italic">
          {bias.notes}
        </p>
      )}

      {(verseTranslation || verseCitation) && (
        <div className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(212,168,83,0.18)] p-2.5">
          <div className="flex items-start gap-2">
            <Quotes size={12} weight="bold" className="text-[#D4A853] shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              {verseArabic && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-[14px] text-[#F5E8C7] leading-relaxed mb-1 font-medium"
                >
                  {verseArabic}
                </p>
              )}
              {verseTranslation && (
                <p className="text-[11.5px] text-[#7A7363] leading-relaxed">
                  {verseTranslation}
                </p>
              )}
              {verseCitation && (
                <p className="text-[10px] text-[#7A8595] mt-1">{verseCitation}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {lessonId && (
        <button
          onClick={() => navigate(`/eim/lesson/${lessonId}`)}
          className="w-full flex items-center justify-between text-left text-[11.5px] text-[#D4A853] hover:text-[#E8C97A] transition-colors px-2.5 py-2 rounded-lg bg-[rgba(212,168,83,0.04)] border border-[rgba(212,168,83,0.15)]"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen size={12} weight="bold" />
            Open recommended lesson
          </span>
          <span className="text-[10.5px] text-[#7A8595]">{lessonId}</span>
        </button>
      )}

      {bias.evidence_trade_ids.length > 0 && (
        <div className="text-[10.5px] text-[#7A8595]">
          Evidence trades: {bias.evidence_trade_ids.length}
        </div>
      )}
    </div>
  );
}

function LotList({ lots }: { lots: MirrorReconstructedLot[] }) {
  const { money, price } = useInrMoney();
  // Show 50 newest first by default; very large books are still browsable but
  // we don't want to push 5000 rows through React all at once.
  const visible = useMemo(() => {
    const sorted = [...lots].sort((a, b) =>
      a.timestamp < b.timestamp ? 1 : -1,
    );
    return sorted.slice(0, 50);
  }, [lots]);

  return (
    <div className="space-y-1.5">
      {visible.map((lot, idx) => {
        const wonRound = lot.pnl > 0;
        return (
          <div
            key={`${lot.symbol}-${lot.timestamp}-${idx}`}
            className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold">{lot.symbol}</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    lot.side === 'SELL'
                      ? 'bg-[rgba(111,207,151,0.12)] text-[#6FCF97]'
                      : 'bg-[rgba(239,83,80,0.12)] text-[#EF5350]'
                  }`}
                >
                  {lot.side === 'SELL' ? 'CLOSED LONG' : 'CLOSED SHORT'}
                </span>
              </div>
              <div
                className={`text-[13px] font-semibold flex items-center gap-1 ${
                  wonRound ? 'text-[#6FCF97]' : 'text-[#EF5350]'
                }`}
              >
                {wonRound ? <ArrowUp size={12} weight="bold" /> : <ArrowDown size={12} weight="bold" />}
                {money(lot.pnl)}
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#7A8595] mt-1.5">
              <span>{new Date(lot.timestamp).toLocaleDateString()}</span>
              <span>·</span>
              <span>
                {lot.quantity} @ {price(lot.price)}
              </span>
              <span>·</span>
              <span>held {formatDays(lot.holding_duration)}</span>
            </div>
          </div>
        );
      })}
      {lots.length > visible.length && (
        <p className="text-[11px] text-[#7A8595] text-center pt-2">
          Showing latest {visible.length} of {lots.length}.
        </p>
      )}
    </div>
  );
}
