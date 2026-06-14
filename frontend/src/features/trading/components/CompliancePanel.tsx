/**
 * CompliancePanel — the HERO block of the stock-detail page.
 *
 * Per EIM_V2_PLAN/08_TRADING_TERMINAL_DESIGN.md, the Shariah-compliance panel
 * sits ABOVE fundamentals — it's the unique value no broker app has. Shows the
 * per-standard pass/fail, the screening ratios, and when it was last screened.
 */

import { CheckCircle, XCircle } from '@phosphor-icons/react';
import {
  COMPLIANCE_STANDARDS,
  STANDARD_META,
  passesStandard,
  type Stock,
} from '../types/trading.types';

function Ratio({ label, value, capNote }: { label: string; value: number; capNote: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-[#7A7363]">{label}</span>
      <span className="text-[11px] font-semibold text-[#F5E8C7] tabular-nums">
        {value}% <span className="text-[#5C5749] font-normal">· {capNote}</span>
      </span>
    </div>
  );
}

export function CompliancePanel({ stock }: { stock: Stock }) {
  return (
    <div className="rounded-2xl border border-[rgba(123,179,154,0.30)] bg-gradient-to-b from-[rgba(123,179,154,0.06)] to-[rgba(16,26,42,0.2)] p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#7BB39A] font-semibold mb-3">
        Shariah Compliance
      </div>

      {/* Per-standard verdict */}
      <div className="flex flex-wrap gap-2 mb-3">
        {COMPLIANCE_STANDARDS.map((standard) => {
          const ok = passesStandard(stock, standard);
          return (
            <div
              key={standard}
              className={
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border ' +
                (ok
                  ? 'bg-[rgba(123,179,154,0.12)] text-[#7BB39A] border-[rgba(123,179,154,0.30)]'
                  : 'bg-[rgba(232,67,147,0.08)] text-[#E84393] border-[rgba(232,67,147,0.22)]')
              }
              title={STANDARD_META[standard].note}
            >
              {ok ? <CheckCircle size={13} weight="fill" /> : <XCircle size={13} weight="fill" />}
              {STANDARD_META[standard].label}
              <span className="opacity-60 font-normal">{STANDARD_META[standard].thresholdPct}%</span>
            </div>
          );
        })}
      </div>

      {/* Screening ratios */}
      <div className="rounded-xl bg-[rgba(255,255,255,0.02)] px-3 py-1.5 mb-2">
        <Ratio label="Interest-bearing debt / mkt cap" value={stock.ratios.debtToMarketCapPct} capNote="debt screen" />
        <Ratio label="Cash + interest securities / mkt cap" value={stock.ratios.cashAndInterestSecPct} capNote="liquidity screen" />
        <Ratio label="Non-compliant income / revenue" value={stock.ratios.nonCompliantIncomePct} capNote="cap 5%" />
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#5C5749]">
        <span>Last screened {stock.lastScreened}</span>
        <span>Screened to AAOIFI / DJIM / TASIS criteria</span>
      </div>
    </div>
  );
}
