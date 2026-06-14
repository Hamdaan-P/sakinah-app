/**
 * Small one-shot Islamic widget primitives (IconBadge, SectionHeader,
 * LoadingIndicator, ErrorCard, AnimatedCounter). Kept together because
 * each is tiny and they share the same visual language.
 */

import { motion } from 'framer-motion';
import { ArrowsClockwise, Warning } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { GlassmorphicCard } from './GlassmorphicCard';

interface IconBadgeProps {
  icon: React.ReactNode;
  color?: string;
  size?: number;
  showPulse?: boolean;
  className?: string;
}

export function IconBadge({
  icon,
  color = '#D4A853',
  size = 40,
  showPulse = false,
  className,
}: IconBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        showPulse && 'animate-pulse',
        className
      )}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${color}B3)`,
        boxShadow: `0 0 16px ${color}66`,
      }}
    >
      {icon}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export function SectionHeader({
  title,
  icon,
  onAction,
  actionLabel = 'See All',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-2', className)}>
      <div className="flex items-center gap-3">
        {icon && <span className="text-[#D4A853]">{icon}</span>}
        <span className="text-xl font-bold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent">
          {title}
        </span>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="text-[#D4A853] text-sm hover:text-[#E8C97A] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface LoadingIndicatorProps {
  message?: string;
  color?: string;
  className?: string;
}

export function LoadingIndicator({
  message = 'Loading...',
  color = '#D4A853',
  className,
}: LoadingIndicatorProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <motion.div
        className="w-8 h-8 border-3 rounded-full"
        style={{
          borderColor: `${color}40`,
          borderTopColor: color,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <span className="text-white/70 text-sm">{message}</span>
    </div>
  );
}

interface ErrorCardProps {
  message: string;
  onRetry: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function ErrorCard({ message, onRetry, icon, className }: ErrorCardProps) {
  return (
    <GlassmorphicCard borderColor="border-emerald-500/30" className={className}>
      <div className="flex flex-col items-center gap-3 py-4">
        <span className="text-emerald-500">{icon || <Warning size={40} />}</span>
        <p className="text-white text-sm text-center">{message}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4A853] text-white font-medium hover:bg-[#E8C97A] transition-colors"
        >
          <ArrowsClockwise size={16} />
          Retry
        </button>
      </div>
    </GlassmorphicCard>
  );
}

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={className}
    >
      {value}
    </motion.span>
  );
}
