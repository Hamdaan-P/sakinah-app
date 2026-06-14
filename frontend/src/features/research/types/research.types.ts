/**
 * Research feature types — Notion-for-scholars: search Quran/hadith,
 * write articles with citations, publish.
 */

export type ResearchArticleStatus = 'draft' | 'published' | 'archived';

export interface ResearchCitation {
  id: string;
  /** 'quran' | 'hadith' | 'external' */
  source: 'quran' | 'hadith' | 'external';
  /** For Quran: verseKey "2:255". For hadith: collection+number. For external: URL. */
  reference: string;
  /** Optional Arabic text (Quran/hadith) */
  arabic?: string;
  /** Translation or quoted text */
  translation: string;
  /** e.g. "Sahih Bukhari", "Quran.com translation by ..." */
  attribution?: string;
}

export interface ResearchArticle {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhotoUrl?: string;
  title: string;
  slug: string;
  /** Plain-text summary used in lists / share cards. */
  summary: string;
  /** Markdown body. Citations referenced by [[ref:id]] tokens. */
  body: string;
  citations: ResearchCitation[];
  tags: string[];
  status: ResearchArticleStatus;
  /** Word count of body — for reading time. */
  wordCount: number;
  /** Server timestamps (ms) */
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
  /** Public-discovery metrics; set by Cloud Function later. Local-only for v1. */
  viewCount: number;
  bookmarkCount: number;
}

export interface ResearchScholarProfile {
  uid: string;
  displayName: string;
  bio: string;
  credentials: string[];      // free-text — "Ijazah in Hafs", "Madinah graduate"
  specialties: string[];      // e.g. ["Tafsir", "Hadith Sciences"]
  websiteUrl?: string;
  isVerified: boolean;        // moderator badge
  articleCount: number;
}
