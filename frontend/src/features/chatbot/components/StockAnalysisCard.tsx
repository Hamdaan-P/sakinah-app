/**
 * StockAnalysisCard
 * Rich inline card for 4-layer stock analysis results in chat.
 * Shows Shariah screening, fundamentals, technicals, and overall verdict.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldWarning,
  CaretDown,
  TrendUp,
  TrendDown,
  ChartBar,
  ChartLine,
  CheckCircle,
  XCircle,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type {
  StockAnalysisResult,
  ShariahScreenResult,
  FundamentalAnalysis,
  TechnicalAnalysis,
  RatioResult,
} from '../types/chatbot.types';

interface StockAnalysisCardProps {
  data: StockAnalysisResult;
}

export function StockAnalysisCard({ data }: StockAnalysisCardProps) {
  const isPositive = data.change >= 0;

  return (
    <div className="mt-3 rounded-xl bg-[#0A0E16] border border-[#3A4D65] overflow-hidden">
      {/* Header: Symbol + Price */}
      <div className="px-3 sm:px-4 py-3 bg-gradient-to-r from-[#0F141F] to-[#10151F] border-b border-[#3A4D65]/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-bold text-[#D4A853] bg-[#D4A853]/10 px-2 py-0.5 rounded shrink-0">
              {data.symbol}
            </span>
            <span className="text-xs text-[#B8C4D4] truncate">{data.name}</span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-[#F5E8C7]">${data.current_price?.toFixed(2) ?? 'N/A'}</p>
            <p className={cn('text-[11px] flex items-center justify-end gap-0.5', isPositive ? 'text-emerald-400' : 'text-red-400')}>
              {isPositive ? <TrendUp size={11} /> : <TrendDown size={11} />}
              {isPositive ? '+' : ''}{data.change_percent?.toFixed(2) ?? '0.00'}%
            </p>
          </div>
        </div>
      </div>

      {/* Layer Sections */}
      {data.shariah && <ShariahSection result={data.shariah} />}
      {data.fundamentals && <FundamentalsSection data={data.fundamentals} />}
      {data.technicals && <TechnicalsSection data={data.technicals} />}

      {/* Overall Verdict */}
      {data.overall_verdict && (
        <div className="px-3 sm:px-4 py-3 border-t border-[#3A4D65]/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#7B8DA0]">Overall Verdict</span>
            <VerdictBadge verdict={data.overall_verdict} />
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Shariah Section ====================

function ShariahSection({ result }: { result: ShariahScreenResult }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-[#3A4D65]/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 sm:px-4 py-2.5 flex items-center gap-1.5 sm:gap-2 hover:bg-white/[0.02] transition-colors"
      >
        {result.is_compliant
          ? <ShieldCheck size={16} weight="fill" className="text-emerald-400 shrink-0" />
          : <ShieldWarning size={16} weight="fill" className="text-red-400 shrink-0" />
        }
        <span className="text-xs font-semibold text-[#F5E8C7] shrink-0">Shariah Screening</span>
        <span className={cn('text-[10px] ml-auto shrink-0', result.is_compliant ? 'text-emerald-400' : 'text-red-400')}>
          {result.is_compliant ? 'Compliant' : 'Non-Compliant'}
        </span>
        <span className="text-[10px] text-[#7B8DA0] shrink-0">({result.standard})</span>
        <CaretDown size={12} className={cn('text-[#7B8DA0] transition-transform shrink-0', expanded && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-4 pb-3 space-y-1.5">
              {/* Business screen */}
              <RatioRow
                label="Business Activity"
                passed={result.business_screen_passed}
                value={result.business_screen_passed ? 'Halal' : result.business_reason}
              />
              {/* Financial ratios */}
              <ProgressRatioRow ratio={result.debt_ratio} />
              <ProgressRatioRow ratio={result.interest_ratio} />
              <ProgressRatioRow ratio={result.receivables_ratio} />

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="mt-1 px-2 py-1 rounded bg-[#D4A853]/10">
                  {result.warnings.map((w, i) => (
                    <p key={i} className="text-[10px] text-[#D4A853]">{w}</p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RatioRow({ label, passed, value }: { label: string; passed: boolean; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {passed
        ? <CheckCircle size={14} weight="fill" className="text-emerald-400 shrink-0" />
        : <XCircle size={14} weight="fill" className="text-red-400 shrink-0" />
      }
      <span className="text-[11px] text-[#B8C4D4] flex-1">{label}</span>
      <span className={cn('text-[11px] font-mono', passed ? 'text-emerald-400' : 'text-red-400')}>{value}</span>
    </div>
  );
}

function ProgressRatioRow({ ratio }: { ratio: RatioResult }) {
  const pct = ratio.value != null && ratio.limit ? Math.min((ratio.value / ratio.limit) * 100, 100) : 0;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        {ratio.passed
          ? <CheckCircle size={14} weight="fill" className="text-emerald-400 shrink-0" />
          : <XCircle size={14} weight="fill" className="text-red-400 shrink-0" />
        }
        <span className="text-[11px] text-[#B8C4D4] flex-1">{ratio.name}</span>
        <span className={cn('text-[11px] font-mono', ratio.passed ? 'text-emerald-400' : 'text-red-400')}>
          {ratio.percent_str}
        </span>
        <span className="text-[10px] text-[#7B8DA0]">/ {ratio.limit_str}</span>
      </div>
      <div className="ml-6 h-1.5 rounded-full bg-[#10151F] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', ratio.passed ? 'bg-emerald-500' : 'bg-red-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ==================== Fundamentals Section ====================

function FundamentalsSection({ data }: { data: FundamentalAnalysis }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-[#3A4D65]/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 sm:px-4 py-2.5 flex items-center gap-1.5 sm:gap-2 hover:bg-white/[0.02] transition-colors"
      >
        <ChartBar size={16} className="text-[#D4A853] shrink-0" />
        <span className="text-xs font-semibold text-[#F5E8C7] shrink-0">Fundamentals</span>
        <VerdictBadge verdict={data.verdict ?? 'N/A'} className="ml-auto" />
        <span className="text-[10px] text-[#7B8DA0] shrink-0 hidden sm:inline">{data.combined_score?.toFixed(0) ?? 'N/A'}/100</span>
        <CaretDown size={12} className={cn('text-[#7B8DA0] transition-transform shrink-0', expanded && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-4 pb-3 grid grid-cols-2 gap-1.5 sm:gap-2">
              {/* DCF */}
              <MetricBox
                label="DCF Value"
                value={data.dcf_intrinsic_value != null ? `$${data.dcf_intrinsic_value.toFixed(2)}` : 'N/A'}
                sub={data.dcf_upside_pct != null ? `${data.dcf_upside_pct > 0 ? '+' : ''}${data.dcf_upside_pct.toFixed(1)}% vs price` : undefined}
                highlight={data.dcf_upside_pct != null && data.dcf_upside_pct > 0}
              />
              {/* P/E */}
              <MetricBox
                label="P/E Ratio"
                value={data.trailing_pe != null ? data.trailing_pe.toFixed(1) : 'N/A'}
                sub={data.sector_avg_pe != null ? `Sector avg: ${data.sector_avg_pe}` : undefined}
                tag={data.pe_verdict ?? 'N/A'}
              />
              {/* ROE */}
              <MetricBox
                label="ROE"
                value={data.roe != null ? `${data.roe.toFixed(1)}%` : 'N/A'}
                tag={data.roe_verdict ?? 'N/A'}
              />
              {/* EPS Growth */}
              <MetricBox
                label="EPS Growth"
                value={data.eps_growth_cagr != null ? `${data.eps_growth_cagr.toFixed(1)}% CAGR` : 'N/A'}
                tag={data.eps_verdict ?? 'N/A'}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== Technicals Section ====================

function TechnicalsSection({ data }: { data: TechnicalAnalysis }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-[#3A4D65]/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 sm:px-4 py-2.5 flex items-center gap-1.5 sm:gap-2 hover:bg-white/[0.02] transition-colors"
      >
        <ChartLine size={16} className="text-[#D4A853] shrink-0" />
        <span className="text-xs font-semibold text-[#F5E8C7] shrink-0">Technicals</span>
        <VerdictBadge verdict={data.verdict ?? 'N/A'} className="ml-auto" />
        <span className="text-[10px] text-[#7B8DA0] shrink-0 hidden sm:inline">{data.combined_score?.toFixed(0) ?? 'N/A'}/100</span>
        <CaretDown size={12} className={cn('text-[#7B8DA0] transition-transform shrink-0', expanded && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-4 pb-3 space-y-2">
              {/* RSI Gauge */}
              <div className="flex flex-wrap items-center justify-between gap-y-1">
                <span className="text-[11px] text-[#B8C4D4]">RSI (14)</span>
                <div className="flex items-center gap-2">
                  {data.rsi_14 != null && (
                    <div className="w-16 sm:w-24 h-1.5 rounded-full bg-[#10151F] relative">
                      <div
                        className="absolute top-0 h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#D4A853] to-red-500"
                        style={{ width: '100%', opacity: 0.3 }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-[#D4A853]"
                        style={{ left: `${Math.min(data.rsi_14, 100)}%`, transform: 'translate(-50%, -50%)' }}
                      />
                    </div>
                  )}
                  <span className="text-[11px] font-mono text-[#F5E8C7]">
                    {data.rsi_14 != null ? data.rsi_14.toFixed(1) : 'N/A'}
                  </span>
                  <SignalTag signal={data.rsi_signal} />
                </div>
              </div>

              {/* EMA */}
              <div className="flex flex-wrap items-center justify-between gap-y-1">
                <span className="text-[11px] text-[#B8C4D4]">EMA 50/200</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] text-[#7B8DA0] font-mono">
                    {data.ema_50 != null ? data.ema_50.toFixed(0) : '—'} / {data.ema_200 != null ? data.ema_200.toFixed(0) : '—'}
                  </span>
                  <SignalTag signal={data.ema_signal} />
                </div>
              </div>

              {/* MACD */}
              <div className="flex flex-wrap items-center justify-between gap-y-1">
                <span className="text-[11px] text-[#B8C4D4]">MACD</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] text-[#7B8DA0] font-mono">
                    H: {data.macd_histogram != null ? data.macd_histogram.toFixed(4) : '—'}
                  </span>
                  <SignalTag signal={data.macd_signal} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== Shared Sub-components ====================

function MetricBox({
  label,
  value,
  sub,
  tag,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  tag?: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-2.5 rounded-lg bg-[#0F141F]">
      <p className="text-[10px] text-[#7B8DA0] mb-0.5">{label}</p>
      <p className={cn('text-sm font-semibold', highlight ? 'text-emerald-400' : 'text-[#F5E8C7]')}>{value}</p>
      {sub && <p className="text-[10px] text-[#7B8DA0]">{sub}</p>}
      {tag && tag !== 'N/A' && (
        <span className={cn(
          'inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded mt-1',
          tag.includes('Strong') || tag.includes('Under') ? 'bg-emerald-500/20 text-emerald-400'
            : tag.includes('Weak') || tag.includes('Over') || tag.includes('Declin') ? 'bg-red-500/20 text-red-400'
            : 'bg-[#D4A853]/20 text-[#D4A853]'
        )}>
          {tag}
        </span>
      )}
    </div>
  );
}

function VerdictBadge({ verdict, className }: { verdict: string; className?: string }) {
  const isBullish = verdict.includes('Buy') || verdict === 'Halal';
  const isBearish = verdict.includes('Sell') || verdict.includes('Haram') || verdict.includes('Non-Compliant');

  return (
    <span className={cn(
      'text-[10px] font-bold px-2 py-0.5 rounded-full',
      isBullish ? 'bg-emerald-500/20 text-emerald-400'
        : isBearish ? 'bg-red-500/20 text-red-400'
        : 'bg-[#D4A853]/20 text-[#D4A853]',
      className
    )}>
      {verdict}
    </span>
  );
}

function SignalTag({ signal }: { signal: string }) {
  const isBullish = signal.includes('Bullish') || signal.includes('Golden') || signal.includes('Oversold');
  const isBearish = signal.includes('Bearish') || signal.includes('Death') || signal.includes('Overbought');

  return (
    <span className={cn(
      'text-[9px] font-semibold px-1.5 py-0.5 rounded',
      isBullish ? 'bg-emerald-500/20 text-emerald-400'
        : isBearish ? 'bg-red-500/20 text-red-400'
        : 'bg-[#10151F] text-[#7B8DA0]'
    )}>
      {signal.replace(' (Bullish)', '').replace(' (Bearish)', '')}
    </span>
  );
}
