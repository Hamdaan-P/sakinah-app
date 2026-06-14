/**
 * Bottom-sheet modal showing live Shariah screening details for a stock.
 */

import { motion } from 'framer-motion';
import {
  ArrowsClockwise, Buildings, CurrencyDollar, Info, Pulse, Shield, ShieldCheck,
  ShieldWarning, TrendDown, TrendUp, X,
} from '@phosphor-icons/react';
import type { LiveStockData } from './_cache';
import { ScreeningStage, CriteriaRow } from './_screeningPrimitives';

export function LiveStockDetailSheet({ stock, onClose }: { stock: LiveStockData; onClose: () => void }) {
  const screen = stock.backendScreen!;
  const isCompliant = screen.is_compliant;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#10151F] rounded-t-3xl max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#10151F] px-5 pt-4 pb-3 border-b border-[#3A4D65]/50 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[#F5E8C7] font-bold text-lg">{screen.symbol}</h2>
              {isCompliant
                ? <ShieldCheck size={18} weight="fill" className="text-emerald-400" />
                : <ShieldWarning size={18} weight="fill" className="text-red-400" />
              }
            </div>
            <p className="text-[#7B8DA0] text-xs">{screen.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10">
            <X size={20} className="text-[#7B8DA0]" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Price */}
          <div>
            <p className="text-3xl font-bold text-[#F5E8C7]">${stock.price.toFixed(2)}</p>
            <p className={`text-sm flex items-center gap-1 ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stock.change >= 0 ? <TrendUp size={16} /> : <TrendDown size={16} />}
              {stock.change >= 0 ? '+' : ''}{stock.changePct.toFixed(2)}%
            </p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Buildings, label: 'Sector', value: screen.sector || screen.industry || '—' },
              { icon: CurrencyDollar, label: 'Market Cap', value: stock.marketCapLabel },
              { icon: Pulse, label: 'Volume', value: stock.volume },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-[#0A0E16] text-center">
                <item.icon size={16} className="text-[#D4A853] mx-auto mb-1" />
                <p className="text-[#F5E8C7] text-xs font-semibold">{item.value}</p>
                <p className="text-[#7B8DA0] text-[10px]">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Standard badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0A0E16]">
            <Shield size={14} className="text-[#D4A853]" />
            <span className="text-[11px] text-[#D4A853] font-semibold">{screen.standard} Standard</span>
          </div>

          {/* Stage 2: Business Screening */}
          <ScreeningStage
            number={2}
            title="Business Screening"
            subtitle="Halal/Haram activity"
            passed={screen.business_screen_passed}
          >
            <CriteriaRow
              label="Primary Business"
              desc={screen.business_reason || 'Business activity check'}
              passed={screen.business_screen_passed}
              value={screen.industry || screen.sector || '—'}
            />
          </ScreeningStage>

          {/* Stage 3: Financial Screening */}
          <ScreeningStage
            number={3}
            title="Financial Screening"
            subtitle={`3 ratio tests (${screen.standard})`}
            passed={screen.debt_ratio.passed && screen.interest_ratio.passed && screen.receivables_ratio.passed}
          >
            <CriteriaRow
              label="Debt / Total Assets"
              desc="Limit: ≤ 30%"
              passed={screen.debt_ratio.passed}
              value={screen.debt_ratio.percent_str}
            />
            <CriteriaRow
              label="Interest Income Ratio"
              desc="Limit: ≤ 5%"
              passed={screen.interest_ratio.passed}
              value={screen.interest_ratio.percent_str}
            />
            <CriteriaRow
              label="Cash + Receivables / Assets"
              desc="Limit: ≤ 70%"
              passed={screen.receivables_ratio.passed}
              value={screen.receivables_ratio.percent_str}
            />
          </ScreeningStage>

          {/* Overall Verdict */}
          <div className={`p-4 rounded-xl border ${isCompliant ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              {isCompliant
                ? <ShieldCheck size={20} weight="fill" className="text-emerald-400" />
                : <ShieldWarning size={20} weight="fill" className="text-red-400" />
              }
              <span className={`font-bold text-sm ${isCompliant ? 'text-emerald-400' : 'text-red-400'}`}>
                {isCompliant ? 'Shariah Compliant' : 'Non-Compliant'}
              </span>
            </div>
            {!isCompliant && screen.issues.length > 0 && (
              <div className="mt-2 space-y-1">
                {screen.issues.map((issue, i) => (
                  <p key={i} className="text-xs text-red-400/80 flex items-start gap-1.5">
                    <Info size={12} className="shrink-0 mt-0.5" />
                    {issue}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Warnings */}
          {screen.warnings && screen.warnings.length > 0 && (
            <div className="p-3 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20">
              <p className="text-[11px] text-[#D4A853] font-semibold mb-1">Warnings</p>
              {screen.warnings.map((w, i) => (
                <p key={i} className="text-[11px] text-[#B8C4D4]">{w}</p>
              ))}
            </div>
          )}

          {/* Purification (for compliant stocks) */}
          {isCompliant && screen.purification_per_share_per_day > 0 && (
            <div className="p-4 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/30">
              <div className="flex items-center gap-2 mb-2">
                <ArrowsClockwise size={18} className="text-[#D4A853]" />
                <span className="text-sm font-bold text-[#D4A853]">Purification / Purging</span>
              </div>
              <p className="text-[11px] text-[#B8C4D4] leading-relaxed mb-2">
                Even compliant stocks may have minor interest income that must be purged (donated to charity).
              </p>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#7B8DA0]">Per share per day:</span>
                  <span className="text-[#F5E8C7] font-mono font-semibold">
                    ${screen.purification_per_share_per_day.toFixed(4)}
                  </span>
                </div>
                {screen.purification_per_dividend > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#7B8DA0]">Per dividend:</span>
                    <span className="text-[#F5E8C7] font-mono font-semibold">
                      ${screen.purification_per_dividend.toFixed(4)}
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-[#7B8DA0] mt-1">
                  Example: 100 shares held for 365 days = ${(screen.purification_per_share_per_day * 100 * 365).toFixed(2)} to donate
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
