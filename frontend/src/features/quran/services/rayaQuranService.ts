/**
 * rayaQuranService
 *
 * Calls the backend `/chat/islamic` (books-only, source-constrained) endpoint
 * for the in-page Raya panel. Sends optional ayah context so the answer stays
 * anchored to the currently-focused verse.
 *
 * Citation parsing: the backend returns the final, post-processed response
 * text plus a structured `sources` array. We expose the response and the
 * citations as a single message so the panel can render
 * `SourceCitationChip`s under each AI message without any further parsing.
 */

import { authPost } from '@/lib/api';
import type { RayaQuranAyahContext, SourceCitation } from '../types/quran.types';
import { auth } from '@/config/firebase.config';
import { classifyApiError } from './_apiErrors';

interface IslamicChatResponseBody {
  response: string;
  sources: Array<Record<string, unknown>>;
  confidence: number;
  category: string;
  meets_threshold: boolean;
}

export interface RayaQuranAnswer {
  text: string;
  citations: SourceCitation[];
  confidence: number;
  category: string;
  /** True when the backend refused because retrieval fell below threshold. */
  lowConfidence: boolean;
}

function citationsFromSources(sources: Array<Record<string, unknown>>): SourceCitation[] {
  const out: SourceCitation[] = [];
  for (const src of sources) {
    const ct = (src.content_type as string | undefined) ?? '';
    const category = (src.category as string | undefined) ?? '';
    if (ct === 'quran_verse' || category === 'quran') {
      const verseKey = (src.verse_reference as string | undefined) ?? '';
      if (!verseKey) continue;
      out.push({
        kind: 'quran',
        verse_key: verseKey,
        surah_name: (src.surah_name as string | undefined) ?? '',
        arabic_text: (src.arabic_text as string | undefined) ?? undefined,
      });
    } else if (ct === 'hadith' || category === 'hadith') {
      out.push({
        kind: 'hadith',
        collection: (src.book_name as string | undefined) ?? '',
        number: String(src.hadith_number ?? ''),
        narrator: (src.narrator as string | undefined) ?? undefined,
        grade: (src.grade as string | undefined) ?? undefined,
      });
    } else {
      const book = (src.book_name as string | undefined) ?? '';
      if (!book) continue;
      const pageRaw = src.page_number;
      out.push({
        kind: 'book',
        book,
        author: (src.author as string | undefined) ?? undefined,
        page: typeof pageRaw === 'number' ? pageRaw : null,
      });
    }
  }
  return out;
}

export async function askRayaAboutAyah(input: {
  question: string;
  context?: RayaQuranAyahContext;
  sessionId?: string;
}): Promise<RayaQuranAnswer> {
  const uid = auth.currentUser?.uid ?? 'anonymous';
  const body: Record<string, unknown> = {
    user_id: uid,
    message: input.question,
    session_id: input.sessionId ?? `quran-raya-${uid}`,
    require_sources: true,
  };
  if (input.context) {
    body.ayah_context = {
      verse_key: input.context.verseKey,
      surah_name: input.context.surahName,
      ayah_translation: input.context.ayahTranslation,
    };
  }

  let r: IslamicChatResponseBody;
  try {
    r = await authPost<IslamicChatResponseBody>('/chat/islamic', body, 60000);
  } catch (e) {
    throw classifyApiError(e, '/chat/islamic');
  }
  return {
    text: r.response,
    citations: citationsFromSources(r.sources ?? []),
    confidence: r.confidence ?? 0,
    category: r.category ?? 'general',
    lowConfidence: !r.meets_threshold,
  };
}

// ── Local conversation history (per-user, capped) ─────────────────────────

const HISTORY_KEY = 'quran_raya_history_v1';
const MAX_HISTORY = 30;

export interface RayaQuranHistoryEntry {
  id: string;
  verseKey?: string;
  question: string;
  answer: string;
  citations: SourceCitation[];
  lowConfidence: boolean;
  createdAt: number;
}

export function loadRayaHistory(): RayaQuranHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as RayaQuranHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendRayaHistory(entry: RayaQuranHistoryEntry): void {
  const list = loadRayaHistory();
  list.unshift(entry);
  const capped = list.slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(capped));
  } catch {
    /* ignore storage quota / disabled storage */
  }
}

export function clearRayaHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* noop */
  }
}
