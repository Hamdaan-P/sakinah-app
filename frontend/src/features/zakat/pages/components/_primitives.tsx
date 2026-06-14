/**
 * Layout primitives reused inside ZakatCalculatorPage.
 */

import { motion } from 'framer-motion';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export function CollapsibleSection({
  icon,
  title,
  expanded,
  onToggle,
  children,
  delay = 0,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  delay?: number;
  accentColor?: 'gold' | 'silver';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="mb-3"
    >
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-colors',
          'bg-gradient-to-br from-[#10151F]/80 to-[#10151F]/60',
          expanded ? 'border-[#D4A853]/30 rounded-b-none' : 'border-[rgba(212,168,83,0.2)]/50',
        )}
      >
        <span className="text-[#D4A853]">{icon}</span>
        <span className="flex-1 text-sm font-semibold text-[#F5E8C7]">{title}</span>
        {expanded ? (
          <CaretUp size={16} className="text-[#D4A853]" />
        ) : (
          <CaretDown size={16} className="text-[#7A7363]" />
        )}
      </button>
      {expanded && (
        <div className="p-4 border border-t-0 border-[#D4A853]/30 rounded-b-2xl bg-[#10151F]/40">
          {children}
        </div>
      )}
    </motion.div>
  );
}

export function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-[10px] text-[#7A7363] mb-1 block">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#7A7363]">{prefix}</span>
        )}
        <input
          type="number"
          inputMode="decimal"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className={cn(
            'w-full py-2.5 rounded-xl text-sm text-[#F5E8C7] bg-[#0A0E16]/40 border border-[rgba(212,168,83,0.2)]/50',
            'focus:border-[#D4A853]/50 focus:outline-none transition-colors',
            'placeholder:text-[#7A7363]/50',
            prefix ? 'pl-7 pr-3' : 'pl-3',
            suffix ? 'pr-7' : 'pr-3',
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A7363]">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export function ResultRow({
  label,
  value,
  highlight,
  negative,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-[#C9C0A8]">{label}</span>
      <span
        className={cn(
          'text-sm font-semibold',
          highlight ? 'text-[#D4A853]' : negative ? 'text-red-400' : 'text-[#F5E8C7]',
        )}
      >
        {value}
      </span>
    </div>
  );
}
