import { ShieldCheck } from '@phosphor-icons/react';

interface Props {
  score: number; // 0–100
  size?: 'sm' | 'md';
}

export function TrustBadge({ score, size = 'sm' }: Props) {
  const tier: 'high' | 'mid' | 'new' =
    score >= 75 ? 'high' : score >= 45 ? 'mid' : 'new';
  const colors = {
    high: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    mid: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    new: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  }[tier];
  const label = tier === 'high' ? 'Trusted' : tier === 'mid' ? 'Building Trust' : 'New';
  const sz = size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5';
  const icon = size === 'md' ? 14 : 11;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${colors} ${sz}`}
      title={`Trust score ${score}/100`}
    >
      <ShieldCheck size={icon} weight="fill" />
      {label}
    </span>
  );
}
