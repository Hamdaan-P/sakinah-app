/**
 * Transactions tab — list of DNZ transactions with loading/empty states.
 */

import { Coins } from '@phosphor-icons/react';
import { ACTIVITY_LABELS, formatDNZ } from './_walletConstants';
import type { DNZTransaction } from '../../services/walletService';

interface Props {
  transactions: DNZTransaction[];
  transactionsLoading: boolean;
}

export function TransactionsTab({ transactions, transactionsLoading }: Props) {
  return (
    <div className="px-4 space-y-2">
      {transactionsLoading && (
        <p className="text-[#7A7363] text-sm text-center py-8">Loading transactions...</p>
      )}
      {!transactionsLoading && transactions.length === 0 && (
        <div className="text-center py-12">
          <Coins size={48} className="text-[#7A7363]/40 mx-auto mb-3" />
          <p className="text-[#7A7363] text-sm">No transactions yet</p>
          <p className="text-[#7A7363]/60 text-xs mt-1">Use the app to start earning DNZ</p>
        </div>
      )}
      {transactions.map((tx) => {
        const meta = ACTIVITY_LABELS[tx.type] || { label: tx.type, icon: Coins };
        const Icon = meta.icon;
        return (
          <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Icon size={16} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F5E8C7] text-sm">{tx.description}</p>
              <p className="text-[#7A7363] text-xs">{tx.date}</p>
            </div>
            <span className="font-semibold text-sm text-emerald-400">
              +{formatDNZ(tx.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
