/**
 * Public Profile Service
 * Handles slug claim/release and the public_profiles mirror doc.
 */

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import type { PublicProfile, ShukrSnapshot } from '../types/public-profile.types';
import {
  RESERVED_SLUGS,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_REGEX,
} from '../types/public-profile.types';

/** Normalize any string into a slug candidate (lowercase, dashes, stripped). */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, SLUG_MAX_LENGTH);
}

/** Is the given string a syntactically valid handle? (Doesn't check availability.) */
export function isSlugFormatValid(slug: string): boolean {
  if (!slug || slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) return false;
  if (!SLUG_REGEX.test(slug)) return false;
  if (RESERVED_SLUGS.has(slug)) return false;
  return true;
}

/** Check whether a slug is free to claim. */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  if (!isSlugFormatValid(slug)) return false;
  const snap = await getDoc(doc(db, 'slugs', slug));
  return !snap.exists();
}

/** Pick a free slug based on a name. Tries "umar", "umar-1", "umar-2", …. */
export async function generateUniqueSlug(seed: string, fallback = 'user'): Promise<string> {
  const base = slugify(seed) || fallback;
  // Ensure min length after slugify — short names get padded.
  const seeded = base.length >= SLUG_MIN_LENGTH ? base : `${base}-user`.slice(0, SLUG_MAX_LENGTH);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? seeded : `${seeded}-${i}`.slice(0, SLUG_MAX_LENGTH);
    if (!isSlugFormatValid(candidate)) continue;
    if (await isSlugAvailable(candidate)) return candidate;
  }
  // Last resort — append random suffix
  const rand = Math.random().toString(36).slice(2, 6);
  return `${seeded}-${rand}`.slice(0, SLUG_MAX_LENGTH);
}

/**
 * Claim a slug for a user. If they already had a slug, release the old one.
 * Throws if the new slug is invalid or already taken by someone else.
 */
export async function claimSlug(uid: string, newSlug: string, oldSlug?: string | null): Promise<void> {
  if (!isSlugFormatValid(newSlug)) {
    throw new Error('Handle must be 3–24 chars, lowercase letters, numbers, or dashes.');
  }
  if (oldSlug === newSlug) return;

  // Check availability (race is possible; rule will still block double-claim)
  const existing = await getDoc(doc(db, 'slugs', newSlug));
  if (existing.exists()) {
    const existingUid = (existing.data() as { uid?: string }).uid;
    if (existingUid !== uid) throw new Error('That handle is already taken.');
  }

  const batch = writeBatch(db);
  batch.set(doc(db, 'slugs', newSlug), {
    slug: newSlug,
    uid,
    createdAt: serverTimestamp(),
  });
  if (oldSlug && oldSlug !== newSlug) {
    batch.delete(doc(db, 'slugs', oldSlug));
  }
  batch.set(
    doc(db, 'public_profiles', uid),
    { slug: newSlug, updatedAt: serverTimestamp() },
    { merge: true },
  );
  await batch.commit();
}

/**
 * Update only the Shukr snapshot field on the public profile. Called whenever
 * Barka Labs stats change so the connections Discover ranker can use them
 * without N extra reads. Best-effort: silently ignores failures.
 */
export async function updateShukrSnapshot(uid: string, snapshot: Omit<ShukrSnapshot, 'updatedAt'>): Promise<void> {
  try {
    await setDoc(
      doc(db, 'public_profiles', uid),
      {
        shukrSnapshot: { ...snapshot, updatedAt: Date.now() },
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.warn('[publicProfile] updateShukrSnapshot failed (non-blocking):', err);
  }
}

/** Read the public_profiles/{uid} doc directly. Returns null if not found. */
export async function getPublicProfileByUid(uid: string): Promise<PublicProfile | null> {
  const snap = await getDoc(doc(db, 'public_profiles', uid));
  if (!snap.exists()) return null;
  return normalizePublicProfile(uid, snap.data());
}

/**
 * Idempotent: make sure the current user has a public_profiles mirror.
 * Safe to call on every app boot — reads users/{uid} (own doc, rules allow)
 * and syncs the safe subset. No-op if mirror already exists and userData is
 * unchanged; otherwise updates.
 */
export async function ensureOwnPublicProfile(uid: string): Promise<PublicProfile | null> {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return null;
    return await syncPublicProfile(uid, userSnap.data() as Record<string, unknown>, {
      ensureSlug: true,
    });
  } catch (err) {
    console.warn('ensureOwnPublicProfile failed', err);
    return null;
  }
}

/**
 * Resolve /p/:slug or /@:slug → PublicProfile.
 *
 * Two lookup paths are attempted:
 *   1. slugs/{slug} → uid → public_profiles/{uid} (pretty-handle case)
 *   2. public_profiles/{slug} directly (fallback when the "slug" is actually
 *      a raw Firebase UID — e.g. when someone shared their link before they
 *      had a custom handle set up)
 *
 * Returns null only if neither path resolves to an existing profile.
 */
export async function getPublicProfileBySlug(slug: string): Promise<PublicProfile | null> {
  // Try the pretty-handle path first.
  const slugSnap = await getDoc(doc(db, 'slugs', slug));
  if (slugSnap.exists()) {
    const { uid } = slugSnap.data() as { uid: string };
    const byUid = await getPublicProfileByUid(uid);
    if (byUid) return byUid;
  }
  // Fall back to treating the value as a uid directly.
  return getPublicProfileByUid(slug);
}

/** Toggle whether the public profile is visible to strangers. */
export async function setProfileVisibility(uid: string, isPublic: boolean): Promise<void> {
  await setDoc(
    doc(db, 'public_profiles', uid),
    { isPublic, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/**
 * Copy the safe-to-share subset of users/{uid} → public_profiles/{uid}.
 * Call after the user edits their profile, or lazily on first share.
 * Leaves `slug` and `isPublic` alone if they already exist (so sync doesn't clobber user choice).
 */
export async function syncPublicProfile(
  uid: string,
  userData: Record<string, unknown>,
  options: { ensureSlug?: boolean } = {},
): Promise<PublicProfile> {
  const existingSnap = await getDoc(doc(db, 'public_profiles', uid));
  const existing = existingSnap.exists() ? (existingSnap.data() as Record<string, unknown>) : null;

  // Ensure the user has a slug (lazy-generate on first sync if asked).
  let slug = (existing?.slug as string | undefined) ?? null;
  if (!slug && options.ensureSlug) {
    const seed =
      (userData.display_name as string | undefined) ||
      (userData.full_name as string | undefined) ||
      (userData.displayName as string | undefined) ||
      (userData.fullName as string | undefined) ||
      uid.slice(0, 8);
    slug = await generateUniqueSlug(seed);
    await setDoc(doc(db, 'slugs', slug), {
      slug,
      uid,
      createdAt: serverTimestamp(),
    });
  }

  const isPublic = (existing?.isPublic as boolean | undefined) ?? true;

  const payload: Record<string, unknown> = {
    uid,
    isPublic,
    fullName: userData.full_name ?? userData.fullName ?? null,
    displayName: userData.display_name ?? userData.displayName ?? null,
    photoUrl:
      userData.profile_image_url ??
      userData.profileImageUrl ??
      userData.photo_url ??
      userData.photoUrl ??
      null,
    bio: userData.bio ?? null,
    profession: userData.profession ?? null,
    company: userData.company ?? null,
    industry: userData.industry ?? null,
    location: userData.location ?? null,
    gender: (userData.gender === 'male' || userData.gender === 'female') ? userData.gender : null,
    archetype: userData.pascoArchetype ?? userData.pasco_archetype ?? null,
    islamicInterests: Array.isArray(userData.islamic_interests)
      ? (userData.islamic_interests as string[])
      : Array.isArray(userData.islamicInterests)
        ? (userData.islamicInterests as string[])
        : [],
    islamicKnowledge: (userData.islamic_knowledge as string | null) ?? (userData.islamicKnowledge as string | null) ?? null,
    skills: Array.isArray(userData.skills) ? (userData.skills as string[]) : [],
    hobbies: Array.isArray(userData.hobbies) ? (userData.hobbies as string[]) : [],
    instagramUrl: userData.instagram_url ?? userData.instagramUrl ?? null,
    twitterUrl: userData.twitter_url ?? userData.twitterUrl ?? null,
    linkedinUrl: userData.linkedin_url ?? userData.linkedinUrl ?? null,
    websiteUrl: userData.website_url ?? userData.websiteUrl ?? null,
    memberSince:
      toMillis(userData.created_at) ??
      toMillis(userData.createdAt) ??
      (existing?.memberSince as number | null | undefined) ??
      Date.now(),
    updatedAt: serverTimestamp(),
  };
  if (slug) payload.slug = slug;

  await setDoc(doc(db, 'public_profiles', uid), payload, { merge: true });

  return normalizePublicProfile(uid, { ...existing, ...payload });
}

function toMillis(v: unknown): number | null {
  if (!v) return null;
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === 'number') return v;
  if (v instanceof Date) return v.getTime();
  return null;
}

function normalizePublicProfile(uid: string, data: Record<string, unknown>): PublicProfile {
  return {
    uid,
    slug: (data.slug as string) ?? '',
    isPublic: (data.isPublic as boolean) ?? true,
    fullName: (data.fullName as string | null) ?? null,
    displayName: (data.displayName as string | null) ?? null,
    photoUrl: (data.photoUrl as string | null) ?? null,
    bio: (data.bio as string | null) ?? null,
    profession: (data.profession as string | null) ?? null,
    company: (data.company as string | null) ?? null,
    industry: (data.industry as string | null) ?? null,
    location: (data.location as string | null) ?? null,
    gender: data.gender === 'male' || data.gender === 'female' ? data.gender : null,
    archetype: (data.archetype as string | null) ?? null,
    islamicInterests: Array.isArray(data.islamicInterests) ? (data.islamicInterests as string[]) : [],
    islamicKnowledge: (data.islamicKnowledge as string | null) ?? null,
    skills: Array.isArray(data.skills) ? (data.skills as string[]) : [],
    hobbies: Array.isArray(data.hobbies) ? (data.hobbies as string[]) : [],
    instagramUrl: (data.instagramUrl as string | null) ?? null,
    twitterUrl: (data.twitterUrl as string | null) ?? null,
    linkedinUrl: (data.linkedinUrl as string | null) ?? null,
    websiteUrl: (data.websiteUrl as string | null) ?? null,
    memberSince: toMillis(data.memberSince),
    connectionsCount: typeof data.connectionsCount === 'number' ? data.connectionsCount : 0,
    updatedAt: toMillis(data.updatedAt) ?? Date.now(),
  };
}
