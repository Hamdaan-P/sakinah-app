import { useRef, useEffect, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { createParticle, stepAndDrawParticles, type Particle } from './premium-background/_particles';

interface PremiumIslamicBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  /** Override automatic particle count derived from variant */
  particleCount?: number;
  /**
   * Visual density preset:
   *  - `hero`   – 60 particles (default, rich celestial feel)
   *  - `chat`   – 40 particles (lighter, less distracting)
   *  - `subtle` – 25 particles (minimal ambient shimmer)
   */
  variant?: 'hero' | 'chat' | 'subtle';
}

const VARIANT_COUNTS: Record<NonNullable<PremiumIslamicBackgroundProps['variant']>, number> = {
  hero: 60,
  chat: 40,
  subtle: 25,
};

export const PremiumIslamicBackground = memo(function PremiumIslamicBackground({
  children,
  className,
  particleCount,
  variant = 'hero',
}: PremiumIslamicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const count = particleCount ?? VARIANT_COUNTS[variant];

  // Initialise / re-initialise particles when count or canvas size changes
  const initParticles = useCallback(
    (width: number, height: number) => {
      const particles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(width, height));
      }
      particlesRef.current = particles;
    },
    [count],
  );

  // Resize handler – keeps canvas resolution in sync with CSS size
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = container.getBoundingClientRect();

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Re-create particles so they are distributed across the new dimensions
    initParticles(width, height);
  }, [initParticles]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = container.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);

    timeRef.current += 1;
    stepAndDrawParticles(ctx, particlesRef.current, width, height, timeRef.current);

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Setup & teardown
  useEffect(() => {
    handleResize();

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Listen for resize
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [handleResize, animate]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Deep navy gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06080D] via-[#0A0E16] to-[#0F141F]" />

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      {/* Content rendered on top */}
      <div className="relative z-10">{children}</div>
    </div>
  );
});
