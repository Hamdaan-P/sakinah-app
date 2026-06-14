import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  onClick?: () => void;
}

export function GlassmorphicCard({
  children,
  className,
  borderColor = 'border-[#D4A853]/30',
  onClick,
}: GlassmorphicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl p-5',
        'bg-gradient-to-br from-[#0F141F]/95 to-[#0A0E16]/95',
        'backdrop-blur-xl border',
        borderColor,
        'shadow-[0_8px_32px_rgba(212,168,83,0.12),0_0_24px_rgba(43,111,107,0.15),0_4px_16px_rgba(0,0,0,0.4)]',
        onClick && 'cursor-pointer hover:scale-[1.02] transition-transform',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
