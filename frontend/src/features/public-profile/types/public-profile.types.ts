/**
 * Public Profile Feature Types
 *
 * A `public_profiles/{uid}` doc mirrors only the safe-to-share fields of a user.
 * Anyone can read these; only the owner writes their own.
 *
 * A `slugs/{slug}` doc maps the human-readable handle back to a uid for /p/:slug lookups.
 */

export interface PublicProfile {
  uid: string;
  slug: string;
  isPublic: boolean;
  fullName: string | null;
  displayName: string | null;
  photoUrl: string | null;
  bio: string | null;
  profession: string | null;
  company: string | null;
  industry: string | null;
  location: string | null;
  gender: 'male' | 'female' | null;
  archetype: string | null;
  islamicInterests: string[];
  islamicKnowledge: string | null;
  skills: string[];
  hobbies: string[];
  instagramUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  memberSince: number | null; // unix ms
  connectionsCount: number; // maintained by Cloud Function
  updatedAt: number; // unix ms
  /**
   * Shukr (gratitude) snapshot — denormalized from the user's Barka Labs stats
   * so the Discover ranker can match on gratitude practice without N extra
   * Firestore reads. Refreshed when the user logs blessings.
   */
  shukrSnapshot?: ShukrSnapshot;
}

export interface ShukrSnapshot {
  level: number;             // barka-labs phase 0-4
  currentStreak: number;     // consecutive days
  totalBlessings: number;
  avgDepthScore: number;     // 0..3 (common / thoughtful / profound)
  lastActiveDate: string | null; // YYYY-MM-DD
  updatedAt: number;         // unix ms
}

export interface SlugDoc {
  slug: string;
  uid: string;
  createdAt: number;
}

export type SlugAvailability = 'available' | 'taken' | 'invalid' | 'checking';

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 24;
export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,22}[a-z0-9])?$/;

// Reserved handles we don't let users claim.
export const RESERVED_SLUGS = new Set<string>([
  'admin', 'api', 'app', 'auth', 'barakah-labs', 'blog', 'chat', 'claim',
  'connect', 'connections', 'dashboard', 'discover', 'help', 'home',
  'kyc', 'legal', 'login', 'logout', 'me', 'new', 'notifications', 'onboarding',
  'p', 'privacy', 'profile', 'public', 'raya', 'root', 'search', 'settings',
  'share', 'signup', 'signin', 'signout', 'support', 'system', 'terms', 'user',
  'users', 'wallet', 'welcome', 'zaryah', 'zaryahplus',
]);
