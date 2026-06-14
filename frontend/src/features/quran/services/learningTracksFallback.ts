/**
 * Local fallback for the scholar-led learning tracks catalog + detail pages.
 *
 * Mirrors `backend/langchain_backend/data/learning_tracks.json`, vendored
 * into the frontend so the tracks pages stay usable when the backend is
 * offline. To refresh, re-run:
 *
 *     cp backend/langchain_backend/data/learning_tracks.json \
 *        frontend/src/features/quran/data/learningTracks.json
 *
 * Vite imports JSON natively at build time — no runtime cost.
 */

import type { LearningTrack, LearningTrackSummary } from '../types/quran.types';
import data from '../data/learningTracks.json';

interface RawTrackFile {
  _meta?: { description?: string; version?: number };
  tracks: LearningTrack[];
}

const file = data as RawTrackFile;

export const FALLBACK_TRACKS_FULL: LearningTrack[] = file.tracks;

export const FALLBACK_TRACK_CATALOG: LearningTrackSummary[] = file.tracks.map((t) => ({
  id: t.id,
  title: t.title,
  subtitle: t.subtitle,
  level: t.level,
  duration_days: t.duration_days,
  stage_count: t.stages.length,
  scholar_attribution: t.scholar_attribution,
}));

export function getFallbackTrack(trackId: string): LearningTrack | null {
  return file.tracks.find((t) => t.id === trackId) ?? null;
}
