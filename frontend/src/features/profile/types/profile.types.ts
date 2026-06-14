/**
 * Profile Feature Types
 */

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  displayName?: string;
  photoUrl?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: Date | null;
  gender?: 'male' | 'female' | null;
  location?: string;
  bio?: string;
  profession?: string;

  // Islamic profile
  islamicKnowledge?: string;
  islamicInterests?: string[];
  prayerFrequency?: string;
  fastingHabit?: string;

  // Professional
  company?: string;
  industry?: string;
  yearsExperience?: number;
  skills?: string[];
  hobbies?: string[];

  // Financial
  investmentGoals?: string[];
  riskTolerance?: string;
  investmentExperience?: string;
  preferredPaymentMethods?: string[];

  // Social
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;

  // LinkedIn OAuth connection
  linkedinId?: string;
  linkedinEmail?: string;
  linkedinEmailVerified?: boolean;
  linkedinPicture?: string;
  linkedinConnectedAt?: Date;

  // KYC (2-tier system)
  kycTier?: 0 | 1 | 2;
  kycStatus?: 'none' | 'tier1_complete' | 'tier2_complete' | 'unverified' | 'pending' | 'verified' | 'rejected';
  kycLevel?: 'none' | 'basic' | 'full' | 'lite' | 'standard' | 'premium';

  // Meta
  createdAt?: Date;
  updatedAt?: Date;
  profileCompleted?: boolean;
}

export interface ProfileSection {
  key: string;
  title: string;
  icon: string;
  isExpanded: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface QuickAction {
  icon: string;
  title: string;
  subtitle: string;
  action: () => void;
}

export interface AppFeature {
  icon: string;
  title: string;
  description: string;
}

export interface CompanyInfo {
  company: string;
  headquarters: string;
  founded: string;
  teamSize: string;
  certification: string;
}

export interface SocialLink {
  icon: string;
  label: string;
  url: string;
}

export interface LegalItem {
  title: string;
  subtitle: string;
  url: string;
}
