/**
 * Result summary card shown after calculating zakat.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ZakatInput, ZakatResult } from '../../types/zakatCalculation';
import { GOLD_NISAB_GRAMS, SILVER_NISAB_GRAMS } from '../../types/zakatCalculation';
import { ResultRow } from './_primitives';

interface ZakatResultCardProps {
  input: ZakatInput;
  result: ZakatResult;
  fmt: (n: number) => string;
}

export function ZakatResultCard({ input, result, fmt }: ZakatResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-5 rounded-xl border bg-gradient-to-br from-[#10151F]/90 to-[#10151F]/70 border-[#D4A853]/30"
    >
      <h3 className="text-lg font-bold text-[#D4A853] mb-4">Zakat Summary</h3>

      <div className="space-y-2.5">
        <ResultRow label="Total Gold Value" value={fmt(result.totalGoldValue)} />
        <ResultRow label="Total Silver Value" value={fmt(result.totalSilverValue)} />
        {result.jewelryIncluded && (
          <p className="text-[10px] text-[#7B8DA0] ml-1">Includes personal jewelry (Hanafi ruling)</p>
        )}
        {!result.jewelryIncluded && input.goldJewelryPersonal + input.silverJewelryPersonal > 0 && (
          <p className="text-[10px] text-[#7B8DA0] ml-1">Personal jewelry excluded (Shafi&apos;i ruling)</p>
        )}
        <ResultRow label="Total Cash & Savings" value={fmt(result.totalCash)} />
        {result.totalStockZakat > 0 && (
          <>
            <ResultRow label="Stock Zakatable Value" value={fmt(result.totalStockZakat)} />
            <p className="text-[10px] text-[#7B8DA0] ml-1">{result.stockZakatMethod}</p>
          </>
        )}
        <ResultRow label="Total Business Assets" value={fmt(result.totalBusinessAssets)} />
        <div className="border-t border-[rgba(212,168,83,0.2)] my-2" />
        <ResultRow label="Total Assets" value={fmt(result.totalAssets)} highlight />
        <ResultRow label="Total Liabilities" value={`- ${fmt(result.totalLiabilities)}`} negative />
        <div className="border-t border-[rgba(212,168,83,0.2)] my-2" />
        <ResultRow label="Net Zakatable Amount" value={fmt(result.netZakatableAmount)} highlight />
        <ResultRow label={`Nisab (${SILVER_NISAB_GRAMS}g silver / ${GOLD_NISAB_GRAMS}g gold)`} value={fmt(result.nisabThreshold)} />
      </div>

      {/* Eligibility */}
      <div className={cn(
        'mt-4 p-4 rounded-xl border text-center',
        result.isZakatDue
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-[#7A7363]/10 border-[#7A7363]/30',
      )}>
        <p className={cn('text-sm font-bold', result.isZakatDue ? 'text-emerald-400' : 'text-[#C9C0A8]')}>
          {result.isZakatDue ? 'Zakat is Due' : 'Zakat is Not Due'}
        </p>
        {result.isZakatDue && (
          <>
            <p className="text-2xl font-bold text-[#D4A853] mt-2">{fmt(result.zakatAmount)}</p>
            {input.previousUnpaidZakat > 0 && (
              <p className="text-xs text-[#C9C0A8] mt-1">
                + {fmt(input.previousUnpaidZakat)} unpaid = <span className="font-bold text-[#D4A853]">{fmt(result.totalZakatDue)}</span> total
              </p>
            )}
          </>
        )}
        {!result.isZakatDue && result.meetsNisab && (
          <p className="text-xs text-amber-400 mt-1">
            Your assets exceed nisab, but you haven&apos;t confirmed that one lunar year (hawl) has passed. Check the hawl box above if applicable.
          </p>
        )}
        {!result.isZakatDue && !result.meetsNisab && (
          <p className="text-xs text-[#7A7363] mt-1">
            Your net assets ({fmt(result.netZakatableAmount)}) are below the nisab threshold ({fmt(result.nisabThreshold)})
          </p>
        )}
      </div>

      {/* Donation Options */}
      {result.isZakatDue && (
        <div className="mt-4">
          <p className="text-xs text-[#7A7363] mb-2">Donate your Zakat</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'Local Mosque', icon: '🕌' },
              { name: 'Islamic Relief', icon: '🤝' },
              { name: 'Zakat Foundation', icon: '💎' },
              { name: 'Direct to Needy', icon: '❤️' },
            ].map((opt) => (
              <button
                key={opt.name}
                className="flex items-center gap-2 p-3 rounded-xl border border-[rgba(212,168,83,0.2)] bg-[#10151F]/50 hover:border-[#D4A853]/40 transition-colors text-left"
              >
                <span className="text-lg">{opt.icon}</span>
                <div>
                  <p className="text-xs font-medium text-[#F5E8C7]">{opt.name}</p>
                  <p className="text-[10px] text-[#7A7363]">{fmt(result.zakatAmount)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
