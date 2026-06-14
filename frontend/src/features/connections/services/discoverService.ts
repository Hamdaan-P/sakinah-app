/**
 * "People you might know" ranking.
 *
 * Pulls a capped batch of public profiles and ranks them client-side by
 * overlap with the current user (archetype / profession / industry / location /
 * islamic interests / skills / hobbies). Zero backend — all scoring happens
 * in the browser, which is fine while the user base is small.
 */

import {
  collection,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import type { PublicProfile, ShukrSnapshot } from '@/features/public-profile/types/public-profile.types';

const FETCH_CAP = 100;

/** Human-readable "why we suggested them." Up to 3 reasons, in priority order. */
export interface Suggestion {
  profile: PublicProfile;
  score: number;
  reasons: string[];
}

interface RankSeed {
  archetype: string | null;
  profession: string | null;
  industry: string | null;
  location: string | null;
  islamicInterests: Set<string>;
  skills: Set<string>;
  hobbies: Set<string>;
  shukr?: ShukrSnapshot;
}

function toSeed(me: PublicProfile | null): RankSeed {
  return {
    archetype: me?.archetype?.toLowerCase() ?? null,
    profession: me?.profession?.toLowerCase() ?? null,
    industry: me?.industry?.toLowerCase() ?? null,
    location: me?.location?.toLowerCase() ?? null,
    islamicInterests: new Set((me?.islamicInterests ?? []).map((s) => s.toLowerCase())),
    skills: new Set((me?.skills ?? []).map((s) => s.toLowerCase())),
    hobbies: new Set((me?.hobbies ?? []).map((s) => s.toLowerCase())),
    shukr: me?.shukrSnapshot,
  };
}

/**
 * Score the Shukr (gratitude practice) compatibility between two users.
 * Returns added points + a human-readable reason.
 *
 * Heuristics:
 *  - Both maintaining a gratitude streak ≥7 days = strong accountability match
 *  - Same Barakah Labs level = peers at the same stage of practice
 *  - One significantly above the other = potential mentor relationship
 *  - Both reflective (avgDepthScore ≥ 2) = compatible journaling style
 *  - Big gap on streak (≥30 days lower) = "could inspire" — softer signal
 */
function scoreShukr(meSnap: ShukrSnapshot | undefined, otherSnap: ShukrSnapshot | undefined): { score: number; reason: string | null } {
  if (!meSnap || !otherSnap) return { score: 0, reason: null };

  let added = 0;
  let reason: string | null = null;

  const bothActive = (meSnap.currentStreak ?? 0) >= 7 && (otherSnap.currentStreak ?? 0) >= 7;
  if (bothActive) {
    added += 4;
    reason = 'Both on a gratitude streak';
  }

  if (meSnap.level === otherSnap.level && meSnap.level > 0) {
    added += 2;
    reason ??= `Same Shukr level (${meSnap.level})`;
  }

  const levelGap = Math.abs(meSnap.level - otherSnap.level);
  if (levelGap >= 2) {
    // Mentor / mentee dynamic — useful for Halaqah-style pairing
    added += 1;
    reason ??= otherSnap.level > meSnap.level ? 'Could mentor your Shukr practice' : 'Looks for mentorship';
  }

  if (meSnap.avgDepthScore >= 2 && otherSnap.avgDepthScore >= 2) {
    added += 2;
    reason ??= 'Both reflective journalers';
  }

  // Beginner buddies — both starting out
  if ((meSnap.totalBlessings ?? 0) < 30 && (otherSnap.totalBlessings ?? 0) < 30) {
    added += 1;
    reason ??= 'Beginner-buddy match';
  }

  return { score: added, reason };
}

function normalizeRaw(uid: string, data: Record<string, unknown>): PublicProfile {
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
    islamicInterests: Array.isArray(data.islamicInterests)
      ? (data.islamicInterests as string[])
      : [],
    islamicKnowledge: (data.islamicKnowledge as string | null) ?? null,
    skills: Array.isArray(data.skills) ? (data.skills as string[]) : [],
    hobbies: Array.isArray(data.hobbies) ? (data.hobbies as string[]) : [],
    instagramUrl: (data.instagramUrl as string | null) ?? null,
    twitterUrl: (data.twitterUrl as string | null) ?? null,
    linkedinUrl: (data.linkedinUrl as string | null) ?? null,
    websiteUrl: (data.websiteUrl as string | null) ?? null,
    memberSince: typeof data.memberSince === 'number' ? data.memberSince : null,
    connectionsCount: typeof data.connectionsCount === 'number' ? data.connectionsCount : 0,
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : 0,
    shukrSnapshot: (data.shukrSnapshot as ShukrSnapshot | undefined) ?? undefined,
  };
}

function sharedItems(a: Set<string>, b: string[]): string[] {
  const out: string[] = [];
  for (const v of b) {
    if (a.has(v.toLowerCase())) out.push(v);
  }
  return out;
}

function score(me: RankSeed, other: PublicProfile): { score: number; reasons: string[] } {
  let total = 0;
  const reasons: string[] = [];

  if (me.archetype && other.archetype && me.archetype === other.archetype.toLowerCase()) {
    total += 3;
    reasons.push(`Also a ${other.archetype}`);
  }
  if (me.profession && other.profession && me.profession === other.profession.toLowerCase()) {
    total += 2;
    reasons.push(`Also ${other.profession}`);
  }
  if (me.industry && other.industry && me.industry === other.industry.toLowerCase()) {
    total += 2;
    reasons.push(`Works in ${other.industry}`);
  }
  if (me.location && other.location && me.location === other.location.toLowerCase()) {
    total += 2;
    reasons.push(`Same location`);
  }

  const sharedInterests = sharedItems(me.islamicInterests, other.islamicInterests);
  if (sharedInterests.length > 0) {
    total += Math.min(sharedInterests.length, 3);
    reasons.push(
      sharedInterests.length === 1
        ? `Shares ${sharedInterests[0]}`
        : `${sharedInterests.length} shared interests`,
    );
  }

  const sharedSkills = sharedItems(me.skills, other.skills);
  if (sharedSkills.length > 0) {
    total += Math.min(sharedSkills.length, 3);
    reasons.push(
      sharedSkills.length === 1 ? `Shares ${sharedSkills[0]}` : `${sharedSkills.length} shared skills`,
    );
  }

  const sharedHobbies = sharedItems(me.hobbies, other.hobbies);
  if (sharedHobbies.length > 0) {
    total += Math.min(sharedHobbies.length, 2);
    reasons.push(
      sharedHobbies.length === 1
        ? `Also enjoys ${sharedHobbies[0]}`
        : `${sharedHobbies.length} shared hobbies`,
    );
  }

  const shukr = scoreShukr(me.shukr, other.shukrSnapshot);
  if (shukr.score > 0 && shukr.reason) {
    total += shukr.score;
    reasons.push(`✦ ${shukr.reason}`); // sparkle prefix marks Shukr-derived reasons
  }

  return { score: total, reasons: reasons.slice(0, 3) };
}

/**
 * Pull a batch of public profiles and rank them for `me`.
 *
 * @param me         current user's uid (excluded from results)
 * @param myProfile  current user's own public profile (drives overlap scoring)
 * @param excludeUids uids already connected / pending / declined — skip these
 * @param max        how many suggestions to return (default 20)
 */
export async function discoverPeople(
  me: string,
  myProfile: PublicProfile | null,
  excludeUids: Set<string>,
  max = 20,
): Promise<Suggestion[]> {
  const q = query(
    collection(db, 'public_profiles'),
    where('isPublic', '==', true),
    orderBy('updatedAt', 'desc'),
    fsLimit(FETCH_CAP),
  );
  const snap = await getDocs(q);
  const candidates: PublicProfile[] = [];
  snap.forEach((d) => {
    if (d.id === me || excludeUids.has(d.id)) return;
    candidates.push(normalizeRaw(d.id, d.data() as Record<string, unknown>));
  });

  const seed = toSeed(myProfile);
  const scored: Suggestion[] = candidates.map((p) => {
    const { score: s, reasons } = score(seed, p);
    return { profile: p, score: s, reasons };
  });

  // Sort by score desc; tiebreak by updatedAt desc (freshness).
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.profile.updatedAt - a.profile.updatedAt;
  });

  return scored.slice(0, max);
}
