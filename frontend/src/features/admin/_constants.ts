/**
 * Static configuration data for the Halaqah Admin page.
 *
 * Phase 5 split — extracted from HalaqahAdminPage.tsx.
 */

import type { EventCategory } from './_types';

export const EVENT_CATEGORIES: Record<string, EventCategory> = {
  'Quran Study': { name: 'Quran Study', color: '#10B981' },
  'Hadith Discussion': { name: 'Hadith Discussion', color: '#3B82F6' },
  'Islamic Lecture': { name: 'Islamic Lecture', color: '#8B5CF6' },
  'Community Gathering': { name: 'Community Gathering', color: '#F59E0B' },
  'Youth Program': { name: 'Youth Program', color: '#EC4899' },
  'Family Event': { name: 'Family Event', color: '#06B6D4' },
  'Charity': { name: 'Charity', color: '#EF4444' },
  'Dawah': { name: 'Dawah', color: '#14B8A6' },
  'Education': { name: 'Education', color: '#F97316' },
  'Other': { name: 'Other', color: '#6B7280' },
};
