/**
 * ShariahBadge
 * Shows compliance status badge for a stock symbol.
 * Displays 3-stage AAOIFI/TASIS screening results in detail sheet.
 */

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldWarning } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { getStockData } from './../services/shariahService';
import type { ShariahData } from '../types/shariahData';
import { ShariahDetailsSheet } from './badge/ShariahDetailsSheet';

export function ShariahBadge({
  symbol,
  data: dataProp,
  showDetails = false,
}: {
  symbol: string;
  data?: ShariahData;
  showDetails?: boolean;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const data = dataProp ?? getStockData(symbol);

  if (!data) return null;

  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        className={cn(
          'inline-flex items-center gap-1 rounded-full text-white font-semibold',
          showDetails ? 'px-3 py-1 text-[11px]' : 'px-2 py-0.5 text-[10px]',
          data.isCompliant ? 'bg-emerald-500' : 'bg-[#3D1F1F]',
        )}
      >
        {data.isCompliant
          ? <ShieldCheck size={showDetails ? 14 : 12} weight="fill" />
          : <ShieldWarning size={showDetails ? 14 : 12} weight="fill" />
        }
        {data.isCompliant ? 'Compliant' : 'Non-Compliant'}
      </button>

      <AnimatePresence>
        {sheetOpen && (
          <ShariahDetailsSheet
            symbol={symbol}
            data={data}
            onClose={() => setSheetOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
