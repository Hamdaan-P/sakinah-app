/**
 * xrayService — fetches surah X-Ray context (revelation period, themes,
 * timeline events, connected verses) for the X-Ray page and the X-Ray tab
 * inside the Deep Dive Sheet.
 *
 * Surah-level only in v1. Ayah-level returns 404 (handled as empty state).
 */

import { authGet } from '@/lib/api';
import { classifyApiError } from './_apiErrors';
import type { SourceCitation } from '../types/quran.types';

export interface XrayKeyStat {
  label: string;
  value: string;
}

export interface XrayTimelineEvent {
  year_ce: number;
  title: string;
  description: string;
  citation?: SourceCitation;
}

export interface XrayConnectedRevelation {
  verse_key: string;
  label: string;
  note: string;
  citation?: SourceCitation;
}

export interface SurahXray {
  surah_id: number;
  name_simple: string;
  name_arabic: string;
  name_english: string;
  revelation_year_hijri: string | null;
  revelation_year_ce: number;
  revelation_period: string;
  location: string;
  verses_count: number;
  themes: string[];
  key_stats: XrayKeyStat[];
  timeline_events: XrayTimelineEvent[];
  connected_revelations: XrayConnectedRevelation[];
  sources: SourceCitation[];
}

const _surahCache = new Map<number, Promise<SurahXray | null>>();

export function fetchSurahXray(surahId: number): Promise<SurahXray | null> {
  const cached = _surahCache.get(surahId);
  if (cached) return cached;

  const path = `/quran/surah/${surahId}/xray`;
  const p = authGet<SurahXray>(path)
    .then((r) => r as SurahXray | null)
    .catch((e: Error) => {
      _surahCache.delete(surahId);
      // 404 = no curated entry for this surah; render empty state.
      if (/API error 404/.test(e.message)) return null;
      throw classifyApiError(e, path);
    });
  _surahCache.set(surahId, p);
  return p;
}
