/**
 * Barrel re-export for Islamic widget primitives. Individual components
 * live under `./islamic-widgets/` — this file exists so existing imports
 * from `./IslamicWidgetComponents` keep working.
 */

export { GlassmorphicCard } from './islamic-widgets/GlassmorphicCard';
export { ShimmerSkeleton } from './islamic-widgets/ShimmerSkeleton';
export {
  IconBadge,
  SectionHeader,
  LoadingIndicator,
  ErrorCard,
  AnimatedCounter,
} from './islamic-widgets/_smallPrimitives';
