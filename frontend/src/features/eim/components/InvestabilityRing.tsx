/**
 * InvestabilityRing — the 0-100% composite-score visualisation.
 *
 * Three sizes: sm (compact card chip), md (default card body), lg (detail page).
 * The ring is a pure SVG; the optional factor-drill-down lists the 5 pillars
 * with their sub-scores and reason text.
 *
 * Missing-data behaviour (D22): when the score is `null` the ring renders an
 * explicit "Score unavailable" state with the withhold reason — never a blank
 * or guessed value.
 */

import { useState } from 'react';
import { CaretDown, CaretUp, Info, WarningOctagon } from '@phosphor-icons/react';
import type { InvestabilityBand, InvestabilityPillar, InvestabilityScore } from '../types/eim.types';

type Size = 'sm' | 'md' | 'lg';

const BAND_STYLE: Record<
  InvestabilityBand,
  { label: string; from: string; to: string; text: string }
> = {
  excellent:   { label: 'Excellent',   from: '#22C55E', to: '#86EFAC', text: '#22C55E' },
  strong:      { label: 'Strong',      from: '#65A30D', to: '#A3E635', text: '#A3E635' },
  fair:        { label: 'Fair',        from: '#D4A853', to: '#E8C97A', text: '#D4A853' },
  concerning:  { label: 'Concerning',  from: '#F59E0B', to: '#FBBF24', text: '#F59E0B' },
  avoid:       { label: 'Avoid',       from: '#DC2626', to: '#EF4444', text: '#EF4444' },
  unavailable: { label: 'Unavailable', from: '#475569', to: '#64748B', text: '#5C5749' },
};

const SIZE_CONFIG: Record<Size, { dim: number; stroke: number; font: number; label: number }> = {
  sm: { dim: 60, stroke: 6, font: 16, label: 9 },
  md: { dim: 96, stroke: 8, font: 24, label: 10 },
  lg: { dim: 140, stroke: 12, font: 36, label: 11 },
};

function Ring({ score, band, size }: { score: number; band: InvestabilityBand; size: Size }) {
  const { dim, stroke, font, label } = SIZE_CONFIG[size];
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const s = BAND_STYLE[band];
  const gradId = `inv-grad-${band}-${size}`;

  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={s.from} />
          <stop offset="100%" stopColor={s.to} />
        </linearGradient>
      </defs>
      <circle
        cx={dim / 2}
        cy={dim / 2}
        r={radius}
        fill="none"
        stroke="rgba(212,168,83,0.12)"
        strokeWidth={stroke}
      />
      <circle
        cx={dim / 2}
        cy={dim / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
        style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#F5E8C7"
        fontWeight="800"
        fontSize={font}
        dy={size === 'sm' ? -2 : -3}
      >
        {score}
      </text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill={s.text}
        fontWeight="700"
        fontSize={label}
        dy={size === 'sm' ? 12 : 18}
        style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
      >
        {s.label}
      </text>
    </svg>
  );
}

function UnavailableRing({ size }: { size: Size }) {
  const { dim, stroke, label } = SIZE_CONFIG[size];
  const radius = (dim - stroke) / 2;
  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
      <circle
        cx={dim / 2}
        cy={dim / 2}
        r={radius}
        fill="none"
        stroke="rgba(127,138,154,0.25)"
        strokeWidth={stroke}
        strokeDasharray="4 6"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#5C5749"
        fontSize={label}
        fontWeight="700"
        style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
      >
        N/A
      </text>
    </svg>
  );
}

/** Horizontal sub-bar for one pillar. Handles null + inverted display. */
function PillarBar({ pillar }: { pillar: InvestabilityPillar }) {
  const value = pillar.value;
  const isMissing = value === null;
  const pct = isMissing ? 0 : Math.max(0, Math.min(100, value));
  const barColor = isMissing
    ? 'rgba(127,138,154,0.30)'
    : pct >= 70
      ? '#22C55E'
      : pct >= 50
        ? '#D4A853'
        : pct >= 30
          ? '#F59E0B'
          : '#EF4444';

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-[11.5px] text-[#F5E8C7] font-semibold">
          {pillar.label}
          <span className="text-[10px] text-[#5C5749] font-normal">({pillar.weight_pct}%)</span>
        </div>
        <div className="text-[12px] font-bold" style={{ color: isMissing ? '#5C5749' : barColor }}>
          {isMissing ? '—' : `${value}`}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-[rgba(212,168,83,0.08)] overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      {pillar.reason && (
        <div className="text-[10.5px] text-[#7A7363] mt-1 leading-relaxed italic">
          {pillar.reason}
        </div>
      )}
    </div>
  );
}

interface Props {
  score: InvestabilityScore | null | undefined;
  loading?: boolean;
  size?: Size;
  /** When true, renders the pillar drill-down inline. When false, an expandable disclosure. */
  drilldown?: 'inline' | 'collapsed' | 'hidden';
}

export function InvestabilityRing({
  score,
  loading,
  size = 'md',
  drilldown = 'collapsed',
}: Props) {
  const [open, setOpen] = useState(drilldown === 'inline');

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="rounded-full bg-[rgba(212,168,83,0.08)] animate-pulse"
          style={{ width: SIZE_CONFIG[size].dim, height: SIZE_CONFIG[size].dim }}
        />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-24 rounded bg-[rgba(212,168,83,0.10)] animate-pulse" />
          <div className="h-2 w-32 rounded bg-[rgba(212,168,83,0.06)] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="text-[11px] text-[#5C5749] italic">Score unavailable.</div>
    );
  }

  const isWithheld = score.composite === null;
  const refreshDate = new Date(score.refresh_due);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3.5">
        {isWithheld ? (
          <UnavailableRing size={size} />
        ) : (
          <Ring score={score.composite as number} band={score.band} size={size} />
        )}

        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-0.5">
            % Investable Score
          </div>
          {isWithheld ? (
            <div className="text-[12px] text-[#FCA5A5] leading-snug flex items-start gap-1.5">
              <WarningOctagon size={13} weight="fill" className="shrink-0 mt-0.5" />
              <span>{score.reason_withheld}</span>
            </div>
          ) : (
            <>
              <div className="text-[12.5px] text-[#7A7363] leading-snug">
                Composite of 5 weighted factors. Source as of{' '}
                {new Date(score.source_timestamp).toLocaleDateString()}; refresh due{' '}
                {refreshDate.toLocaleDateString()}.
              </div>
            </>
          )}

          {drilldown === 'collapsed' && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-[#D4A853] hover:text-[#E8C97A] font-semibold"
            >
              {open ? 'Hide breakdown' : 'See factor breakdown'}
              {open ? <CaretUp size={11} weight="bold" /> : <CaretDown size={11} weight="bold" />}
            </button>
          )}
        </div>
      </div>

      {/* Drill-down */}
      {drilldown !== 'hidden' && (open || drilldown === 'inline') && (
        <div className="mt-3 rounded-xl border border-[rgba(212,168,83,0.14)] bg-[rgba(212,168,83,0.03)] px-3.5 pt-1 pb-2">
          <div className="divide-y divide-[rgba(212,168,83,0.07)]">
            {score.pillars.map((p) => (
              <PillarBar key={p.id} pillar={p} />
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-[rgba(212,168,83,0.10)] flex items-start gap-1.5 text-[10.5px] text-[#5C5749] italic leading-relaxed">
            <Info size={11} weight="bold" className="shrink-0 mt-0.5 text-[#D4A853]" />
            <span>{score.methodology_note}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestabilityRing;
