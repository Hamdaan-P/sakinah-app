/**
 * Shared presentational primitives used by ShariahBadge sub-views.
 * Verbatim — no behavior changes.
 */

import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export function StageSection({
  number,
  title,
  subtitle,
  passed,
  icon,
  children,
}: {
  number: number;
  title: string;
  subtitle: string;
  passed: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[#0F141F] border border-[#3A4D65] overflow-hidden">
      {/* Stage header */}
      <div className="px-4 py-2.5 flex items-center gap-2 bg-[#0A0E16]">
        <span className={cn('flex items-center justify-center', passed ? 'text-emerald-400' : 'text-red-400')}>
          {icon}
        </span>
        {number > 0 && (
          <span className="text-[10px] font-bold text-[#7B8DA0] bg-[#10151F] px-1.5 py-0.5 rounded">
            Stage {number}
          </span>
        )}
        <span className="text-[13px] font-semibold text-[#F5E8C7]">{title}</span>
        <span className="text-[10px] text-[#7B8DA0] ml-auto">{subtitle}</span>
        {passed
          ? <CheckCircle size={16} weight="fill" className="text-emerald-400" />
          : <XCircle size={16} weight="fill" className="text-red-400" />
        }
      </div>
      {/* Criteria items */}
      <div className="px-4 py-1">
        {children}
      </div>
    </div>
  );
}

export function CriteriaItem({
  title,
  passed,
  criteria,
  value,
}: {
  title: string;
  passed: boolean;
  criteria: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-2 py-2">
      {passed
        ? <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0" />
        : <XCircle size={18} weight="fill" className="text-red-400 shrink-0" />
      }
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#F5E8C7] font-medium">{title}</p>
        <p className="text-[10px] text-[#7B8DA0]">{criteria}</p>
      </div>
      {value && (
        <span className={cn('text-[12px] font-semibold font-mono', passed ? 'text-emerald-400' : 'text-red-400')}>
          {value}
        </span>
      )}
    </div>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components -- date helper colocated with primitives for use in the badge details sheet */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
