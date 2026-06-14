/**
 * Small reusable visual primitives shared between insight sections.
 */

import { motion } from 'framer-motion';
import type { Icon } from '@phosphor-icons/react';

export function EmotionBar({ emotion, pct, rank }: { emotion: string; pct: number; rank: number }) {
  const colors = ['#D4A853', '#E8C97A', '#2A9D6F', '#3B82F6', '#A78BFA'];
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#C9C0A8] text-[13px] w-28 capitalize truncate">{emotion}</span>
      <div className="flex-1 h-2.5 rounded-full bg-[#0A0E16]/80 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 + rank * 0.1 }}
          className="h-full rounded-full"
          style={{ background: colors[rank] ?? '#5C5749' }}
        />
      </div>
      <span className="text-[#5C5749] text-[12px] w-10 text-right">{pct}%</span>
    </div>
  );
}

export function QuoteBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="relative pl-4 py-2" style={{ borderLeft: '2px solid rgba(212,168,83,0.3)' }}>
      <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[#C9C0A8] text-[13px] leading-relaxed italic">"{text}"</p>
    </div>
  );
}

export function TagPill({ text, color = '#D4A853' }: { text: string; color?: string }) {
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}
    >
      {text}
    </span>
  );
}

interface SectionProps {
  title: string;
  icon: Icon;
  children: React.ReactNode;
  delay?: number;
  accent?: boolean;
}

export function Section({ title, icon: IconCmp, children, delay = 0, accent = false }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: accent
              ? 'linear-gradient(135deg, rgba(212,168,83,0.25), rgba(212,168,83,0.08))'
              : 'rgba(36,50,70,0.6)',
            border: accent ? '1px solid rgba(212,168,83,0.3)' : '1px solid rgba(212,168,83,0.1)',
          }}
        >
          <IconCmp size={16} weight="fill" className="text-[#D4A853]" />
        </div>
        <h2 className="text-[#F5E8C7] text-[16px] font-semibold tracking-tight">{title}</h2>
      </div>
      <div
        className="rounded-[18px] p-5"
        style={{
          background: 'linear-gradient(145deg, rgba(36,50,70,0.7), rgba(10,14,22,0.9))',
          border: '1px solid rgba(212,168,83,0.1)',
        }}
      >
        {children}
      </div>
    </motion.section>
  );
}
