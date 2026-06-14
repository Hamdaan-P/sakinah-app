/**
 * researchCollectionsService — localStorage-backed user collections of
 * saved research results. Mirrors the `_v1`-suffix + listener-emitter pattern
 * used by annotationManager.ts and highlightManager.ts so future migrations
 * follow the same shape.
 */

import type {
  ResearchCollection,
  ResearchCollectionItem,
  ResearchResult,
} from '../types/quran.types';

const STORAGE_KEY = 'quran_research_collections_v1';
const LISTENERS = new Set<() => void>();

function load(): ResearchCollection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ResearchCollection[]) : [];
  } catch {
    return [];
  }
}

function save(list: ResearchCollection[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore storage quota / disabled storage */
  }
  LISTENERS.forEach((fn) => fn());
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function onCollectionsChange(listener: () => void): () => void {
  LISTENERS.add(listener);
  return () => LISTENERS.delete(listener);
}

export function listCollections(): ResearchCollection[] {
  return load().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function ensureDefaultCollection(): ResearchCollection {
  const list = load();
  let existing = list.find((c) => c.name.toLowerCase() === 'general');
  if (existing) return existing;
  const now = Date.now();
  existing = { id: genId('col'), name: 'General', createdAt: now, updatedAt: now, items: [] };
  list.unshift(existing);
  save(list);
  return existing;
}

export function createCollection(name: string): ResearchCollection {
  const trimmed = name.trim() || 'Untitled';
  const list = load();
  const now = Date.now();
  const col: ResearchCollection = {
    id: genId('col'),
    name: trimmed,
    createdAt: now,
    updatedAt: now,
    items: [],
  };
  list.unshift(col);
  save(list);
  return col;
}

export function deleteCollection(collectionId: string): void {
  const next = load().filter((c) => c.id !== collectionId);
  save(next);
}

export function saveResultToCollection(
  collectionId: string,
  result: ResearchResult,
): ResearchCollectionItem | null {
  const list = load();
  const col = list.find((c) => c.id === collectionId);
  if (!col) return null;
  const item: ResearchCollectionItem = {
    id: genId('item'),
    savedAt: Date.now(),
    result,
  };
  col.items.unshift(item);
  col.updatedAt = item.savedAt;
  save(list);
  return item;
}

export function removeItemFromCollection(collectionId: string, itemId: string): void {
  const list = load();
  const col = list.find((c) => c.id === collectionId);
  if (!col) return;
  col.items = col.items.filter((i) => i.id !== itemId);
  col.updatedAt = Date.now();
  save(list);
}
