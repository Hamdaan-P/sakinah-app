/**
 * Scholar Gate — multi-pole scholar-opinion display.
 *
 * The conscience layer on every contested asset/topic. Never collapses to one
 * verdict — shows the spectrum (Malaysia/SAC · GCC/AAOIFI · Traditional/Conservative · Modern Western)
 * with each scholar's reasoning, conditions, and source citation.
 */

import { ArrowSquareOut } from '@phosphor-icons/react';
import type { Scholar, ScholarOpinion, ScholarPole } from '../types/eim.types';

// NOTE: a "pole" is a position on the methodological spectrum (permissive →
// conservative), NOT a madhab or movement. The conservative pole spans more
// than Deobandi South Asia — it also holds Turkey's Diyanet, Egypt's Dar
// al-Ifta and Indian Hanafi bodies — so it is labelled by its spectrum
// position. Each scholar's actual school/jurisdiction is shown separately
// from `scholar.madhab_or_jurisdiction`.
const POLE_LABEL: Record<ScholarPole, string> = {
  malaysia_sac: 'Malaysia / SAC',
  gcc_aaoifi: 'GCC / AAOIFI',
  deobandi: 'Traditional / Conservative',
  modern_western: 'Modern Western',
};

const POLE_COLOR: Record<ScholarPole, string> = {
  malaysia_sac: '#22C55E',
  gcc_aaoifi: '#D4A853',
  deobandi: '#7BB39A',
  modern_western: '#4FB892',
};

const RULING_LABEL: Record<string, string> = {
  permissible: 'Permissible',
  permissible_with_conditions: 'Permissible with Conditions',
  haram: 'Impermissible',
  case_by_case: 'Case by case',
  no_position: 'No position',
};

const RULING_COLOR: Record<string, string> = {
  permissible: 'text-[#22C55E] bg-[rgba(34,197,94,0.10)] border-[rgba(34,197,94,0.30)]',
  permissible_with_conditions:
    'text-[#D4A853] bg-[rgba(212,168,83,0.10)] border-[rgba(212,168,83,0.30)]',
  haram: 'text-[#E84393] bg-[rgba(232,67,147,0.10)] border-[rgba(232,67,147,0.30)]',
  case_by_case: 'text-[#4FB892] bg-[rgba(79,184,146,0.10)] border-[rgba(79,184,146,0.30)]',
  no_position: 'text-[#5C5749] bg-[rgba(127,138,154,0.10)] border-[rgba(127,138,154,0.30)]',
};

interface Props {
  scholars: Scholar[];
  opinions: ScholarOpinion[];
  topicTitle?: string;
  topicSummary?: string;
}

export function ScholarGate({ scholars, opinions, topicTitle, topicSummary }: Props) {
  const lookup = Object.fromEntries(scholars.map((s) => [s.id, s] as const));

  return (
    <div className="rounded-2xl border border-[rgba(123,158,137,0.25)] p-5 bg-[rgba(42,157,111,0.04)]">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[11px] uppercase tracking-widest text-[#7BB39A] font-semibold">
          🌿 Scholar Gate — Ulama Screening
        </div>
        <div className="text-[10px] text-[#5C5749]">
          {opinions.length} opinion{opinions.length === 1 ? '' : 's'}
        </div>
      </div>
      {topicTitle && (
        <h3 className="text-[15px] font-semibold text-[#F5E8C7] mt-1">{topicTitle}</h3>
      )}
      {topicSummary && (
        <p className="text-[12px] text-[#7A7363] mt-1 leading-relaxed">{topicSummary}</p>
      )}

      <div className="mt-4 space-y-3">
        {opinions.map((op, i) => {
          const scholar = lookup[op.scholar_id];
          if (!scholar) return null;
          return (
            <div
              key={`${op.scholar_id}-${i}`}
              className="rounded-xl border border-[rgba(212,168,83,0.12)] bg-[#101a2a] p-3.5"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[#0A0E16] font-bold text-[14px]"
                  style={{ background: POLE_COLOR[scholar.pole] }}
                >
                  {scholar.avatar_initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <div className="text-[13px] font-semibold text-[#F5E8C7]">{scholar.name}</div>
                      <div className="text-[10px] text-[#5C5749]">
                        {scholar.madhab_or_jurisdiction}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full border"
                        style={{
                          color: POLE_COLOR[scholar.pole],
                          borderColor: `${POLE_COLOR[scholar.pole]}50`,
                          background: `${POLE_COLOR[scholar.pole]}10`,
                        }}
                      >
                        {POLE_LABEL[scholar.pole]}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${RULING_COLOR[op.ruling]}`}
                      >
                        {RULING_LABEL[op.ruling]}
                      </span>
                    </div>
                  </div>
                  {op.conditions && (
                    <p className="text-[11px] text-[#D4A853] mt-2 italic leading-relaxed">
                      Conditions: {op.conditions}
                    </p>
                  )}
                  <p className="text-[12px] text-[#C9D4E0] mt-2 leading-relaxed">
                    {op.rationale}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#5C5749]">
                    <span>Source:</span>
                    {op.source_url ? (
                      <a
                        href={op.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#4FB892] hover:underline inline-flex items-center gap-1"
                      >
                        {op.source_title}
                        <ArrowSquareOut size={10} weight="bold" />
                      </a>
                    ) : (
                      <span>{op.source_title}</span>
                    )}
                    {op.year && <span className="ml-1">· {op.year}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-[#5C5749] mt-4 italic leading-relaxed border-t border-[rgba(212,168,83,0.10)] pt-3">
        Difference of opinion among qualified scholars is not a defect — it is a mercy. Pick the framework whose methodology you understand and whose scholar you trust.
      </p>
    </div>
  );
}
