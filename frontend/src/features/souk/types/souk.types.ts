/**
 * Souk (marketplace) types
 * Mirrors the Firestore `souk_listings/*` document shape.
 */

export type ListingType =
  | 'product'
  | 'service'
  | 'freelancer'
  | 'job'
  | 'rental'
  | 'donation'
  | 'islamic'
  | 'business'
  | 'digital';

export type ListingStatus =
  | 'draft'
  | 'active'
  | 'pending_review'
  | 'rejected'
  | 'sold'
  | 'archived';

export type Currency = 'USD' | 'AED' | 'SAR' | 'GBP' | 'INR' | 'PKR' | 'DNZ';

export interface ListingPrice {
  amount: number | null;
  currency: Currency;
  flexible: boolean;
  acceptsDinarz?: boolean;
}

export interface ListingMedia {
  url: string;
  kind: 'image' | 'video';
  thumb?: string;
}

export interface ListingLocation {
  city?: string;
  country?: string;
  geohash?: string;
}

export interface ListingEngagement {
  views: number;
  saves: number;
  interests: number;
  shares: number;
  reports: number;
  ratingCount?: number;
  ratingSum?: number;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string | null;
  type: ListingType;
  category: string;
  title: string;
  description: string;
  price: ListingPrice;
  media: ListingMedia[];
  location: ListingLocation | null;
  tags: string[];
  status: ListingStatus;
  trustScore: number;
  engagement: ListingEngagement;
  createdAt: number;
  updatedAt: number;
  bumpedAt: number;
}

export interface RankedListing extends Listing {
  /** Server-computed score in [0,1]; surfaced for debugging only. */
  rankScore?: number;
  /** Score component breakdown when ?debug=1. */
  scoreBreakdown?: Record<string, number>;
}

export interface Inquiry {
  userId: string;
  type: 'save' | 'interest' | 'share';
  createdAt: number;
}

export interface ListingComment {
  id: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: number;
  edited?: boolean;
}

export interface ListingReport {
  id: string;
  reporterUid: string;
  reason: ReportReason;
  note?: string;
  status: 'open' | 'reviewed' | 'actioned';
  createdAt: number;
}

export type ReportReason =
  | 'prohibited'
  | 'spam'
  | 'misleading'
  | 'unethical'
  | 'duplicate'
  | 'other';

export interface SellerProfile {
  uid: string;
  displayName: string;
  avatar?: string | null;
  bio?: string;
  listingCount: number;
  reputationScore: number;
  joinedAt: number;
  verifiedBadges: string[];
}

export interface FeedResponse {
  items: RankedListing[];
  cursor: string | null;
  count: number;
}

export interface CreateListingInput {
  type: ListingType;
  category: string;
  title: string;
  description: string;
  price: ListingPrice;
  media: ListingMedia[];
  location: ListingLocation | null;
  tags: string[];
}

export interface FeedFilter {
  type?: ListingType | 'all';
  category?: string;
  country?: string;
  query?: string;
}
