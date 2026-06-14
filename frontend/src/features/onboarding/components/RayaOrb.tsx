/**
 * Raya orb — abstract light source, never a face. Pure CSS radial gradient
 * with the existing `bk-raya-orb-pulse` keyframe (defined in index.css) for
 * a soft 3s breathing cycle. Two sizes: hero (Stage B) and mini (pills).
 */

interface RayaOrbProps {
  variant?: 'hero' | 'mini';
  className?: string;
}

const SIZE: Record<NonNullable<RayaOrbProps['variant']>, string> = {
  hero: 'w-[120px] h-[120px]',
  mini: 'w-[42px] h-[42px]',
};

export function RayaOrb({ variant = 'hero', className = '' }: RayaOrbProps) {
  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 rounded-full bk-raya-orb-pulse ${SIZE[variant]} ${className}`}
      style={{
        background:
          'radial-gradient(circle at 35% 35%, rgba(232,201,122,0.85), rgba(212,168,83,0.35) 50%, transparent 100%)',
        boxShadow:
          variant === 'hero'
            ? '0 0 60px rgba(212,168,83,0.25), 0 0 120px rgba(212,168,83,0.10)'
            : undefined,
      }}
    />
  );
}
