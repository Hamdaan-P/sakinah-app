/**
 * Halaqah page types.
 *
 * Phase 5 split — extracted from HalaqahPage.tsx.
 */

import type { ReactNode } from 'react';

export interface HalaqahEvent {
  id: string;
  name: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  venueAddress: string;
  capacity: number;
  attendeeCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  description: string;
  hostName: string;
  hostId: string;
  hostRating: number;
  hostVerified: boolean;
  agenda: {
    title: string;
    arabicTitle: string;
    duration: number;
  }[];
  venueFeatures: {
    qiblaDirection: boolean;
    prayerSpace: boolean;
    wuduFacilities: boolean;
    parking: boolean;
    wheelchairAccessible: boolean;
  };
  registeredCount: number;
  checkedInCount: number;
  rejectionReason?: string;
  cancellationReason?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  icon: ReactNode;
  color: string;
}

export type MainTab = 'dashboard' | 'browse' | 'host' | 'myEvents';
export type ViewMode = 'grid' | 'list';
export type MyEventsTab = 'upcoming' | 'past' | 'cancelled';
export type HostDashboardTab = 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export type HostFormData = {
  gender?: string;
  eventName?: string;
  description?: string;
  category?: string;
  capacity?: string | number;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  venueName?: string;
  isOnline?: boolean;
  location?: string;
  onlineLink?: string;
  agenda?: Array<{ title: string; arabicTitle: string; duration: string }>;
  [key: string]: unknown;
};
