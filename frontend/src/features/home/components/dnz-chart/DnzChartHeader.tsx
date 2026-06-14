/**
 * Header row of the DNZ price chart card: token badge + live price + stats row.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fmt } from './_config';

interface DnzChartHeaderProps {
  price: number;
  change: number;
  changePct: number;
  high24: number;
  low24: number;
  openPrice: number;
  volume: string;
}

export function DnzChartHeader({
  price, change, changePct, high24, low24, openPrice, volume,
}: DnzChartHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Token badge */}
          <div className="relative">
            <div
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center',
                'bg-gradient-to-br from-[#E8C97A] to-[#B8893A]',
                'shadow-[0_2px_16px_rgba(212,168,83,0.45)]',
                'text-[#0A0E16] text-[10px] font-bold tracking-wider',
              )}
            >
              DNZ
            </div>
            <div className="absolute -inset-[3px] rounded-full border border-[#D4A853]/30" />
          </div>
          <div>
            <div className="text-[#F5E8C7] text-[15px] font-semibold tracking-wide leading-tight">
              DNZ / INR
            </div>
            <div className="text-[#D4A853] text-[10px] tracking-[3px] font-light mt-0.5">
              DINARZ
            </div>
          </div>
        </div>

        {/* Live price */}
        <div className="text-right">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={price}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-light bg-gradient-to-r from-[#E8C97A] to-[#D4A853] bg-clip-text text-transparent"
            >
              {fmt(price)}
            </motion.div>
          </AnimatePresence>
          <div
            className={cn(
              'text-[11px] font-light flex items-center justify-end gap-1 mt-0.5',
              change >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]',
            )}
          >
            <span className="text-[9px]">{change >= 0 ? '▲' : '▼'}</span>
            <span>
              {change >= 0 ? '+' : ''}{fmt(change)} ({change >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 px-5 pb-3 overflow-x-auto">
        {[
          { label: '24h High', value: fmt(high24, 4), color: 'text-[#4ade80]' },
          { label: '24h Low', value: fmt(low24, 4), color: 'text-[#f87171]' },
          { label: 'Vol', value: volume, color: 'text-[#7A7363]' },
          { label: 'Open', value: fmt(openPrice, 4), color: 'text-[#7A7363]' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col min-w-0">
            <span className="text-[9px] text-[#7A7363]/60 tracking-wider uppercase whitespace-nowrap">
              {s.label}
            </span>
            <span className={cn('text-[12px] font-light whitespace-nowrap', s.color)}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Chart sub-header */}
      <div className="flex items-center justify-between px-5 py-1.5 border-t border-white/[0.04]">
        <span className="text-[9px] tracking-[3px] uppercase text-[#D4A853]/70 font-light">
          Price Chart
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-[5px] h-[5px] rounded-full bg-[#D4A853] animate-pulse shadow-[0_0_6px_rgba(212,168,83,0.6)]" />
          <span className="text-[9px] tracking-[2px] text-[#D4A853]/70 font-light">
            LIVE
          </span>
        </div>
      </div>
    </>
  );
}
