import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShimmerSkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export function ShimmerSkeleton({
  width = 100,
  height = 20,
  borderRadius = 12,
  className,
}: ShimmerSkeletonProps) {
  return (
    <div
      className={cn('relative overflow-hidden bg-white/5', className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: `${borderRadius}px`,
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
