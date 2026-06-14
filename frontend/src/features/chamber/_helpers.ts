/**
 * ChamberV2 helpers + lookup tables. Phase 5 split.
 */

import type { CategoryFilter } from './_types';

export const CATEGORIES: CategoryFilter[] = [
  'All',
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Real Estate',
  'Consulting',
  'Marketing',
  'Legal',
  'Manufacturing',
  'Media',
  'Non-Profit',
  'Other',
];

export const REFERRAL_TYPES = [
  'Business Opportunity',
  'Job/Career',
  'Investment',
  'Partnership',
  'Mentorship',
  'Service Provider',
  'Client Introduction',
  'Vendor/Supplier',
];

export function getAvatarColor(name: string): string {
  const colors = ['#7C3AED', '#0284C7', '#EA580C', '#059669', '#DC2626', '#D97706'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function getThumbnailGradient(thumb: string): string {
  const gradients: Record<string, string> = {
    tech: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    invest: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    startup: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
    finance: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    marketing: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    health: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    blockchain: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    market: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    strategy: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    stories: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
    analytics: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
  };
  return gradients[thumb] || gradients.tech;
}
