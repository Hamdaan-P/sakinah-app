/**
 * Honest-disclosure strip for snapshot data quality.
 *
 * Lights up only when the backend's `data_quality.severity` is `caution`
 * or `risky` — top-tier tickers never see it, so this stays out of the
 * way for the normal case.
 *
 * Tone-neutral by design. No "we don't recommend", no "are you sure?".
 * Just labels the facts so the user knows the data they're looking at
 * is thin. The AI Mentor (persona layer) is where opinion lives.
 */

import { useState } from 'react';
import { CaretDown, Info, WarningCircle } from '@phosphor-icons/react';
import type { DataQuality } from '../types/eim.types';

export function DataQualityStrip({ dq, compact = false }: { dq: DataQuality | undefined; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!dq || dq.severity === 'none' || dq.flags.length === 0) return null;

  const risky = dq.severity === 'risky';
  const colors = risky
    ? {
        border: 'rgba(232,67,147,0.35)',
        bg: 'rgba(232,67,147,0.08)',
        ink: '#E84393',
        chevron: '#FFC2D6',
      }
    : {
        border: 'rgba(212,168,83,0.30)',
        bg: 'rgba(212,168,83,0.06)',
        ink: '#D4A853',
        chevron: '#F5E8C7',
      };

  const headline = risky
    ? 'Use caution — this stock has limited or risky data'
    : 'Limited data on this stock';

  return (
    <div
      className={[
        'rounded-xl border text-[11px]',
        compact ? 'p-2' : 'p-3',
      ].join(' ')}
      style={{ borderColor: colors.border, background: colors.bg }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 text-left"
        aria-expanded={open}
      >
        {risky ? (
          <WarningCircle size={14} weight="fill" color={colors.ink} />
        ) : (
          <Info size={14} weight="fill" color={colors.ink} />
        )}
        <span className="font-semibold flex-1 truncate" style={{ color: colors.ink }}>
          {headline}
        </span>
        <span className="text-[10px]" style={{ color: colors.chevron }}>
          {dq.flags.length} signal{dq.flags.length === 1 ? '' : 's'}
        </span>
        <CaretDown
          size={12}
          weight="bold"
          color={colors.chevron}
          className={open ? 'rotate-180 transition-transform' : 'transition-transform'}
        />
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5 pl-1">
          {dq.flags.map((f) => (
            <li
              key={f.id}
              className="leading-snug"
              style={{ color: f.severity === 'risky' ? '#FFC2D6' : '#F5E8C7' }}
            >
              <span className="opacity-60 mr-1.5">·</span>
              {f.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DataQualityStrip;
