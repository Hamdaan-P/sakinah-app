/**
 * Time-travel panel — "What if I'd held this portfolio X years ago?"
 *
 * Educational sim: takes the current portfolio composition (ticker + qty)
 * and prices it at a historical date via the backend's yfinance history pull,
 * then shows the hypothetical performance.
 *
 * Per §9: no shorter intervals than 6 months. Anti-daily framing.
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ClockCounterClockwise, ArrowsClockwise } from '@phosphor-icons/react';
import { eimService, type TimeTravelHorizon, type TimeTravelResult } from '../services/eim.service';
import type { Portfolio } from '../types/eim.types';

const HORIZONS: { id: TimeTravelHorizon; label: string }[] = [
  { id: '6mo', label: '6 mo' },
  { id: '1yr', label: '1 yr' },
  { id: '3yr', label: '3 yr' },
  { id: '5yr', label: '5 yr' },
  { id: '10yr', label: '10 yr' },
];

export function TimeTravelPanel({ portfolio }: { portfolio: Portfolio }) {
  const [selected, setSelected] = useState<TimeTravelHorizon | null>(null);

  const mutation = useMutation<TimeTravelResult, Error, TimeTravelHorizon>({
    mutationFn: (h) => eimService.timeTravel(portfolio, h),
  });

  if (portfolio.positions.length === 0) return null;

  const result = mutation.data;
  const isLoading = mutation.isPending;

  return (
    <div className="rounded-2xl border border-[rgba(79,184,146,0.20)] bg-gradient-to-br from-[rgba(79,184,146,0.06)] to-[rgba(123,158,137,0.04)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <ClockCounterClockwise size={16} weight="bold" className="text-[#4FB892]" />
        <div className="text-[11px] uppercase tracking-widest text-[#4FB892] font-semibold">
          Time travel — what if you'd held this since…
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {HORIZONS.map((h) => {
          const isSelected = selected === h.id;
          return (
            <button
              key={h.id}
              onClick={() => {
                setSelected(h.id);
                mutation.mutate(h.id);
              }}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                isSelected
                  ? 'bg-[rgba(79,184,146,0.18)] border-[#4FB892] text-[#4FB892]'
                  : 'bg-[#101a2a] border-[rgba(79,184,146,0.15)] text-[#7A7363] hover:border-[rgba(79,184,146,0.35)]'
              } disabled:opacity-40`}
            >
              {h.label}
            </button>
          );
        })}
        {isLoading && (
          <span className="text-[10px] text-[#5C5749] italic flex items-center gap-1.5 ml-1">
            <ArrowsClockwise size={11} weight="bold" className="animate-spin" />
            fetching history…
          </span>
        )}
      </div>

      {mutation.error && (
        <p className="text-[11px] text-[#E84393] mb-2">
          Couldn't fetch historical data: {mutation.error.message}
        </p>
      )}

      {result && (
        <div className="rounded-xl border border-[rgba(79,184,146,0.12)] bg-[#0F1724] p-3.5">
          <div className="flex items-baseline justify-between gap-2 mb-2.5">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#5C5749]">
                Started {result.start_date}
              </div>
              <div className="text-[20px] font-bold mt-0.5">
                <span
                  className={result.total_change_pct >= 0 ? 'text-[#22C55E]' : 'text-[#E84393]'}
                >
                  {result.total_change_pct >= 0 ? '▲' : '▼'}{' '}
                  {Math.abs(result.total_change_pct).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#5C5749]">
                Then ${result.historical_total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[13px] text-[#F5E8C7] font-semibold">
                Now ${result.current_total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2.5 border-t border-[rgba(79,184,146,0.10)]">
            {result.positions.map((p) => (
              <div
                key={p.ticker}
                className="flex items-center justify-between gap-3 text-[11px]"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[#F5E8C7] font-semibold">{p.ticker}</span>
                  {p.note ? (
                    <span className="text-[10px] text-[#5C5749] italic ml-2">{p.note}</span>
                  ) : (
                    <span className="text-[#5C5749] ml-2">
                      ${p.historical_price.toFixed(2)} → ${p.current_price.toFixed(2)}
                    </span>
                  )}
                </div>
                {!p.note && (
                  <span
                    className={p.change_pct >= 0 ? 'text-[#22C55E]' : 'text-[#E84393]'}
                  >
                    {p.change_pct >= 0 ? '+' : ''}
                    {p.change_pct.toFixed(1)}%
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="text-[10px] text-[#5C5749] mt-3 italic leading-relaxed">
            Hypothetical only — assumes you held the same qty of each position throughout.
            Past performance is not a forecast of future returns.
          </p>
        </div>
      )}
    </div>
  );
}
