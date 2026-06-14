/**
 * Visual content blocks for lesson steps — Udemy/Coursera-style learning aids.
 * Renders the ContentBlock union from eim.types.ts.
 */

import { useState } from 'react';
import {
  CheckCircle,
  Info,
  Warning,
  WarningOctagon,
  Lightbulb,
  Star,
  Lightning,
  Quotes,
  XCircle,
} from '@phosphor-icons/react';
import type { ContentBlock, CalloutVariant } from '../types/eim.types';

// ── Callout ────────────────────────────────────────────────────────────────

const CALLOUT_STYLE: Record<CalloutVariant, { bg: string; border: string; text: string; iconColor: string }> = {
  info:    { bg: 'rgba(56,189,248,0.08)',  border: 'rgba(56,189,248,0.30)',  text: '#7DD3FC', iconColor: '#38BDF8' },
  warning: { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.30)',  text: '#FCD34D', iconColor: '#FBBF24' },
  danger:  { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.30)',   text: '#FCA5A5', iconColor: '#EF4444' },
  success: { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.30)',   text: '#86EFAC', iconColor: '#22C55E' },
  tip:     { bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.30)',  text: '#D8B4FE', iconColor: '#A855F7' },
  wisdom:  { bg: 'rgba(212,168,83,0.08)', border: 'rgba(212,168,83,0.30)', text: '#F5E8C7', iconColor: '#D4A853' },
};

const CALLOUT_ICON: Record<CalloutVariant, typeof Info> = {
  info: Info,
  warning: Warning,
  danger: WarningOctagon,
  success: CheckCircle,
  tip: Lightbulb,
  wisdom: Star,
};

function Callout({ block }: { block: ContentBlock }) {
  const variant: CalloutVariant = block.variant ?? 'info';
  const s = CALLOUT_STYLE[variant];
  const Icon = CALLOUT_ICON[variant];
  return (
    <div
      className="my-4 rounded-xl border p-4"
      style={{ background: s.bg, borderColor: s.border }}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} weight="fill" color={s.iconColor} className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {block.title && (
            <div className="text-[12px] uppercase tracking-wider font-bold mb-1.5" style={{ color: s.iconColor }}>
              {block.title}
            </div>
          )}
          <div className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: s.text }}>
            {block.body}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Comparison Table ───────────────────────────────────────────────────────

function ComparisonTable({ block }: { block: ContentBlock }) {
  return (
    <div className="my-4 rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#0B121F] overflow-hidden">
      {block.title && (
        <div className="px-4 py-2.5 border-b border-[rgba(212,168,83,0.14)] bg-[rgba(212,168,83,0.05)]">
          <div className="text-[11px] uppercase tracking-widest font-bold text-[#D4A853]">{block.title}</div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-[rgba(212,168,83,0.14)]">
              {block.columns.map((c, i) => (
                <th
                  key={i}
                  className="px-3.5 py-2.5 text-left font-bold text-[#F5E8C7] text-[11.5px] uppercase tracking-wider"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-[rgba(212,168,83,0.07)] last:border-0 hover:bg-[rgba(212,168,83,0.03)]"
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-3.5 py-2.5 align-top text-[#7A7363] leading-relaxed ${
                      j === 0 ? 'font-semibold text-[#F5E8C7]' : ''
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Key Takeaways ──────────────────────────────────────────────────────────

function KeyTakeaways({ block }: { block: ContentBlock }) {
  return (
    <div
      className="my-4 rounded-xl border border-[rgba(34,197,94,0.25)] p-4"
      style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))' }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <Lightning size={16} weight="fill" color="#22C55E" />
        <div className="text-[11px] uppercase tracking-widest font-bold text-[#86EFAC]">
          {block.title || 'Key Takeaways'}
        </div>
      </div>
      <ul className="space-y-2">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-[13px] text-[#D1D9E5] leading-relaxed">
            <CheckCircle size={15} weight="fill" color="#22C55E" className="shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Case Study ─────────────────────────────────────────────────────────────

function CaseStudy({ block }: { block: ContentBlock }) {
  return (
    <div className="my-4 rounded-xl border border-[rgba(212,168,83,0.22)] bg-gradient-to-br from-[#13202F] to-[#0E1726] p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="px-2 py-0.5 rounded-md bg-[rgba(212,168,83,0.15)] text-[10px] uppercase tracking-widest font-bold text-[#D4A853]">
          Real-World Example
        </div>
        {block.subject && <div className="text-[11px] text-[#5C5749]">· {block.subject}</div>}
      </div>
      {block.title && (
        <div className="text-[14.5px] font-bold text-[#F5E8C7] mb-2">{block.title}</div>
      )}
      <div className="text-[13px] text-[#7A7363] leading-relaxed whitespace-pre-line">
        {block.narrative || block.body}
      </div>
    </div>
  );
}

// ── Stat Grid ──────────────────────────────────────────────────────────────

function StatGrid({ block }: { block: ContentBlock }) {
  // Stat grids in lessons frequently carry 4 cells with long currency/text
  // values. Forcing 4 columns on phones crushes them — start at 2 cols on
  // mobile and expand to the full set on sm+ where there's room.
  const cols = Math.min(block.stats.length, 4);
  const smGridCols =
    cols === 1
      ? 'sm:grid-cols-1'
      : cols === 2
        ? 'sm:grid-cols-2'
        : cols === 3
          ? 'sm:grid-cols-3'
          : 'sm:grid-cols-4';
  return (
    <div className="my-4">
      {block.title && (
        <div className="text-[11px] uppercase tracking-widest font-bold text-[#D4A853] mb-2">
          {block.title}
        </div>
      )}
      <div className={`grid gap-2.5 grid-cols-2 ${smGridCols}`}>
        {block.stats.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#0B121F] p-3 text-center"
          >
            <div className="text-[18px] font-extrabold text-[#F5E8C7] leading-none">{s.value}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#D4A853] mt-1.5 font-semibold">
              {s.label}
            </div>
            {s.hint && <div className="text-[10px] text-[#5C5749] mt-1 leading-tight">{s.hint}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Diagram (ASCII / monospace flow) ───────────────────────────────────────

function Diagram({ block }: { block: ContentBlock }) {
  return (
    <div className="my-4 rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#0B121F] overflow-hidden">
      {block.title && (
        <div className="px-4 py-2 border-b border-[rgba(212,168,83,0.14)] text-[11px] uppercase tracking-widest font-bold text-[#D4A853]">
          {block.title}
        </div>
      )}
      <pre className="p-4 text-[11.5px] leading-snug text-[#7A7363] overflow-x-auto font-mono whitespace-pre">
        {block.ascii}
      </pre>
      {block.caption && (
        <div className="px-4 py-2 border-t border-[rgba(212,168,83,0.10)] text-[11px] italic text-[#5C5749]">
          {block.caption}
        </div>
      )}
    </div>
  );
}

// ── Quiz Check (no scoring yet — Dinarz wires in P7) ───────────────────────

function QuizCheck({ block }: { block: ContentBlock }) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked !== null && picked === block.answer_idx;
  return (
    <div className="my-4 rounded-xl border border-[rgba(168,85,247,0.30)] bg-[rgba(168,85,247,0.05)] p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Lightbulb size={16} weight="fill" color="#A855F7" />
        <div className="text-[11px] uppercase tracking-widest font-bold text-[#D8B4FE]">
          Quick Check
        </div>
      </div>
      <div className="text-[13.5px] text-[#F5E8C7] mb-3 leading-relaxed">{block.question}</div>
      <div className="space-y-1.5">
        {block.options.map((opt, i) => {
          const isPicked = picked === i;
          const isAnswer = i === block.answer_idx;
          const showResult = picked !== null;
          let bg = 'transparent';
          let border = 'rgba(212,168,83,0.18)';
          let color = '#7A7363';
          if (showResult && isAnswer) {
            bg = 'rgba(34,197,94,0.10)';
            border = 'rgba(34,197,94,0.45)';
            color = '#86EFAC';
          } else if (showResult && isPicked && !isAnswer) {
            bg = 'rgba(239,68,68,0.10)';
            border = 'rgba(239,68,68,0.45)';
            color = '#FCA5A5';
          } else if (isPicked) {
            bg = 'rgba(168,85,247,0.10)';
            border = 'rgba(168,85,247,0.45)';
            color = '#D8B4FE';
          }
          return (
            <button
              key={i}
              onClick={() => setPicked(i)}
              disabled={showResult}
              className="w-full text-left rounded-lg border px-3 py-2.5 text-[13px] flex items-center gap-2.5 transition-all hover:opacity-90 disabled:cursor-default"
              style={{ background: bg, borderColor: border, color }}
            >
              {showResult && isAnswer ? (
                <CheckCircle size={15} weight="fill" color="#22C55E" />
              ) : showResult && isPicked && !isAnswer ? (
                <XCircle size={15} weight="fill" color="#EF4444" />
              ) : (
                <div className="w-[15px] h-[15px] rounded-full border-2 border-current shrink-0" />
              )}
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div
          className="mt-3 rounded-lg border px-3 py-2.5 text-[12.5px] leading-relaxed"
          style={{
            background: correct ? 'rgba(34,197,94,0.08)' : 'rgba(251,191,36,0.08)',
            borderColor: correct ? 'rgba(34,197,94,0.30)' : 'rgba(251,191,36,0.30)',
            color: correct ? '#86EFAC' : '#FCD34D',
          }}
        >
          <span className="font-bold">{correct ? '✓ Correct. ' : 'Not quite. '}</span>
          {block.explanation}
        </div>
      )}
    </div>
  );
}

// ── Quote ──────────────────────────────────────────────────────────────────

function Quote({ block }: { block: ContentBlock }) {
  return (
    <div className="my-4 rounded-xl border-l-4 border-l-[#D4A853] border-y border-r border-[rgba(212,168,83,0.14)] bg-[rgba(212,168,83,0.03)] pl-4 pr-4 py-3">
      <div className="flex gap-2.5">
        <Quotes size={18} weight="fill" color="#D4A853" className="shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-[13.5px] italic text-[#F5E8C7] leading-relaxed">{block.body}</div>
          {block.citation && (
            <div className="text-[11px] text-[#D4A853] mt-1.5 font-semibold">— {block.citation}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dispatcher ─────────────────────────────────────────────────────────────

export function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case 'callout':
      return <Callout block={block} />;
    case 'comparison_table':
      return <ComparisonTable block={block} />;
    case 'key_takeaways':
      return <KeyTakeaways block={block} />;
    case 'case_study':
      return <CaseStudy block={block} />;
    case 'stat_grid':
      return <StatGrid block={block} />;
    case 'diagram':
      return <Diagram block={block} />;
    case 'quiz_check':
      return <QuizCheck block={block} />;
    case 'quote':
      return <Quote block={block} />;
    default:
      return null;
  }
}

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] | undefined }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <>
      {blocks.map((b, i) => (
        <ContentBlockRenderer key={i} block={b} />
      ))}
    </>
  );
}
