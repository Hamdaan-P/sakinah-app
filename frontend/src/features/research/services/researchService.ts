/**
 * researchService — CRUD for the scholar research workbench.
 *
 * Firestore layout:
 *   research_articles/{articleId}    — articles (public read when published)
 *   scholar_profiles/{uid}           — opt-in scholar profile
 *
 * Article slugs are generated client-side; collisions are handled by suffix.
 */

import { auth, db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fsLimit,
  serverTimestamp,
  addDoc,
  increment,
} from 'firebase/firestore';
import type {
  ResearchArticle,
  ResearchScholarProfile,
  ResearchCitation,
  ResearchArticleStatus,
} from '../types/research.types';

// ── Helpers ────────────────────────────────────────────────────────

function requireUid(): string {
  const u = auth.currentUser;
  if (!u) throw new Error('Sign in required');
  return u.uid;
}

function currentDisplayName(): string {
  return auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Scholar';
}

function currentPhotoUrl(): string | undefined {
  return auth.currentUser?.photoURL ?? undefined;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ── Articles ───────────────────────────────────────────────────────

export async function createArticle(input: {
  title: string;
  body?: string;
  summary?: string;
  tags?: string[];
}): Promise<ResearchArticle> {
  const uid = requireUid();
  const slug = slugify(input.title) || `article-${Date.now()}`;
  const ref = await addDoc(collection(db, 'research_articles'), {
    authorUid: uid,
    authorName: currentDisplayName(),
    authorPhotoUrl: currentPhotoUrl() ?? null,
    title: input.title.trim().slice(0, 200),
    slug,
    summary: (input.summary ?? '').trim().slice(0, 400),
    body: input.body ?? '',
    citations: [],
    tags: (input.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8),
    status: 'draft' as ResearchArticleStatus,
    wordCount: wordCount(input.body ?? ''),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: null,
    viewCount: 0,
    bookmarkCount: 0,
  });
  const created = await getDoc(ref);
  return rawToArticle(ref.id, created.data() as Record<string, unknown>);
}

export async function updateArticle(
  id: string,
  patch: Partial<Pick<ResearchArticle, 'title' | 'body' | 'summary' | 'tags' | 'citations'>>,
): Promise<void> {
  requireUid();
  const update: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.title !== undefined) update.title = patch.title.trim().slice(0, 200);
  if (patch.body !== undefined) {
    update.body = patch.body;
    update.wordCount = wordCount(patch.body);
  }
  if (patch.summary !== undefined) update.summary = patch.summary.trim().slice(0, 400);
  if (patch.tags !== undefined) update.tags = patch.tags.map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8);
  if (patch.citations !== undefined) update.citations = patch.citations.slice(0, 64);
  await updateDoc(doc(db, 'research_articles', id), update);
}

export async function publishArticle(id: string): Promise<void> {
  requireUid();
  await updateDoc(doc(db, 'research_articles', id), {
    status: 'published',
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Bump scholar profile articleCount
  const uid = requireUid();
  const profRef = doc(db, 'scholar_profiles', uid);
  const prof = await getDoc(profRef);
  if (prof.exists()) {
    await updateDoc(profRef, { articleCount: increment(1) });
  }
}

export async function archiveArticle(id: string): Promise<void> {
  requireUid();
  await updateDoc(doc(db, 'research_articles', id), {
    status: 'archived',
    updatedAt: serverTimestamp(),
  });
}

export async function deleteArticle(id: string): Promise<void> {
  requireUid();
  await deleteDoc(doc(db, 'research_articles', id));
}

export async function getArticle(id: string): Promise<ResearchArticle | null> {
  const snap = await getDoc(doc(db, 'research_articles', id));
  if (!snap.exists()) return null;
  return rawToArticle(snap.id, snap.data() as Record<string, unknown>);
}

export async function listMyArticles(): Promise<ResearchArticle[]> {
  const uid = requireUid();
  const q = query(
    collection(db, 'research_articles'),
    where('authorUid', '==', uid),
    orderBy('updatedAt', 'desc'),
    fsLimit(50),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => rawToArticle(d.id, d.data() as Record<string, unknown>));
}

export async function listPublishedArticles(lim = 30): Promise<ResearchArticle[]> {
  const q = query(
    collection(db, 'research_articles'),
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc'),
    fsLimit(lim),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => rawToArticle(d.id, d.data() as Record<string, unknown>));
}

function rawToArticle(id: string, data: Record<string, unknown>): ResearchArticle {
  return {
    id,
    authorUid: (data.authorUid as string) ?? '',
    authorName: (data.authorName as string) ?? 'Unknown',
    authorPhotoUrl: (data.authorPhotoUrl as string) ?? undefined,
    title: (data.title as string) ?? '',
    slug: (data.slug as string) ?? '',
    summary: (data.summary as string) ?? '',
    body: (data.body as string) ?? '',
    citations: (data.citations as ResearchCitation[]) ?? [],
    tags: (data.tags as string[]) ?? [],
    status: (data.status as ResearchArticleStatus) ?? 'draft',
    wordCount: (data.wordCount as number) ?? 0,
    createdAt: (data.createdAt as { toMillis?: () => number })?.toMillis?.() ?? Date.now(),
    updatedAt: (data.updatedAt as { toMillis?: () => number })?.toMillis?.() ?? Date.now(),
    publishedAt: (data.publishedAt as { toMillis?: () => number })?.toMillis?.() ?? null,
    viewCount: (data.viewCount as number) ?? 0,
    bookmarkCount: (data.bookmarkCount as number) ?? 0,
  };
}

// ── Scholar profile ────────────────────────────────────────────────

export async function getMyScholarProfile(): Promise<ResearchScholarProfile | null> {
  const uid = requireUid();
  const snap = await getDoc(doc(db, 'scholar_profiles', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: snap.id,
    displayName: data.displayName ?? currentDisplayName(),
    bio: data.bio ?? '',
    credentials: data.credentials ?? [],
    specialties: data.specialties ?? [],
    websiteUrl: data.websiteUrl,
    isVerified: data.isVerified ?? false,
    articleCount: data.articleCount ?? 0,
  };
}

export async function upsertScholarProfile(input: Partial<Omit<ResearchScholarProfile, 'uid' | 'isVerified' | 'articleCount'>>): Promise<void> {
  const uid = requireUid();
  await setDoc(doc(db, 'scholar_profiles', uid), {
    displayName: input.displayName ?? currentDisplayName(),
    bio: (input.bio ?? '').slice(0, 500),
    credentials: (input.credentials ?? []).slice(0, 8),
    specialties: (input.specialties ?? []).slice(0, 6),
    websiteUrl: input.websiteUrl ?? null,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getScholarProfileByUid(uid: string): Promise<ResearchScholarProfile | null> {
  const snap = await getDoc(doc(db, 'scholar_profiles', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: snap.id,
    displayName: data.displayName ?? 'Scholar',
    bio: data.bio ?? '',
    credentials: data.credentials ?? [],
    specialties: data.specialties ?? [],
    websiteUrl: data.websiteUrl,
    isVerified: data.isVerified ?? false,
    articleCount: data.articleCount ?? 0,
  };
}

// ── Citation helpers ───────────────────────────────────────────────

export function newCitation(input: Omit<ResearchCitation, 'id'>): ResearchCitation {
  return { id: `c_${Math.random().toString(36).slice(2, 10)}`, ...input };
}

/**
 * Replace [[ref:cite-id]] tokens in body markdown with formatted footnote
 * markers. Used in the publish-time render to embed citations.
 */
export function expandCitationsInBody(body: string, citations: ResearchCitation[]): string {
  const map = new Map(citations.map((c) => [c.id, c]));
  return body.replace(/\[\[ref:([a-zA-Z0-9_]+)\]\]/g, (_m, id) => {
    const c = map.get(id);
    if (!c) return '';
    if (c.source === 'quran') return ` (Qur'an ${c.reference})`;
    if (c.source === 'hadith') return ` (${c.attribution || 'Hadith'} ${c.reference})`;
    return ` (${c.reference})`;
  });
}
