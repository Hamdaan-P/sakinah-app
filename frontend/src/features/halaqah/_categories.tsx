/**
 * Event-category list with phosphor icon nodes — separated so the bulky
 * mockEvents array can live in a plain `.ts` file.
 */

import {
  Book,
  Chat,
  Microphone,
  UsersThree,
  Sparkle,
  Heart,
  HandHeart,
  Globe,
  GraduationCap,
  DotsThree,
} from '@phosphor-icons/react';
import type { EventCategory } from './_types';

export const eventCategories: EventCategory[] = [
  { id: 'quran', name: 'Quran Study', icon: <Book size={20} />, color: '#10B981' },
  { id: 'hadith', name: 'Hadith Discussion', icon: <Chat size={20} />, color: '#3B82F6' },
  { id: 'lecture', name: 'Islamic Lecture', icon: <Microphone size={20} />, color: '#8B5CF6' },
  { id: 'community', name: 'Community Gathering', icon: <UsersThree size={20} />, color: '#F59E0B' },
  { id: 'youth', name: 'Youth Program', icon: <Sparkle size={20} />, color: '#EC4899' },
  { id: 'family', name: 'Family Event', icon: <Heart size={20} />, color: '#06B6D4' },
  { id: 'charity', name: 'Charity', icon: <HandHeart size={20} />, color: '#EF4444' },
  { id: 'dawah', name: 'Dawah', icon: <Globe size={20} />, color: '#14B8A6' },
  { id: 'education', name: 'Education', icon: <GraduationCap size={20} />, color: '#F97316' },
  { id: 'other', name: 'Other', icon: <DotsThree size={20} />, color: '#6B7280' },
];
