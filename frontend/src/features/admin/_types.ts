/**
 * Types for the Halaqah Admin Dashboard.
 *
 * Phase 5 split — extracted from HalaqahAdminPage.tsx.
 */

export interface AdminStats {
  pending: number;
  approved: number;
  totalHosts: number;
  reports: number;
}

export interface EventCategory {
  name: string;
  color: string;
}

export interface PendingEvent {
  id: string;
  name: string;
  category: string;
  date: string;
  hostName: string;
  hostEmail: string;
  capacity: number;
  venue: string;
  description: string;
  agenda: string[];
  submittedAt: string;
}

export interface ApprovedEvent {
  id: string;
  name: string;
  category: string;
  date: string;
  attendees: number;
  capacity: number;
  location: string;
  description: string;
  hostName: string;
  approvedAt: string;
  attendeesList: Array<{ name: string; email: string; registeredAt: string }>;
}

export interface Host {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  eventsHosted: number;
  rating: number;
  joinedDate: string;
  phone: string;
  bio: string;
}

export interface Activity {
  id: string;
  action: string;
  eventName: string;
  timestamp: string;
  type: 'approved' | 'rejected' | 'verified' | 'unverified';
}

export type TabType = 'dashboard' | 'pending' | 'approved' | 'hosts' | 'reports';
export type HostFilter = 'all' | 'verified' | 'unverified';
