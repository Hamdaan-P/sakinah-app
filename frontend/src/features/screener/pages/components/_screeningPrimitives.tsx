/**
 * ScreeningStage and CriteriaRow primitives shared by the Screener detail sheet.
 */

import { ChartBar, CheckCircle, XCircle } from '@phosphor-icons/react';

export function ScreeningStage({
  number,
  title,
  subtitle,
  passed,
  children,
}: {
  number: number;
  title: string;
  subtitle: string;
  passed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[#0F141F] border border-[#3A4D65] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center gap-2 bg-[#0A0E16]">
        <ChartBar size={14} className={passed ? 'text-emerald-400' : 'text-red-400'} />
        <span className="text-[10px] font-bold text-[#7B8DA0] bg-[#10151F] px-1.5 py-0.5 rounded">
          Stage {number}
        </span>
        <span className="text-[13px] font-semibold text-[#F5E8C7]">{title}</span>
        <span className="text-[10px] text-[#7B8DA0] ml-auto">{subtitle}</span>
        {passed
          ? <CheckCircle size={16} weight="fill" className="text-emerald-400" />
          : <XCircle size={16} weight="fill" className="text-red-400" />
        }
      </div>
      <div className="px-4 py-1 space-y-0.5">
        {children}
      </div>
    </div>
  );
}

export function CriteriaRow({
  label,
  desc,
  passed,
  value,
}: {
  label: string;
  desc: string;
  passed: boolean;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-2 py-2">
      {passed
        ? <CheckCircle size={16} weight="fill" className="text-emerald-400 shrink-0" />
        : <XCircle size={16} weight="fill" className="text-red-400 shrink-0" />
      }
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#F5E8C7] font-medium">{label}</p>
        <p className="text-[10px] text-[#7B8DA0]">{desc}</p>
      </div>
      {value && (
        <span className={`text-[11px] font-semibold font-mono shrink-0 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
          {value}
        </span>
      )}
    </div>
  );
}
