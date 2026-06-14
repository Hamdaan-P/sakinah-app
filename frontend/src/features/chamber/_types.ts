/**
 * ChamberV2 types. Phase 5 split.
 */

import type { ComponentType } from 'react';

export type PhosphorIcon = ComponentType<{
  size?: number;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  style?: React.CSSProperties;
  className?: string;
}>;

export type Tab = 'home' | 'members' | 'referrals' | 'analytics' | 'networking' | 'presentations';
export type CategoryFilter = 'All' | 'Technology' | 'Finance' | 'Healthcare' | 'Education' | 'Real Estate' | 'Consulting' | 'Marketing' | 'Legal' | 'Manufacturing' | 'Media' | 'Non-Profit' | 'Other';
export type ReferralTab = 'new' | 'sent' | 'received';
export type PresentationTab = 'browse' | 'mydecks';
export type PresentationCategory = 'All' | 'Investment' | 'Startup' | 'Technology' | 'Islamic Finance' | 'Business Plan' | 'Marketing' | 'Other';
export type AnalyticsPeriod = 'Week' | 'Month' | 'Quarter' | 'Year';

export interface Member {
  id: string;
  name: string;
  role: string;
  company: string;
  verified: boolean;
  premium: boolean;
  bio: string;
  location: string;
  connections: number;
  category: CategoryFilter;
  avatar: string;
  skills: string[];
  experience: Array<{ title: string; company: string; period: string }>;
  activityCount: number;
}

export interface Referral {
  id: string;
  fromMember: string;
  toMember: string;
  type: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  details: string;
  value: string;
  date: string;
}

export interface NetworkingSession {
  id: string;
  title: string;
  description: string;
  time: string;
  duration: string;
  host: string;
  hostRole: string;
  attendees: number;
  capacity: number;
  category: string;
}

export interface Presentation {
  id: string;
  title: string;
  owner: string;
  verified: boolean;
  slides: number;
  views: number;
  likes: number;
  featured: boolean;
  category: PresentationCategory;
  thumbnail: string;
  description?: string;
  status?: 'draft' | 'published';
}
