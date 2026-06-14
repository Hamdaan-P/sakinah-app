/**
 * InsightsTab — "reviews", two ways:
 *
 *   A. Raya's read on you  — the weekly Quiet Report, a Tafakkur seed, and
 *      the 6-category weekly insights (pattern / relationship / growth /
 *      trigger / self-talk / mood).
 *   B. Your feedback        — the ratings/comments you left on Raya's replies.
 *
 * A is reflective and slow-moving; B is your own voice back to Raya.
 */

import { ChatText, Heart, Sparkle, Star } from '@phosphor-icons/react';
import { useQuietReport, useTafakkurSeeds } from '../hooks/useRayaHub';
import { useFeedback, useWeeklyInsights } from '../hooks/useDashboard';
import { Card, EmptyState, SectionTitle, SkeletonRows } from './ui';
import { fmtWhen } from './format';

function ratingStars(rating: number | string | null): number | null {
  if (rating == null) return null;
  const n = typeof rating === 'string' ? Number(rating) : rating;
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(5, Math.round(n)));
}

export function InsightsTab({ uid }: { uid: string | undefined }) {
  const { data: report } = useQuietReport(uid);
  const { data: seedsResp } = useTafakkurSeeds(uid);
  const { data: weekly, isLoading: weeklyLoading } = useWeeklyInsights(uid);
  const { data: feedback, isLoading: fbLoading } = useFeedback();

  const seed = seedsResp?.seeds?.[0];
  const insights = weekly?.insights ?? [];
  const fbItems = feedback?.items ?? [];
  const hasReviewA = !!(report || seed || weekly?.summary || insights.length);

  return (
    <div>
      {/* ── A. Raya's read on you ── */}
      <SectionTitle hint="What Raya notices about your week">Raya's read on you</SectionTitle>

      {!hasReviewA ? (
        <EmptyState icon={<Sparkle size={28} />} title="Nothing to reflect on yet" hint="As you talk with Raya, she builds a gentle weekly read on your patterns and growth." />
      ) : (
        <div className="space-y-3 mb-8">
          {report?.summary && (
            <Card className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4A853]/60 mb-2">Quiet report</p>
              <p className="text-[#F5E8C7] text-sm leading-relaxed">{report.summary}</p>
              {report.observation && (
                <p className="text-[#C9C0A8]/80 text-[13px] leading-relaxed mt-3 italic border-l-2 border-[#D4A853]/30 pl-3">
                  {report.observation}
                </p>
              )}
            </Card>
          )}

          {seed && (
            <Card className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4A853]/60 mb-2">A seed to sit with</p>
              {seed.context && <p className="text-[#C9C0A8]/70 text-xs mb-2">{seed.context}</p>}
              <p className="text-[#F5E8C7] text-base leading-relaxed font-medium">{seed.prompt}</p>
            </Card>
          )}

          {weekly?.summary && (
            <Card className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4A853]/60 mb-2">This week</p>
              <p className="text-[#F5E8C7] text-sm leading-relaxed">{weekly.summary}</p>
            </Card>
          )}

          {weeklyLoading && insights.length === 0 && <SkeletonRows rows={2} />}

          {insights.map((it, i) => (
            <Card key={`${it.type ?? 'insight'}-${i}`} className="p-4 flex items-start gap-3">
              <Heart size={18} weight="duotone" className="text-[#D4A853] shrink-0 mt-0.5" />
              <div>
                {it.title && <p className="text-[#F5E8C7] text-sm font-medium">{it.title}</p>}
                {it.description && <p className="text-[#C9C0A8]/70 text-[13px] leading-snug mt-1">{it.description}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── B. Your feedback ── */}
      <SectionTitle hint="Ratings & notes you left on Raya's replies">Your feedback</SectionTitle>
      {fbLoading ? (
        <SkeletonRows rows={2} />
      ) : fbItems.length === 0 ? (
        <EmptyState icon={<ChatText size={28} />} title="No feedback yet" hint="React to Raya's answers and your ratings collect here." />
      ) : (
        <div className="space-y-2">
          {fbItems.map((f) => {
            const stars = ratingStars(f.rating);
            return (
              <Card key={f.id} className="p-3.5">
                <div className="flex items-center justify-between gap-3">
                  {stars != null ? (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          weight={i < stars ? 'fill' : 'regular'}
                          className={i < stars ? 'text-[#D4A853]' : 'text-[#C9C0A8]/30'}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#C9C0A8]/60 text-xs">{String(f.rating ?? 'Feedback')}</span>
                  )}
                  <span className="text-[#C9C0A8]/45 text-[11px]">{fmtWhen(f.timestamp)}</span>
                </div>
                {f.feedback && <p className="text-[#C9C0A8]/80 text-[13px] leading-snug mt-2">{f.feedback}</p>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default InsightsTab;
