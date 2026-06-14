/**
 * EventsPage types. Phase 5 split.
 */

export type EventFormat = 'In-Person' | 'Virtual' | 'Hybrid';
export type EventCategory = 'Business & Economics' | 'Technology' | 'Healthcare' | 'Education' | 'Marketing';
export type TicketTier = 'Standard' | 'VIP' | 'Premium';
export type SessionType = 'keynote' | 'panel' | 'workshop' | 'networking' | 'exhibition' | 'ceremony';
export type DetailTab = 'Overview' | 'Schedule' | 'Speakers' | 'Venue' | 'Attendees';
export type MyEventsTab = 'Upcoming' | 'Past' | 'Cancelled';
export type MainView = 'options' | 'browse' | 'host' | 'myEvents';

export interface Conference {
  id: string;
  title: string;
  organizer: string;
  description: string;
  format: EventFormat;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registered: number;
  price: number;
  featured: boolean;
  bannerGradient: string;
  topics: string[];
  venue: {
    name: string;
    address: string;
    amenities: string[];
  };
  tickets: {
    tier: TicketTier;
    price: number;
    benefits: string[];
    popular?: boolean;
  }[];
  speakers: {
    name: string;
    title: string;
    company: string;
    avatarColor: string;
    expertise: string[];
  }[];
  schedule: {
    day: number;
    sessions: {
      time: string;
      title: string;
      type: SessionType;
    }[];
  }[];
}

export interface Registration {
  id: string;
  conferenceId: string;
  conferenceName: string;
  date: string;
  location: string;
  status: 'upcoming' | 'past' | 'cancelled';
  registrationId: string;
  ticketTier: TicketTier;
}

export interface Attendee {
  name: string;
  tagline: string;
  company: string;
  designation: string;
  avatarColor: string;
  verified: boolean;
  online: boolean;
}

export type HostForm = {
  name: string;
  website: string;
  description: string;
  format: EventFormat;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  venueName: string;
  venueAddress: string;
  transportation: string;
  hotels: string;
  standardPrice: number;
  standardBenefits: string;
  vipPrice: number;
  vipBenefits: string;
  phone: string;
  email: string;
  website2: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  speakers: { name: string; title: string; company: string; bio: string }[];
  sponsors: { name: string; tier: string }[];
};
