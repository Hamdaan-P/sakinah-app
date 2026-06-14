/**
 * Playbook reader — famous-investor personal applied process, with the
 * Halal Lens overlay. Lives at /eim/playbook/:playbookId.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────┐
 *   │ ← back · Library › Playbook                     │
 *   │                                                 │
 *   │ Hero: avatar · name · framework · quote · meta  │
 *   │                                                 │
 *   │ ▌ The framework                                 │
 *   │   bio paragraph                                 │
 *   │                                                 │
 *   │ ▌ Personal applied process                      │
 *   │   numbered principle cards                      │
 *   │                                                 │
 *   │ ▌ Case studies                                  │
 *   │   case study cards (each with optional halal-   │
 *   │   lens framing inline)                          │
 *   │                                                 │
 *   │ ▌ Halal Lens overlay                            │
 *   │   3 columns: applies / modify / forbidden       │
 *   │                                                 │
 *   │ ▌ Try it in the simulator                       │
 *   │   practical exercise CTA                        │
 *   │                                                 │
 *   │ ▌ References                                    │
 *   └─────────────────────────────────────────────────┘
 */

import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CaretLeft,
  Quotes,
  CheckCircle,
  Warning,
  XCircle,
  ChartLineUp,
  BookOpen,
  Lightning,
} from '@phosphor-icons/react';
import { eimTrack } from '../analytics';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { PLAYBOOKS } from '../data/knowledge-bank';
import type { HalalLensItem, HalalLensVerdict } from '../data/knowledge-bank';

const VERDICT_STYLE: Record<
  HalalLensVerdict,
  { label: string; bg: string; border: string; text: string; iconColor: string; Icon: typeof CheckCircle }
> = {
  applies_as_is: {
    label: 'Applies as-is',
    bg: 'rgba(34,197,94,0.06)',
    border: 'rgba(34,197,94,0.30)',
    text: '#86EFAC',
    iconColor: '#22C55E',
    Icon: CheckCircle,
  },
  needs_modification: {
    label: 'Needs modification',
    bg: 'rgba(251,191,36,0.06)',
    border: 'rgba(251,191,36,0.30)',
    text: '#FCD34D',
    iconColor: '#FBBF24',
    Icon: Warning,
  },
  forbidden: {
    label: 'Forbidden',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.30)',
    text: '#FCA5A5',
    iconColor: '#EF4444',
    Icon: XCircle,
  },
};

export function EimPlaybookPage() {
  const { playbookId } = useParams<{ playbookId: string }>();
  const navigate = useNavigate();

  const playbook = useMemo(
    () => PLAYBOOKS.find((p) => p.id === playbookId),
    [playbookId],
  );

  // P10 analytics — fire once per (mount, playbookId).
  useEffect(() => {
    if (playbook) eimTrack('eim_playbook_opened');
    // playbook.id is the only field used; depending on the full object would
    // re-fire if any field changed, which is not what we want.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbook?.id]);

  // Group halal-lens items by verdict for the 3-column layout
  const groupedLens = useMemo(() => {
    const groups: Record<HalalLensVerdict, HalalLensItem[]> = {
      applies_as_is: [],
      needs_modification: [],
      forbidden: [],
    };
    playbook?.halal_lens.forEach((item) => groups[item.verdict].push(item));
    return groups;
  }, [playbook]);

  if (!playbook) {
    return (
      <div className="min-h-screen bg-[#0F1724] flex flex-col items-center justify-center text-[#5C5749] text-[13px] px-6 text-center">
        Playbook not found.
        <button
          onClick={() => navigate('/eim/library')}
          className="mt-3 px-4 py-2 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.20)] text-[#D4A853] text-[12px]"
        >
          Back to library
        </button>
      </div>
    );
  }

  const initial = playbook.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-4xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim/library')}
            aria-label="Back to library"
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="text-[11px] text-[#5C5749]">
            <button
              type="button"
              className="hover:text-[#D4A853] cursor-pointer bg-transparent border-0 p-0 text-inherit"
              onClick={() => navigate('/eim/library')}
            >
              Library
            </button>
            <span className="mx-1.5">›</span>
            <span className="text-[#D4A853]">Playbook</span>
          </div>
        </header>

        <DisclaimerBanner />

        {/* Hero card */}
        <section className="px-5 mt-3">
          <div
            className="rounded-2xl border border-[rgba(212,168,83,0.22)] overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(212,168,83,0.10) 0%, rgba(42,157,111,0.05) 60%, rgba(15,23,36,0) 100%)',
            }}
          >
            <div className="p-4 sm:p-7 flex flex-col sm:flex-row gap-4 sm:gap-7 items-start">
              <div
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shrink-0 border border-[rgba(212,168,83,0.30)] text-[#F5E8C7] font-extrabold text-[20px] sm:text-[24px]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(212,168,83,0.20), rgba(42,157,111,0.12))',
                }}
              >
                {initial}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-1">
                  Playbook · {playbook.years_active}
                </div>
                <h1 className="text-[22px] sm:text-[28px] font-extrabold text-[#F5E8C7] leading-tight">
                  {playbook.name}
                </h1>
                {playbook.epithet && (
                  <div className="text-[12.5px] sm:text-[13px] text-[#D4A853] mt-0.5 italic">
                    “{playbook.epithet}”
                  </div>
                )}
                <div className="text-[12.5px] sm:text-[13px] text-[#7A7363] mt-1 font-semibold">
                  {playbook.framework}
                </div>
                <p className="text-[12.5px] sm:text-[13px] text-[#D1D9E5] mt-3 leading-relaxed max-w-2xl">
                  {playbook.bio}
                </p>
                <div className="mt-3 text-[10.5px] sm:text-[11px] text-[#5C5749] italic leading-snug">
                  Educational article about publicly documented investment history. Not financial advice.
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-[#7A7363]">
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={14} weight="bold" className="text-[#D4A853]" />
                    {playbook.minutes} min read
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lightning size={14} weight="bold" className="text-[#D4A853]" />
                    {playbook.principles.length} principles
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ChartLineUp size={14} weight="bold" className="text-[#D4A853]" />
                    {playbook.case_studies.length} case studies
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signature quote band */}
          <div className="mt-3 rounded-xl border-l-4 border-l-[#D4A853] border-y border-r border-[rgba(212,168,83,0.14)] bg-[rgba(212,168,83,0.03)] pl-4 pr-4 py-3 flex gap-2.5">
            <Quotes size={20} weight="fill" color="#D4A853" className="shrink-0 mt-1" />
            <div className="flex-1">
              <div className="text-[14px] italic text-[#F5E8C7] leading-relaxed">
                {playbook.signature_quote}
              </div>
              <div className="text-[11px] text-[#D4A853] mt-2 font-semibold">
                — {playbook.signature_quote_source}
              </div>
            </div>
          </div>
        </section>

        {/* Personal applied process */}
        <section className="px-5 mt-6">
          <SectionHeading>Personal Applied Process</SectionHeading>
          <div className="space-y-2.5">
            {playbook.principles.map((p, i) => (
              <div
                key={i}
                className="rounded-xl border border-[rgba(212,168,83,0.14)] bg-[#101a2a] p-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-[13px] bg-[rgba(212,168,83,0.12)] text-[#D4A853]">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-bold text-[#F5E8C7] mb-1">{p.name}</div>
                    <div className="text-[13px] text-[#C9D4E0] leading-relaxed whitespace-pre-line">
                      {p.body}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Case studies */}
        <section className="px-5 mt-6">
          <SectionHeading>Case Studies</SectionHeading>
          <div className="space-y-3">
            {playbook.case_studies.map((cs, i) => (
              <div
                key={i}
                className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-gradient-to-br from-[#13202F] to-[#0E1726] p-4"
              >
                <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-1">
                  Case · {cs.subject}
                </div>
                <div className="text-[13px] text-[#D1D9E5] leading-relaxed whitespace-pre-line">
                  {cs.narrative}
                </div>
                {cs.halal_lens && (
                  <div className="mt-3 rounded-lg border border-[rgba(123,158,137,0.30)] bg-[rgba(42,157,111,0.06)] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-[#7BB39A] font-semibold mb-1">
                      🌿 Halal Lens
                    </div>
                    <div className="text-[12.5px] text-[#C9D4E0] leading-relaxed">
                      {cs.halal_lens}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Halal Lens overlay — 3 columns */}
        <section className="px-5 mt-6">
          <SectionHeading>Halal Lens Overlay</SectionHeading>
          <div className="text-[12px] text-[#7A7363] mb-3 italic">
            Three buckets: what applies directly, what needs modification, and what is forbidden.
            The framework is the lesson — the personal portfolio is not endorsed.
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {(['applies_as_is', 'needs_modification', 'forbidden'] as const).map((v) => {
              const s = VERDICT_STYLE[v];
              const items = groupedLens[v];
              return (
                <div
                  key={v}
                  className="rounded-xl border p-4"
                  style={{ background: s.bg, borderColor: s.border }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <s.Icon size={16} weight="fill" color={s.iconColor} />
                    <div
                      className="text-[11px] uppercase tracking-widest font-bold"
                      style={{ color: s.text }}
                    >
                      {s.label} ({items.length})
                    </div>
                  </div>
                  {items.length === 0 ? (
                    <div className="text-[12px] text-[#5C5749] italic">— none —</div>
                  ) : (
                    <ul className="space-y-2.5">
                      {items.map((item, i) => (
                        <li key={i}>
                          <div className="text-[13px] font-bold text-[#F5E8C7] mb-0.5">
                            {item.title}
                          </div>
                          <div className="text-[12px] text-[#C9D4E0] leading-relaxed">
                            {item.body}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Practical exercise CTA */}
        <section className="px-5 mt-6">
          <div className="rounded-xl border border-[rgba(56,189,248,0.30)] bg-[rgba(56,189,248,0.05)] p-4">
            <div className="text-[11px] uppercase tracking-widest font-bold text-[#7DD3FC] mb-1.5">
              ⚒ Try it in your portfolio
            </div>
            <div className="text-[14px] font-bold text-[#F5E8C7] mb-1">
              {playbook.practical_exercise.title}
            </div>
            <div className="text-[13px] text-[#C9D4E0] leading-relaxed">
              {playbook.practical_exercise.body}
            </div>
            <button
              onClick={() => navigate('/eim/simulator')}
              className="mt-3 h-11 px-4 rounded-xl text-[13px] font-bold text-[#0A0E16] inline-flex items-center gap-1.5"
              style={{ background: 'linear-gradient(90deg, #38BDF8, #7DD3FC)' }}
            >
              Open Portfolio →
            </button>
          </div>
        </section>

        {/* References */}
        {playbook.references.length > 0 && (
          <section className="px-5 mt-6">
            <SectionHeading>Sources & References</SectionHeading>
            <div className="rounded-xl border border-[rgba(212,168,83,0.12)] bg-[rgba(212,168,83,0.03)] p-4">
              <ul className="space-y-1.5 text-[12px] text-[#7A7363]">
                {playbook.references.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#D4A853]">·</span>
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-px flex-1 bg-[rgba(212,168,83,0.14)]" />
      <div className="text-[11px] uppercase tracking-widest font-bold text-[#D4A853]">
        {children}
      </div>
      <div className="h-px flex-1 bg-[rgba(212,168,83,0.14)]" />
    </div>
  );
}

export default EimPlaybookPage;
