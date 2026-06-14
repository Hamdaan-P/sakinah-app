/**
 * Quran Workspace Service
 *
 * Unified store for the Tadabbur "My Quran Workspace" hub:
 * Notes, Documents, Reflections, Reminders — plus a virtual view
 * over existing bookmarks (see quranBookmarkService).
 *
 * Design source: /tadabbur-app.html (Screen 6 — WORKSPACE).
 */

import { getBookmarks, type QuranBookmark } from './quranBookmarkService';
import { getAnnotations } from './annotationManager';
import type { Annotation } from '../types/quran.types';

export type WorkspaceItemType = 'note' | 'document' | 'reflection' | 'reminder';

export interface AyahPreview {
  surahName: string;
  surahNameArabic: string;
  arabic: string;
  translation: string;
}

export interface WorkspaceItem {
  id: string;
  type: WorkspaceItemType;
  title: string;
  body: string;            // markdown-ish prose; ayah embeds rendered from `linkedAyahs`
  linkedAyahs: string[];   // verse keys, e.g. ["25:63", "25:64-77"]
  /** Cached preview content per linked verse key — populated by the picker so
   *  the editor renders real Arabic + translation without re-fetching. */
  ayahPreviews?: Record<string, AyahPreview>;
  tags: string[];          // without the leading "#"
  reminderAt?: number;     // epoch ms — only meaningful for reminders / notes-with-reminder
  reminderChannel?: 'whatsapp' | 'in-app';
  createdAt: number;
  updatedAt: number;
}

export type WorkspaceFilter = 'all' | WorkspaceItemType | 'bookmark' | 'annotation';

const KEY = 'quran_workspace_items';
const DIRTY_KEY = 'quran_workspace_dirty';

/** Mark an item as needing server sync. workspaceSyncService listens for the
 *  'quran-workspace-dirty' event and flushes after a debounce. */
function markDirty(id: string, op: 'upsert' | 'delete'): void {
  try {
    const raw = localStorage.getItem(DIRTY_KEY);
    const map: Record<string, 'upsert' | 'delete'> = raw ? JSON.parse(raw) : {};
    map[id] = op;
    localStorage.setItem(DIRTY_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('quran-workspace-dirty'));
  } catch {
    /* localStorage unavailable — sync will retry on next change */
  }
}

function load(): WorkspaceItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Defensive normalisation — old localStorage entries from prior versions
    // may be missing fields. Coerce so the renderer never sees undefined.
    return parsed
      .filter((i) => i && typeof i === 'object' && typeof i.id === 'string')
      .map((i): WorkspaceItem => ({
        id: i.id,
        type: (['note', 'document', 'reflection', 'reminder'].includes(i.type) ? i.type : 'note') as WorkspaceItemType,
        title: typeof i.title === 'string' ? i.title : 'Untitled',
        body: typeof i.body === 'string' ? i.body : '',
        linkedAyahs: Array.isArray(i.linkedAyahs) ? i.linkedAyahs.filter((k: unknown) => typeof k === 'string') : [],
        ayahPreviews: i.ayahPreviews && typeof i.ayahPreviews === 'object' ? i.ayahPreviews : undefined,
        tags: Array.isArray(i.tags) ? i.tags.filter((t: unknown) => typeof t === 'string') : [],
        reminderAt: typeof i.reminderAt === 'number' ? i.reminderAt : undefined,
        reminderChannel: i.reminderChannel === 'whatsapp' || i.reminderChannel === 'in-app' ? i.reminderChannel : undefined,
        createdAt: typeof i.createdAt === 'number' ? i.createdAt : Date.now(),
        updatedAt: typeof i.updatedAt === 'number' ? i.updatedAt : Date.now(),
      }));
  } catch {
    return [];
  }
}

function save(items: WorkspaceItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function uid(): string {
  return `ws_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Get all workspace items, newest first. */
export function getItems(filter: WorkspaceFilter = 'all'): WorkspaceItem[] {
  const items = load().sort((a, b) => b.updatedAt - a.updatedAt);
  if (filter === 'all' || filter === 'bookmark') return items;
  return items.filter((i) => i.type === filter);
}

export function getItem(id: string): WorkspaceItem | null {
  return load().find((i) => i.id === id) ?? null;
}

export interface WorkspaceCounts {
  notes: number;
  documents: number;
  reflections: number;
  reminders: number;
  bookmarks: number;
  annotations: number;
  total: number;
}

export function getCounts(): WorkspaceCounts {
  const items = load();
  const notes = items.filter((i) => i.type === 'note').length;
  const documents = items.filter((i) => i.type === 'document').length;
  const reflections = items.filter((i) => i.type === 'reflection').length;
  const reminders = items.filter((i) => i.type === 'reminder').length;
  const bookmarks = getBookmarks().length;
  const annotations = getAnnotations().length;
  return {
    notes,
    documents,
    reflections,
    reminders,
    bookmarks,
    annotations,
    total: notes + documents + reflections + reminders + bookmarks + annotations,
  };
}

export interface CreateItemInput {
  type: WorkspaceItemType;
  title: string;
  body?: string;
  linkedAyahs?: string[];
  ayahPreviews?: Record<string, AyahPreview>;
  tags?: string[];
  reminderAt?: number;
  reminderChannel?: 'whatsapp' | 'in-app';
}

export function createItem(input: CreateItemInput): WorkspaceItem {
  const now = Date.now();
  const item: WorkspaceItem = {
    id: uid(),
    type: input.type,
    title: input.title || 'Untitled',
    body: input.body ?? '',
    linkedAyahs: input.linkedAyahs ?? [],
    ayahPreviews: input.ayahPreviews,
    tags: input.tags ?? [],
    reminderAt: input.reminderAt,
    reminderChannel: input.reminderChannel,
    createdAt: now,
    updatedAt: now,
  };
  const items = load();
  items.push(item);
  save(items);
  markDirty(item.id, 'upsert');
  return item;
}

export function updateItem(
  id: string,
  patch: Partial<Omit<WorkspaceItem, 'id' | 'createdAt'>>,
): WorkspaceItem | null {
  const items = load();
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return null;
  items[idx] = { ...items[idx], ...patch, updatedAt: Date.now() };
  save(items);
  markDirty(id, 'upsert');
  return items[idx];
}

export function deleteItem(id: string): void {
  save(load().filter((i) => i.id !== id));
  markDirty(id, 'delete');
}

/**
 * Internal hook for workspaceSyncService — apply a remote snapshot of an item
 * (last-write-wins by updatedAt). Does NOT re-enqueue dirty.
 */
export function _applyRemoteItem(item: WorkspaceItem): void {
  const items = load();
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx < 0) {
    items.push(item);
  } else if ((items[idx].updatedAt ?? 0) < item.updatedAt) {
    items[idx] = item;
  } else {
    return;
  }
  save(items);
}

/** Internal: apply a remote delete (no dirty re-enqueue). */
export function _applyRemoteDelete(id: string): void {
  save(load().filter((i) => i.id !== id));
}

/** Internal: read the dirty map (consumed by workspaceSyncService). */
export function _readDirty(): Record<string, 'upsert' | 'delete'> {
  try {
    const raw = localStorage.getItem(DIRTY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Internal: clear specific dirty entries after they've been flushed. */
export function _clearDirty(ids: string[]): void {
  try {
    const current = _readDirty();
    for (const id of ids) delete current[id];
    localStorage.setItem(DIRTY_KEY, JSON.stringify(current));
  } catch {
    /* ignore */
  }
}

/**
 * A bookmark presented as a read-only workspace row. Useful so the unified
 * "All" feed can interleave bookmarks with notes/docs/reflections without
 * duplicating storage.
 */
export interface BookmarkRow {
  kind: 'bookmark';
  bookmark: QuranBookmark;
}
export interface WorkspaceRow {
  kind: 'item';
  item: WorkspaceItem;
}
export interface AnnotationRow {
  kind: 'annotation';
  annotation: Annotation;
}
export type FeedRow = BookmarkRow | WorkspaceRow | AnnotationRow;

/** Timestamp a feed row sorts by (newest first). */
function rowTimestamp(row: FeedRow): number {
  if (row.kind === 'item') return row.item.updatedAt;
  if (row.kind === 'bookmark') return row.bookmark.savedAt;
  return row.annotation.updatedAt;
}

export function getFeed(filter: WorkspaceFilter = 'all'): FeedRow[] {
  if (filter === 'bookmark') {
    return getBookmarks().map((bookmark) => ({ kind: 'bookmark', bookmark }));
  }
  if (filter === 'annotation') {
    return getAnnotations().map((annotation) => ({ kind: 'annotation', annotation }));
  }
  const itemRows: FeedRow[] = getItems(filter).map((item) => ({ kind: 'item', item }));
  if (filter === 'all') {
    const bmRows: FeedRow[] = getBookmarks().map((bookmark) => ({ kind: 'bookmark', bookmark }));
    const annRows: FeedRow[] = getAnnotations().map((annotation) => ({ kind: 'annotation', annotation }));
    return [...itemRows, ...bmRows, ...annRows].sort((a, b) => rowTimestamp(b) - rowTimestamp(a));
  }
  return itemRows;
}
