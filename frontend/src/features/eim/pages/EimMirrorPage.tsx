/**
 * Mizan Mirror — landing / hub page (EIM Phase F1).
 *
 * The premium behavioural-finance self-audit. Users upload a broker
 * tradebook CSV; the backend reconstructs realised lots (F1.a),
 * detects biases (F1.b — pending), and produces a muhasaba-framed
 * narrative (F1.c — pending).
 *
 * Gated end-to-end on `VITE_ENABLE_EIM_MIRROR` — the router refuses to
 * register the route when the flag is off, so a user typing the URL
 * directly hits the 404. The backend mirrors with `EIM_MIRROR_ENABLED`.
 */

import { useNavigate } from 'react-router-dom';
import { CaretLeft, Scales, Upload, Trash, Sparkle, Eye } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { FeatureIntro } from '../components/FeatureIntro';
import { eimService } from '../services/eim.service';
import { useEimStore } from '../stores/eim.store';

export function EimMirrorPage() {
  const navigate = useNavigate();
  const portfolios = useEimStore((s) => s.portfolios);
  const totalPositions = portfolios.reduce((acc, p) => acc + p.positions.length, 0);
  const [purgeConfirm, setPurgeConfirm] = useState(false);
  const purgeMutation = useMutation({
    mutationFn: () => eimService.deleteMirrorData(),
    onSuccess: () => setPurgeConfirm(false),
  });

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6EAF0] pb-24">
      <div className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/eim')}
          className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center"
          aria-label="Back to EIM home"
        >
          <CaretLeft size={18} weight="bold" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">Mizan Mirror</h1>
          <p className="text-[12px] text-[#7A7363]">
            Muhasaba for your trading — a behavioural self-audit.
          </p>
        </div>
        <FeatureIntro featureId="mirror" />
        <span className="px-2 py-0.5 rounded-full bg-[rgba(212,168,83,0.12)] border border-[rgba(212,168,83,0.3)] text-[10px] font-semibold text-[#D4A853] uppercase tracking-wider">
          Premium
        </span>
      </div>

      <DisclaimerBanner />

      <div className="px-4 mt-6 space-y-4">
        <div className="rounded-2xl border border-[rgba(212,168,83,0.2)] bg-[rgba(212,168,83,0.04)] p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(212,168,83,0.12)] flex items-center justify-center shrink-0">
              <Scales size={20} weight="duotone" className="text-[#D4A853]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold">What Mirror does</h2>
              <p className="text-[13px] leading-relaxed text-[#7A7363] mt-1">
                Upload a CSV of your real past trades. Mirror reconstructs each
                round-trip, surfaces the psychological patterns running through
                them — loss aversion, revenge trading, FOMO — and frames each
                finding through the Islamic lens of <em>muhasaba</em>
                {' '}(self-accounting). No predictions. No advice. A mirror.
              </p>
            </div>
          </div>
        </div>

        {/* Two-path entry: free sim preview + premium full audit. The
            preview is hidden when the user has no simulator positions
            yet so the empty-state doesn't dangle a broken CTA. */}
        <div className="space-y-3">
          {totalPositions > 0 && (
            <button
              onClick={() => navigate('/eim/mirror/preview')}
              className="w-full rounded-2xl border border-[rgba(212,168,83,0.3)] bg-[rgba(212,168,83,0.06)] text-left p-4 hover:border-[rgba(212,168,83,0.5)] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(212,168,83,0.15)] flex items-center justify-center shrink-0">
                  <Eye size={20} weight="duotone" className="text-[#D4A853]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[14px] font-semibold text-[#E6EAF0]">
                      Try a preview now
                    </span>
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(111,207,151,0.15)] text-[#6FCF97] font-semibold">
                      Free
                    </span>
                  </div>
                  <p className="text-[12px] text-[#7A7363] leading-relaxed">
                    Runs Mirror on your portfolios ({totalPositions}{' '}
                    {totalPositions === 1 ? 'position' : 'positions'}). No upload,
                    instant. Shows 2 biases — unlock the rest with a tradebook.
                  </p>
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => navigate('/eim/mirror/upload')}
            className="w-full rounded-2xl bg-[#D4A853] text-[#0B0F14] text-left p-4 hover:bg-[#E0C07A] transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(11,15,20,0.15)] flex items-center justify-center shrink-0">
                <Upload size={20} weight="bold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[14px] font-bold">Upload a tradebook</span>
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(11,15,20,0.15)] font-semibold">
                    Full audit
                  </span>
                </div>
                <p className="text-[12px] opacity-80 leading-relaxed">
                  All 10 biases · full muhasaba framing · evidence trades. Your
                  Zerodha tradebook never leaves the server.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold">
            <Sparkle size={14} weight="bold" className="text-[#D4A853]" />
            What you&apos;ll see in the report
          </div>
          <ul className="space-y-2 text-[12.5px] text-[#7A7363] leading-relaxed pl-5 list-disc marker:text-[#D4A853]">
            <li>
              <span className="text-[#E6EAF0] font-medium">Trade reconstruction</span> —
              every realised buy↔sell pair with P&amp;L and holding period.
            </li>
            <li>
              <span className="text-[#E6EAF0] font-medium">Behavioural biases</span> —
              loss aversion, disposition, revenge, early exit, FOMO, herding,
              recency, confirmation, anchoring, emotional state.{' '}
              <span className="text-[10px] uppercase tracking-wider text-[#D4A853]/70">F1.b</span>
            </li>
            <li>
              <span className="text-[#E6EAF0] font-medium">Muhasaba framing</span> —
              each finding re-described as <em>sabr</em>, <em>khawf</em>,
              <em> tawakkul</em>, <em>ishlah</em>.{' '}
              <span className="text-[10px] uppercase tracking-wider text-[#D4A853]/70">F1.c</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
          <p className="text-[11.5px] text-[#7A7363] leading-relaxed">
            <span className="text-[#E6EAF0] font-semibold">Privacy:</span> your raw trades
            never leave the server. The narrative model only ever sees aggregated
            scores and the static Islamic-concept mapping — never your individual
            trade rows.
          </p>
        </div>

        <div className="pt-6 border-t border-[rgba(255,255,255,0.05)]">
          <p className="text-[11px] uppercase tracking-wider text-[#7A8595] mb-2">
            Data control
          </p>
          {purgeConfirm ? (
            <div className="rounded-xl border border-[rgba(239,83,80,0.3)] bg-[rgba(239,83,80,0.06)] p-3 space-y-2">
              <p className="text-[12px] text-[#E6EAF0]">
                This deletes every uploaded tradebook, reconstructed lot, and
                generated report for your account. Permanent.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => purgeMutation.mutate()}
                  disabled={purgeMutation.isPending}
                  className="px-3 py-2 rounded-lg bg-[#EF5350] text-white text-[12px] font-semibold disabled:opacity-50"
                >
                  {purgeMutation.isPending ? 'Purging…' : 'Yes, delete everything'}
                </button>
                <button
                  onClick={() => setPurgeConfirm(false)}
                  className="px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-[12px]"
                >
                  Cancel
                </button>
              </div>
              {purgeMutation.isSuccess && (
                <p className="text-[11px] text-[#6FCF97]">
                  Purged — {purgeMutation.data.uploads_deleted} uploads,{' '}
                  {purgeMutation.data.reports_deleted} reports.
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setPurgeConfirm(true)}
              className="text-[12px] text-[#EF5350] flex items-center gap-1.5 hover:underline"
            >
              <Trash size={13} weight="bold" />
              Delete all my Mirror data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
