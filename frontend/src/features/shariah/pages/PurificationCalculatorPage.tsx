/**
 * Purification Calculator Page
 * Standalone calculator for determining how much impure income to purge.
 *
 * Based on AAOIFI SS 21 (Financial Paper) & TASIS Ch. 6.9:
 * - TASIS method: Per share per day = (Interest Income × 10^6) / Shares Outstanding / 365
 * - AAOIFI method: Per dividend = Dividend × (Impure Revenue / Total Revenue)
 * - Investor purification = rate × shares owned × days held
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowsClockwise,
  Calculator,
  Info,
  Shield,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { trackFeature } from '@/lib/analytics';
import {
  calculatePurification,
  calculateInvestorPurification,
  getActiveStandard,
} from '../services/shariahService';
import type { CompanyFinancials } from '../types/shariahData';

export function PurificationCalculatorPage() {
  useEffect(() => { trackFeature('shariah-compliance'); }, []);
  const [mode, setMode] = useState<'company' | 'investor'>('investor');

  // Company-level inputs (for calculating the rate)
  const [interestIncome, setInterestIncome] = useState(340);
  const [totalIncome, setTotalIncome] = useState(59700);
  const [sharesOutstanding, setSharesOutstanding] = useState(3663);
  const [closingPrice, setClosingPrice] = useState(3842.50);
  const [dividendYield, setDividendYield] = useState(1.2);

  // Investor inputs
  const [sharesOwned, setSharesOwned] = useState(100);
  const [daysHeld, setDaysHeld] = useState(365);

  // Compute
  const companyFinancials: CompanyFinancials = {
    symbol: 'USER', name: 'User Input', industryGroup: '', mainProductService: '',
    latestAnnualReportYear: new Date().getFullYear(),
    totalAssets: 1, totalIncome, totalDebt: 0,
    interestIncome, interestBasedInvestments: 0,
    cashAndBankBalance: 0, accountsReceivables: 0,
    totalExpenses: 0, totalLiabilities: 0,
    sharesOutstanding, marketCap: 0,
    closingPrice, eps: 0, equityFaceValue: 0,
    dividendYield,
  };

  const purification = calculatePurification(companyFinancials);
  const investorAmount = calculateInvestorPurification(
    purification.interestIncomePerSharePerDay,
    sharesOwned,
    daysHeld,
  );
  const standard = getActiveStandard();

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  return (
    <div className="min-h-full relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#10151F] via-[#10151F] to-[#0A0E16] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-6 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center">
              <ArrowsClockwise size={20} className="text-[#0A0E16]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5E8C7]">Purification Calculator</h1>
              <p className="text-xs text-[#B8C4D4]">AAOIFI SS 21 / TASIS Purging Methodology</p>
            </div>
          </div>
        </motion.div>

        {/* Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20 mb-5"
        >
          <div className="flex items-start gap-2">
            <Info size={16} className="text-[#D4A853] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-[#F5E8C7] font-semibold mb-1">What is Purification?</p>
              <p className="text-[11px] text-[#B8C4D4] leading-relaxed">
                Even Shariah-compliant companies may earn minor interest income (below the threshold).
                Per AAOIFI SS 21, investors must <strong className="text-[#F5E8C7]">purge</strong> their proportional share
                of this impure income by donating it to charity. This cannot be counted as sadaqah — it is an obligation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMode('investor')}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors',
              mode === 'investor' ? 'bg-[#D4A853] text-[#0A0E16]' : 'bg-[#0F141F] text-[#B8C4D4] border border-[#3A4D65]',
            )}
          >
            Investor Calculator
          </button>
          <button
            onClick={() => setMode('company')}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors',
              mode === 'company' ? 'bg-[#D4A853] text-[#0A0E16]' : 'bg-[#0F141F] text-[#B8C4D4] border border-[#3A4D65]',
            )}
          >
            Company Rate
          </button>
        </div>

        {/* Standard indicator */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0A0E16] border border-[#3A4D65] mb-5">
          <Shield size={14} className="text-[#D4A853]" />
          <span className="text-[10px] text-[#D4A853] font-semibold">Active: {standard}</span>
        </div>

        {/* Company-level inputs */}
        {mode === 'company' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mb-5">
            <h3 className="text-sm font-semibold text-[#F5E8C7]">Company Financial Data</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Interest Income (Cr)" value={interestIncome} onChange={setInterestIncome} />
              <Field label="Total Income (Cr)" value={totalIncome} onChange={setTotalIncome} />
              <Field label="Shares Outstanding (M)" value={sharesOutstanding} onChange={setSharesOutstanding} />
              <Field label="Closing Price" value={closingPrice} onChange={setClosingPrice} prefix="$" />
              <Field label="Dividend Yield %" value={dividendYield} onChange={setDividendYield} />
            </div>
          </motion.div>
        )}

        {/* Investor inputs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mb-5">
          <h3 className="text-sm font-semibold text-[#F5E8C7]">
            {mode === 'investor' ? 'Your Investment' : 'Investor Details'}
          </h3>
          {mode === 'investor' && (
            <p className="text-[10px] text-[#7B8DA0]">
              Enter the company's interest income data to calculate your purification amount.
            </p>
          )}
          {mode === 'investor' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Interest Income (Cr)" value={interestIncome} onChange={setInterestIncome} />
              <Field label="Total Income (Cr)" value={totalIncome} onChange={setTotalIncome} />
              <Field label="Shares Outstanding (M)" value={sharesOutstanding} onChange={setSharesOutstanding} />
              <Field label="Closing Price" value={closingPrice} onChange={setClosingPrice} prefix="$" />
              <Field label="Dividend Yield %" value={dividendYield} onChange={setDividendYield} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Shares You Own" value={sharesOwned} onChange={setSharesOwned} />
            <Field label="Days Held" value={daysHeld} onChange={setDaysHeld} />
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-xl bg-gradient-to-br from-[#0F141F] to-[#0A0E16] border border-[#D4A853]/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={18} className="text-[#D4A853]" />
            <h3 className="text-base font-bold text-[#D4A853]">Purification Results</h3>
          </div>

          <div className="space-y-3">
            {/* TASIS method */}
            <div className="p-3 rounded-xl bg-[#10151F] border border-[#3A4D65]">
              <p className="text-[10px] text-[#7B8DA0] uppercase tracking-wide mb-1">TASIS Method (Per Share Per Day)</p>
              <p className="text-lg font-bold text-[#F5E8C7] font-mono">
                ${fmt(purification.interestIncomePerSharePerDay)}
              </p>
              <p className="text-[10px] text-[#7B8DA0] mt-1 font-mono">{purification.formula}</p>
            </div>

            {/* AAOIFI method */}
            {purification.purificationPerDividend > 0 && (
              <div className="p-3 rounded-xl bg-[#10151F] border border-[#3A4D65]">
                <p className="text-[10px] text-[#7B8DA0] uppercase tracking-wide mb-1">AAOIFI Method (Per Dividend)</p>
                <p className="text-lg font-bold text-[#F5E8C7] font-mono">
                  ${fmt(purification.purificationPerDividend)}
                </p>
                <p className="text-[10px] text-[#7B8DA0] mt-1">
                  Impure income ratio: {(purification.impureIncomeRatio * 100).toFixed(2)}% of revenue
                </p>
              </div>
            )}

            {/* Investor amount */}
            <div className="p-4 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/30">
              <p className="text-[10px] text-[#D4A853] uppercase tracking-wide mb-1">
                Your Purification Amount
              </p>
              <p className="text-2xl font-bold text-[#D4A853] font-mono">
                ${fmt(investorAmount)}
              </p>
              <p className="text-[10px] text-[#7B8DA0] mt-1">
                = ${fmt(purification.interestIncomePerSharePerDay)} × {sharesOwned} shares × {daysHeld} days
              </p>
              <p className="text-[10px] text-[#B8C4D4] mt-2">
                This amount must be donated to charity. It cannot be counted as sadaqah or personal benefit.
              </p>
            </div>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-5 p-4 rounded-xl bg-[#0F141F] border border-[#3A4D65]"
        >
          <h3 className="text-sm font-semibold text-[#F5E8C7] mb-3">How Purification Works</h3>
          <div className="space-y-3 text-[11px] text-[#B8C4D4] leading-relaxed">
            <div>
              <p className="text-[#D4A853] font-semibold mb-1">TASIS Method (Indian Market)</p>
              <p>Interest Income Per Share Per Day = (Total Interest Income × 10⁶) ÷ Shares Outstanding ÷ 365</p>
              <p className="mt-1">Your purification = Rate × Shares Owned × Days Held</p>
            </div>
            <div>
              <p className="text-[#D4A853] font-semibold mb-1">AAOIFI / S&P Method (Global)</p>
              <p>Impure Income Ratio = Non-Permissible Revenue ÷ Total Revenue</p>
              <p className="mt-1">Purification Per Dividend = Dividend Per Share × Impure Income Ratio</p>
            </div>
            <div>
              <p className="text-[#D4A853] font-semibold mb-1">Recipients</p>
              <p>Purified amounts should be donated to the poor and needy, Islamic charitable organizations, or public welfare projects. They cannot be used for personal benefit or counted as voluntary charity (sadaqah).</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ==================== Sub-components ====================

function Field({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
}) {
  return (
    <div>
      <label className="text-[10px] text-[#7B8DA0] mb-1 block">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#7B8DA0]">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          className={cn(
            'w-full py-2.5 rounded-xl text-sm text-[#F5E8C7] bg-[#0A0E16] border border-[#3A4D65]',
            'focus:border-[#D4A853]/50 focus:outline-none placeholder:text-[#7B8DA0]/50',
            prefix ? 'pl-7 pr-3' : 'px-3',
          )}
        />
      </div>
    </div>
  );
}

export default PurificationCalculatorPage;
