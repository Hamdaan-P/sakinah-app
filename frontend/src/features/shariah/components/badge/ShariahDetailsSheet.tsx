/**
 * Bottom-sheet modal showing full Shariah compliance details for a stock.
 * Verbatim — no behavior changes.
 */

import { motion } from 'framer-motion';
import {
  X, Info, Shield, ShieldCheck, ShieldWarning, ArrowsClockwise,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { getActiveStandard, getStandardInfo } from '../../services/shariahService';
import { getComplianceReason } from '../../types/shariahData';
import type { ShariahData } from '../../types/shariahData';
import { FullScreeningView } from './FullScreeningView';
import { LegacyScreeningView } from './LegacyScreeningView';
import { formatDate } from './_primitives';

export function ShariahDetailsSheet({
  symbol,
  data,
  onClose,
}: {
  symbol: string;
  data: ShariahData;
  onClose: () => void;
}) {
  const sr = data.screeningResult;
  const standard = sr?.standard ?? getActiveStandard();
  const standardInfo = getStandardInfo(standard);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[80vh] rounded-t-2xl bg-[#10151F] border-t border-[rgba(212,168,83,0.2)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 pb-0 flex items-center gap-3">
          {data.isCompliant
            ? <ShieldCheck size={32} weight="fill" className="text-emerald-400" />
            : <ShieldWarning size={32} weight="fill" className="text-red-400" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-[#F5E8C7]">{symbol}</p>
            <p className={cn('text-sm font-semibold', data.isCompliant ? 'text-emerald-400' : 'text-red-400')}>
              {data.isCompliant ? 'Shariah Compliant' : 'Non-Compliant'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-[#7B8DA0] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Standard indicator */}
        <div className="mx-5 mt-3 px-3 py-2 rounded-lg bg-[#0A0E16] flex items-center gap-2">
          <Shield size={16} className="text-[#D4A853]" />
          <span className="text-[11px] text-[#D4A853] font-semibold">{standardInfo.label}</span>
          <span className="text-[10px] text-[#7B8DA0] ml-1">{standardInfo.description}</span>
        </div>

        <div className="border-t border-[rgba(212,168,83,0.1)] my-3 mx-5" />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
          {sr ? (
            <FullScreeningView sr={sr} />
          ) : (
            <LegacyScreeningView data={data} />
          )}

          {/* Non-compliance reason summary */}
          {!data.isCompliant && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2">
              <Info size={18} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 leading-relaxed">{getComplianceReason(data)}</p>
            </div>
          )}

          {/* Purification for compliant stocks */}
          {data.isCompliant && sr?.purification && sr.purification.interestIncomePerSharePerDay > 0 && (
            <div className="p-3 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/30">
              <div className="flex items-center gap-2 mb-2">
                <ArrowsClockwise size={16} className="text-[#D4A853]" />
                <span className="text-xs font-bold text-[#D4A853]">Purification Required</span>
              </div>
              <p className="text-[11px] text-[#B8C4D4] leading-relaxed">
                Interest income must be purged (donated to charity).
              </p>
              <p className="text-[11px] text-[#F5E8C7] mt-1 font-mono">
                {sr.purification.formula}
              </p>
              {sr.purification.purificationPerDividend > 0 && (
                <p className="text-[11px] text-[#B8C4D4] mt-1">
                  Per dividend purification: <span className="text-[#F5E8C7] font-semibold">
                    {sr.purification.purificationPerDividend.toFixed(4)}
                  </span> per share
                </p>
              )}
            </div>
          )}

          {data.lastUpdated && (
            <p className="text-[10px] text-[#7B8DA0]">
              Last updated: {formatDate(data.lastUpdated)}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
