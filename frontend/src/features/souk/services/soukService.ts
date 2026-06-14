/**
 * Souk API client
 * Talks to the FastAPI /souk/* endpoints via the authed wrappers in lib/api.
 *
 * The client transparently falls back to a Firestore-only read path when the
 * backend isn't reachable (dev without local FastAPI running) so the UI keeps
 * functioning. Writes always go through the backend so moderation + counter
 * updates stay server-authoritative.
 */

import { authGet, authPost } from '@/lib/api';
import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import type {
  CreateListingInput,
  FeedFilter,
  FeedResponse,
  Listing,
  RankedListing,
  ReportReason,
  SellerProfile,
} from '../types/souk.types';
import { devSeedListings } from '../_data';

const COLL = 'souk_listings';

// ── Feed ──

/**
 * Per-browser-tab session id, used to seed the personalization rotation on
 * the server. New tab → new seed → different order; same tab refresh →
 * same order. Persists in sessionStorage so reloads in the same tab keep
 * a consistent feed.
 */
function getSessionSeed(): string {
  try {
    const KEY = 'souk_session_seed_v1';
    let seed = sessionStorage.getItem(KEY);
    if (!seed) {
      seed = Math.random().toString(36).slice(2, 14);
      sessionStorage.setItem(KEY, seed);
    }
    return seed;
  } catch {
    return 'anon';
  }
}

export async function fetchFeed(
  filter: FeedFilter = {},
  cursor?: string | null,
): Promise<FeedResponse> {
  try {
    const params = new URLSearchParams();
    if (filter.type && filter.type !== 'all') params.set('type', filter.type);
    if (filter.category) params.set('category', filter.category);
    if (filter.country) params.set('country', filter.country);
    if (filter.query) params.set('q', filter.query);
    if (cursor) params.set('cursor', cursor);
    params.set('session', getSessionSeed());
    const qs = params.toString();
    return await authGet<FeedResponse>(`/souk/feed${qs ? `?${qs}` : ''}`);
  } catch {
    return fallbackFeed(filter);
  }
}

// ── Personalization signals ──

export async function recordSoukSignal(
  listingType: string,
  kind: 'view' | 'save' | 'interest' | 'purchase',
): Promise<void> {
  try {
    await authPost<{ ok: true }>('/souk/signal', { listingType, kind });
  } catch {
    // Best-effort — affinity will just be slightly less accurate.
  }
}

async function fallbackFeed(filter: FeedFilter): Promise<FeedResponse> {
  try {
    const constraints = [
      where('status', '==', 'active'),
      orderBy('bumpedAt', 'desc'),
      fbLimit(40),
    ];
    if (filter.type && filter.type !== 'all') {
      constraints.unshift(where('type', '==', filter.type));
    }
    const snap = await getDocs(query(collection(db, COLL), ...constraints));
    const items: RankedListing[] = snap.docs.map((d) => d.data() as RankedListing);
    if (items.length === 0 && import.meta.env.DEV) {
      return { items: devSeedListings() as RankedListing[], cursor: null, count: 4 };
    }
    return { items, cursor: null, count: items.length };
  } catch {
    if (import.meta.env.DEV) {
      return { items: devSeedListings() as RankedListing[], cursor: null, count: 4 };
    }
    return { items: [], cursor: null, count: 0 };
  }
}

// ── Listing detail ──

export async function fetchListing(id: string): Promise<Listing | null> {
  try {
    return await authGet<Listing>(`/souk/listings/${encodeURIComponent(id)}`);
  } catch {
    const snap = await getDoc(doc(db, COLL, id));
    if (!snap.exists()) {
      if (import.meta.env.DEV) {
        const seed = devSeedListings().find((s) => s.id === id);
        return (seed as Listing | undefined) ?? null;
      }
      return null;
    }
    return snap.data() as Listing;
  }
}

// ── Create / edit ──

export interface CreateListingResponse {
  listing: Listing;
  moderation: { status: 'active' | 'pending_review'; reasons: string[] };
  reward?: { awarded: boolean; amount: number };
}

export async function createListing(
  input: CreateListingInput,
): Promise<CreateListingResponse> {
  return authPost<CreateListingResponse>('/souk/listings', input);
}

export async function updateListing(
  id: string,
  patch: Partial<CreateListingInput>,
): Promise<Listing> {
  return authPost<Listing>(
    `/souk/listings/${encodeURIComponent(id)}/update`,
    patch,
  );
}

// ── Interactions ──

export async function recordInterest(
  listingId: string,
  kind: 'interest' | 'share' = 'interest',
): Promise<{ ok: true; newCount: number }> {
  return authPost<{ ok: true; newCount: number }>(
    `/souk/listings/${encodeURIComponent(listingId)}/interest`,
    { kind },
  );
}

export async function reportListing(
  listingId: string,
  reason: ReportReason,
  note?: string,
): Promise<{ ok: true; quarantined: boolean }> {
  return authPost<{ ok: true; quarantined: boolean }>(
    `/souk/listings/${encodeURIComponent(listingId)}/report`,
    { reason, note: note ?? null },
  );
}

// ── Ratings ──

export interface RateResponse {
  ok: true;
  ratingCount: number;
  ratingAverage: number | null;
  sellerReputation: number;
}

export async function rateListing(
  listingId: string,
  score: 1 | 2 | 3 | 4 | 5,
  text?: string,
): Promise<RateResponse> {
  return authPost<RateResponse>(
    `/souk/listings/${encodeURIComponent(listingId)}/rate`,
    { score, text: text ?? null },
  );
}

export interface Rating {
  userId: string;
  score: number;
  text: string;
  createdAt: number;
}

export async function fetchRatings(listingId: string): Promise<Rating[]> {
  const res = await authGet<{ items: Rating[] }>(
    `/souk/listings/${encodeURIComponent(listingId)}/ratings`,
  );
  return res.items;
}

// ── Dinarz payment ──

export interface PayResponse {
  ok: true;
  transferId: string;
  amount: number;
  senderBalance: number;
  sellerUid: string;
}

export async function payListingDnz(
  listingId: string,
  opts?: { quantity?: number; note?: string },
): Promise<PayResponse> {
  return authPost<PayResponse>(
    `/souk/listings/${encodeURIComponent(listingId)}/pay`,
    { quantity: opts?.quantity ?? 1, note: opts?.note ?? null },
  );
}

// ── Scholar escalation ──

export async function escalateToScholar(
  listingId: string,
  reason: string,
  question: string,
): Promise<{ ok: true; escalationId: string }> {
  return authPost<{ ok: true; escalationId: string }>(
    `/souk/listings/${encodeURIComponent(listingId)}/escalate`,
    { reason, question },
  );
}

// ── Seller profile ──

export async function fetchSeller(uid: string): Promise<{
  profile: SellerProfile;
  listings: Listing[];
}> {
  return authGet<{ profile: SellerProfile; listings: Listing[] }>(
    `/souk/sellers/${encodeURIComponent(uid)}`,
  );
}

// ── My listings ──

export async function fetchMyListings(uid: string): Promise<Listing[]> {
  try {
    const res = await authGet<{ items: Listing[] }>(`/souk/my-listings`);
    return res.items;
  } catch {
    const snap = await getDocs(
      query(
        collection(db, COLL),
        where('sellerId', '==', uid),
        orderBy('createdAt', 'desc'),
        fbLimit(50),
      ),
    );
    return snap.docs.map((d) => d.data() as Listing);
  }
}

// ── Media upload ──

export interface MediaUploadTicket {
  uploadUrl: string;
  publicUrl: string;
  storagePath: string;
  expiresAt: number;
}

export async function requestMediaUploadUrl(input: {
  contentType: string;
  byteSize: number;
}): Promise<MediaUploadTicket> {
  return authPost<MediaUploadTicket>('/souk/media/upload-url', input);
}
