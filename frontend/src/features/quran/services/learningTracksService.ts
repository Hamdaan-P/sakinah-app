/**
 * learningTracksService
 *
 * Catalog fetcher for the scholar-led learning tracks (PDF Section 11
 * items 1 + 2). The track data lives on the backend; per-user progress
 * lives in localStorage under `quran_learning_tracks_progress_v1` so the
 * server holds no per-user state for this feature in v1.
 */

import { authGet } from '@/lib/api';
import type {
  LearningTrack,
  LearningTrackProgress,
  LearningTrackSummary,
} from '../types/quran.types';
import { classifyApiError } from './_apiErrors';
import { FALLBACK_TRACK_CATALOG, getFallbackTrack } from './learningTracksFallback';

/** Set to true when the most recent fetchTracks call used the local fallback. */
let _lastFetchWasFallback = false;
export function tracksAreOffline(): boolean {
  return _lastFetchWasFallback;
}

interface CatalogResponse {
  tracks: LearningTrackSummary[];
  count: number;
}

const _catalogCache: { p: Promise<LearningTrackSummary[]> | null } = { p: null };
const _trackCache = new Map<string, Promise<LearningTrack>>();

export function fetchTracks(): Promise<LearningTrackSummary[]> {
  if (_catalogCache.p) return _catalogCache.p;
  const path = '/quran/learning-tracks';
  const p = authGet<CatalogResponse>(path)
    .then((r) => {
      _lastFetchWasFallback = false;
      return r.tracks ?? [];
    })
    .catch((e) => {
      // Any failure — network, 404, CORS, auth — falls back to the bundled
      // catalog so the catalog page is always usable. The page surfaces the
      // offline state via tracksAreOffline() so users know detail pages
      // still need the backend.
      void e; // intentionally swallow — exposed via tracksAreOffline()
      _lastFetchWasFallback = true;
      return FALLBACK_TRACK_CATALOG;
    });
  _catalogCache.p = p;
  return p;
}

export function fetchTrack(trackId: string): Promise<LearningTrack> {
  const cached = _trackCache.get(trackId);
  if (cached) return cached;
  const path = `/quran/learning-tracks/${encodeURIComponent(trackId)}`;
  const p = authGet<LearningTrack>(path).catch((e) => {
    // Any backend failure falls back to the bundled track data — the
    // detail page is more useful with stale data than with "Load failed".
    void classifyApiError(e, path); // run for side-effect logging only
    const fallback = getFallbackTrack(trackId);
    if (fallback) {
      _lastFetchWasFallback = true;
      return fallback;
    }
    _trackCache.delete(trackId);
    throw new Error(`No fallback data for track "${trackId}".`);
  });
  _trackCache.set(trackId, p);
  return p;
}

// ── Local progress (per-user, localStorage-only v1) ───────────────────────

const PROGRESS_KEY = 'quran_learning_tracks_progress_v1';
const LISTENERS = new Set<() => void>();

function loadAll(): LearningTrackProgress[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as LearningTrackProgress[]) : [];
  } catch {
    return [];
  }
}

function saveAll(list: LearningTrackProgress[]): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(list));
  } catch {
    /* quota — ignore */
  }
  LISTENERS.forEach((fn) => fn());
}

export function onProgressChange(listener: () => void): () => void {
  LISTENERS.add(listener);
  return () => LISTENERS.delete(listener);
}

export function getProgress(trackId: string): LearningTrackProgress | null {
  return loadAll().find((p) => p.trackId === trackId) ?? null;
}

export function listAllProgress(): LearningTrackProgress[] {
  return loadAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function enrollTrack(trackId: string): LearningTrackProgress {
  const list = loadAll();
  const existing = list.find((p) => p.trackId === trackId);
  if (existing) return existing;
  const now = Date.now();
  const p: LearningTrackProgress = {
    trackId,
    startedAt: now,
    completedStages: [],
    lastStageId: null,
    updatedAt: now,
  };
  list.unshift(p);
  saveAll(list);
  return p;
}

export function toggleStageComplete(trackId: string, stageId: string): LearningTrackProgress {
  const list = loadAll();
  let entry = list.find((p) => p.trackId === trackId);
  if (!entry) {
    entry = enrollTrack(trackId);
    return toggleStageComplete(trackId, stageId);
  }
  const idx = entry.completedStages.indexOf(stageId);
  if (idx >= 0) {
    entry.completedStages.splice(idx, 1);
  } else {
    entry.completedStages.push(stageId);
  }
  entry.lastStageId = stageId;
  entry.updatedAt = Date.now();
  saveAll(list);
  return entry;
}

export function setLastStage(trackId: string, stageId: string): void {
  const list = loadAll();
  const entry = list.find((p) => p.trackId === trackId);
  if (!entry) return;
  entry.lastStageId = stageId;
  entry.updatedAt = Date.now();
  saveAll(list);
}

export function resetTrack(trackId: string): void {
  const next = loadAll().filter((p) => p.trackId !== trackId);
  saveAll(next);
}
