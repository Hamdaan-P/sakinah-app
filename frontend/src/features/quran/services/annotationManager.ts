/**
 * AnnotationManager
 * Inline notes attached to verses or specific words. Non-blocking — no modals.
 * Persists to localStorage with an in-memory event emitter for reactive UI.
 */

import type { Annotation, AnnotationStatus } from '../types/quran.types';

const STORAGE_KEY = 'quran_annotations_v1';
const LISTENERS = new Set<() => void>();

function load(): Annotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Annotation[]) : [];
  } catch {
    return [];
  }
}

function save(list: Annotation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  LISTENERS.forEach((fn) => fn());
}

function genId(): string {
  return `ann_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function onAnnotationsChange(listener: () => void): () => void {
  LISTENERS.add(listener);
  return () => LISTENERS.delete(listener);
}

export function getAnnotations(): Annotation[] {
  return load().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getAnnotationsForVerse(verseKey: string): Annotation[] {
  return load().filter((a) => a.verseKey === verseKey);
}

export function getAnnotationsForSurah(surahId: number): Annotation[] {
  return load().filter((a) => a.surahId === surahId);
}

export function createAnnotation(input: {
  verseKey: string;
  surahId: number;
  comment: string;
  tags?: string[];
  wordPosition?: number;
  pageNumber?: number;
}): Annotation {
  const now = Date.now();
  const ann: Annotation = {
    id: genId(),
    verseKey: input.verseKey,
    surahId: input.surahId,
    wordPosition: input.wordPosition,
    pageNumber: input.pageNumber,
    comment: input.comment.trim(),
    tags: input.tags ?? [],
    status: 'open',
    createdAt: now,
    updatedAt: now,
  };
  const list = load();
  list.push(ann);
  save(list);
  return ann;
}

export function updateAnnotation(id: string, patch: Partial<Pick<Annotation, 'comment' | 'tags' | 'status'>>): Annotation | null {
  const list = load();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const current = list[idx];
  const next: Annotation = {
    ...current,
    ...patch,
    tags: patch.tags ?? current.tags,
    updatedAt: Date.now(),
  };
  list[idx] = next;
  save(list);
  return next;
}

export function setAnnotationStatus(id: string, status: AnnotationStatus): Annotation | null {
  return updateAnnotation(id, { status });
}

export function deleteAnnotation(id: string): void {
  save(load().filter((a) => a.id !== id));
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  load().forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

/** Group annotations for the Annotations list view (sort: by-page | by-surah | by-date) */
export type AnnotationSort = 'page' | 'surah' | 'recent';

export function sortAnnotations(list: Annotation[], mode: AnnotationSort): Annotation[] {
  const copy = [...list];
  switch (mode) {
    case 'page':
      return copy.sort((a, b) => (a.pageNumber ?? 999) - (b.pageNumber ?? 999) || a.verseKey.localeCompare(b.verseKey));
    case 'surah':
      return copy.sort((a, b) => a.surahId - b.surahId || a.verseKey.localeCompare(b.verseKey));
    case 'recent':
    default:
      return copy.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}
