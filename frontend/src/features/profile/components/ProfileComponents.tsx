/**
 * Shared Profile Components — barrel re-exporting individual files.
 *
 * The original aggregator was split into one component per file to keep each
 * file under the 200 LOC leaf-component target. Consumers continue to import
 * from this path unchanged.
 */

export { CollapsibleSection } from './CollapsibleSection';
export { ProfileInfoRow } from './ProfileInfoRow';
export { ProfileCompletionCard } from './ProfileCompletionCard';
export { QuickActionCard } from './QuickActionCard';
export { FAQAccordion } from './FAQAccordion';
export { ChangePasswordDialog } from './ChangePasswordDialog';
export { ChangeEmailDialog } from './ChangeEmailDialog';
export { FeatureCard } from './FeatureCard';
export { SectionHeader } from './SectionHeader';
