/**
 * Live nisab card — today's gold/silver spot prices + computed nisab in USD.
 *
 * Why this exists: nisab (the zakat threshold) is a moving number because it's
 * defined in grams of gold/silver, not dollars. Most apps quote a stale number.
 * We pull live spot and recompute every render — small but pedagogically
 * meaningful.
 *
 * Convention (AAOIFI / Hanafi consensus): the LOWER of the two USD thresholds
 * is operative, because the more inclusive threshold preserves the rights of
 * the poor (more wealth-holders fall above it, so more zakat reaches them).
 */

import { useQuery } from '@tanstack/react-query';
import { Coin } from '@phosphor-icons/react';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import { eimService } from '../services/eim.service';

export function NisabCard() {
  // Spot prices + nisab come from the backend in USD; render them in the
  // user's chosen display currency (falls back to native USD until FX loads).
  const { format } = useCurrencyFormat();
  const { data, isLoading, error } = useQuery({
    queryKey: ['eim', 'metals'],
    queryFn: eimService.getMetalsSpot,
    staleTime: 10 * 60_000,
  });

  if (error || (!isLoading && !data)) return null;

  const gold = data?.gold;
  const silver = data?.silver;
  const nisab = data?.nisab;
  const ready = !!(nisab && nisab.operative_usd > 0);

  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.20)] bg-gradient-to-br from-[rgba(212,168,83,0.08)] to-[rgba(123,158,137,0.04)] p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Coin size={16} weight="bold" className="text-[#D4A853]" />
        <div className="text-[11px] uppercase tracking-widest text-[#D4A853] font-semibold">
          Today's Nisab (live)
        </div>
      </div>

      {isLoading || !ready ? (
        <div className="text-[12px] text-[#5C5749] italic">
          {isLoading ? 'Fetching spot prices…' : 'Spot prices unavailable — try again later.'}
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-bold text-[#F5E8C7]">
              {format(nisab.operative_usd, 'USD', { maxDecimals: 0 })}
            </span>
            <span className="text-[10px] text-[#5C5749]">
              ({nisab.operative_basis}-basis)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
            <div className="rounded-lg border border-[rgba(212,168,83,0.10)] bg-[#101a2a] p-2.5">
              <div className="text-[9px] uppercase text-[#5C5749] mb-0.5">Gold</div>
              <div className="text-[#F5E8C7] font-semibold">
                {format(gold!.per_troy_oz_usd, 'USD', { maxDecimals: 0 })}/oz
              </div>
              <div className="text-[10px] text-[#7A7363]">
                Nisab: {format(nisab.gold_usd, 'USD', { maxDecimals: 0 })}
                <span className="text-[#5C5749]"> ({nisab.gold_grams}g)</span>
              </div>
            </div>
            <div className="rounded-lg border border-[rgba(212,168,83,0.10)] bg-[#101a2a] p-2.5">
              <div className="text-[9px] uppercase text-[#5C5749] mb-0.5">Silver</div>
              <div className="text-[#F5E8C7] font-semibold">
                {format(silver!.per_troy_oz_usd, 'USD', { maxDecimals: 2 })}/oz
              </div>
              <div className="text-[10px] text-[#7A7363]">
                Nisab: {format(nisab.silver_usd, 'USD', { maxDecimals: 0 })}
                <span className="text-[#5C5749]"> ({nisab.silver_grams}g)</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[#5C5749] mt-3 italic leading-relaxed">
            {nisab.rationale}
          </p>
        </>
      )}
    </div>
  );
}
